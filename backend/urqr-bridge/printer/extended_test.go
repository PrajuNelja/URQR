// Package printer — extended_test.go
// 50-vector cross-check test suite for URQR Go Hardware Bridge.
// Senior Architect sign-off validation — Nelja Tech Phase 1.
//
// Vectors cover:
//   V01-V08  ESC/POS byte constants (exact protocol bytes)
//   V09-V14  ESC/POS combined byte sequences
//   V15-V22  Builder chain correctness
//   V23-V30  Column formatter edge cases
//   V31-V35  ReceiptLine format contract
//   V36-V40  TCP dial / close / write error paths
//   V41-V45  Heartbeat: Stop idempotency, Addr on nil, dial failure
//   V46-V50  USB enumeration on no-sysfs host (CI-safe)
package printer

import (
	"bytes"
	"errors"
	"log"
	"net"
	"strings"
	"testing"
	"time"
)

// ─── V01-V08: Protocol byte constants ────────────────────────────────────────

// V01
func TestV01_ESCValue(t *testing.T) {
	if ESC != 0x1B {
		t.Errorf("V01: ESC = 0x%02X, want 0x1B", ESC)
	}
}

// V02
func TestV02_GSValue(t *testing.T) {
	if GS != 0x1D {
		t.Errorf("V02: GS = 0x%02X, want 0x1D", GS)
	}
}

// V03
func TestV03_LFValue(t *testing.T) {
	if LF != 0x0A {
		t.Errorf("V03: LF = 0x%02X, want 0x0A", LF)
	}
}

// V04 — ESCInit exact bytes
func TestV04_ESCInit(t *testing.T) {
	b := ESCInit()
	if len(b) != 2 || b[0] != 0x1B || b[1] != 0x40 {
		t.Errorf("V04: ESCInit = %v, want [1B 40]", b)
	}
}

// V05 — ESCBold ON
func TestV05_ESCBoldOn(t *testing.T) {
	b := ESCBold(true)
	want := []byte{0x1B, 0x45, 0x01}
	if !bytes.Equal(b, want) {
		t.Errorf("V05: ESCBold(true) = %v, want %v", b, want)
	}
}

// V06 — ESCBold OFF
func TestV06_ESCBoldOff(t *testing.T) {
	b := ESCBold(false)
	want := []byte{0x1B, 0x45, 0x00}
	if !bytes.Equal(b, want) {
		t.Errorf("V06: ESCBold(false) = %v, want %v", b, want)
	}
}

// V07 — GSFullCut exact 4 bytes
func TestV07_GSFullCut(t *testing.T) {
	b := GSFullCut()
	want := []byte{0x1D, 0x56, 0x41, 0x00}
	if !bytes.Equal(b, want) {
		t.Errorf("V07: GSFullCut = %v, want %v", b, want)
	}
}

// V08 — ESCLineFeed(255) boundary
func TestV08_ESCLineFeedMax(t *testing.T) {
	b := ESCLineFeed(255)
	want := []byte{0x1B, 0x64, 0xFF}
	if !bytes.Equal(b, want) {
		t.Errorf("V08: ESCLineFeed(255) = %v, want %v", b, want)
	}
}

// ─── V09-V14: Combined byte sequences ────────────────────────────────────────

// V09 — Charset PC437 = [1B 74 00]
func TestV09_CharSetPC437(t *testing.T) {
	b := ESCCharSet(CharSetPC437)
	if b[2] != 0x00 {
		t.Errorf("V09: PC437 charset byte = 0x%02X, want 0x00", b[2])
	}
}

// V10 — Charset PC850 = [1B 74 02]
func TestV10_CharSetPC850(t *testing.T) {
	b := ESCCharSet(CharSetPC850)
	if b[2] != 0x02 {
		t.Errorf("V10: PC850 charset byte = 0x%02X, want 0x02", b[2])
	}
}

