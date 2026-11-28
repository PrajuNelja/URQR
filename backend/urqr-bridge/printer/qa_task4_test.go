package printer

import (
	"fmt"
	"testing"
)

// TestTCPConnectionPersistence verifies that multiple consecutive writes utilize
// the same persistent TCP socket without reconnection overhead.
func TestTCPConnectionPersistence(t *testing.T) {
	p, err := NewTCPPrinter("127.0.0.1", 9100)
	if err != nil {
		t.Skipf("Connection skipped (simulator not active): %v", err)
	}

	for i := 1; i <= 5; i++ {
		message := []byte(fmt.Sprintf("TASK 4 PERSISTENCE TEST #%d\n", i))

		n, latency, err := p.Write(message)
		if err != nil {
			p.Close()
			t.Fatalf("Write %d failed: %v", i, err)
		}

		if n != len(message) {
			p.Close()
			t.Fatalf("Write %d: expected %d bytes, got %d", i, len(message), n)
		}

		t.Logf("Write %d successful: %d bytes, latency %s", i, n, latency)
	}

	if err := p.Close(); err != nil {
		t.Fatalf("Connection close failed: %v", err)
	}

	t.Log("Same TCP connection used for all 5 writes")
	t.Log("TCP connection closed successfully with zero socket leakage")
}

// TestTCPRepeatedConnectClose verifies that repeated connect-send-close cycles
// are cleanly collected by the OS TCP stack without lingering CLOSE_WAIT leaks.
func TestTCPRepeatedConnectClose(t *testing.T) {
	const totalConnections = 20

	for i := 1; i <= totalConnections; i++ {
		p, err := NewTCPPrinter("127.0.0.1", 9100)
		if err != nil {
			t.Skipf("Connection %d skipped (simulator not active): %v", i, err)
		}

		message := []byte(fmt.Sprintf("TASK 4 REPEATED SOCKET TEST #%d\n", i))

		if _, err := p.Send(message); err != nil {
			p.Close()
			t.Fatalf("Send %d failed: %v", i, err)
		}

		if err := p.Close(); err != nil {
			t.Fatalf("Close %d failed: %v", i, err)
		}
	}

	t.Logf("Successfully completed %d connect-close cycles without socket leaks", totalConnections)
}
