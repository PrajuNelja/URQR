// Package printer — template.go
// Implements the official 80mm (48-column) and 58mm (32-column) ESC/POS
// thermal receipt template generator according to Gagan's design specifications.
//
// Pure Go, CGO_ENABLED=0 compatible.
package printer

import (
	"fmt"
	"strings"
	"time"
)

// ReceiptItem represents a line item on the printed bill.
type ReceiptItem struct {
	Name       string  `json:"name"`
	Quantity   int     `json:"quantity"`
	UnitPrice  float64 `json:"unitPrice"`
	TotalPrice float64 `json:"totalPrice"`
	TaxRate    float64 `json:"taxRate,omitempty"`
}

// ReceiptTaxes represents the itemized GST tax breakdown.
type ReceiptTaxes struct {
	CGST     float64 `json:"cgst"`
	CGSTRate float64 `json:"cgstRate"` // e.g. 2.5
	SGST     float64 `json:"sgst"`
	SGSTRate float64 `json:"sgstRate"` // e.g. 2.5
	VAT      float64 `json:"vat"`
	VATRate  float64 `json:"vatRate"`  // e.g. 0.0
	TotalTax float64 `json:"totalTax"`
}

// ReceiptTotals holds the monetary aggregations for the bill.
type ReceiptTotals struct {
	Subtotal   float64 `json:"subtotal"`
	Discount   float64 `json:"discount,omitempty"`
	Tax        float64 `json:"tax"`
	GrandTotal float64 `json:"grandTotal"`
}

// ReceiptStore holds store branding and tax registration details.
type ReceiptStore struct {
	Name    string `json:"name"`
	Branch  string `json:"branch,omitempty"`
	Address string `json:"address,omitempty"`
	GSTIN   string `json:"gstin,omitempty"`
	Phone   string `json:"phone,omitempty"`
}

// ReceiptOrder holds metadata for a specific order.
type ReceiptOrder struct {
	OrderID       string `json:"orderId"`
	BillNumber    string `json:"billNumber,omitempty"`
	TableNumber   string `json:"tableNumber,omitempty"`
	ServerName    string `json:"serverName,omitempty"`
	PaymentMode   string `json:"paymentMode,omitempty"`
	TransactionID string `json:"transactionId,omitempty"`
	Timestamp     string `json:"timestamp,omitempty"`
	Notes         string `json:"notes,omitempty"`
}

// ReceiptData encapsulates all information needed to format and print a receipt.
type ReceiptData struct {
	Store     ReceiptStore  `json:"store"`
	Order     ReceiptOrder  `json:"order"`
	Items     []ReceiptItem `json:"items"`
	Taxes     ReceiptTaxes  `json:"taxes"`
	Totals    ReceiptTotals `json:"totals"`
	RollWidth RollWidth     `json:"rollWidth,omitempty"` // Default: RollWidth80mm (48)
}

// ─── Multi-line text wrapping helper ─────────────────────────────────────────

// WrapText splits a long text string into slice of lines, each with at most maxChars runes.
// It wraps on spaces where possible to prevent breaking words across lines.
func WrapText(text string, maxChars int) []string {
	if maxChars <= 0 {
		return []string{text}
	}
	text = strings.TrimSpace(text)
	if len([]rune(text)) <= maxChars {
		return []string{text}
	}

	var lines []string
	words := strings.Fields(text)
	if len(words) == 0 {
		return []string{""}
	}

	var currentLine string
	for _, word := range words {
		// If word itself is longer than maxChars, slice it
		if len([]rune(word)) > maxChars {
			if currentLine != "" {
				lines = append(lines, currentLine)
				currentLine = ""
			}
			runes := []rune(word)
			for len(runes) > maxChars {
				lines = append(lines, string(runes[:maxChars]))
				runes = runes[maxChars:]
			}
			currentLine = string(runes)
			continue
		}

		if currentLine == "" {
			currentLine = word
		} else if len([]rune(currentLine))+1+len([]rune(word)) <= maxChars {
			currentLine += " " + word
		} else {
			lines = append(lines, currentLine)
			currentLine = word
		}
	}
	if currentLine != "" {
		lines = append(lines, currentLine)
	}
	return lines
}

// ─── Line formatters for 80mm (48 columns) ───────────────────────────────────

// FormatItemLines80mm formats an item line with multi-line description wrapping:
//   Column allocation: Desc (30) + space (1) + Qty (4) + space (1) + Price (12) = 48 cols.
// Line 1 contains the first chunk of the description along with Qty and Price.
// Subsequent lines contain remaining description lines indented in the 30-char description column.
func FormatItemLines80mm(desc string, qty int, price float64) []string {
	const descWidth = 30
	wrappedDesc := WrapText(desc, descWidth)
	if len(wrappedDesc) == 0 {
		wrappedDesc = []string{""}
	}

	var lines []string
	// First line includes Qty and Price
	firstLine := FormatColumns(
		Column{Text: wrappedDesc[0], Width: descWidth, Right: false},
		Column{Text: fmt.Sprintf("%d", qty), Width: 4, Right: true},
		Column{Text: fmt.Sprintf("%.2f", price), Width: 12, Right: true},
	)
	lines = append(lines, firstLine)

	// Additional lines display wrapped description with blank qty and price columns
	for i := 1; i < len(wrappedDesc); i++ {
		contLine := FormatColumns(
			Column{Text: wrappedDesc[i], Width: descWidth, Right: false},
			Column{Text: "", Width: 4, Right: true},
			Column{Text: "", Width: 12, Right: true},
		)
		lines = append(lines, contLine)
	}
	return lines
}