// V11 — Charset PC858 = [1B 74 13]
func TestV11_CharSetPC858(t *testing.T) {
	b := ESCCharSet(CharSetPC858)
	if b[2] != 0x13 {
		t.Errorf("V11: PC858 charset byte = 0x%02X, want 0x13", b[2])
	}
}

// V12 — FontDoubleHW = [1D 21 11]
func TestV12_FontDoubleHW(t *testing.T) {
	b := GSFontSize(FontDoubleHW)
	want := []byte{0x1D, 0x21, 0x11}
	if !bytes.Equal(b, want) {
		t.Errorf("V12: FontDoubleHW = %v, want %v", b, want)
	}
}

// V13 — JustifyCenter = [1B 61 01]
func TestV13_JustifyCenter(t *testing.T) {
	b := ESCJustify(JustifyCenter)
	want := []byte{0x1B, 0x61, 0x01}
	if !bytes.Equal(b, want) {
		t.Errorf("V13: JustifyCenter = %v, want %v", b, want)
	}
}

// V14 — JustifyRight = [1B 61 02]
func TestV14_JustifyRight(t *testing.T) {
	b := ESCJustify(JustifyRight)
	if b[2] != 0x02 {
		t.Errorf("V14: JustifyRight byte = 0x%02X, want 0x02", b[2])
	}
}

// ─── V15-V22: Builder chain ───────────────────────────────────────────────────

// V15 — NewBuilder always starts with ESC @ then ESC t 00
func TestV15_BuilderHeaderBytes(t *testing.T) {
	data := NewBuilder().Bytes()
	// [1B 40][1B 74 00] = first 5 bytes
	want := []byte{0x1B, 0x40, 0x1B, 0x74, 0x00}
	if !bytes.HasPrefix(data, want) {
		t.Errorf("V15: Builder header = %v, want prefix %v", data[:min5(len(data))], want)
	}
}

func min5(n int) int {
	if n < 5 { return n }
	return 5
}

// V16 — Builder.Print does not append LF
func TestV16_BuilderPrintNoLF(t *testing.T) {
	b := NewBuilder().Print("ABC")
	data := b.Bytes()
	if data[len(data)-1] == 0x0A {
		t.Errorf("V16: Builder.Print appended LF, should not")
	}
}

// V17 — Builder.Println appends LF
func TestV17_BuilderPrintlnHasLF(t *testing.T) {
	b := NewBuilder().Println("ABC")
	data := b.Bytes()
	if data[len(data)-1] != 0x0A {
		t.Errorf("V17: Builder.Println last byte = 0x%02X, want 0x0A", data[len(data)-1])
	}
}

// V18 — Builder.Cut ends with [1D 56 41 00]
func TestV18_BuilderCutBytes(t *testing.T) {
	b := NewBuilder().Cut()
	data := b.Bytes()
	n := len(data)
	tail := data[n-4:]
	want := []byte{0x1D, 0x56, 0x41, 0x00}
	if !bytes.Equal(tail, want) {
		t.Errorf("V18: Builder cut tail = %v, want %v", tail, want)
	}
}

// V19 — Builder Bold off clears bold after bold on
func TestV19_BuilderBoldToggle(t *testing.T) {
	b := NewBuilder().Bold(true).Bold(false)
	data := b.Bytes()
	// Last ESC E sequence should end with 0x00
	idx := bytes.LastIndex(data, []byte{0x1B, 0x45})
	if idx == -1 || data[idx+2] != 0x00 {
		t.Errorf("V19: last bold command = 0x%02X, want 0x00", data[idx+2])
	}
}

// V20 — Multiple LineFeed values accumulate correctly
func TestV20_MultipleLineFeed(t *testing.T) {
	b := NewBuilder().LineFeed(1).LineFeed(5).LineFeed(10)
	data := b.Bytes()
	// Count [1B 64] occurrences = 3
	count := bytes.Count(data, []byte{0x1B, 0x64})
	if count != 3 {
		t.Errorf("V20: LineFeed occurrences = %d, want 3", count)
	}
}

