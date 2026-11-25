// Package printer — printer.go
// Shared Printer interface so heartbeat and callers can treat TCP and USB
// connections uniformly.
package printer

import "time"

// Printer is implemented by both TCPPrinter and USBPrinter.
type Printer interface {
	// Send writes raw bytes and returns write latency.
	Send(data []byte) (time.Duration, error)
	// Addr returns the connection address / device path string.
	Addr() string
	// Close releases the underlying connection or device handle.
	Close() error
}
