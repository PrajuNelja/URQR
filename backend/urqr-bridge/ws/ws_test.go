// Package ws — ws_test.go
// Tests the WebSocket server, contract deserialization, status event broadcasts,
// and end-to-end receipt print dispatching.
package ws

import (
	"context"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

// MockPrinter implements printer.Printer for unit tests.
type MockPrinter struct {
	sentBytes []byte
	latency   time.Duration
	err       error
}

func (m *MockPrinter) Send(data []byte) (time.Duration, error) {
	if m.err != nil {
		return 0, m.err
	}
	m.sentBytes = append(m.sentBytes, data...)
	return m.latency, nil
}

func (m *MockPrinter) Addr() string { return "mock:9100" }
func (m *MockPrinter) Close() error { return nil }

func samplePrintPayload() string {
	return `{
		"action": "print",
		"orderId": "ord_12345678",
		"tenantId": "249700d6-6d33-4873-8899-1ed8b1b3f59e",
		"billNumber": "#1042",
		"tableNumber": "T-04",
		"serverName": "Prajwal",
		"paymentMode": "Dynamic UPI QR",
		"timestamp": "25-Nov-2026 12:45 PM",
		"store": {
			"name": "URQR GOURMET",
			"branch": "Indiranagar",
			"gstin": "29AAAAA0000A1Z5"
		},
		"items": [
			{
				"name": "Butter Chicken Special Gravy",
				"quantity": 2,
				"unitPrice": 240.00,
				"totalPrice": 480.00
			},
			{
				"name": "Garlic Naan",
				"quantity": 3,
				"unitPrice": 40.00,
				"totalPrice": 120.00
			}
		],
		"taxes": {
			"cgst": 15.00,
			"cgstRate": 2.5,
			"sgst": 15.00,
			"sgstRate": 2.5,
			"totalTax": 30.00
		},
		"totals": {
			"subtotal": 600.00,
			"tax": 30.00,
			"grandTotal": 630.00
		},
		"rollWidth": 80
	}`
}

func TestDeserializePrintRequest_Valid(t *testing.T) {
	raw := []byte(samplePrintPayload())
	req, err := DeserializePrintRequest(raw)
	if err != nil {
		t.Fatalf("Failed to deserialize valid request: %v", err)
	}

	if req.OrderID != "ord_12345678" {
		t.Errorf("Expected OrderID ord_12345678, got %s", req.OrderID)
	}
	if req.TenantID != "249700d6-6d33-4873-8899-1ed8b1b3f59e" {
		t.Errorf("Expected TenantID match, got %s", req.TenantID)
	}
	if len(req.Items) != 2 {
		t.Errorf("Expected 2 items, got %d", len(req.Items))
	}
	if req.Totals.GrandTotal != 630.00 {
		t.Errorf("Expected GrandTotal 630.00, got %.2f", req.Totals.GrandTotal)
	}
}

func TestDeserializePrintRequest_MissingFields(t *testing.T) {
	badJSON := `{"tenantId": "123"}` // Missing orderId and items
	_, err := DeserializePrintRequest([]byte(badJSON))
	if err == nil {
		t.Fatalf("Expected error for missing orderId, got nil")
	}
}

func TestWebSocketServer_EndToEnd(t *testing.T) {
	mock := &MockPrinter{latency: 2 * time.Millisecond}
	// Use dynamic port to avoid collision during test
	srv := NewServer("127.0.0.1:0", mock, nil)
	srv.lastState = StatusPrinterReady

	if err := srv.Start(); err != nil {
		t.Fatalf("Failed to start ws server: %v", err)
	}
	defer srv.Stop(context.Background())

	wsAddr := srv.Addr()
	u := url.URL{Scheme: "ws", Host: wsAddr, Path: "/ws"}

	// Connect client
	dialer := websocket.Dialer{HandshakeTimeout: 3 * time.Second}
	conn, _, err := dialer.Dial(u.String(), nil)
	if err != nil {
		t.Fatalf("Failed to connect to ws server: %v", err)
	}
	defer conn.Close()

	// 1. Read initial status event
	var initialEvent StatusEvent
	if err := conn.ReadJSON(&initialEvent); err != nil {
		t.Fatalf("Failed to read initial status: %v", err)
	}
	if initialEvent.Status != StatusPrinterReady {
		t.Errorf("Expected initial status %s, got %s", StatusPrinterReady, initialEvent.Status)
	}

	// 2. Test status broadcast: PAPER_OUT
	srv.BroadcastStatus(StatusPaperOut, "Thermal roll empty")
	var statusEvent StatusEvent
	if err := conn.ReadJSON(&statusEvent); err != nil {
		t.Fatalf("Failed to read broadcast status: %v", err)
	}
	if statusEvent.Status != StatusPaperOut {
		t.Errorf("Expected broadcast status %s, got %s", StatusPaperOut, statusEvent.Status)
	}

	// 3. Test status broadcast: PRINTER_READY
	srv.BroadcastStatus(StatusPrinterReady, "Roll replaced, printer ready")
	if err := conn.ReadJSON(&statusEvent); err != nil {
		t.Fatalf("Failed to read broadcast status: %v", err)
	}
	if statusEvent.Status != StatusPrinterReady {
		t.Errorf("Expected broadcast status %s, got %s", StatusPrinterReady, statusEvent.Status)
	}

	// 4. Send PrintRequest payload over WebSocket
	if err := conn.WriteMessage(websocket.TextMessage, []byte(samplePrintPayload())); err != nil {
		t.Fatalf("Failed to send print payload: %v", err)
	}

	// 5. Read PrintResponse
	var printResp PrintResponse
	if err := conn.ReadJSON(&printResp); err != nil {
		t.Fatalf("Failed to read print response: %v", err)
	}

	if !printResp.Success {
		t.Fatalf("Expected print success, got failure: %s", printResp.Message)
	}
	if printResp.OrderID != "ord_12345678" {
		t.Errorf("Expected response OrderID ord_12345678, got %s", printResp.OrderID)
	}
	if len(mock.sentBytes) == 0 {
		t.Fatalf("Expected mock printer to receive raw ESC/POS bytes")
	}

	// 6. Verify mock printer received full paper cut
	cutBytes := []byte{0x1D, 0x56, 0x41, 0x00}
	if !strings.Contains(string(mock.sentBytes), string(cutBytes)) {
		t.Errorf("Mock printer data does not contain GSFullCut")
	}
}

func TestWebSocketServer_PingPong(t *testing.T) {
	srv := NewServer("127.0.0.1:0", &MockPrinter{}, nil)
	srv.lastState = StatusPrinterReady
	if err := srv.Start(); err != nil {
		t.Fatalf("Failed to start ws server: %v", err)
	}
	defer srv.Stop(context.Background())

	u := url.URL{Scheme: "ws", Host: srv.Addr(), Path: "/ws"}
	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		t.Fatalf("Failed to dial: %v", err)
	}
	defer conn.Close()

	// Drain initial status
	var drain StatusEvent
	_ = conn.ReadJSON(&drain)

	// Send ping
	_ = conn.WriteJSON(map[string]string{"action": "ping"})

	var pongResp map[string]any
	if err := conn.ReadJSON(&pongResp); err != nil {
		t.Fatalf("Failed to read pong: %v", err)
	}
	if pongResp["event"] != "pong" {
		t.Errorf("Expected event pong, got %v", pongResp["event"])
	}
}