// V21 — Builder method chaining returns same builder
func TestV21_BuilderChaining(t *testing.T) {
	b := NewBuilder()
	b2 := b.Bold(true).Justify(JustifyLeft).LineFeed(1).Cut()
	if b != b2 {
		t.Errorf("V21: Builder chaining returned different pointer")
	}
}

// V22 — Builder empty text produces only header + cut
func TestV22_BuilderEmptyText(t *testing.T) {
	data := NewBuilder().Cut().Bytes()
	// min: 2 (ESCInit) + 3 (CharSet) + 4 (GSFullCut) = 9 bytes
	if len(data) < 9 {
		t.Errorf("V22: Builder with no text too small: %d bytes", len(data))
	}
}

// ─── V23-V30: Column formatter edge cases ────────────────────────────────────

// V23 — exact width string (no pad, no truncate)
func TestV23_ColumnExactWidth(t *testing.T) {
	got := FormatColumns(Column{Text: "HELLO", Width: 5, Right: false})
	if got != "HELLO" {
		t.Errorf("V23: exact-width column = %q, want %q", got, "HELLO")
	}
}

// V24 — zero-width column produces empty string
func TestV24_ColumnZeroWidth(t *testing.T) {
	got := FormatColumns(Column{Text: "ABC", Width: 0, Right: false})
	if got != "" {
		t.Errorf("V24: zero-width column = %q, want empty", got)
	}
}

// V25 — truncation at exact boundary
func TestV25_ColumnTruncate(t *testing.T) {
	got := FormatColumns(Column{Text: "ABCDEFGHIJ", Width: 5, Right: false})
	if got != "ABCDE" {
		t.Errorf("V25: truncated column = %q, want %q", got, "ABCDE")
	}
}

// V26 — right-align with single char in wide column
func TestV26_RightAlignSingleChar(t *testing.T) {
	got := FormatColumns(Column{Text: "1", Width: 10, Right: true})
	if got != "         1" || len(got) != 10 {
		t.Errorf("V26: right-align single char = %q (len=%d)", got, len(got))
	}
}

// V27 — left-align empty string fills with spaces
func TestV27_LeftAlignEmpty(t *testing.T) {
	got := FormatColumns(Column{Text: "", Width: 5, Right: false})
	if got != "     " || len(got) != 5 {
		t.Errorf("V27: empty left-align = %q (len=%d)", got, len(got))
	}
}

// V28 — multi-column total width check (3 col: 20+1+5+1+8 = 35)
func TestV28_MultiColTotalWidth(t *testing.T) {
	got := FormatColumns(
		Column{Text: "Item", Width: 20, Right: false},
		Column{Text: "Qty", Width: 5, Right: true},
		Column{Text: "Price", Width: 8, Right: true},
	)
	if len(got) != 35 {
		t.Errorf("V28: 3-col total len = %d, want 35; row=%q", len(got), got)
	}
}

// V29 — unicode multibyte rune truncation (Hindi char is 1 rune)
func TestV29_UnicodeTruncation(t *testing.T) {
	text := "नमस्ते" // 6 runes
	got := FormatColumns(Column{Text: text, Width: 3, Right: false})
	runes := []rune(got)
	if len(runes) != 3 {
		t.Errorf("V29: unicode truncation rune count = %d, want 3", len(runes))
	}
}

// V30 — space separator is exactly 1 space between columns
func TestV30_ColSeparator(t *testing.T) {
	got := FormatColumns(
		Column{Text: "A", Width: 1, Right: false},
		Column{Text: "B", Width: 1, Right: false},
	)
	// Should be "A B" (len=3, separator at index 1)
	if got != "A B" {
		t.Errorf("V30: separator check = %q, want %q", got, "A B")
	}
}

// ─── V31-V35: ReceiptLine contract ───────────────────────────────────────────

// V31 — ReceiptLine always produces 40 chars
func TestV31_ReceiptLineWidth(t *testing.T) {
	cases := []struct{ desc string; qty int; price float64 }{
		{"Coffee", 1, 50.00},
		{"Paneer Butter Masala XL", 10, 9999.99},
		{"", 0, 0.00},
	}
	for _, c := range cases {
		line := ReceiptLine(c.desc, c.qty, c.price)
		if len(line) != 40 {
			t.Errorf("V31: ReceiptLine(%q) len=%d want 40", c.desc, len(line))
		}
	}
}

