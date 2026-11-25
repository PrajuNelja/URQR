// Package printer — bridge_test.go
// Unit tests for the URQR Go Hardware Bridge — ESC/POS command builder,
// TCP socket latency, column formatter, and heartbeat reconnection.
//
// Run: go test ./... -v
// All tests must pass with CGO_ENABLED=0.
package printer

import (
	"bytes"
	"errors"
	"log"
	"net"
	"testing"
	"time"
)

// ─── ESC/POS byte-sequence tests ────────────────────────────────────────────

func TestESCInit(t *testing.T) {
	got := ESCInit()
	want := []byte{0x1B, 0x40}
	if !bytes.Equal(got, want) {
		t.Errorf("ESCInit() = %v, want %v", got, want)
	}
}

func TestESCBold(t *testing.T) {
	tests := []struct {
		name string
		on   bool
		want []byte
	}{
		{"bold on", true, []byte{0x1B, 0x45, 0x01}},
		{"bold off", false, []byte{0x1B, 0x45, 0x00}},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := ESCBold(tc.on)
			if !bytes.Equal(got, tc.want) {
				t.Errorf("ESCBold(%v) = %v, want %v", tc.on, got, tc.want)
			}
		})
	}
}

func TestGSFontSize(t *testing.T) {
	tests := []struct {
		name string
		size FontSize
		want []byte
	}{
		{"normal", FontNormal, []byte{0x1D, 0x21, 0x00}},
		{"double height", FontDoubleHeight, []byte{0x1D, 0x21, 0x01}},
		{"double width", FontDoubleWidth, []byte{0x1D, 0x21, 0x10}},
		{"double height+width", FontDoubleHW, []byte{0x1D, 0x21, 0x11}},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := GSFontSize(tc.size)
			if !bytes.Equal(got, tc.want) {
				t.Errorf("GSFontSize(%v) = %v, want %v", tc.size, got, tc.want)
			}
		})
	}
}

func TestESCJustify(t *testing.T) {
	tests := []struct {
		name string
		j    Justify
		want []byte
	}{
		{"left", JustifyLeft, []byte{0x1B, 0x61, 0x00}},
		{"center", JustifyCenter, []byte{0x1B, 0x61, 0x01}},
		{"right", JustifyRight, []byte{0x1B, 0x61, 0x02}},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := ESCJustify(tc.j)
			if !bytes.Equal(got, tc.want) {
				t.Errorf("ESCJustify(%v) = %v, want %v", tc.j, got, tc.want)
			}
		})
	}
}

func TestESCLineFeed(t *testing.T) {
	tests := []struct {
		lines uint8
		want  []byte
	}{
		{1, []byte{0x1B, 0x64, 0x01}},
		{5, []byte{0x1B, 0x64, 0x05}},
		{10, []byte{0x1B, 0x64, 0x0A}},
	}
	for _, tc := range tests {
		got := ESCLineFeed(tc.lines)
		if !bytes.Equal(got, tc.want) {
			t.Errorf("ESCLineFeed(%d) = %v, want %v", tc.lines, got, tc.want)
		}
	}
}

func TestGSFullCut(t *testing.T) {
	got := GSFullCut()
	want := []byte{0x1D, 0x56, 0x41, 0x00}
	if !bytes.Equal(got, want) {
		t.Errorf("GSFullCut() = %v, want %v", got, want)
	}
}

func TestESCCharSet(t *testing.T) {
	got := ESCCharSet(CharSetPC437)
	want := []byte{0x1B, 0x74, 0x00}
	if !bytes.Equal(got, want) {
		t.Errorf("ESCCharSet(PC437) = %v, want %v", got, want)
	}
}

// ─── Builder integration test ────────────────────────────────────────────────

func TestBuilder(t *testing.T) {
	b := NewBuilder().
		Bold(true).
		FontSize(FontDoubleHW).
		Justify(JustifyCenter).
		Println("NELJA TECH").
		Bold(false).
		FontSize(FontNormal).
		Justify(JustifyLeft).
		LineFeed(3).
		Cut()

	data := b.Bytes()
	if len(data) == 0 {
		t.Fatal("Builder.Bytes() returned empty slice")
	}
	// Verify ESC @ is at start.
	if data[0] != 0x1B || data[1] != 0x40 {
		t.Errorf("Builder output must start with ESC @, got %02x %02x", data[0], data[1])
	}
	// Verify GSFullCut is at end.
	n := len(data)
	if data[n-4] != 0x1D || data[n-3] != 0x56 || data[n-2] != 0x41 || data[n-1] != 0x00 {
		t.Errorf("Builder output must end with GS V A 0, got %v", data[n-4:])
	}
}

// ─── Column formatter tests ───────────────────────────────────────────────────

