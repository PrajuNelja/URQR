// Command receipt-generator generates ESC/POS binary files, Hex dumps,
// and Base64 payloads for 58mm (32 col) and 80mm (48 col) thermal receipts.
//
// Can also stream directly to any ESC/POS TCP printer simulator on port 9100:
//   go run ./cmd/receipt-generator -roll=80 -out=receipt_80mm.bin
//   go run ./cmd/receipt-generator -roll=58 -out=receipt_58mm.bin
package main

import (
	"encoding/base64"
	"flag"
	"fmt"
	"os"
	"strings"

	"github.com/nelja/urqr-bridge/printer"
)

func main() {
	rollFlag := flag.Int("roll", 80, "Paper roll width in mm: 58 or 80")
	hostFlag := flag.String("host", "", "Target TCP printer host/IP (optional)")
	portFlag := flag.Int("port", 9100, "Target TCP printer port")
	outputFile := flag.String("out", "", "Output binary file path (optional)")
	flag.Parse()

	var roll printer.RollWidth
	if *rollFlag == 58 {
		roll = printer.RollWidth58mm
	} else {
		roll = printer.RollWidth80mm
	}

	sampleData := createSampleReceiptData(roll)
	rawBytes := printer.GenerateReceipt(sampleData)

	fmt.Printf("====================================================================\n")
	fmt.Printf("  URQR ESC/POS THERMAL RECEIPT — %dmm PROFILE (%d COLUMNS)\n", *rollFlag, int(roll))
	fmt.Printf("====================================================================\n")
	fmt.Printf("Payload Size: %d bytes\n\n", len(rawBytes))

	// 1. Save binary file if requested or by default
	fileName := *outputFile
	if fileName == "" {
		fileName = fmt.Sprintf("receipt_%dmm.bin", *rollFlag)
	}
	if err := os.WriteFile(fileName, rawBytes, 0644); err == nil {
		fmt.Printf("[+] Generated Binary File: %s\n", fileName)
	}

	// 2. Base64
	b64 := base64.StdEncoding.EncodeToString(rawBytes)
	fmt.Printf("\n--- [BASE64 STRING (for Web Simulators)] ---\n%s\n", b64)

	// 3. Hex dump
	hexFormatted := formatHex(rawBytes)
	fmt.Printf("\n--- [HEX DUMP (for virtual-printer.online)] ---\n%s\n", hexFormatted)

	// 4. Send via TCP if host provided
	if *hostFlag != "" {
		fmt.Printf("\n--> Connecting to raw TCP socket: %s:%d ...\n", *hostFlag, *portFlag)
		p, err := printer.NewTCPPrinter(*hostFlag, *portFlag)
		if err != nil {
			fmt.Printf("[-] TCP Dial Failed: %v\n", err)
			return
		}
		defer p.Close()

		elapsed, err := p.Send(rawBytes)
		if err != nil {
			fmt.Printf("[-] Print Write Failed: %v\n", err)
			return
		}
		fmt.Printf("[+] Successfully printed to %s:%d in %s!\n", *hostFlag, *portFlag, elapsed)
	}
}

func createSampleReceiptData(roll printer.RollWidth) printer.ReceiptData {
	return printer.ReceiptData{
		RollWidth: roll,
		Store: printer.ReceiptStore{
			Name:    "NELJA TECH STANDALONE POS",
			Branch:  "Indiranagar, Bengaluru",
			Address: "100 Feet Rd, HAL 2nd Stage",
			GSTIN:   "29AAAAA0000A1Z5",
			Phone:   "+91-80-4920-1122",
		},
		Order: printer.ReceiptOrder{
			OrderID:       "1042",
			BillNumber:    "BL-2026-1042",
			TableNumber:   "T-04",
			ServerName:    "Prajwal",
			PaymentMode:   "Dynamic UPI QR",
			TransactionID: "TXN98765432100",
			Timestamp:     "24-Nov-2026 12:25 PM",
		},
		Items: []printer.ReceiptItem{
			{Name: "Butter Chicken Special Boneless with Rich Gravy", Quantity: 2, UnitPrice: 240.00, TotalPrice: 480.00},
			{Name: "Garlic Naan Butter Glazed", Quantity: 4, UnitPrice: 40.00, TotalPrice: 160.00},
			{Name: "Paneer Tikka XL Sizzling Platter", Quantity: 1, UnitPrice: 280.00, TotalPrice: 280.00},
			{Name: "Fresh Lime Soda Sweet & Salt Mix", Quantity: 2, UnitPrice: 60.00, TotalPrice: 120.00},
			{Name: "Jeera Rice Aromatic Basmati", Quantity: 1, UnitPrice: 140.00, TotalPrice: 140.00},
		},
		Taxes: printer.ReceiptTaxes{
			CGST:     29.50,
			CGSTRate: 2.5,
			SGST:     29.50,
			SGSTRate: 2.5,
			TotalTax: 59.00,
		},
		Totals: printer.ReceiptTotals{
			Subtotal:   1180.00,
			Discount:   0.00,
			Tax:        59.00,
			GrandTotal: 1239.00,
		},
	}
}

func formatHex(data []byte) string {
	var sb strings.Builder
	for i, b := range data {
		sb.WriteString(fmt.Sprintf("%02X ", b))
		if (i+1)%16 == 0 {
			sb.WriteString("\n")
		}
	}
	return sb.String()
}
