// Package printer implements low-level ESC/POS printer communication.
// Nelja Tech — URQR Platform Phase 1 | Standalone Manager POS
//
// tcp.go: Raw TCP socket client for thermal printers on port 9100.
// No CGO, no external runtime dependencies.
package printer

import (
	"fmt"
	"net"
	"time"
)

const (
	// DefaultPrinterPort is the standard ESC/POS RAW TCP port.
	DefaultPrinterPort = 9100

	// tcpDialTimeout is the maximum time to establish a TCP connection.
	tcpDialTimeout = 5 * time.Second

	// tcpWriteDeadline is the per-write deadline ensuring < 5ms latency is
	// detected and surfaced as an error rather than a silent hang.
	tcpWriteDeadline = 5 * time.Millisecond
)

// TCPPrinter is a raw TCP client for a network-attached thermal printer.
type TCPPrinter struct {
	conn net.Conn
	addr string
}

// NewTCPPrinter dials the printer at host:port and returns a connected client.
// The caller must call Close() when done.
func NewTCPPrinter(host string, port int) (*TCPPrinter, error) {
	if port <= 0 {
		port = DefaultPrinterPort
	}
	addr := net.JoinHostPort(host, fmt.Sprintf("%d", port))
	conn, err := net.DialTimeout("tcp", addr, tcpDialTimeout)
	if err != nil {
		return nil, fmt.Errorf("tcp printer dial %s: %w", addr, err)
	}
	return &TCPPrinter{conn: conn, addr: addr}, nil
}

// Write sends raw bytes to the printer.
// It enforces a strict write deadline so callers can detect > 5ms latency.
// Returns the number of bytes written and any error.
func (p *TCPPrinter) Write(data []byte) (int, time.Duration, error) {
	if err := p.conn.SetWriteDeadline(time.Now().Add(tcpWriteDeadline)); err != nil {
		return 0, 0, fmt.Errorf("tcp set write deadline: %w", err)
	}
	start := time.Now()
	n, err := p.conn.Write(data)
	elapsed := time.Since(start)
	if err != nil {
		return n, elapsed, fmt.Errorf("tcp printer write to %s: %w", p.addr, err)
	}
	// Reset deadline after write.
	_ = p.conn.SetWriteDeadline(time.Time{})
	return n, elapsed, nil
}

// Send is a convenience wrapper that writes data and returns write latency.
func (p *TCPPrinter) Send(data []byte) (time.Duration, error) {
	_, elapsed, err := p.Write(data)
	return elapsed, err
}

// Addr returns the remote printer address.
func (p *TCPPrinter) Addr() string { return p.addr }

// Close closes the underlying TCP connection.
func (p *TCPPrinter) Close() error {
	if p.conn != nil {
		return p.conn.Close()
	}
	return nil
}