func TestFormatColumns(t *testing.T) {
	tests := []struct {
		name string
		cols []Column
		want string
	}{
		{
			name: "receipt item line",
			cols: []Column{
				{Text: "Butter Chicken", Width: 24, Right: false},
				{Text: "2", Width: 4, Right: true},
				{Text: "480.00", Width: 10, Right: true},
			},
			// desc=24, space, qty=4, space, price=10 → 24+1+4+1+10=40 chars
			want: "Butter Chicken              2     480.00",
		},
		{
			name: "text truncation",
			cols: []Column{
				{Text: "Avocado Toast Deluxe XL", Width: 10, Right: false},
			},
			want: "Avocado To",
		},
		{
			name: "right align padding",
			cols: []Column{
				{Text: "7", Width: 5, Right: true},
			},
			want: "    7",
		},
		{
			name: "left align padding",
			cols: []Column{
				{Text: "Hi", Width: 6, Right: false},
			},
			want: "Hi    ",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := FormatColumns(tc.cols...)
			if got != tc.want {
				t.Errorf("FormatColumns() =\n  %q\nwant\n  %q", got, tc.want)
			}
		})
	}
}

func TestReceiptLine(t *testing.T) {
	line := ReceiptLine("Masala Dosa", 3, 150.00)
	// Width: 24 + 1 + 4 + 1 + 10 = 40
	if len(line) != 40 {
		t.Errorf("ReceiptLine length = %d, want 40; line=%q", len(line), line)
	}
	if !bytes.Contains([]byte(line), []byte("Masala Dosa")) {
		t.Errorf("ReceiptLine missing description; got %q", line)
	}
	if !bytes.Contains([]byte(line), []byte("150.00")) {
		t.Errorf("ReceiptLine missing price; got %q", line)
	}
}

// ─── TCP socket write-latency test (AM Task 4) ───────────────────────────────

// TestTCPWriteLatency starts a loopback TCP server, connects a TCPPrinter to
// it, and verifies write latency stays below 5ms (the ESC/POS spec requirement).
func TestTCPWriteLatency(t *testing.T) {
	// Start a local TCP listener that accepts and discards bytes.
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}
	defer ln.Close()

	done := make(chan struct{})
	go func() {
		defer close(done)
		conn, err := ln.Accept()
		if err != nil {
			return
		}
		defer conn.Close()
		buf := make([]byte, 4096)
		for {
			_, err := conn.Read(buf)
			if err != nil {
				return
			}
		}
	}()

	host, portStr, _ := net.SplitHostPort(ln.Addr().String())
	port := 0
	if _, err := net.LookupPort("tcp", portStr); err == nil {
		port = func() int {
			p := 0
			for _, c := range portStr {
				p = p*10 + int(c-'0')
			}
			return p
		}()
	}

	p, err := NewTCPPrinter(host, port)
	if err != nil {
		t.Fatalf("NewTCPPrinter: %v", err)
	}
	defer p.Close()

	payload := ESCInit() // 2 bytes — minimal realistic write
	const maxLatency = 5 * time.Millisecond
	const iterations = 10

	for i := 0; i < iterations; i++ {
		_, elapsed, err := p.Write(payload)
		if err != nil {
			// On loopback the write deadline should not trigger.
			t.Fatalf("Write[%d] error: %v", i, err)
		}
		if elapsed > maxLatency {
			t.Errorf("Write[%d] latency %s exceeds 5ms threshold", i, elapsed)
		}
	}
	t.Logf("All %d writes completed within 5ms on loopback", iterations)
}

// ─── Heartbeat reconnection test (AM Task 3) ─────────────────────────────────

// TestHeartbeatReconnects verifies that Heartbeat calls DialFunc again after
// a printer connection is closed (simulating a cable disconnect).
func TestHeartbeatReconnects(t *testing.T) {
	callCount := 0
	var innerPrinter *mockPrinter

	dial := func() (Printer, error) {
		callCount++
		innerPrinter = &mockPrinter{addr: "mock:9100"}
		return innerPrinter, nil
	}

	logger := log.New(newTestLogWriter(t), "[heartbeat] ", 0)
	h, err := NewHeartbeat(dial, logger)
	if err != nil {
		t.Fatalf("NewHeartbeat: %v", err)
	}
	defer h.Stop()

	if callCount != 1 {
		t.Errorf("expected 1 dial on start, got %d", callCount)
	}

	// Simulate the printer closing mid-session.
	innerPrinter.forceErr = errors.New("cable disconnected")

	// Mark disconnected manually (mimics what Send does on write failure).
	h.markDisconnected()

	// Give the heartbeat loop one tick to reconnect.
	time.Sleep(heartbeatInterval + 200*time.Millisecond)

	if callCount < 2 {
		t.Errorf("expected reconnect dial, still at callCount=%d", callCount)
	}
}

// ─── Mock printer for heartbeat tests ────────────────────────────────────────

type mockPrinter struct {
	addr     string
	forceErr error
	written  []byte
}

func (m *mockPrinter) Send(data []byte) (time.Duration, error) {
	if m.forceErr != nil {
		return 0, m.forceErr
	}
	m.written = append(m.written, data...)
	return 0, nil
}
func (m *mockPrinter) Addr() string  { return m.addr }
func (m *mockPrinter) Close() error  { return nil }

// ─── Test logger helper ───────────────────────────────────────────────────────

type testLogWriter struct{ t *testing.T }

func (w *testLogWriter) Write(p []byte) (int, error) {
	w.t.Log(string(p))
	return len(p), nil
}

func newTestLogWriter(t *testing.T) *testLogWriter {
	return &testLogWriter{t: t}
}