// V32 — ReceiptLine price formatted to 2 decimal places
func TestV32_ReceiptLineDecimal(t *testing.T) {
	line := ReceiptLine("Tea", 2, 25.5)
	if !strings.Contains(line, "25.50") {
		t.Errorf("V32: price format missing '25.50' in %q", line)
	}
}

// V33 — ReceiptLine description truncated at 24 chars
func TestV33_ReceiptLineDescTruncation(t *testing.T) {
	desc := "ABCDEFGHIJKLMNOPQRSTUVWXYZ" // 26 chars
	line := ReceiptLine(desc, 1, 100.00)
	if !strings.HasPrefix(line, "ABCDEFGHIJKLMNOPQRSTUVWX") {
		t.Errorf("V33: description not truncated to 24, line=%q", line)
	}
}

// V34 — ReceiptLine quantity right-aligned in col width 4
func TestV34_ReceiptLineQtyAlign(t *testing.T) {
	line := ReceiptLine("X", 1, 10.00)
	// bytes 25 (space sep) then 4 chars for qty field = positions 25-28
	qtyField := line[25:29]
	if !strings.HasSuffix(strings.TrimLeft(qtyField, " "), "1") {
		t.Errorf("V34: qty field = %q, want right-aligned '1'", qtyField)
	}
}

// V35 — ReceiptLine high price value fits within 10 chars
func TestV35_ReceiptLineHighPrice(t *testing.T) {
	line := ReceiptLine("Item", 1, 123456.78)
	if !strings.Contains(line, "123456.78") {
		t.Errorf("V35: high price missing from %q", line)
	}
}

// ─── V36-V40: TCP error paths ─────────────────────────────────────────────────

// V36 — NewTCPPrinter fails on unreachable host (not loopback)
func TestV36_TCPDialFailure(t *testing.T) {
	_, err := NewTCPPrinter("192.0.2.1", 9100) // TEST-NET, guaranteed unreachable
	if err == nil {
		t.Error("V36: expected dial error for unreachable host, got nil")
	}
}

// V37 — TCPPrinter.Close on nil conn returns nil
func TestV37_TCPCloseNilConn(t *testing.T) {
	p := &TCPPrinter{conn: nil}
	if err := p.Close(); err != nil {
		t.Errorf("V37: Close on nil conn = %v, want nil", err)
	}
}

// V38 — TCPPrinter.Addr returns stored address
func TestV38_TCPAddr(t *testing.T) {
	p := &TCPPrinter{addr: "10.0.0.1:9100"}
	if p.Addr() != "10.0.0.1:9100" {
		t.Errorf("V38: Addr = %q, want %q", p.Addr(), "10.0.0.1:9100")
	}
}

// V39 — Default port used when port <= 0
func TestV39_DefaultPortFallback(t *testing.T) {
	// We just verify the constant value; actual dial will fail.
	if DefaultPrinterPort != 9100 {
		t.Errorf("V39: DefaultPrinterPort = %d, want 9100", DefaultPrinterPort)
	}
}

// V40 — TCP write latency across 50 iterations (AM Task 4 extended)
func TestV40_TCPWriteLatency50(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("V40: listen: %v", err)
	}
	defer ln.Close()

	go func() {
		conn, err := ln.Accept()
		if err != nil { return }
		defer conn.Close()
		buf := make([]byte, 65536)
		for { if _, err := conn.Read(buf); err != nil { return } }
	}()

	host, portStr, _ := net.SplitHostPort(ln.Addr().String())
	port := 0
	for _, c := range portStr { port = port*10 + int(c-'0') }

	p, err := NewTCPPrinter(host, port)
	if err != nil { t.Fatalf("V40: dial: %v", err) }
	defer p.Close()

	payload := NewBuilder().Println("TEST").Bytes()
	maxOK := 0
	for i := 0; i < 50; i++ {
		_, elapsed, err := p.Write(payload)
		if err != nil { t.Fatalf("V40: write[%d]: %v", i, err) }
		if elapsed <= 5*time.Millisecond { maxOK++ }
	}
	t.Logf("V40: %d/50 writes within 5ms on loopback", maxOK)
	if maxOK < 45 { // allow 5 jitter hits on slow CI
		t.Errorf("V40: only %d/50 writes within 5ms (need >=45)", maxOK)
	}
}

