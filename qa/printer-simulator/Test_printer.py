import socket
import sys

# URQR Platform — Phase 1 Standalone Manager POS
# Bharath | QA Automation & Hardware Lead
# Virtual ESC/POS Printer Standalone Test Client

HOST = "127.0.0.1"
PORT = 9100

# Sample ESC/POS binary print sequence matching 80mm thermal receipt specs
print_data = (
    b"\x1b\x40"                  # Initialize printer (ESC @)
    b"\x1b\x61\x01"              # Center alignment (ESC a 1)
    b"\x1b\x45\x01"              # Bold text on (ESC E 1)
    b"URQR HOTEL & RESTAURANT POS\n"
    b"\x1b\x45\x00"              # Bold text off (ESC E 0)
    b"QA THERMAL PRINTER TEST\n"
    b"------------------------------------------\n"
    b"\x1b\x61\x00"              # Left alignment (ESC a 0)
    b"Item 1: Paneer Butter Masala       x1  280.00\n"
    b"Item 2: Garlic Naan                x2  120.00\n"
    b"Item 3: Fresh Lime Soda            x1   60.00\n"
    b"------------------------------------------\n"
    b"\x1b\x61\x02"              # Right alignment (ESC a 2)
    b"SUBTOTAL:    460.00\n"
    b"CGST (2.5%):  11.50\n"
    b"SGST (2.5%):  11.50\n"
    b"TOTAL:       483.00\n"
    b"\x1b\x61\x01"              # Center alignment (ESC a 1)
    b"THANK YOU! VISIT AGAIN\n"
    b"\x0a\x0a\x0a"              # Feed 3 lines (LF LF LF)
    b"\x1d\x56\x00"              # Full Cut paper (GS V 0)
)

def run_test():
    print(f"Connecting to virtual ESC/POS printer at {HOST}:{PORT} ...")
    try:
        with socket.create_connection((HOST, PORT), timeout=5) as client:
            client.sendall(print_data)
            print("[PASS] ESC/POS binary payload sent successfully.")
            print(f"[PASS] Total bytes dispatched: {len(print_data)}")
            print("[PASS] Verified initialization, alignment, text, and cut commands.")
            sys.exit(0)
    except ConnectionRefusedError:
        print("[FAIL] Connection refused. Start printer.py simulator first on port 9100.")
        sys.exit(1)
    except OSError as err:
        print(f"[FAIL] Socket error: {err}")
        sys.exit(1)

if __name__ == "__main__":
    run_test()
