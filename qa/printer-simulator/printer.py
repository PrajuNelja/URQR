import socket
import os
import threading
from datetime import datetime

# URQR Platform — Phase 1 Standalone Manager POS
# Bharath | QA Automation & Hardware Lead
# Virtual ESC/POS Thermal Printer Simulator
#
# Listens on TCP port 9100 (standard RAW ESC/POS port)
# Decodes incoming ESC/POS control bytes, saves binary captures,
# and maintains audit logs.

HOST = "127.0.0.1"
PORT = 9100
BUFFER_SIZE = 4096

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CAPTURE_DIR = os.path.join(BASE_DIR, "captures")
LOG_DIR = os.path.join(BASE_DIR, "logs")

os.makedirs(CAPTURE_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)


def decode_escpos(data: bytes):
    print("\n--- ESC/POS COMMAND INSPECTION ---")

    # Command byte signatures
    if b"\x1b\x40" in data:
        print("[CMD] ESC @       : Initialize printer")

    if b"\x1b\x61\x00" in data:
        print("[CMD] ESC a 0     : Left alignment")

    if b"\x1b\x61\x01" in data:
        print("[CMD] ESC a 1     : Center alignment")

    if b"\x1b\x61\x02" in data:
        print("[CMD] ESC a 2     : Right alignment")

    if b"\x1b\x45\x01" in data:
        print("[CMD] ESC E 1     : Bold text enabled")

    if b"\x1b\x45\x00" in data:
        print("[CMD] ESC E 0     : Bold text disabled")

    if b"\x1d\x21" in data:
        print("[CMD] GS ! n      : Character size selection")

    if b"\x1d\x56" in data:
        print("[CMD] GS V        : Paper cut command")

    if b"\x1b\x64" in data:
        print("[CMD] ESC d       : Feed n lines")

    print("Raw HEX:       ", data.hex(" ").upper()[:120] + ("..." if len(data) > 60 else ""))
    print("Printable Text:", data.decode("cp437", errors="replace").strip())


def handle_client(conn, address):
    print(f"\n[PRINTER-SIM] Connection accepted from: {address}")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    capture_path = os.path.join(CAPTURE_DIR, f"print_{timestamp}.bin")
    log_path = os.path.join(LOG_DIR, "printer.log")

    total_bytes = 0

    try:
        with open(capture_path, "wb") as capture:
            while True:
                data = conn.recv(BUFFER_SIZE)
                if not data:
                    break

                capture.write(data)
                total_bytes += len(data)

                print(f"[PRINTER-SIM] Received {len(data)} bytes from {address}")
                decode_escpos(data)

        log_message = (
            f"{datetime.now().isoformat()} | {address} | {total_bytes} bytes | {capture_path}\n"
        )

        with open(log_path, "a", encoding="utf-8") as log:
            log.write(log_message)

        print(f"[PRINTER-SIM] Capture saved: {capture_path} ({total_bytes} bytes)")

    except Exception as error:
        print(f"[PRINTER-SIM] Error on connection {address}: {error}")

    finally:
        try:
            conn.close()
        except Exception:
            pass
        print(f"[PRINTER-SIM] Connection closed: {address}")


def start_printer(ready_event=None):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    try:
        server.bind((HOST, PORT))
        server.listen(50)

        print("========================================================")
        print("  URQR Virtual ESC/POS Thermal Printer Simulator")
        print("========================================================")
        print(f"Listening on TCP: {HOST}:{PORT}")
        print(f"Capture Directory: {CAPTURE_DIR}")
        print(f"Logs Directory:    {LOG_DIR}")
        print("Ready to receive ESC/POS print jobs from Go URQR-Bridge.\n")

        if ready_event:
            ready_event.set()

        while True:
            conn, address = server.accept()
            client_thread = threading.Thread(
                target=handle_client,
                args=(conn, address),
                daemon=True,
            )
            client_thread.start()

    except KeyboardInterrupt:
        print("\n[PRINTER-SIM] Printer simulator stopped.")
    except Exception as e:
        print(f"[PRINTER-SIM] Server error: {e}")
    finally:
        server.close()


if __name__ == "__main__":
    start_printer()
