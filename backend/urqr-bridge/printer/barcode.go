// Package printer — barcode.go
// Implements standard ESC/POS 1D Barcode (Code128) and HRI (Human Readable Interpretation) commands.
// Pure Go, CGO_ENABLED=0 compatible.
package printer

// BarcodeType represents ESC/POS barcode symbologies.
type BarcodeType byte

const (
	BarcodeCode128 BarcodeType = 73 // Function B Code128 (GS k 73 n d1...dn)
)

// HRIPosition controls where human-readable characters are printed relative to the barcode.
type HRIPosition byte

const (
	HRINone        HRIPosition = 0 // Not printed
	HRIAbove       HRIPosition = 1 // Above barcode
	HRIBelow       HRIPosition = 2 // Below barcode
	HRIAboveBelow  HRIPosition = 3 // Both above and below barcode
)

// GSBarcodeHeight returns GS h n — set barcode height in dots (1 to 255).
func GSBarcodeHeight(dots uint8) []byte {
	if dots == 0 {
		dots = 64
	}
	return []byte{GS, 0x68, dots}
}

// GSBarcodeWidth returns GS w n — set barcode module width (2 to 6).
func GSBarcodeWidth(width uint8) []byte {
	if width < 2 {
		width = 2
	} else if width > 6 {
		width = 6
	}
	return []byte{GS, 0x77, width}
}

// GSHRIPosition returns GS H n — select HRI character print position.
func GSHRIPosition(pos HRIPosition) []byte {
	return []byte{GS, 0x48, byte(pos)}
}

// GSBarcodeCode128 generates the ESC/POS command for a Code128 barcode:
// GS k 73 [len] [CodeSetPrefix] [data...]
func GSBarcodeCode128(data string) []byte {
	if len(data) == 0 {
		return nil
	}
	// Code128 requires subset prefix: '{B' (0x7B 0x42) selects Code Set B (alphanumeric)
	prefix := []byte{0x7B, 0x42}
	payload := append(prefix, []byte(data)...)
	
	cmd := []byte{GS, 0x6B, byte(BarcodeCode128), byte(len(payload))}
	return append(cmd, payload...)
}
