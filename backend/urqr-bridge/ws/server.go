// Package ws — server.go
// Implements the local WebSocket server for Go URQR-Bridge daemon
// listening on ws://localhost:9101 for print requests from Tauri v2.
//
// Pure Go, CGO_ENABLED=0 compatible.
package ws

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/nelja/urqr-bridge/printer"
)

// Server coordinates WebSocket connections from desktop clients (Tauri v2).
type Server struct {
	addr        string
	server      *http.Server
	listener    net.Listener
	upgrader    websocket.Upgrader
	printer     printer.Printer
	printerLock sync.Mutex

	clients   map[*websocket.Conn]bool
	clientMu  sync.RWMutex
	lastState string
	logger    *log.Logger

	// Mockable print dispatcher for tests
	PrintDispatcher func(data []byte) (time.Duration, error)
}

// NewServer initializes a WebSocket server for the specified address (e.g. ":9101").
func NewServer(addr string, p printer.Printer, logger *log.Logger) *Server {
	if logger == nil {
		logger = log.Default()
	}
	s := &Server{
		addr:      addr,
		printer:   p,
		clients:   make(map[*websocket.Conn]bool),
		lastState: StatusPrinterOffline,
		logger:    logger,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  4096,
			WriteBufferSize: 4096,
			CheckOrigin: func(r *http.Request) bool {
				// Allow localhost, Tauri custom scheme, and desktop clients
				return true
			},
		},
	}
	return s
}

// Start binds and starts the WebSocket server.
func (s *Server) Start() error {
	mux := http.NewServeMux()
	mux.HandleFunc("/", s.handleWebSocket)
	mux.HandleFunc("/ws", s.handleWebSocket)
	mux.HandleFunc("/status", s.handleHTTPStatus)

	ln, err := net.Listen("tcp", s.addr)
	if err != nil {
		return fmt.Errorf("failed to bind websocket server on %s: %w", s.addr, err)
	}
	s.listener = ln
	s.server = &http.Server{
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	go func() {
		s.logger.Printf("[ws-bridge] Daemon listening on %s", s.listener.Addr().String())
		if err := s.server.Serve(s.listener); err != nil && err != http.ErrServerClosed {
			s.logger.Printf("[ws-bridge] Serve error: %v", err)
		}
	}()

	return nil
}

// Addr returns the network address the server is listening on.
func (s *Server) Addr() string {
	if s.listener != nil {
		return s.listener.Addr().String()
	}
	return s.addr
}

// Stop gracefully terminates the WebSocket server and disconnects clients.
func (s *Server) Stop(ctx context.Context) error {
	s.clientMu.Lock()
	for conn := range s.clients {
		_ = conn.WriteControl(
			websocket.CloseMessage,
			websocket.FormatCloseMessage(websocket.CloseNormalClosure, "server shutdown"),
			time.Now().Add(1*time.Second),
		)
		_ = conn.Close()
	}
	s.clients = make(map[*websocket.Conn]bool)
	s.clientMu.Unlock()

	if s.server != nil {
		return s.server.Shutdown(ctx)
	}
	return nil
}

// BroadcastStatus publishes a printer status event to all connected WebSocket clients.
func (s *Server) BroadcastStatus(status, message string) {
	s.clientMu.Lock()
	s.lastState = status
	event := NewStatusEvent(status, message)
	data, err := json.Marshal(event)
	if err != nil {
		s.clientMu.Unlock()
		return
	}

	for conn := range s.clients {
		_ = conn.SetWriteDeadline(time.Now().Add(2 * time.Second))
		if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
			s.logger.Printf("[ws-bridge] Broadcast failed to client: %v", err)
			_ = conn.Close()
			delete(s.clients, conn)
		}
	}
	s.clientMu.Unlock()
}

// SetPrinter dynamically updates the printer handle.
func (s *Server) SetPrinter(p printer.Printer) {
	s.printerLock.Lock()
	defer s.printerLock.Unlock()
	s.printer = p
}

// handleWebSocket handles incoming WebSocket connections.
func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		s.logger.Printf("[ws-bridge] Upgrade error: %v", err)
		return
	}

	s.clientMu.Lock()
	s.clients[conn] = true
	// Immediately send initial printer status to new connection
	initialStatus := s.lastState
	if initialStatus == "" {
		initialStatus = StatusPrinterReady
	}
	s.clientMu.Unlock()

	// Send initial status event
	_ = conn.WriteJSON(NewStatusEvent(initialStatus, "Connected to URQR Bridge"))

	go s.readLoop(conn)
}

// readLoop reads messages from a WebSocket client.
func (s *Server) readLoop(conn *websocket.Conn) {
	defer func() {
		s.clientMu.Lock()
		delete(s.clients, conn)
		s.clientMu.Unlock()
		_ = conn.Close()
	}()

	conn.SetReadLimit(512 * 1024) // 512KB max payload
	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				s.logger.Printf("[ws-bridge] WebSocket read error: %v", err)
			}
			break
		}

		if messageType == websocket.TextMessage {
			s.handleClientMessage(conn, message)
		}
	}
}

// handleClientMessage parses and dispatches client commands.
func (s *Server) handleClientMessage(conn *websocket.Conn, message []byte) {
	start := time.Now()

	// 1. Check for ping or status query
	var probe struct {
		Action string `json:"action"`
	}
	if err := json.Unmarshal(message, &probe); err == nil && probe.Action == "ping" {
		_ = conn.WriteJSON(map[string]any{
			"event":     "pong",
			"timestamp": time.Now().UnixMilli(),
			"status":    s.lastState,
		})
		return
	}

	// 2. Deserialize PrintRequest
	req, err := DeserializePrintRequest(message)
	if err != nil {
		resp := PrintResponse{
			Success: false,
			Status:  StatusPrintError,
			Message: fmt.Sprintf("Invalid print request contract: %v", err),
		}
		_ = conn.WriteJSON(resp)
		return
	}

	// 3. Format ESC/POS Receipt Bytes
	receiptData := req.ToReceiptData()
	rawBytes := printer.GenerateReceipt(receiptData)

	// 4. Dispatch to Printer
	latency, err := s.dispatchPrint(rawBytes)
	if err != nil {
		resp := PrintResponse{
			Success:   false,
			OrderID:   req.OrderID,
			Status:    StatusPrinterOffline,
			Message:   fmt.Sprintf("Print dispatch failed: %v", err),
			LatencyMs: time.Since(start).Milliseconds(),
		}
		_ = conn.WriteJSON(resp)
		s.BroadcastStatus(StatusPrinterOffline, err.Error())
		return
	}

	// 5. Send Success Response
	resp := PrintResponse{
		Success:   true,
		OrderID:   req.OrderID,
		Status:    StatusPrinterReady,
		Message:   fmt.Sprintf("Receipt printed successfully (%d bytes)", len(rawBytes)),
		LatencyMs: latency.Milliseconds(),
	}
	_ = conn.WriteJSON(resp)
}

// dispatchPrint transmits raw bytes to the connected printer.
func (s *Server) dispatchPrint(data []byte) (time.Duration, error) {
	if s.PrintDispatcher != nil {
		return s.PrintDispatcher(data)
	}

	s.printerLock.Lock()
	p := s.printer
	s.printerLock.Unlock()

	if p == nil {
		return 0, fmt.Errorf("no active thermal printer connected")
	}

	return p.Send(data)
}

// handleHTTPStatus returns an immediate JSON health status.
func (s *Server) handleHTTPStatus(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"service":       "urqr-bridge-ws",
		"status":        s.lastState,
		"activeClients": len(s.clients),
	})
}