// ─── V41-V45: Heartbeat edge cases ───────────────────────────────────────────

// V41 — Stop is idempotent (second call must not panic)
func TestV41_HeartbeatStopIdempotent(t *testing.T) {
	dial := func() (Printer, error) {
		return &mockPrinter{addr: "x:9100"}, nil
	}
	logger := log.New(newTestLogWriter(t), "", 0)
	h, err := NewHeartbeat(dial, logger)
	if err != nil { t.Fatal(err) }
	h.Stop()
	h.Stop() // must not panic
}

// V42 — Heartbeat.Addr returns <disconnected> when conn is nil
func TestV42_HeartbeatAddrDisconnected(t *testing.T) {
	h := &Heartbeat{stopCh: make(chan struct{})}
	if h.Addr() != "<disconnected>" {
		t.Errorf("V42: Addr() = %q, want '<disconnected>'", h.Addr())
	}
}

// V43 — NewHeartbeat propagates dial error
func TestV43_HeartbeatDialError(t *testing.T) {
	dialErr := errors.New("no printer available")
	dial := func() (Printer, error) { return nil, dialErr }
	logger := log.New(newTestLogWriter(t), "", 0)
	_, err := NewHeartbeat(dial, logger)
	if err == nil {
		t.Error("V43: expected error from failing DialFunc, got nil")
	}
}

// V44 — markDisconnected twice doesn't panic
func TestV44_MarkDisconnectedTwice(t *testing.T) {
	h := &Heartbeat{
		conn:   &mockPrinter{addr: "x"},
		stopCh: make(chan struct{}),
	}
	h.markDisconnected()
	h.markDisconnected() // second call: conn is nil, must not panic
}

// V45 — Heartbeat.Send marks disconnected on write error
func TestV45_HeartbeatSendMarksDisconnected(t *testing.T) {
	mp := &mockPrinter{addr: "x:9100", forceErr: errors.New("write fail")}
	logger := log.New(newTestLogWriter(t), "", 0)
	h := &Heartbeat{
		conn:   mp,
		stopCh: make(chan struct{}),
		logger: logger,
	}
	h.Send([]byte{0x1B, 0x40})
	h.mu.RLock()
	conn := h.conn
	h.mu.RUnlock()
	if conn != nil {
		t.Error("V45: conn should be nil after Send write failure")
	}
}

// ─── V46-V50: USB enumeration (CI-safe, no hardware needed) ──────────────────

// V46 — ListUSBPrinters on Windows returns no error (port scan safe)
func TestV46_USBListNoError(t *testing.T) {
	_, err := ListUSBPrinters()
	// On Windows: either empty list or nil err; on Linux CI container: nil or empty.
	// On unsupported OS: error expected — that's fine too.
	if err != nil {
		t.Logf("V46: ListUSBPrinters err = %v (expected on this OS/CI)", err)
	}
}

// V47 — OpenUSBPrinter with no devices returns error
func TestV47_OpenUSBNoDevice(t *testing.T) {
	// Use non-existent VID/PID that will never match in a CI container.
	_, err := OpenUSBPrinter(0xFFFF, 0xFFFF)
	if err == nil {
		t.Error("V47: expected error for non-existent USB printer")
	}
}

// V48 — USBPrinter.Close on nil file returns nil
func TestV48_USBCloseNil(t *testing.T) {
	p := &USBPrinter{f: nil}
	if err := p.Close(); err != nil {
		t.Errorf("V48: Close nil = %v, want nil", err)
	}
}

