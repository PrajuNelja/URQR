// Command receipt-generator generates ESC/POS binary files, Hex dumps,
// and Base64 payloads for 58mm (32 col) and 80mm (48 col) thermal receipts.
//
// Can also stream directly to any ESC/POS TCP printer simulator on port 9100:
//   go run ./cmd/receipt-generator -roll=58 -host=virtual-printer.online -port=9100
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

	rawBytes := generateReceipt(roll)

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

func generateReceipt(roll printer.RollWidth) []byte {
	b := printer.NewBuilder()

	// Header
	b.Justify(printer.JustifyCenter).
		Bold(true).
		FontSize(printer.FontDoubleHW).
		Println("NELJA TECH").
		Bold(false).
		FontSize(printer.FontNormal)

	if roll == printer.RollWidth58mm {
		b.Println("58mm THERMAL POS").
			Println("GSTIN: 29AAAAA0000A1Z5").
			Println(printer.SeparatorLine(roll)).
			Println("Bill: #1042        Table: T-04").
			Println("24-Nov 12:25      Svr: Prajwal").
			Println(printer.SeparatorLine(roll))
	} else {
		b.Println("URQR STANDALONE POS -- 80mm ROLL").
			Println("Branch: Indiranagar, Bengaluru").
			Println("GSTIN: 29AAAAA0000A1Z5").
			Println(printer.SeparatorLine(roll)).
			Println("Bill No: #1042        Table: T-04   Svr: Prajwal").
			Println("Date: 24-Nov-2026 12:25 PM").
			Println(printer.SeparatorLine(roll))
	}

	// Column Header
	if roll == printer.RollWidth58mm {
		b.Justify(printer.JustifyLeft).
			Bold(true).
			Println(printer.FormatColumns(
				printer.Column{Text: "ITEM", Width: 18, Right: false},
				printer.Column{Text: "QTY", Width: 3, Right: true},
				printer.Column{Text: "PRICE", Width: 9, Right: true},
			)).
			Bold(false).
			Println(printer.SeparatorLine(roll))
	} else {
		b.Justify(printer.JustifyLeft).
			Bold(true).
			Println(printer.FormatColumns(
				printer.Column{Text: "ITEM DESCRIPTION", Width: 30, Right: false},
				printer.Column{Text: "QTY", Width: 4, Right: true},
				printer.Column{Text: "PRICE (INR)", Width: 12, Right: true},
			)).
			Bold(false).
			Println(printer.SeparatorLine(roll))
	}

	// Line items
	items := []struct {
		desc  string
		qty   int
		price float64
	}{
		{"Butter Chicken", 2, 480.00},
		{"Garlic Naan", 4, 160.00},
		{"Paneer Tikka XL", 1, 280.00},
		{"Fresh Lime Soda", 2, 120.00},
		{"Jeera Rice", 1, 140.00},
	}

	subtotal := 0.0
	for _, it := range items {
		subtotal += it.price
		b.Println(printer.ReceiptLineForRoll(roll, it.desc, it.qty, it.price))
	}

	cgst := subtotal * 0.025
	sgst := subtotal * 0.025
	grandTotal := subtotal + cgst + sgst

	b.Println(printer.SeparatorLine(roll))

	if roll == printer.RollWidth58mm {
		b.Println(printer.FormatColumns(
			printer.Column{Text: "Subtotal", Width: 18, Right: false},
			printer.Column{Text: "", Width: 3, Right: true},
			printer.Column{Text: fmt.Sprintf("%.2f", subtotal), Width: 9, Right: true},
		))
		b.Println(printer.FormatColumns(
			printer.Column{Text: "CGST (2.5%)", Width: 18, Right: false},
			printer.Column{Text: "", Width: 3, Right: true},
			printer.Column{Text: fmt.Sprintf("%.2f", cgst), Width: 9, Right: true},
		))
		b.Println(printer.FormatColumns(
			printer.Column{Text: "SGST (2.5%)", Width: 18, Right: false},
			printer.Column{Text: "", Width: 3, Right: true},
			printer.Column{Text: fmt.Sprintf("%.2f", sgst), Width: 9, Right: true},
		))
		b.Println(printer.SeparatorLine(roll)).
			Bold(true).
			Println(printer.FormatColumns(
				printer.Column{Text: "TOTAL", Width: 18, Right: false},
				printer.Column{Text: "", Width: 3, Right: true},
				printer.Column{Text: fmt.Sprintf("Rs.%.2f", grandTotal), Width: 9, Right: true},
			)).
			Bold(false)
	} else {
		b.Println(printer.FormatColumns(
			printer.Column{Text: "Subtotal", Width: 30, Right: false},
			printer.Column{Text: "", Width: 4, Right: true},
			printer.Column{Text: fmt.Sprintf("%.2f", subtotal), Width: 12, Right: true},
		))
		b.Println(printer.FormatColumns(
			printer.Column{Text: "CGST (2.5%)", Width: 30, Right: false},
			printer.Column{Text: "", Width: 4, Right: true},
			printer.Column{Text: fmt.Sprintf("%.2f", cgst), Width: 12, Right: true},
		))
		b.Println(printer.FormatColumns(
			printer.Column{Text: "SGST (2.5%)", Width: 30, Right: false},
			printer.Column{Text: "", Width: 4, Right: true},
			printer.Column{Text: fmt.Sprintf("%.2f", sgst), Width: 12, Right: true},
		))
		b.Println(printer.SeparatorLine(roll)).
			Bold(true).
			FontSize(printer.FontDoubleHeight).
			Println(printer.FormatColumns(
				printer.Column{Text: "TOTAL AMOUNT", Width: 26, Right: false},
				printer.Column{Text: "", Width: 4, Right: true},
				printer.Column{Text: fmt.Sprintf("Rs.%.2f", grandTotal), Width: 16, Right: true},
			)).
			Bold(false).
			FontSize(printer.FontNormal)
	}

	b.Println(printer.SeparatorLine(roll)).
		Justify(printer.JustifyCenter).
		Println("Payment: Dynamic UPI QR").
		Println("upi://pay?pa=urqr@nelja&am=1239.00").
		LineFeed(1).
		Println("*** THANK YOU FOR VISITING ***").
		Println("Powered by URQR Platform").
		LineFeed(4).
		Cut()

	return b.Bytes()
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