// FormatTaxLine48 formats an itemized tax breakdown line for 48 columns:
//   Label (32 chars left) + Space (1) + Amount (15 chars right) = 48 cols.
func FormatTaxLine48(label string, rate float64, amount float64) string {
	tag := fmt.Sprintf("%s (%.1f%%)", label, rate)
	return FormatColumns(
		Column{Text: tag, Width: 32, Right: false},
		Column{Text: fmt.Sprintf("%.2f", amount), Width: 15, Right: true},
	)
}

// FormatSummaryLine48 formats a generic total/discount line for 48 columns.
func FormatSummaryLine48(label string, amount float64) string {
	return FormatColumns(
		Column{Text: label, Width: 32, Right: false},
		Column{Text: fmt.Sprintf("%.2f", amount), Width: 15, Right: true},
	)
}

// ─── Complete Receipt Generator ─────────────────────────────────────────────

// GenerateReceipt80mm generates a complete ESC/POS binary byte stream formatted strictly
// for 80mm (48-column) thermal paper according to Gagan's design specifications.
func GenerateReceipt80mm(data ReceiptData) []byte {
	b := NewBuilder()
	roll := RollWidth80mm

	// 1. Store Header
	storeName := data.Store.Name
	if storeName == "" {
		storeName = "NELJA TECH POS"
	}
	b.Justify(JustifyCenter).
		Bold(true).
		FontSize(FontDoubleHW).
		Println(storeName).
		Bold(false).
		FontSize(FontNormal)

	if data.Store.Branch != "" {
		b.Println(CenterText(data.Store.Branch, roll))
	}
	if data.Store.Address != "" {
		b.Println(CenterText(data.Store.Address, roll))
	}
	if data.Store.GSTIN != "" {
		b.Println(CenterText("GSTIN: "+data.Store.GSTIN, roll))
	}
	if data.Store.Phone != "" {
		b.Println(CenterText("Tel: "+data.Store.Phone, roll))
	}

	b.Println(SeparatorLine(roll))

	// 2. Order Metadata
	b.Justify(JustifyLeft)
	billNo := data.Order.BillNumber
	if billNo == "" {
		billNo = "#" + data.Order.OrderID
	}
	tableNo := data.Order.TableNumber
	if tableNo == "" {
		tableNo = "Takeaway"
	}
	server := data.Order.ServerName
	if server == "" {
		server = "Manager"
	}
	dt := data.Order.Timestamp
	if dt == "" {
		dt = time.Now().Format("02-Jan-2006 03:04 PM")
	}

	meta1 := FormatColumns(
		Column{Text: "Bill: " + billNo, Width: 23, Right: false},
		Column{Text: "Table: " + tableNo, Width: 24, Right: true},
	)
	meta2 := FormatColumns(
		Column{Text: "Date: " + dt, Width: 28, Right: false},
		Column{Text: "Svr: " + server, Width: 19, Right: true},
	)
	b.Println(meta1).Println(meta2)
	b.Println(SeparatorLine(roll))

	// 3. Items Table Header
	b.Bold(true).
		Println(FormatColumns(
			Column{Text: "ITEM", Width: 30, Right: false},
			Column{Text: "QTY", Width: 4, Right: true},
			Column{Text: "PRICE", Width: 12, Right: true},
		)).
		Bold(false).
		Println(SeparatorLine(roll))

	// 4. Line Items with Multi-line Wrapping
	for _, item := range data.Items {
		lines := FormatItemLines80mm(item.Name, item.Quantity, item.TotalPrice)
		for _, l := range lines {
			b.Println(l)
		}
	}
	b.Println(SeparatorLine(roll))

	// 5. Totals & Tax Breakdown
	b.Println(FormatSummaryLine48("Subtotal", data.Totals.Subtotal))

	if data.Taxes.CGST > 0 || data.Taxes.CGSTRate > 0 {
		rate := data.Taxes.CGSTRate
		if rate == 0 {
			rate = 2.5
		}
		b.Println(FormatTaxLine48("CGST", rate, data.Taxes.CGST))
	}
	if data.Taxes.SGST > 0 || data.Taxes.SGSTRate > 0 {
		rate := data.Taxes.SGSTRate
		if rate == 0 {
			rate = 2.5
		}
		b.Println(FormatTaxLine48("SGST", rate, data.Taxes.SGST))
	}
	if data.Taxes.VAT > 0 || data.Taxes.VATRate > 0 {
		b.Println(FormatTaxLine48("VAT", data.Taxes.VATRate, data.Taxes.VAT))
	}

	if data.Totals.Discount > 0 {
		b.Println(FormatSummaryLine48("Discount Applied", -data.Totals.Discount))
	}

	b.Println(SeparatorLine(roll))

	// 6. Grand Total (High-visibility bold)
	b.Bold(true).
		FontSize(FontDoubleHeight).
		Println(FormatColumns(
			Column{Text: "TOTAL PAYABLE", Width: 24, Right: false},
			Column{Text: fmt.Sprintf("Rs.%.2f", data.Totals.GrandTotal), Width: 23, Right: true},
		)).
		Bold(false).
		FontSize(FontNormal)

	b.Println(SeparatorLine(roll))

	// 7. Payment Information & Footer
	paymentMode := data.Order.PaymentMode
	if paymentMode == "" {
		paymentMode = "Cash"
	}
	b.Justify(JustifyCenter).
		Println("Payment Method: " + paymentMode)

	if data.Order.TransactionID != "" {
		b.Println("Txn ID: " + data.Order.TransactionID)
	}
	if data.Order.Notes != "" {
		b.Println("Notes: " + data.Order.Notes)
	}

	b.LineFeed(1)

	// 8. Barcode Rendering (Code128 of OrderID/BillNo)
	barcodeVal := data.Order.BillNumber
	if barcodeVal == "" {
		barcodeVal = data.Order.OrderID
	}
	if barcodeVal != "" {
		// Clean alphanumeric for Code128
		cleanBarcode := strings.ReplaceAll(barcodeVal, "#", "")
		if cleanBarcode != "" {
			b.Barcode(cleanBarcode)
			b.LineFeed(1)
		}
	}

	// 9. Polite Greeting & Platform Attribution
	b.Justify(JustifyCenter).
		Bold(true).
		Println("*** THANK YOU FOR VISITING ***").
		Bold(false).
		Println("Powered by URQR Platform")

	// 10. Feed & Paper Cut
	b.LineFeed(4).Cut()

	return b.Bytes()
}

