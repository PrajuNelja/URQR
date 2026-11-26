package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gorilla/websocket"
)

func TestWebSocketHandshakeAndMessages(t *testing.T) {
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", webSocketHandler)
	server := httptest.NewServer(mux)
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http") + "/ws"
	headers := http.Header{"Origin": []string{"http://localhost:5173"}}
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, headers)
	if err != nil {
		t.Fatalf("connect to bridge: %v", err)
	}
	defer conn.Close()

	var message bridgeMessage
	if err := conn.ReadJSON(&message); err != nil {
		t.Fatalf("read connected message: %v", err)
	}
	if message.Type != "connected" || message.Service != "urqr-bridge" {
		t.Fatalf("unexpected connected message: %+v", message)
	}

	if err := conn.WriteJSON(bridgeMessage{Type: "hello", ID: "hello-1"}); err != nil {
		t.Fatalf("send hello: %v", err)
	}
	if err := conn.ReadJSON(&message); err != nil {
		t.Fatalf("read hello acknowledgment: %v", err)
	}
	if message.Type != "ack" || message.ID != "hello-1" || message.Status != "UP" {
		t.Fatalf("unexpected hello acknowledgment: %+v", message)
	}

	if err := conn.WriteJSON(bridgeMessage{Type: "ping", ID: "ping-1"}); err != nil {
		t.Fatalf("send ping: %v", err)
	}
	if err := conn.ReadJSON(&message); err != nil {
		t.Fatalf("read pong: %v", err)
	}
	if message.Type != "pong" || message.ID != "ping-1" || message.Status != "UP" {
		t.Fatalf("unexpected pong: %+v", message)
	}
}

func TestWebSocketRejectsNonLocalOrigin(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/ws", nil)
	request.RemoteAddr = "127.0.0.1:1234"
	request.Header.Set("Origin", "https://example.com")
	recorder := httptest.NewRecorder()

	webSocketHandler(recorder, request)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("expected status %d, got %d", http.StatusForbidden, recorder.Code)
	}
}

func TestWebSocketRejectsNonLoopbackPeer(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/ws", nil)
	request.RemoteAddr = "192.0.2.1:1234"
	request.Header.Set("Origin", "http://localhost:5173")
	recorder := httptest.NewRecorder()

	webSocketHandler(recorder, request)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("expected status %d, got %d", http.StatusForbidden, recorder.Code)
	}
}
