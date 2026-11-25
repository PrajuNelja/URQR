// Package printer — usb.go
// Raw USB device communication handler for local thermal printers.
// CGO_ENABLED=0 pure-Go implementation using OS file I/O.
//
// Linux:  Enumerates /dev/usb/lpX line-printer devices by scanning sysfs
//         vendor/product IDs under /sys/bus/usb/devices/.
// Windows: Opens USB printer ports via \\.\USBPRNx using raw CreateFile syscall.
//
// The USB interface intentionally mirrors TCPPrinter so heartbeat.go can
// treat both transport types uniformly via the Printer interface.
package printer

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"
)

// USBPrinter communicates with a USB thermal printer via raw OS file I/O.
// No CGO, no libusb — pure Go, CGO_ENABLED=0 compatible.
type USBPrinter struct {
	f    *os.File
	path string
}

// USBDevice describes a discovered USB printer device.
type USBDevice struct {
	VendorID  uint16
	ProductID uint16
	Path      string // /dev/usb/lpX on Linux, \\.\USBPRNx on Windows
}

// OpenUSBPrinter opens the first USB printer matching the given vendor and
// product IDs. Pass 0 for either ID to match any value.
func OpenUSBPrinter(vendorID, productID uint16) (*USBPrinter, error) {
	devices, err := ListUSBPrinters()
	if err != nil {
		return nil, err
	}
	for _, d := range devices {
		if (vendorID == 0 || d.VendorID == vendorID) &&
			(productID == 0 || d.ProductID == productID) {
			f, err := os.OpenFile(d.Path, os.O_RDWR, 0)
			if err != nil {
				return nil, fmt.Errorf("usb open %s: %w", d.Path, err)
			}
			return &USBPrinter{f: f, path: d.Path}, nil
		}
	}
	return nil, fmt.Errorf("no USB printer found with VID=0x%04x PID=0x%04x", vendorID, productID)
}

// ListUSBPrinters enumerates USB printer devices available on the host OS.
// On Linux it reads /sys/bus/usb/devices/*/idVendor + idProduct and matches
// to /dev/usb/lpX character devices. On Windows it probes \\.\USBPRNx paths.
func ListUSBPrinters() ([]USBDevice, error) {
	switch runtime.GOOS {
	case "linux":
		return listLinuxUSBPrinters()
	case "windows":
		return listWindowsUSBPrinters()
	default:
		return nil, fmt.Errorf("USB printer enumeration not supported on %s", runtime.GOOS)
	}
}

// listLinuxUSBPrinters scans /sys/bus/usb/devices/ for printer-class devices.
func listLinuxUSBPrinters() ([]USBDevice, error) {
	sysDir := "/sys/bus/usb/devices"
	entries, err := os.ReadDir(sysDir)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil, nil // No USB subsystem (e.g. CI container); return empty.
		}
		return nil, fmt.Errorf("list usb devices: %w", err)
	}

	var devices []USBDevice
	lpIdx := 0
	for _, e := range entries {
		if e.IsDir() {
			devPath := filepath.Join(sysDir, e.Name())
			vid, vidErr := readSysHex(filepath.Join(devPath, "idVendor"))
			pid, pidErr := readSysHex(filepath.Join(devPath, "idProduct"))
			if vidErr != nil || pidErr != nil {
				continue
			}
			// Check bDeviceClass == 0x07 (printer) or look for lp* child interface.
			classBytes, _ := os.ReadFile(filepath.Join(devPath, "bDeviceClass"))
			classStr := strings.TrimSpace(string(classBytes))
			if classStr != "07" {
				// Also check for printer interface class in child interfaces.
				ifaceClass, _ := os.ReadFile(filepath.Join(devPath, e.Name()+":1.0", "bInterfaceClass"))
				if strings.TrimSpace(string(ifaceClass)) != "07" {
					continue
				}
			}
			lpDev := fmt.Sprintf("/dev/usb/lp%d", lpIdx)
			lpIdx++
			devices = append(devices, USBDevice{
				VendorID:  uint16(vid),
				ProductID: uint16(pid),
				Path:      lpDev,
			})
		}
	}
	return devices, nil
}

// listWindowsUSBPrinters probes \\.\USBPRNx paths (0–7) for accessible ports.
func listWindowsUSBPrinters() ([]USBDevice, error) {
	var devices []USBDevice
	for i := 0; i < 8; i++ {
		path := fmt.Sprintf(`\\.\USBPRN%d`, i)
		f, err := os.OpenFile(path, os.O_RDWR, 0)
		if err != nil {
			continue // Port not present.
		}
		f.Close()
		// VID/PID unavailable via raw file I/O on Windows without WinUSB/CGO;
		// use 0,0 to indicate unknown but accessible USB printer port.
		devices = append(devices, USBDevice{VendorID: 0, ProductID: 0, Path: path})
	}
	return devices, nil
}

// readSysHex reads a sysfs hex value file and returns it as uint64.
func readSysHex(path string) (uint64, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return 0, err
	}
	return strconv.ParseUint(strings.TrimSpace(string(data)), 16, 64)
}

// Write sends raw bytes to the USB printer. No write deadline is enforced
// on USB (latency is handled by the OS USB driver).
func (p *USBPrinter) Write(data []byte) (int, time.Duration, error) {
	start := time.Now()
	n, err := p.f.Write(data)
	elapsed := time.Since(start)
	if err != nil {
		return n, elapsed, fmt.Errorf("usb printer write %s: %w", p.path, err)
	}
	return n, elapsed, nil
}

// Send is a convenience wrapper.
func (p *USBPrinter) Send(data []byte) (time.Duration, error) {
	_, elapsed, err := p.Write(data)
	return elapsed, err
}

// Addr returns the USB device path.
func (p *USBPrinter) Addr() string { return p.path }

// Close closes the USB device file.
func (p *USBPrinter) Close() error {
	if p.f != nil {
		return p.f.Close()
	}
	return nil
}
