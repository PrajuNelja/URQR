// Package printer — escpos.go
// ESC/POS command builder.
//
// Implements:
//   - Hardware reset         (ESC @)
//   - Character set          (ESC t n)
//   - Bold on/off            (ESC E n)
//   - Double-height+width    (GS ! n)
//   - Text justification     (ESC a n)  left / center / right
//   - Line feeds             (ESC d n)
//   - Full paper cut         (GS V m)
//   - Column alignment formatter
//
// All constants are raw ESC/POS protocol byte sequences.
// No CGO, no external dependencies — pure Go, CGO_ENABLED=0 compatible.
package printer

import (
	"bytes"
	"fmt"
	"strings"
)

// ─── ESC/POS byte constants ─────────────────────────────────────────────────

const (
	ESC = 0x1B
	GS  = 0x1D
	LF  = 0x0A
)

// CharSet selects the active character code table.
type CharSet byte

const (
	CharSetPC437  CharSet = 0x00 // PC437 (USA, Standard Europe) — default
	CharSetPC850  CharSet = 0x02 // PC850 Multilingual
	CharSetPC858  CharSet = 0x13 // PC858 Euro symbol
)

// Justify controls text alignment.
type Justify byte

const (
	JustifyLeft   Justify = 0x00
	JustifyCenter Justify = 0x01
	JustifyRight  Justify = 0x02
)

// FontSize encodes GS ! double-height / double-width bits.
type FontSize byte

const (
	FontNormal       FontSize = 0x00 // Normal size
	FontDoubleHeight FontSize = 0x01 // Double height  (GS ! 0x01)
	FontDoubleWidth  FontSize = 0x10 // Double width   (GS ! 0x10)
	FontDoubleHW     FontSize = 0x11 // Double height + width (GS ! 0x11)
)

// ─── Command builders ────────────────────────────────────────────────────────

// ESCInit returns the ESC @ (hardware reset) command.
// Clears print buffer and resets all settings to defaults.
func ESCInit() []byte {
	return []byte{ESC, 0x40}
}

// ESCCharSet returns ESC t n — select character code table.
func ESCCharSet(cs CharSet) []byte {
	return []byte{ESC, 0x74, byte(cs)}
}

// ESCBold returns ESC E n — bold on (n=1) or off (n=0).
func ESCBold(on bool) []byte {
	n := byte(0x00)
	if on {
		n = 0x01
	}
	return []byte{ESC, 0x45, n}
}

// GSFontSize returns GS ! n — select print mode (font size).
// Use FontDoubleHeight, FontDoubleWidth, or FontDoubleHW.
func GSFontSize(size FontSize) []byte {
	return []byte{GS, 0x21, byte(size)}
}

// ESCJustify returns ESC a n — text justification.
func ESCJustify(j Justify) []byte {
	return []byte{ESC, 0x61, byte(j)}
}

// ESCLineFeed returns ESC d n — print and feed n lines.
func ESCLineFeed(lines uint8) []byte {
	return []byte{ESC, 0x64, lines}
}

// GSFullCut returns GS V A 0 — full paper cut.
func GSFullCut() []byte {
	return []byte{GS, 0x56, 0x41, 0x00}
}

// ─── High-level builder ──────────────────────────────────────────────────────

// Builder assembles a sequence of ESC/POS commands into a single byte slice
// ready to send to the printer.
type Builder struct {
	buf bytes.Buffer
}

// NewBuilder returns an initialised Builder that starts with ESC @ reset.
func NewBuilder() *Builder {
	b := &Builder{}
	b.buf.Write(ESCInit())
	b.buf.Write(ESCCharSet(CharSetPC437))
	return b
}

func (b *Builder) Bold(on bool) *Builder {
	b.buf.Write(ESCBold(on))
	return b
}

func (b *Builder) FontSize(size FontSize) *Builder {
	b.buf.Write(GSFontSize(size))
	return b
}

func (b *Builder) Justify(j Justify) *Builder {
	b.buf.Write(ESCJustify(j))
	return b
}

func (b *Builder) Print(text string) *Builder {
	b.buf.WriteString(text)
	return b
}

func (b *Builder) Println(text string) *Builder {
	b.buf.WriteString(text)
	b.buf.WriteByte(LF)
	return b
}

func (b *Builder) LineFeed(n uint8) *Builder {
	b.buf.Write(ESCLineFeed(n))
	return b
}

func (b *Builder) Cut() *Builder {
	b.buf.Write(GSFullCut())
	return b
}

// Bytes returns the assembled command bytes.
func (b *Builder) Bytes() []byte {
	return b.buf.Bytes()
}

