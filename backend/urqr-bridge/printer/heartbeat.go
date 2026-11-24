// Package printer — heartbeat.go
// Printer connection keep-alive heartbeat and auto-reconnection loop.
//
// The Heartbeat struct wraps any Printer implementation, periodically sends
// an ESC @ (hardware reset / ping) to verify the connection is alive, and
// automatically reconnects on failure using exponential back-off.
//
// Reconnection is transport-agnostic: callers supply a DialFunc that creates
// a fresh Printer (TCP dial or USB open) on demand.
package printer

import (
	"log"
	"sync"
	"time"
)

const (
	// heartbeatInterval is how often the keep-alive ping is sent.
	heartbeatInterval = 5 * time.Second

	// reconnectBaseDelay is the initial back-off delay after a disconnect.
	reconnectBaseDelay = 1 * time.Second

	// reconnectMaxDelay caps the exponential back-off.
	reconnectMaxDelay = 30 * time.Second
)

// DialFunc is a factory that creates a new Printer connection.
// Implementations call NewTCPPrinter or OpenUSBPrinter as appropriate.
type DialFunc func() (Printer, error)

// Heartbeat manages a live Printer connection with periodic health checks and
// automatic reconnection on failure.
type Heartbeat struct {
	mu      sync.RWMutex
	conn    Printer
	dial    DialFunc
	logger  *log.Logger
	stopCh  chan struct{}
	stopped bool
}

// NewHeartbeat constructs a Heartbeat, establishes the initial connection, and
// starts the background keep-alive goroutine.
func NewHeartbeat(dial DialFunc, logger *log.Logger) (*Heartbeat, error) {
	conn, err := dial()
	if err != nil {
		return nil, err
	}
	h := &Heartbeat{
		conn:   conn,
		dial:   dial,
		logger: logger,
		stopCh: make(chan struct{}),
	}
	go h.loop()
	return h, nil
}

// Send acquires the connection under a read-lock and writes bytes.
// If the write fails the connection is marked closed so the loop reconnects.
func (h *Heartbeat) Send(data []byte) (time.Duration, error) {
	h.mu.RLock()
	c := h.conn
	h.mu.RUnlock()
	elapsed, err := c.Send(data)
	if err != nil {
		h.logger.Printf("[heartbeat] write failed (%v); will reconnect", err)
		h.markDisconnected()
	}
	return elapsed, err
}

// Addr returns the current printer address.
func (h *Heartbeat) Addr() string {
	h.mu.RLock()
	defer h.mu.RUnlock()
	if h.conn == nil {
		return "<disconnected>"
	}
	return h.conn.Addr()
}

// Stop terminates the keep-alive goroutine and closes the connection.
func (h *Heartbeat) Stop() {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.stopped {
		return
	}
	h.stopped = true
	close(h.stopCh)
	if h.conn != nil {
		_ = h.conn.Close()
		h.conn = nil
	}
}

// loop is the background goroutine that pings the printer and reconnects.
func (h *Heartbeat) loop() {
	ticker := time.NewTicker(heartbeatInterval)
	defer ticker.Stop()
	delay := reconnectBaseDelay

	for {
		select {
		case <-h.stopCh:
			return

		case <-ticker.C:
			h.mu.RLock()
			c := h.conn
			h.mu.RUnlock()

			if c == nil {
				// Attempt reconnection.
				newConn, err := h.dial()
				if err != nil {
					h.logger.Printf("[heartbeat] reconnect failed (%v); retry in %s", err, delay)
					time.Sleep(delay)
					delay = min(delay*2, reconnectMaxDelay)
					continue
				}
				h.mu.Lock()
				h.conn = newConn
				h.mu.Unlock()
				delay = reconnectBaseDelay
				h.logger.Printf("[heartbeat] reconnected to %s", newConn.Addr())
				c = newConn // use the fresh connection for the ping below
			}

			// Ping: send ESC @ (printer reset / NOP that thermal printers tolerate).
			ping := ESCInit()
			if _, err := c.Send(ping); err != nil {
				h.logger.Printf("[heartbeat] ping failed on %s (%v); marking disconnected", c.Addr(), err)
				h.markDisconnected()
			}
		}
	}
}

// markDisconnected closes the current connection and sets conn = nil so the
// loop knows to reconnect on the next tick.
func (h *Heartbeat) markDisconnected() {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.conn != nil {
		_ = h.conn.Close()
		h.conn = nil
	}
}

func min(a, b time.Duration) time.Duration {
	if a < b {
		return a
	}
	return b
}
