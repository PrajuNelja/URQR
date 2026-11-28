// URQR Bridge — Entry point
// Nelja Tech | Phase 1
//
// urqr-bridge is a lightweight Go daemon that provides:
// 1. High-speed local WebSocket print server on ws://localhost:9101 for desktop POS (Tauri v2).
// 2. Health check and readiness HTTP endpoints on http://localhost:9090.
// 3. Raw TCP ESC/POS thermal printer forwarding with auto-reconnect and heartbeat.
//
// Architecture constraint: single-process, CGO_ENABLED=0, zero external runtime dependencies.

package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/netip"
	"net/url"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
	"github.com/nelja/urqr-bridge/printer"
	"github.com/nelja/urqr-bridge/ws"
)

type bridgeMessage struct {
	Type    string `json:"type"`
	ID      string `json:"id,omitempty"`
	Service string `json:"service,omitempty"`
	Status  string `json:"status,omitempty"`
	Error   string `json:"error,omitempty"`
}

var bridgeUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return isLoopbackAddress(r.RemoteAddr) && isLocalOrigin(r.Header.Get("Origin"))
	},
}

func main() {
	logger := log.New(os.Stdout, "[urqr-bridge] ", log.LstdFlags|log.LUTC)

	httpPort := getEnv("BRIDGE_PORT", "9090")
	wsPort := getEnv("WS_PORT", "9101")
	printerHost := getEnv("PRINTER_HOST", "127.0.0.1")
	printerPortStr := getEnv("PRINTER_PORT", "9100")
	printerPort, err := strconv.Atoi(printerPortStr)
	if err != nil || printerPort <= 0 {
		printerPort = 9100
	}

	logger.Printf("URQR Bridge initializing...")
	logger.Printf("HTTP Health/Ready server configured on :%s", httpPort)
	logger.Printf("WebSocket Print Daemon configured on :%s", wsPort)
	logger.Printf("Target Thermal Printer: %s:%d", printerHost, printerPort)

	// 1. Initialize WebSocket Server
	wsServer := ws.NewServer(":"+wsPort, nil, logger)
	if err := wsServer.Start(); err != nil {
		logger.Fatalf("Failed to start WebSocket daemon: %v", err)
	}

	// 2. Printer auto-reconnect and health monitoring loop
	stopMonitor := make(chan struct{})
	go runPrinterMonitor(printerHost, printerPort, wsServer, logger, stopMonitor)

	// 3. HTTP Server (/health, /ready, /status)
	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/ready", readyHandler)
	mux.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = fmt.Fprintf(w, `{"service":"urqr-bridge","httpPort":"%s","wsPort":"%s","printerTarget":"%s:%d"}`,
			httpPort, wsPort, printerHost, printerPort)
	})

	httpServer := &http.Server{
		Addr:         ":" + httpPort,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		logger.Printf("HTTP server listening on :%s", httpPort)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatalf("HTTP ListenAndServe failed: %v", err)
		}
	}()

	// 4. Graceful shutdown on SIGINT / SIGTERM
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit
	logger.Printf("Received signal %v. Initiating graceful shutdown...", sig)

	close(stopMonitor)

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := wsServer.Stop(shutdownCtx); err != nil {
		logger.Printf("WebSocket server shutdown error: %v", err)
	}
	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		logger.Printf("HTTP server shutdown error: %v", err)
	}

	logger.Println("Bridge stopped cleanly.")
}

func runPrinterMonitor(host string, port int, wsServer *ws.Server, logger *log.Logger, stopCh <-chan struct{}) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	var activePrinter printer.Printer
	wasConnected := false

	connect := func() {
		if activePrinter != nil {
			_ = activePrinter.Close()
			activePrinter = nil
		}
		p, err := printer.NewTCPPrinter(host, port)
		if err != nil {
			if wasConnected {
				logger.Printf("[printer-monitor] Printer at %s:%d disconnected (%v)", host, port, err)
				wsServer.BroadcastStatus(ws.StatusPrinterOffline, fmt.Sprintf("Printer disconnected: %v", err))
				wasConnected = false
			}
			wsServer.SetPrinter(nil)
			return
		}

		activePrinter = p
		wsServer.SetPrinter(p)
		if !wasConnected {
			logger.Printf("[printer-monitor] Connected to thermal printer at %s:%d", host, port)
			wsServer.BroadcastStatus(ws.StatusPrinterReady, fmt.Sprintf("Connected to thermal printer at %s:%d", host, port))
			wasConnected = true
		}
	}

	// Initial immediate dial attempt
	connect()

	for {
		select {
		case <-stopCh:
			if activePrinter != nil {
				_ = activePrinter.Close()
			}
			return
		case <-ticker.C:
			// Ping check if connected
			if activePrinter != nil {
				if _, err := activePrinter.Send(printer.ESCInit()); err != nil {
					logger.Printf("[printer-monitor] Keep-alive ping failed: %v", err)
					connect()
				}
			} else {
				connect()
			}
		}
	}
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"status":"UP","service":"urqr-bridge"}`))
}

func readyHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"status":"READY"}`))
}

func webSocketHandler(w http.ResponseWriter, r *http.Request) {
	if !isLoopbackAddress(r.RemoteAddr) || !isLocalOrigin(r.Header.Get("Origin")) {
		http.Error(w, "WebSocket access is limited to local clients", http.StatusForbidden)
		return
	}

	conn, err := bridgeUpgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	conn.SetReadLimit(64 * 1024)
	if err := conn.SetReadDeadline(time.Time{}); err != nil {
		return
	}
	if err := conn.SetWriteDeadline(time.Time{}); err != nil {
		return
	}
	if err := conn.WriteJSON(bridgeMessage{Type: "connected", Service: "urqr-bridge"}); err != nil {
		return
	}

	for {
		var message bridgeMessage
		if err := conn.ReadJSON(&message); err != nil {
			return
		}

		switch message.Type {
		case "hello":
			err = conn.WriteJSON(bridgeMessage{Type: "ack", ID: message.ID, Status: "UP"})
		case "ping":
			err = conn.WriteJSON(bridgeMessage{Type: "pong", ID: message.ID, Status: "UP"})
		default:
			err = conn.WriteJSON(bridgeMessage{Type: "error", ID: message.ID, Error: "unsupported_message_type"})
		}
		if err != nil {
			return
		}
	}
}

func isLoopbackAddress(remoteAddr string) bool {
	host, _, err := net.SplitHostPort(remoteAddr)
	if err != nil {
		host = strings.Trim(remoteAddr, "[]")
	}

	addr, err := netip.ParseAddr(host)
	return err == nil && addr.Unmap().IsLoopback()
}

func isLocalOrigin(origin string) bool {
	if origin == "" {
		return true
	}

	parsed, err := url.Parse(origin)
	if err != nil || parsed.User != nil {
		return false
	}
	switch parsed.Scheme {
	case "http", "https", "tauri":
	default:
		return false
	}

	switch strings.ToLower(parsed.Hostname()) {
	case "localhost", "127.0.0.1", "::1", "tauri.localhost":
		return true
	default:
		return false
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
