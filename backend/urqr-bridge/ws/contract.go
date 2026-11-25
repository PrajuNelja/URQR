// Package ws — contract.go
// Defines the JSON contract for print requests, print responses,
// and real-time hardware status events between Tauri v2 and Go URQR-Bridge.
//
// Pure Go, CGO_ENABLED=0 compatible.
package ws

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/nelja/urqr-bridge/printer"
)

// Hardware status event constants.
const (
	StatusPrinterReady   = "PRINTER_READY"
	StatusPaperOut       = "PAPER_OUT"
	StatusPrinterOffline = "PRINTER_OFFLINE"
	StatusPrinting       = "PRINTING"
	StatusPrintError     = "PRINT_ERROR"
)

// PrintOrderItem represents an item in the JSON print payload.
type PrintOrderItem struct {
	ID         string  `json:"id,omitempty"`
	Name       string  `json:"name"`
	Quantity   int     `json:"quantity"`
	UnitPrice  float64 `json:"unitPrice"`
	TotalPrice float64 `json:"totalPrice"`
	TaxRate    float64 `json:"taxRate,omitempty"`
	Category   string  `json:"category,omitempty"`
}

// TaxBreakdown represents the itemized GST taxes in the JSON payload.
type TaxBreakdown struct {
	CGST     float64 `json:"cgst"`
	CGSTRate float64 `json:"cgstRate,omitempty"`
	SGST     float64 `json:"sgst"`
	SGSTRate float64 `json:"sgstRate,omitempty"`
	VAT      float64 `json:"vat,omitempty"`
	VATRate  float64 `json:"vatRate,omitempty"`
	TotalTax float64 `json:"totalTax"`
}

// PrintOrderTotals represents the bill calculations in the JSON payload.
type PrintOrderTotals struct {
	Subtotal   float64 `json:"subtotal"`
	Discount   float64 `json:"discount,omitempty"`
	Tax        float64 `json:"tax"`
	GrandTotal float64 `json:"grandTotal"`
}

// StoreDetails represents store branding in the JSON payload.
type StoreDetails struct {
	Name    string `json:"name"`
	Branch  string `json:"branch,omitempty"`
	Address string `json:"address,omitempty"`
	GSTIN   string `json:"gstin,omitempty"`
	Phone   string `json:"phone,omitempty"`
}

// PrintRequest is the core contract emitted by Tauri v2 / POS frontend.
// Mandate: {orderId, tenantId, items, taxes, totals}
type PrintRequest struct {
	Action        string           `json:"action,omitempty"` // "print", "reprint", "ping"
	OrderID       string           `json:"orderId"`
	TenantID      string           `json:"tenantId"`
	BillNumber    string           `json:"billNumber,omitempty"`
	TableNumber   string           `json:"tableNumber,omitempty"`
	ServerName    string           `json:"serverName,omitempty"`
	PaymentMode   string           `json:"paymentMode,omitempty"`
	TransactionID string           `json:"transactionId,omitempty"`
	Timestamp     string           `json:"timestamp,omitempty"`
	Notes         string           `json:"notes,omitempty"`
	Store         StoreDetails     `json:"store,omitempty"`
	Items         []PrintOrderItem `json:"items"`
	Taxes         TaxBreakdown     `json:"taxes"`
	Totals        PrintOrderTotals `json:"totals"`
	RollWidth     int              `json:"rollWidth,omitempty"` // 58 or 80 (default: 80)
}

// Validate checks that required fields exist.
func (r *PrintRequest) Validate() error {
	if r.OrderID == "" {
		return errors.New("missing orderId in print request")
	}
	if r.TenantID == "" {
		return errors.New("missing tenantId in print request")
	}
	if len(r.Items) == 0 {
		return errors.New("cannot print empty order items")
	}
	return nil
}

// ToReceiptData converts the JSON PrintRequest into the printer package's ReceiptData.
func (r *PrintRequest) ToReceiptData() printer.ReceiptData {
	roll := printer.RollWidth80mm
	if r.RollWidth == 58 {
		roll = printer.RollWidth58mm
	}

	items := make([]printer.ReceiptItem, len(r.Items))
	for i, it := range r.Items {
		total := it.TotalPrice
		if total == 0 && it.Quantity > 0 {
			total = it.UnitPrice * float64(it.Quantity)
		}
		items[i] = printer.ReceiptItem{
			Name:       it.Name,
			Quantity:   it.Quantity,
			UnitPrice:  it.UnitPrice,
			TotalPrice: total,
			TaxRate:    it.TaxRate,
		}
	}

	cgstRate := r.Taxes.CGSTRate
	if cgstRate == 0 && r.Taxes.CGST > 0 {
		cgstRate = 2.5
	}
	sgstRate := r.Taxes.SGSTRate
	if sgstRate == 0 && r.Taxes.SGST > 0 {
		sgstRate = 2.5
	}

	return printer.ReceiptData{
		Store: printer.ReceiptStore{
			Name:    r.Store.Name,
			Branch:  r.Store.Branch,
			Address: r.Store.Address,
			GSTIN:   r.Store.GSTIN,
			Phone:   r.Store.Phone,
		},
		Order: printer.ReceiptOrder{
			OrderID:       r.OrderID,
			BillNumber:    r.BillNumber,
			TableNumber:   r.TableNumber,
			ServerName:    r.ServerName,
			PaymentMode:   r.PaymentMode,
			TransactionID: r.TransactionID,
			Timestamp:     r.Timestamp,
			Notes:         r.Notes,
		},
		Items: items,
		Taxes: printer.ReceiptTaxes{
			CGST:     r.Taxes.CGST,
			CGSTRate: cgstRate,
			SGST:     r.Taxes.SGST,
			SGSTRate: sgstRate,
			VAT:      r.Taxes.VAT,
			VATRate:  r.Taxes.VATRate,
			TotalTax: r.Taxes.TotalTax,
		},
		Totals: printer.ReceiptTotals{
			Subtotal:   r.Totals.Subtotal,
			Discount:   r.Totals.Discount,
			Tax:        r.Totals.Tax,
			GrandTotal: r.Totals.GrandTotal,
		},
		RollWidth: roll,
	}
}

// PrintResponse is sent back to WebSocket clients following a print command.
type PrintResponse struct {
	Success   bool   `json:"success"`
	OrderID   string `json:"orderId,omitempty"`
	Status    string `json:"status"` // e.g. "PRINTER_READY", "PRINTED", "ERROR"
	Message   string `json:"message,omitempty"`
	LatencyMs int64  `json:"latencyMs,omitempty"`
}

// StatusEvent is broadcast to all connected WebSocket clients when printer state changes.
type StatusEvent struct {
	Event     string `json:"event"`  // "printer_status"
	Status    string `json:"status"` // "PRINTER_READY", "PAPER_OUT", "PRINTER_OFFLINE"
	Message   string `json:"message,omitempty"`
	Timestamp int64  `json:"timestamp"`
}

// NewStatusEvent constructs a StatusEvent with current unix timestamp.
func NewStatusEvent(status, message string) StatusEvent {
	return StatusEvent{
		Event:     "printer_status",
		Status:    status,
		Message:   message,
		Timestamp: time.Now().UnixMilli(),
	}
}

// DeserializePrintRequest parses raw JSON bytes into a validated PrintRequest.
func DeserializePrintRequest(data []byte) (*PrintRequest, error) {
	var req PrintRequest
	if err := json.Unmarshal(data, &req); err != nil {
		return nil, err
	}
	if err := req.Validate(); err != nil {
		return nil, err
	}
	return &req, nil
}