// ─── Column alignment formatter & Roll Profiles ─────────────────────────────

// RollWidth defines the character column limitation for standard ESC/POS thermal printers.
type RollWidth int

const (
	// RollWidth58mm is the standard character capacity for 58mm thermal rolls
	// using Font A (12×24 dots, 384 dot print line width) = 32 columns.
	RollWidth58mm RollWidth = 32

	// RollWidth80mm is the standard character capacity for 80mm thermal rolls
	// using Font A (12×24 dots, 576 dot print line width) = 48 columns.
	RollWidth80mm RollWidth = 48
)

// Column describes a single column in a row: its content and display width.
type Column struct {
	Text  string
	Width int  // character width of the column
	Right bool // if true, right-align text; default is left-align
}

// FormatColumns formats a row of columns into a fixed-width string line.
// Columns are padded or truncated to their declared Width. A single space
// separates columns. The result is exactly sum(col.Width) + (len(cols)-1)
// characters wide.
//
// Example:
//
//	FormatColumns(
//	  Column{"Butter Chicken", 24, false},
//	  Column{"2",               4, true},
//	  Column{"480.00",         10, true},
//	)
//	// => "Butter Chicken              2     480.00"
func FormatColumns(cols ...Column) string {
	parts := make([]string, len(cols))
	for i, c := range cols {
		if c.Right {
			parts[i] = padLeft(c.Text, c.Width)
		} else {
			parts[i] = padRight(c.Text, c.Width)
		}
	}
	return strings.Join(parts, " ")
}

func padRight(s string, width int) string {
	r := []rune(s)
	if len(r) >= width {
		return string(r[:width])
	}
	return string(r) + strings.Repeat(" ", width-len(r))
}

func padLeft(s string, width int) string {
	r := []rune(s)
	if len(r) >= width {
		return string(r[:width])
	}
	return strings.Repeat(" ", width-len(r)) + string(r)
}

// ReceiptLine is a convenience wrapper for a default 40-column POS receipt item line:
//   description (left, 24 chars) | qty (right, 4) | price (right, 10) -> 24+1+4+1+10 = 40
func ReceiptLine(desc string, qty int, price float64) string {
	return FormatColumns(
		Column{Text: desc, Width: 24, Right: false},
		Column{Text: fmt.Sprintf("%d", qty), Width: 4, Right: true},
		Column{Text: fmt.Sprintf("%.2f", price), Width: 10, Right: true},
	)
}

// ReceiptLine32 formats an item line strictly constrained to 32 columns (for 58mm thermal rolls):
//   description (18) + space (1) + qty (3) + space (1) + price (9) = 32 columns
func ReceiptLine32(desc string, qty int, price float64) string {
	return FormatColumns(
		Column{Text: desc, Width: 18, Right: false},
		Column{Text: fmt.Sprintf("%d", qty), Width: 3, Right: true},
		Column{Text: fmt.Sprintf("%.2f", price), Width: 9, Right: true},
	)
}

// ReceiptLine48 formats an item line strictly constrained to 48 columns (for 80mm thermal rolls):
//   description (30) + space (1) + qty (4) + space (1) + price (12) = 48 columns
func ReceiptLine48(desc string, qty int, price float64) string {
	return FormatColumns(
		Column{Text: desc, Width: 30, Right: false},
		Column{Text: fmt.Sprintf("%d", qty), Width: 4, Right: true},
		Column{Text: fmt.Sprintf("%.2f", price), Width: 12, Right: true},
	)
}

// ReceiptLineForRoll formats an item line according to the target printer roll width.
// Returns 32-column format for RollWidth58mm, 48-column for RollWidth80mm, or default 40-column.
func ReceiptLineForRoll(roll RollWidth, desc string, qty int, price float64) string {
	switch roll {
	case RollWidth58mm:
		return ReceiptLine32(desc, qty, price)
	case RollWidth80mm:
		return ReceiptLine48(desc, qty, price)
	default:
		return ReceiptLine(desc, qty, price)
	}
}

// SeparatorLine returns a horizontal dashed divider line matching the roll column width.
func SeparatorLine(roll RollWidth) string {
	return strings.Repeat("-", int(roll))
}

// CenterText centers a text line within the specified roll column width.
func CenterText(text string, roll RollWidth) string {
	w := int(roll)
	r := []rune(text)
	if len(r) >= w {
		return string(r[:w])
	}
	leftPad := (w - len(r)) / 2
	rightPad := w - len(r) - leftPad
	return strings.Repeat(" ", leftPad) + string(r) + strings.Repeat(" ", rightPad)
}