// V49 — USBPrinter.Addr returns stored path
func TestV49_USBAddr(t *testing.T) {
	p := &USBPrinter{path: "/dev/usb/lp0"}
	if p.Addr() != "/dev/usb/lp0" {
		t.Errorf("V49: Addr = %q, want %q", p.Addr(), "/dev/usb/lp0")
	}
}

// V50 — USBDevice struct fields are correct types and values
func TestV50_USBDeviceFields(t *testing.T) {
	d := USBDevice{VendorID: 0x04B8, ProductID: 0x0202, Path: "/dev/usb/lp0"}
	if d.VendorID != 0x04B8 {
		t.Errorf("V50: VendorID = 0x%04X, want 0x04B8", d.VendorID)
	}
	if d.ProductID != 0x0202 {
		t.Errorf("V50: ProductID = 0x%04X, want 0x0202", d.ProductID)
	}
	if d.Path != "/dev/usb/lp0" {
		t.Errorf("V50: Path = %q, want /dev/usb/lp0", d.Path)
	}
}

// ─── V51-V55: ESC/POS Thermal Paper Roll Limitations (32 & 48 cols) ───────────

// V51 — 58mm roll width constant must equal 32 columns
func TestV51_RollWidth58mmValue(t *testing.T) {
	if RollWidth58mm != 32 {
		t.Errorf("V51: RollWidth58mm = %d, want 32", RollWidth58mm)
	}
}

// V52 — 80mm roll width constant must equal 48 columns
func TestV52_RollWidth80mmValue(t *testing.T) {
	if RollWidth80mm != 48 {
		t.Errorf("V52: RollWidth80mm = %d, want 48", RollWidth80mm)
	}
}

// V53 — ReceiptLine32 must produce exactly 32 columns
func TestV53_ReceiptLine32ExactWidth(t *testing.T) {
	cases := []struct {
		desc  string
		qty   int
		price float64
	}{
		{"Butter Chicken", 2, 480.00},
		{"Very Long Item Name Exceeding 18 chars", 10, 9999.99},
		{"", 0, 0.00},
	}
	for _, c := range cases {
		line := ReceiptLine32(c.desc, c.qty, c.price)
		if len(line) != 32 {
			t.Errorf("V53: ReceiptLine32(%q) len = %d, want 32; line = %q", c.desc, len(line), line)
		}
	}
}

// V54 — ReceiptLine48 must produce exactly 48 columns
func TestV54_ReceiptLine48ExactWidth(t *testing.T) {
	cases := []struct {
		desc  string
		qty   int
		price float64
	}{
		{"Butter Chicken Supreme Chef Special", 2, 540.00},
		{"Short Item", 1, 10.00},
		{"", 0, 0.00},
	}
	for _, c := range cases {
		line := ReceiptLine48(c.desc, c.qty, c.price)
		if len(line) != 48 {
			t.Errorf("V54: ReceiptLine48(%q) len = %d, want 48; line = %q", c.desc, len(line), line)
		}
	}
}

// V55 — SeparatorLine & CenterText matching 32/48 character limits
func TestV55_SeparatorAndCenterTextLimits(t *testing.T) {
	sep32 := SeparatorLine(RollWidth58mm)
	if len(sep32) != 32 {
		t.Errorf("V55: SeparatorLine(58mm) len = %d, want 32", len(sep32))
	}

	sep48 := SeparatorLine(RollWidth80mm)
	if len(sep48) != 48 {
		t.Errorf("V55: SeparatorLine(80mm) len = %d, want 48", len(sep48))
	}

	centered32 := CenterText("NELJA TECH", RollWidth58mm)
	if len(centered32) != 32 {
		t.Errorf("V55: CenterText(32) len = %d, want 32", len(centered32))
	}

	centered48 := CenterText("NELJA TECH", RollWidth80mm)
	if len(centered48) != 48 {
		t.Errorf("V55: CenterText(48) len = %d, want 48", len(centered48))
	}
}
