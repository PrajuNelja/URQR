# URQR Platform — QA Hardware Testing Runbook
## Thermal Printer Simulation & Go Bridge ESC/POS Verification

**Document Reference:** `QA-HW-RUNBOOK-001`  
**Assignee:** Bharath | Role: QA Automation & Hardware Lead  
**Technical Standards:** ESC/POS Protocol, TCP Port 9100, Go 1.27.4 Bridge, sub-5ms write latency  
**Target Hardware:** Epson TM-T88VI, Star TSP143III, Sunmi Cloud Printer, Virtual TCP Port 9100 Emulator

---

### 1. Overview & Architecture

In Phase 1 Standalone Manager POS, cashier terminals trigger thermal receipt printing via the local Go URQR-Bridge daemon. To enable comprehensive automated QA testing in environments without physical printer hardware, a Python-based virtual ESC/POS thermal printer simulator listens on RAW TCP port `9100`.

The simulator intercepts incoming binary byte streams, decodes control command signatures, audits text formatting, persists raw binary captures (`.bin`), and records execution metrics into persistent logs.

```
+--------------------------+       WebSocket       +-----------------------------+
| Tauri v2 / Browser POS   | --------------------> | Go 1.27.4 URQR-Bridge       |
| (Frontend Cashier UI)    |   ws://localhost:9101 | (Print Daemon & ESC/POS)    |
+--------------------------+                       +-----------------------------+
                                                                  |
                                                                  | TCP Socket
                                                                  | Port 9100
                                                                  v
                                                   +-----------------------------+
                                                   | Virtual ESC/POS Simulator   |
                                                   | (qa/printer-simulator/      |
                                                   |  printer.py)                |
                                                   +-----------------------------+
                                                                  |
                                              +-------------------+-------------------+
                                              |                                       |
                                              v                                       v
                                   [ Binary Captures ]                        [ printer.log ]
                                   `captures/print_*.bin`                     `logs/printer.log`
```

---

### 2. ESC/POS Command Byte Decoders

The simulator automatically inspects and verifies the following standard ESC/POS command sequences:

| Command Name | Byte Sequence | Hex Signature | Verification Objective |
| :--- | :--- | :--- | :--- |
| **Initialize Printer** | `ESC @` | `0x1B 0x40` | Clears print buffer and resets hardware state |
| **Left Alignment** | `ESC a 0` | `0x1B 0x61 0x00` | Aligns item description and quantity columns left |
| **Center Alignment** | `ESC a 1` | `0x1B 0x61 0x01` | Centers store header, logo, and footer thank-you message |
| **Right Alignment** | `ESC a 2` | `0x1B 0x61 0x02` | Aligns subtotal, CGST, SGST, and final payable amounts right |
| **Bold Toggle On** | `ESC E 1` | `0x1B 0x45 0x01` | Emphasizes store title and total balance |
| **Bold Toggle Off** | `ESC E 0` | `0x1B 0x45 0x00` | Reverts to regular font weight |
| **Line Feed** | `LF` | `0x0A` | Advances paper by one line |
| **Paper Cut** | `GS V 0` | `0x1D 0x56 0x00` | Triggers receipt paper cutter |

---

### 3. Step-by-Step QA Execution Runbook

#### Step 1: Start the Virtual Printer Simulator
Open a dedicated terminal and start the TCP port 9100 listener:
```powershell
python qa/printer-simulator/printer.py
```
**Expected Output:**
```text
========================================================
  URQR Virtual ESC/POS Thermal Printer Simulator
========================================================
Listening on TCP: 127.0.0.1:9100
Capture Directory: P:\URQR\qa\printer-simulator\captures
Logs Directory:    P:\URQR\qa\printer-simulator\logs
Ready to receive ESC/POS print jobs from Go URQR-Bridge.
```

#### Step 2: Verify Python Client Smoke Test
In a second terminal, execute the test client:
```powershell
python qa/printer-simulator/Test_printer.py
```
**Verification Assertion:**
- Console outputs `[PASS] ESC/POS binary payload sent successfully.`
- Total bytes sent: `~370 bytes`.
- Verified receipt binary saved in `captures/`.

#### Step 3: Run Go Bridge Handshake & Integration Tests
Execute the Go test suite inside `backend/urqr-bridge`:
```powershell
cd backend/urqr-bridge
go test ./printer -run "TestSendToPythonSimulator|TestPythonSimulatorHandshake|TestTCPConnectionPersistence|TestTCPRepeatedConnectClose" -v -count=1
```
**Verification Assertions:**
- `TestSendToPythonSimulator`: Passes with sub-5ms write latency.
- `TestPythonSimulatorHandshake`: Handshake completes in under 3ms.
- `TestTCPConnectionPersistence`: Single TCP connection successfully handles 5 successive writes without reconnection.
- `TestTCPRepeatedConnectClose`: 20 repeated connect-send-close cycles complete with zero lingering sockets or OS socket descriptor exhaustion.

#### Step 4: Audit Hardware Socket Health & Clean Termination
Check active TCP connections on port 9100:
```powershell
Get-NetTCPConnection -LocalPort 9100
```
**Acceptance Criteria:**
- Simulator socket remains in state `Listen`.
- Zero lingering client sockets in `CLOSE_WAIT` or `ESTABLISHED`.

---

### 4. Technical Note on Baud Rate vs TCP Sockets

> [!NOTE]
> **Baud Rate Specification:** In legacy serial interfaces (RS-232 / DB-9), baud rates (e.g. 9600, 19200, 38400, 115200) dictate bit-timing clock synchronization. In modern URQR LAN/Ethernet thermal printers, communication is packet-switched over TCP/IP (port 9100). The Go `NewTCPPrinter` client operates over standard TCP stream semantics with zero baud rate configuration, delivering sub-5ms write latencies.

---

### 5. Final Hardware Milestone Sign-Off

- **Virtual Printer Emulator:** Initialized and listening on `127.0.0.1:9100`.
- **Command Inspection:** Full ESC/POS binary decode verified.
- **Go Handshake:** Verified with Go 1.27.4 TCP client.
- **Socket Persistence & Cleanup:** Verified across 20 cycles with zero leakage.
