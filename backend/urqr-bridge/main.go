// URQR Bridge — Entry point
// Nelja Tech | Phase 1
//
// urqr-bridge is a lightweight Go service that acts as the real-time bridge
// between the Spring Boot monolith and Centrifugo WebSocket hub.
// It subscribes to internal events from the backend (via Redis pub/sub or
// HTTP callbacks) and publishes them to the correct Centrifugo channel.
//
// Architecture constraint: single-process, no Kafka, no K8s, no service mesh.

package main

import (
	"context"
	"log"
	"net"
	"net/http"
	"net/netip"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
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

	port := getEnv("BRIDGE_PORT", "9100")
	logger.Printf("URQR Bridge starting on :%s", port)

	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/ready", readyHandler)
	mux.HandleFunc("/ws", webSocketHandler)

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown on SIGINT / SIGTERM
	done := make(chan struct{})
	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit
		logger.Println("Shutting down bridge...")

		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()
		if err := srv.Shutdown(ctx); err != nil {
			logger.Printf("Shutdown error: %v", err)
		}
		close(done)
	}()

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Fatalf("ListenAndServe failed: %v", err)
	}
	<-done
	logger.Println("Bridge stopped.")
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