// GenerateReceipt auto-selects between 80mm and 58mm profiles based on RollWidth.
func GenerateReceipt(data ReceiptData) []byte {
	if data.RollWidth == RollWidth58mm {
		// Return 58mm formatted receipt if requested
		return generateReceipt58mm(data)
	}
	return GenerateReceipt80mm(data)
}

func generateReceipt58mm(data ReceiptData) []byte {
	b := NewBuilder()
	roll := RollWidth58mm

	storeName := data.Store.Name
	if storeName == "" {
		storeName = "NELJA TECH POS"
	}
	b.Justify(JustifyCenter).
		Bold(true).
		Println(storeName).
		Bold(false)

	if data.Store.GSTIN != "" {
		b.Println("GSTIN: " + data.Store.GSTIN)
	}
	b.Println(SeparatorLine(roll))

	b.Justify(JustifyLeft)
	billNo := data.Order.BillNumber
	if billNo == "" {
		billNo = "#" + data.Order.OrderID
	}
	b.Println(FormatColumns(
		Column{Text: "Bill: " + billNo, Width: 15, Right: false},
		Column{Text: "Tbl: " + data.Order.TableNumber, Width: 16, Right: true},
	))
	b.Println(SeparatorLine(roll))

	// Items (32 columns: desc 18, qty 3, price 9)
	for _, item := range data.Items {
		wrapped := WrapText(item.Name, 18)
		if len(wrapped) > 0 {
			b.Println(FormatColumns(
				Column{Text: wrapped[0], Width: 18, Right: false},
				Column{Text: fmt.Sprintf("%d", item.Quantity), Width: 3, Right: true},
				Column{Text: fmt.Sprintf("%.2f", item.TotalPrice), Width: 9, Right: true},
			))
			for i := 1; i < len(wrapped); i++ {
				b.Println(FormatColumns(
					Column{Text: wrapped[i], Width: 18, Right: false},
					Column{Text: "", Width: 3, Right: true},
					Column{Text: "", Width: 9, Right: true},
				))
			}
		}
	}
	b.Println(SeparatorLine(roll))
	b.Println(FormatColumns(
		Column{Text: "Subtotal", Width: 20, Right: false},
		Column{Text: fmt.Sprintf("%.2f", data.Totals.Subtotal), Width: 11, Right: true},
	))
	b.Println(FormatColumns(
		Column{Text: "Tax", Width: 20, Right: false},
		Column{Text: fmt.Sprintf("%.2f", data.Totals.Tax), Width: 11, Right: true},
	))
	b.Println(SeparatorLine(roll))
	b.Bold(true).Println(FormatColumns(
		Column{Text: "TOTAL", Width: 18, Right: false},
		Column{Text: fmt.Sprintf("Rs.%.2f", data.Totals.GrandTotal), Width: 13, Right: true},
	)).Bold(false)
	b.Println(SeparatorLine(roll))
	b.Justify(JustifyCenter).
		Println("Payment: " + data.Order.PaymentMode).
		Println("*** THANK YOU ***").
		LineFeed(3).
		Cut()

	return b.Bytes()
}
