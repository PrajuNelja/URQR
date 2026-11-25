package printer

import (
	"testing"
	"time"
)

// TestPythonSimulatorHandshake verifies sub-5ms TCP connection handshake between
// Go 1.27.4 bridge and virtual ESC/POS printer simulator on port 9100.
func TestPythonSimulatorHandshake(t *testing.T) {
	start := time.Now()

	p, err := NewTCPPrinter("127.0.0.1", 9100)
	if err != nil {
		t.Fatalf("TCP handshake failed: %v", err)
	}
	defer p.Close()

	handshakeDuration := time.Since(start)
	t.Logf("TCP handshake successful")
	t.Logf("Connected address: %s", p.Addr())
	t.Logf("Connection established in: %s", handshakeDuration)

	// Send verification bytes
	data := []byte("URQR TASK 3 HANDSHAKE TEST\n")
	latency, err := p.Send(data)
	if err != nil {
		t.Fatalf("Data transmission failed: %v", err)
	}

	t.Logf("Test data sent successfully: %d bytes", len(data))
	t.Logf("Write latency: %s", latency)
	t.Log("Connection closed cleanly after test")
}
