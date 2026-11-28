import os
import shutil
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class SwaroopaMasterPDF(FPDF):
    def header(self):
        # Top banner
        self.set_fill_color(15, 23, 42) # Slate 900
        self.rect(0, 0, 210, 14, 'F')
        self.set_y(3)
        self.set_font('Helvetica', 'B', 8.5)
        self.set_text_color(255, 255, 255)
        self.cell(0, 8, '   NELJA TECH  |  URQR PLATFORM -- PHASE 1 POS  |  DAY 5 POS BILLING MASTER PROTOCOL', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(6)

    def footer(self):
        self.set_y(-14)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(100, 116, 139) # Slate 500
        self.cell(100, 8, 'Confidential -- Internal Engineering POS Protocol', new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.cell(0, 8, f'Page {self.page_no()} of {{nb}}', align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def draw_section_heading(self, title, color_rgb=(30, 41, 59)):
        self.ln(2)
        self.set_fill_color(*color_rgb)
        self.rect(self.get_x(), self.get_y(), 190, 6.5, 'F')
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(255, 255, 255)
        self.cell(190, 6.5, f"  {title}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(2)

    def draw_task_5w1h(self, task_num, title, status_text, status_type, what, why, when, where, how, verify):
        # Header line with badge
        self.set_font('Helvetica', 'B', 8.5)
        self.set_text_color(15, 23, 42)
        task_label = f"[Task {task_num}]   {title}"
        self.cell(140, 5, task_label, new_x=XPos.RIGHT, new_y=YPos.TOP)
        
        # Badge
        if status_type == "DONE":
            self.set_fill_color(220, 252, 231)
            self.set_text_color(22, 101, 52)
        else:
            self.set_fill_color(254, 243, 199)
            self.set_text_color(180, 83, 9)
        self.set_font('Helvetica', 'B', 7)
        self.cell(50, 5, status_text, border=1, align='C', fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        
        fields = [
            ("WHAT:", what),
            ("WHY:", why),
            ("WHEN:", when),
            ("WHERE:", where),
            ("HOW:", how),
            ("VERIFICATION:", verify)
        ]
        
        for label, val in fields:
            self.set_font('Helvetica', 'B', 7.5)
            self.set_text_color(71, 85, 105) # Slate 600
            label_w = 23 if label == "VERIFICATION:" else 14
            self.cell(label_w, 3.8, label, new_x=XPos.RIGHT, new_y=YPos.TOP)
            
            self.set_font('Helvetica', '', 7.5)
            self.set_text_color(15, 23, 42)
            if label == "VERIFICATION:":
                self.set_font('Helvetica', 'I', 7.5)
                if status_type == "DONE":
                    self.set_text_color(22, 101, 52)
                else:
                    self.set_text_color(180, 83, 9)
            
            val_w = 190 - label_w
            self.multi_cell(val_w, 3.8, val, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        
        # Thin divider line
        self.set_draw_color(226, 232, 240)
        self.line(self.get_x(), self.get_y() + 1, self.get_x() + 190, self.get_y() + 1)
        self.ln(2)

def generate_pdf():
    pdf = SwaroopaMasterPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=False)
    
    # ================= PAGE 1 =================
    pdf.add_page()
    
    # Title
    pdf.set_xy(10, 18)
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(190, 6, "Swaroopa (Frontend POS Lead) -- Day 5 Master Execution Guide", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_font('Helvetica', '', 8.5)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(190, 4.5, "Complete 5W1H (What, Why, When, Where, How, Verification) Protocol for Day 5 POS Billing Delivery", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)

    # Metadata Card (Box)
    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(203, 213, 225)
    pdf.rect(10, pdf.get_y(), 190, 20, 'FD')
    
    start_box_y = pdf.get_y() + 2
    pdf.set_xy(14, start_box_y)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(50, 4, "Assignee: Swaroopa", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(75, 4, "Role: Frontend Lead (POS Screen 2)", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(60, 4, "Date: Friday, 27 Nov 2026", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_x(14)
    pdf.cell(50, 4, "Baseline Commit: e98033e", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(75, 4, "Session 1: 10:00 AM - 1:00 PM", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(60, 4, "Branch: origin/swaroopa", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_x(14)
    pdf.cell(50, 4, "Scope: Billing Cart & Checkout", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(75, 4, "Session 2: 2:10 PM - 4:10 PM", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(60, 4, "Status: Active Execution", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_y(pdf.get_y() + 4)

    # Section 1: Architectural Alignment & Inter-Team Dependencies
    pdf.draw_section_heading("1. Architectural Alignment & Inter-Team Dependencies", (30, 41, 59))
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(51, 65, 85)
    desc = ("On Day 5, Swaroopa delivers the production POS checkout flow. In the morning, Swaroopa injects client-side UUID v4 "
            "Idempotency-Key headers and connects TanStack mutations to Girish T's POST /api/v1/orders endpoint. In the afternoon, "
            "successful orders trigger automated thermal printing via Bharath's Go urqr-bridge daemon while Nayana validates "
            "concurrency and E2E flows.")
    pdf.multi_cell(190, 3.8, desc, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1.5)

    # Table 1: Dependencies
    pdf.set_fill_color(226, 232, 240)
    pdf.set_font('Helvetica', 'B', 7.2)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(32, 5, 'Upstream Lead', 1, align='L', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(46, 5, 'Deliverable Handed to Swaroopa', 1, align='L', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(66, 5, 'Swaroopa Implementation Objective', 1, align='L', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(46, 5, 'Acceptance Pass Criteria', 1, align='L', fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    dep_rows = [
        ("Girish T (Backend)", "POST /api/v1/orders API", "TanStack mutation with Idempotency-Key", "HTTP 201 Created on payment"),
        ("Prajval V K (Auth)", "Redis 8.2 Idempotency Lock", "Send UUID v4 header per transaction", "409 Conflict handled safely"),
        ("Bharath (Hardware)", "Thermal Bridge ws://:9101", "Dispatch print job on checkout success", "Print frame sent < 25ms"),
        ("Manasa (Design)", "1366x768 POS Viewport Spec", "Zero horizontal overflow, button touch >48px", "Design sign-off with 0 defects")
    ]
    pdf.set_font('Helvetica', '', 7)
    for c1, c2, c3, c4 in dep_rows:
        pdf.cell(32, 4.5, f" {c1}", 1, align='L', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(46, 4.5, f" {c2}", 1, align='L', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(66, 4.5, f" {c3}", 1, align='L', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(46, 4.5, f" {c4}", 1, align='L', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(3)

    # Section 2: Quick Reference Table
    pdf.draw_section_heading("2. Day 5 Master Tasks Quick Reference (10 Tasks Total)", (30, 41, 59))
    pdf.set_fill_color(226, 232, 240)
    pdf.set_font('Helvetica', 'B', 7.2)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(16, 5, 'Session', 1, align='C', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(14, 5, 'Task #', 1, align='C', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(86, 5, 'Task Title & Functional Objective', 1, align='L', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(44, 5, 'Target Scope / File', 1, align='L', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(30, 5, 'Status', 1, align='C', fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    tasks_ref = [
        ("Morning", "Task 1", "Construct POS Checkout Modal (Cash, Card, UPI)", "PosCheckoutModal.tsx", "[DONE - 100%]", (220, 252, 231), (22, 101, 52)),
        ("Morning", "Task 2", "Quick-Tender Cash Buttons (Exact, 100, 500, 2000)", "PosCheckoutModal.tsx", "[DONE - 100%]", (220, 252, 231), (22, 101, 52)),
        ("Morning", "Task 3", "Client-Side UUID v4 Idempotency-Key Header", "useBilling.ts", "[PENDING - TO DO]", (254, 243, 199), (180, 83, 9)),
        ("Morning", "Task 4", "Connect Checkout to POST /api/v1/orders (TanStack)", "useBilling.ts", "[PENDING - TO DO]", (254, 243, 199), (180, 83, 9)),
        ("Morning", "Task 5", "Handle Checkout Loading State & Spinner Locking", "PosCheckoutModal.tsx", "[DONE - 100%]", (220, 252, 231), (22, 101, 52)),
        ("Afternoon", "Task 6", "Wire Checkout Success to Thermal Receipt Bridge", "useBilling.ts / bridgeClient", "[PENDING - TO DO]", (254, 243, 199), (180, 83, 9)),
        ("Afternoon", "Task 7", "Implement POS Keyboard Shortcuts (F2, F4, Esc)", "posShortcutKeys.ts", "[DONE - 100%]", (220, 252, 231), (22, 101, 52)),
        ("Afternoon", "Task 8", "Checkout Failure Error Handling (409 Conflict Banner)", "useBilling.ts / Modal", "[PENDING - TO DO]", (254, 243, 199), (180, 83, 9)),
        ("Afternoon", "Task 9", "Design QA on 1366x768 Viewport with Manasa", "Billing Layout CSS", "[PENDING - TO DO]", (254, 243, 199), (180, 83, 9)),
        ("Afternoon", "Task 10", "Screen 2 Core Functionality Sign-Off & Remote CI", "PHASE1_SCREEN2_QA.md", "[PENDING - TO DO]", (254, 243, 199), (180, 83, 9)),
    ]

    pdf.set_font('Helvetica', '', 6.8)
    for sess, num, title, scope, stat, bg, fg in tasks_ref:
        pdf.cell(16, 4.2, sess, 1, align='C', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(14, 4.2, num, 1, align='C', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(86, 4.2, f" {title}", 1, align='L', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(44, 4.2, f" {scope}", 1, align='L', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_fill_color(*bg)
        pdf.set_text_color(*fg)
        pdf.set_font('Helvetica', 'B', 6.6)
        pdf.cell(30, 4.2, stat, 1, align='C', fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font('Helvetica', '', 6.8)
        pdf.set_text_color(15, 23, 42)

    # ================= PAGE 2 =================
    pdf.add_page()
    pdf.set_xy(10, 18)
    pdf.draw_section_heading("Morning Session (10:00 AM - 1:00 PM): Tasks 1 to 5 Detailed 5W1H", (30, 58, 138))

    pdf.draw_task_5w1h(
        task_num=1,
        title="Construct POS Checkout Modal (Cash, Card, UPI)",
        status_text="[ALREADY DONE - 100%]",
        status_type="DONE",
        what="Modal dialog containing tabbed payment selection for Cash, Card, and UPI tender options.",
        why="Allows cashiers to switch payment methods instantly with 1 tap at the counter.",
        when="Completed during Day 4 foundations.",
        where="frontend/manager-pos/src/pages/Table_Management/Components/Billing/PosCheckoutModal.tsx",
        how="Built with Radix UI Dialog and Tabs primitives with responsive dark theme styling.",
        verify="vishal_page4.test.ts passes all modal rendering and payment mode switching assertions."
    )

    pdf.draw_task_5w1h(
        task_num=2,
        title="Quick-Tender Cash Buttons & Instant Change Due Math",
        status_text="[ALREADY DONE - 100%]",
        status_type="DONE",
        what="Quick cash buttons (Exact Cash, Rs.50, Rs.100, Rs.200, Rs.500, Rs.2000) and real-time change calculation.",
        why="Speeds up counter throughput during peak rush; cashiers don't need mental arithmetic.",
        when="Completed during Day 4 foundations.",
        where="PosCheckoutModal.tsx (Line 438 & Lines 190-195).",
        how="const changeDue = Math.max(0, amountTendered - payablePaise) / 100; (integer paise arithmetic).",
        verify="vishal_page4.test.ts asserts change calculations with zero floating-point rounding drift."
    )

    pdf.draw_task_5w1h(
        task_num=3,
        title="Client-Side UUID v4 Generation for Idempotency-Key Header",
        status_text="[PENDING - TO DO TODAY]",
        status_type="PENDING",
        what="Generate a cryptographically random UUID v4 on cashier device and inject into request header.",
        why="Eliminates risk of double-charging customers if a cashier taps Pay twice or network drops.",
        when="10:15 AM - 11:30 AM (Morning kickoff).",
        where="frontend/manager-pos/src/pages/Table_Management/Hooks/useBilling.ts (Inside handleConfirmPayment).",
        how="const idempotencyKey = crypto.randomUUID(); pass in apiClient headers as { 'Idempotency-Key': idempotencyKey }.",
        verify="In DevTools Network tab, trigger checkout, assert request header contains Idempotency-Key: UUIDv4."
    )

    pdf.draw_task_5w1h(
        task_num=4,
        title="Connect Checkout Trigger to Backend (POST /api/v1/orders)",
        status_text="[PENDING - TO DO TODAY]",
        status_type="PENDING",
        what="Replace local demo receipt state with live TanStack Query useMutation calling Girish's backend API.",
        why="Transitions POS from local frontend mock to live backend database persistence in PostgreSQL 18.7.",
        when="11:30 AM - 12:30 PM (Midday integration).",
        where="frontend/manager-pos/src/pages/Table_Management/Hooks/useBilling.ts.",
        how="Call apiClient.post('/api/v1/orders', payload, { headers: { 'Idempotency-Key': idempotencyKey } }).",
        verify="Completing an order returns HTTP 201 Created with valid orderId, orderNumber, and status 'COMPLETED'."
    )

    pdf.draw_task_5w1h(
        task_num=5,
        title="Handle Checkout Loading State, Spinner & Double-Submit Lock",
        status_text="[ALREADY DONE - 100%]",
        status_type="DONE",
        what="Physically lock the Pay button, disable tender inputs, and display animated spinner while processing.",
        why="Prevents cashiers from tapping multiple times while waiting for backend confirmation.",
        when="Completed during Day 4 foundations.",
        where="PosCheckoutModal.tsx (Lines 143 & 178-213).",
        how="Uses submittingRef.current = true guard and processing boolean state to set disabled={busy}.",
        verify="Rapid clicking on Pay button only dispatches 1 event; subsequent clicks are blocked by ref guard."
    )

    # ================= PAGE 3 =================
    pdf.add_page()
    pdf.set_xy(10, 18)
    pdf.draw_section_heading("Afternoon Session (2:10 PM - 4:10 PM): Tasks 6 to 10 Detailed 5W1H", (88, 28, 135))

    pdf.draw_task_5w1h(
        task_num=6,
        title="Wire Checkout Success to Thermal Receipt Print Bridge",
        status_text="[PENDING - TO DO TODAY]",
        status_type="PENDING",
        what="On successful order response from backend, dispatch print job to Go urqr-bridge daemon over ws://localhost:9101.",
        why="Automatically prints the 48-column thermal receipt at the cashier counter the moment payment succeeds.",
        when="2:10 PM - 2:50 PM.",
        where="frontend/manager-pos/src/pages/Table_Management/Hooks/useBilling.ts (Inside mutation onSuccess).",
        how="Import bridgeClient; call bridgeClient.sendPrintJob(receiptPayload); clearCart(); setIsCheckoutModalOpen(false).",
        verify="Virtual thermal printer on port 9100 receives print stream; console logs 'Print job dispatched'."
    )

    pdf.draw_task_5w1h(
        task_num=7,
        title="Implement POS Keyboard Shortcuts (F2, F4, Esc)",
        status_text="[ALREADY DONE - 100%]",
        status_type="DONE",
        what="Keyboard shortcuts for rapid billing: F2 focuses search, F4 opens cash checkout, Esc dismisses modal.",
        why="Professional POS terminals must be 100% keyboard-navigable without requiring touch or mouse.",
        when="Completed during Day 3/4 foundations.",
        where="frontend/manager-pos/src/pages/Table_Management/Hooks/posShortcutKeys.ts & BillingHeader.tsx.",
        how="Custom usePosHotkeys hook attached to window keydown listener with event.preventDefault().",
        verify="posShortcutKeys.test.ts passes all 17 automated unit tests for F2, F4, and Escape."
    )

    pdf.draw_task_5w1h(
        task_num=8,
        title="Checkout Failure Error Handling (409 Conflict & Network Drops)",
        status_text="[PENDING - TO DO TODAY]",
        status_type="PENDING",
        what="Intercept server error codes (409 Conflict, 500, network drop) and show warning banner without clearing cart.",
        why="If payment encounters a conflict or network drop, the cashier must NEVER lose items in the cart.",
        when="2:50 PM - 3:30 PM.",
        where="useBilling.ts / PosCheckoutModal.tsx.",
        how="In onError: set error message banner; CRITICAL: do NOT call clearCart() on failure.",
        verify="Simulate 409 Conflict in mock/backend; modal shows amber banner, cart remains intact with all items."
    )

    pdf.draw_task_5w1h(
        task_num=9,
        title="Design QA on Billing Screen alongside Manasa",
        status_text="[PENDING - TO DO TODAY]",
        status_type="PENDING",
        what="Review button padding, contrast, modal popups, and touch target sizes (>48px) with Manasa on 1366x768.",
        why="Ensures cashier does not mis-tap buttons or experience visual clipping on retail counter screens.",
        when="3:30 PM - 3:55 PM.",
        where="frontend/manager-pos/src/pages/Table_Management/Components/Billing/.",
        how="Run pnpm dev, open Chrome DevTools in responsive mode set to 1366x768, check layout.",
        verify="Manasa signs off in design register; zero horizontal scrollbars or visual clipping."
    )

    pdf.draw_task_5w1h(
        task_num=10,
        title="Screen 2 Core Functionality Formal Sign-Off",
        status_text="[PENDING - TO DO TODAY]",
        status_type="PENDING",
        what="Execute full regression check and compile official QA sign-off document for Screen 2 Billing Page.",
        why="Certifies that Screen 2 is 100% production-ready for customer checkout before Day 6.",
        when="3:55 PM - 4:10 PM.",
        where="qa/test-execution/PHASE1_SCREEN2_QA_SIGNOFF.md.",
        how="Run pnpm typecheck && pnpm test:run; commit and push branch to origin/swaroopa.",
        verify="Remote GitHub Actions CI passes with [5/5 PASSED]; zero defects logged."
    )

    # ================= PAGE 4 =================
    pdf.add_page()
    pdf.set_xy(10, 18)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(190, 5.5, "Operational Workflow, Defect Severity Matrix & Sign-Off Form", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1)

    # 1. Non-Terminal / GUI & IDE Step-by-Step Workflow
    pdf.draw_section_heading("1. Swaroopa GUI & DevTools Operational Workflow (Non-Terminal)", (30, 41, 59))
    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(203, 213, 225)
    pdf.rect(10, pdf.get_y(), 190, 40, 'FD')
    
    gui_y = pdf.get_y() + 2
    pdf.set_xy(14, gui_y)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(182, 4.2, "# Step-by-Step Execution in VS Code, Browser & DevTools (No Terminal Required):", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    gui_steps = [
        "Step 1: Open VS Code > Navigate to src/pages/Table_Management/Hooks/useBilling.ts.",
        "Step 2: Add crypto.randomUUID() inside handleConfirmPayment and pass Idempotency-Key in headers.",
        "Step 3: Open Chrome > Navigate to http://localhost:5173/pos/billing > Press F12 to open DevTools.",
        "Step 4: Go to Network Tab > Click 'Pay' or Press F4 > Verify POST /api/v1/orders returns 201 Created.",
        "Step 5: Go to Network > WS Tab > Verify bridgeClient sends print frame to ws://localhost:9101.",
        "Step 6: Toggle Chrome Device Toolbar (Ctrl+Shift+M) > Set 1366 x 768 > Verify layout with Manasa."
    ]
    pdf.set_font('Courier', '', 7.2)
    pdf.set_text_color(30, 41, 59)
    for s in gui_steps:
        pdf.set_x(16)
        pdf.cell(178, 3.8, s, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_y(pdf.get_y() + 4)

    # 2. Defect Severity Matrix
    pdf.draw_section_heading("2. Defect Severity & Escalation Classification Matrix", (30, 41, 59))
    pdf.set_fill_color(226, 232, 240)
    pdf.set_font('Helvetica', 'B', 7.2)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(24, 5, 'Severity Level', 1, align='L', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(78, 5, 'Failure Criteria / Condition', 1, align='L', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(54, 5, 'Escalation Target', 1, align='L', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(34, 5, 'Resolution SLA', 1, align='L', fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    defect_rows = [
        ("Blocker", "Double-charging customer; data loss in cart on failure", "Prajval V K & CTO Manjunatha", "Immediate (< 30 mins)"),
        ("Critical", "HTTP 500 on checkout; missing bridge print trigger", "Girish T (Backend Orders)", "< 1 hour"),
        ("Major", "Calculation discrepancy in change due or tax (>0.01 paise)", "Swaroopa & Girish T", "< 2 hours"),
        ("Minor", "Button spinner alignment glitch; modal animation delay", "Vishal (Frontend UI)", "End of Day (Day 5)")
    ]
    pdf.set_font('Helvetica', '', 7)
    for c1, c2, c3, c4 in defect_rows:
        pdf.cell(24, 4.4, f" {c1}", 1, align='L', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(78, 4.4, f" {c2}", 1, align='L', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(54, 4.4, f" {c3}", 1, align='L', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(34, 4.4, f" {c4}", 1, align='L', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(3)

    # 3. Formal Sign-Off Box
    pdf.draw_section_heading("3. Formal Phase 1 Day 5 POS Billing Execution Sign-Off", (30, 41, 59))
    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(203, 213, 225)
    pdf.rect(10, pdf.get_y(), 190, 32, 'FD')

    sign_y = pdf.get_y() + 2
    pdf.set_xy(14, sign_y)
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(51, 65, 85)
    pdf.cell(182, 4, "I hereby certify that all 10 Day 5 POS Billing tasks have been executed in strict compliance with Nelja Tech standards.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(14)
    pdf.cell(182, 4, "Zero double-billing under Redis idempotency lock. Zero cart data loss on payment drop. Automated print bridge verified.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)

    pdf.set_font('Helvetica', 'B', 7.5)
    pdf.set_text_color(15, 23, 42)
    pdf.set_x(14)
    pdf.cell(62, 4.5, "Swaroopa (POS Lead): _____________________", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(62, 4.5, "Prajval V K (Architect): ___________________", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(58, 4.5, "CTO Manjunatha S: ___________________", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_x(14)
    pdf.cell(62, 4.5, "Date: 27 November 2026", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(62, 4.5, "Morning Status: [ X ] Complete", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(58, 4.5, "Afternoon Status: [ X ] Complete", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    out_pdf_path = r"P:\URQR\qa\test-execution\URQR_Swaroopa_Day5_Execution_Guide.pdf"
    pdf.output(out_pdf_path)
    print(f"Master PDF generated successfully at {out_pdf_path}")
    print(f"Total Page Count: {pdf.page_no()}")

    artifact_dir = r"C:\Users\rajan\.gemini\antigravity\brain\880a094d-ffe6-45ad-9916-e0c680e962c5"
    artifact_pdf = os.path.join(artifact_dir, "URQR_Swaroopa_Day5_Execution_Guide.pdf")
    shutil.copyfile(out_pdf_path, artifact_pdf)
    print(f"Copied to artifact directory: {artifact_pdf}")

if __name__ == "__main__":
    generate_pdf()
