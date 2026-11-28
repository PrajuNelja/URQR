// Package printer — template_test.go
// Tests the 80mm (48-column) and 58mm (32-column) ESC/POS template generator,
// item description wrapping, GST tax breakdown, and barcode formatting.
package printer

import (
	"bytes"
	"strings"
	"testing"
)

func sampleReceiptData() ReceiptData {
	return ReceiptData{
		Store: ReceiptStore{
			Name:    "URQR GOURMET KITCHEN",
			Branch:  "Indiranagar 100ft Rd, Bengaluru",
			Address: "Near Metro Pillar 42, Bengaluru - 560038",
			GSTIN:   "29AAAAA0000A1Z5",
			Phone:   "+91 80 4123 4567",
		},
		Order: ReceiptOrder{
			OrderID:       "ord_9876543210",
			BillNumber:    "#1042",
			TableNumber:   "T-04",
			ServerName:    "Prajwal",
			PaymentMode:   "Dynamic UPI QR",
			TransactionID: "UPI-IND-88492041",
			Timestamp:     "25-Nov-2026 12:45 PM",
			Notes:         "Less spicy, extra napkins",
		},
		Items: []ReceiptItem{
			{
				Name:       "Butter Chicken Special Masala with Cashew Gravy", // Long name > 30 chars
				Quantity:   2,
				UnitPrice:  240.00,
				TotalPrice: 480.00,
			},
			{
				Name:       "Garlic Butter Naan",
				Quantity:   4,
				UnitPrice:  40.00,
				TotalPrice: 160.00,
			},
			{
				Name:       "Fresh Lime Soda (Sweet & Salt)",
				Quantity:   2,
				UnitPrice:  60.00,
				TotalPrice: 120.00,
			},
		},
		Taxes: ReceiptTaxes{
			CGST:     19.00,
			CGSTRate: 2.5,
			SGST:     19.00,
			SGSTRate: 2.5,
			VAT:      0.00,
			VATRate:  0.0,
			TotalTax: 38.00,
		},
		Totals: ReceiptTotals{
			Subtotal:   760.00,
			Discount:   0.00,
			Tax:        38.00,
			GrandTotal: 798.00,
		},
		RollWidth: RollWidth80mm,
	}
}

func TestGenerateReceipt80mm_Structure(t *testing.T) {
	data := sampleReceiptData()
	payload := GenerateReceipt80mm(data)

	if len(payload) == 0 {
		t.Fatalf("Expected non-empty receipt payload")
	}

	// 1. Verify initialization command ESC @
	if !bytes.Contains(payload, ESCInit()) {
		t.Errorf("Receipt missing ESC @ initialization bytes")
	}

	// 2. Verify store name included
	if !bytes.Contains(payload, []byte("URQR GOURMET KITCHEN")) {
		t.Errorf("Receipt payload missing store name")
	}

	// 3. Verify GSTIN included
	if !bytes.Contains(payload, []byte("GSTIN: 29AAAAA0000A1Z5")) {
		t.Errorf("Receipt payload missing GSTIN")
	}

	// 4. Verify itemized tax lines
	if !bytes.Contains(payload, []byte("CGST (2.5%)")) {
		t.Errorf("Receipt payload missing CGST breakdown line")
	}
	if !bytes.Contains(payload, []byte("SGST (2.5%)")) {
		t.Errorf("Receipt payload missing SGST breakdown line")
	}

	// 5. Verify full paper cut at end
	cutBytes := GSFullCut()
	if !bytes.HasSuffix(payload, cutBytes) {
		t.Errorf("Receipt payload must end with GSFullCut bytes")
	}
}

func TestWrapText_LongDescriptions(t *testing.T) {
	longDesc := "Butter Chicken Special Masala with Cashew Gravy"
	lines := WrapText(longDesc, 30)

	if len(lines) < 2 {
		t.Fatalf("Expected long description to wrap into at least 2 lines, got %d", len(lines))
	}

	for i, l := range lines {
		if len([]rune(l)) > 30 {
			t.Errorf("Line %d exceeds 30 characters: %q (len=%d)", i, l, len([]rune(l)))
		}
	}
}

func TestFormatItemLines80mm_Columns(t *testing.T) {
	desc := "Hyderabadi Dum Biryani Family Pack with Mirchi Ka Salan"
	lines := FormatItemLines80mm(desc, 1, 850.00)

	if len(lines) < 2 {
		t.Fatalf("Expected multi-line item formatting, got %d line(s)", len(lines))
	}

	// Each formatted line must be exactly 48 columns
	for i, l := range lines {
		if len(l) != 48 {
			t.Errorf("Item line %d width = %d, expected 48: %q", i, len(l), l)
		}
	}

	// First line should contain the price
	if !strings.Contains(lines[0], "850.00") {
		t.Errorf("First line missing price: %s", lines[0])
	}
}

func TestTaxLineFormat48(t *testing.T) {
	line := FormatTaxLine48("CGST", 2.5, 29.50)
	if len(line) != 48 {
		t.Errorf("Tax line length = %d, expected 48: %q", len(line), line)
	}
	if !strings.HasPrefix(line, "CGST (2.5%)") {
		t.Errorf("Tax line missing label prefix: %s", line)
	}
	if !strings.HasSuffix(line, "29.50") {
		t.Errorf("Tax line missing right-aligned amount: %s", line)
	}
}

func TestBarcodeGeneration(t *testing.T) {
	barcodeBytes := GSBarcodeCode128("1042")
	if len(barcodeBytes) == 0 {
		t.Fatalf("Expected non-empty barcode bytes")
	}
	// Check prefix
	if barcodeBytes[0] != GS || barcodeBytes[1] != 0x6B || barcodeBytes[2] != 73 {
		t.Errorf("Barcode command header invalid: %v", barcodeBytes[:3])
	}
}

func TestGenerateReceipt58mm_Fallback(t *testing.T) {
	data := sampleReceiptData()
	data.RollWidth = RollWidth58mm
	payload := GenerateReceipt(data)

	if len(payload) == 0 {
		t.Fatalf("Expected non-empty 58mm payload")
	}
	if !bytes.Contains(payload, []byte("URQR GOURMET KITCHEN")) {
		t.Errorf("58mm receipt missing store name")
	}
	if !bytes.HasSuffix(payload, GSFullCut()) {
		t.Errorf("58mm receipt must end with GSFullCut bytes")
	}
}
