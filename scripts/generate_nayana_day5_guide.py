import os
import shutil
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class URQRPDF(FPDF):
    def header(self):
        self.set_fill_color(15, 23, 42) # Slate 900
        self.rect(0, 0, 210, 14, 'F')
        self.set_y(3)
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(255, 255, 255)
        self.cell(0, 8, '   NELJA TECH  |  URQR PLATFORM -- PHASE 1 POS  |  DAY 5 QA MASTER PROTOCOL', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(6)

    def footer(self):
        self.set_y(-14)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(100, 116, 139)
        self.cell(100, 8, 'Confidential -- Internal Engineering QA Protocol', new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.cell(0, 8, f'Page {self.page_no()} of {{nb}}', align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

def create_guide_pdf(output_path):
    pdf = URQRPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=16)

    # -------------------------------------------------------------
    # PAGE 1: EXECUTIVE BRIEF & METADATA
    # -------------------------------------------------------------
    pdf.add_page()
    
    # Title Section
    pdf.set_font('Helvetica', 'B', 18)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, 'Nayana (QA Lead) -- Day 5 Master Execution Guide', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(0, 6, 'Complete 5W1H (What, Why, When, Where, How, Verification) Protocol for Day 5 QA Delivery', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(3)

    # Metadata Box
    pdf.set_fill_color(241, 245, 249) # Slate 100
    pdf.set_draw_color(203, 213, 225)
    pdf.rect(10, pdf.get_y(), 190, 28, 'DF')
    
    pdf.set_y(pdf.get_y() + 2)
    pdf.set_font('Helvetica', 'B', 8.5)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(47, 5, 'Assignee: Nayana', 0, 0)
    pdf.cell(47, 5, 'Role: Functional & API QA Lead', 0, 0)
    pdf.cell(47, 5, 'Date: Friday, 27 Nov 2026', 0, 0)
    pdf.cell(47, 5, 'Branch: Nayana', 0, 1)

    pdf.cell(47, 5, 'Baseline Commit: e98033e', 0, 0)
    pdf.cell(47, 5, 'Session 1: 10:00 AM - 1:00 PM', 0, 0)
    pdf.cell(47, 5, 'Session 2: 2:10 PM - 4:10 PM', 0, 0)
    pdf.cell(47, 5, 'Status: Active Execution', 0, 1)

    pdf.cell(95, 5, 'Morning Scope: Payment Concurrency & Idempotency QA', 0, 0)
    pdf.cell(95, 5, 'Afternoon Scope: Screen 2 Billing Playwright E2E & DB Audit', 0, 1)
    pdf.ln(8)

    # Architecture Context
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(0, 7, '1. Architectural Alignment & Inter-Team Dependencies', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font('Helvetica', '', 8.5)
    pdf.set_text_color(51, 65, 85)
    intro_text = (
        "On Day 5, Nayana's testing directly validates the resilience of the financial order pipeline. In the morning, "
        "Prajval V K (Auth Lead) and Girish T (Orders Lead) introduce Redis 8.2.11 distributed locking and the "
        "Idempotency-Key header on POST /api/v1/orders. Nayana executes concurrent load tests to verify zero double-debiting. "
        "In the afternoon, Swaroopa delivers the completed Screen 2 Billing Cart, which Nayana automates using Playwright "
        "while verifying database state in PostgreSQL 18.7 relational tables."
    )
    pdf.multi_cell(0, 4.5, intro_text)
    pdf.ln(3)

    # Dependency Table
    pdf.set_font('Helvetica', 'B', 8.5)
    pdf.set_fill_color(226, 232, 240)
    pdf.cell(38, 6, 'Upstream Lead', 1, 0, 'C', True)
    pdf.cell(50, 6, 'Deliverable Handed to Nayana', 1, 0, 'C', True)
    pdf.cell(52, 6, 'Nayana Verification Objective', 1, 0, 'C', True)
    pdf.cell(50, 6, 'Pass Criteria', 1, 1, 'C', True)

    pdf.set_font('Helvetica', '', 8)
    pdf.cell(38, 5, 'Prajval V K (Auth)', 1, 0)
    pdf.cell(50, 5, 'Redis Idempotency Filter', 1, 0)
    pdf.cell(52, 5, 'Test 120s TTL lock & 409 rejection', 1, 0)
    pdf.cell(50, 5, 'Strictly 1 created, 4 rejected (409)', 1, 1)

    pdf.cell(38, 5, 'Girish T (Billing)', 1, 0)
    pdf.cell(50, 5, 'POST /api/v1/orders + Outbox', 1, 0)
    pdf.cell(52, 5, 'Verify atomic order + outbox rows', 1, 0)
    pdf.cell(50, 5, 'Zero orphan/ghost line items in DB', 1, 1)

    pdf.cell(38, 5, 'Swaroopa (Frontend)', 1, 0)
    pdf.cell(50, 5, 'Screen 2 Billing Cart UI', 1, 0)
    pdf.cell(52, 5, 'Playwright E2E full cashier flow', 1, 0)
    pdf.cell(50, 5, 'Search -> Add -> Tender -> 100% pass', 1, 1)

    pdf.cell(38, 5, 'Bharath (Hardware)', 1, 0)
    pdf.cell(50, 5, 'Printer Bridge Socket', 1, 0)
    pdf.cell(52, 5, 'Tender modal print trigger event', 1, 0)
    pdf.cell(50, 5, 'WebSocket frame dispatched < 25ms', 1, 1)
    pdf.ln(5)

    # Overview Summary Table
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(0, 7, '2. Day 5 Master Tasks Quick Reference (10 Tasks Total)', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_fill_color(248, 250, 252)
    pdf.cell(16, 5, 'Session', 1, 0, 'C', True)
    pdf.cell(14, 5, 'Task #', 1, 0, 'C', True)
    pdf.cell(85, 5, 'Task Title & Functional Objective', 1, 0, 'L', True)
    pdf.cell(45, 5, 'Target Scope / File', 1, 0, 'L', True)
    pdf.cell(30, 5, 'Key Status Code', 1, 1, 'C', True)

    tasks_summary = [
        ("Morning", "Task 1", "Execute Payment Concurrency & Idempotency Testing", "Postman / Newman Collection", "HTTP 200 / 201"),
        ("Morning", "Task 2", "Dispatch 5 Concurrent Identical Checkout Requests", "POST /api/v1/orders", "5 Parallel Calls"),
        ("Morning", "Task 3", "Assert Redis Idempotency Lock (1 OK, 4 Blocked)", "IdempotencyFilter.java", "HTTP 409 Conflict"),
        ("Morning", "Task 4", "Verify Safe Retry Returns Cached Order Payload", "Redis Order Cache", "HTTP 200 (Replay)"),
        ("Morning", "Task 5", "Verify Zero Duplicate / Ghost Records in PostgreSQL", "DB: orders, order_items", "Count == 1 strictly"),
        ("Afternoon", "Task 6", "Author Playwright Screen 2 E2E Cashier Script", "tests/screen2-billing.spec.ts", "E2E Green [OK]"),
        ("Afternoon", "Task 7", "Automate Cart Actions (Search -> Add -> Quantity)", "POS Cart DOM Stepper", "Subtotal reactivity"),
        ("Afternoon", "Task 8", "Verify Order Completion Modal & Tender Calculation", "PosCheckoutModal.tsx", "Change Due Exact"),
        ("Afternoon", "Task 9", "Verify PostgreSQL 18.7 Multi-Table Atomic Records", "PostgreSQL: payments, outbox", "Foreign Keys Valid"),
        ("Afternoon", "Task 10", "Triage Billing Defects & Sign-Off with Team Leads", "DEFECT_LOG_DAY5.md", "0 Critical Defects"),
    ]

    pdf.set_font('Helvetica', '', 7.5)
    for session, num, title, scope, code in tasks_summary:
        pdf.cell(16, 4.5, session, 1, 0, 'C')
        pdf.cell(14, 4.5, num, 1, 0, 'C')
        pdf.cell(85, 4.5, title, 1, 0, 'L')
        pdf.cell(45, 4.5, scope, 1, 0, 'L')
        pdf.cell(30, 4.5, code, 1, 1, 'C')

    # -------------------------------------------------------------
    # PAGE 2: MORNING SESSION DEEP DIVE (TASKS 1 - 5)
    # -------------------------------------------------------------
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 8, 'Morning Session (10:00 AM - 1:00 PM): Tasks 1 to 5 Detailed 5W1H', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)

    morning_tasks = [
        {
            "num": "Task 1",
            "title": "Payment Concurrency & Idempotency Test Harness Setup",
            "what": "Configure automated Postman Runner and concurrent Node.js HTTP dispatch harness to test POST /api/v1/orders.",
            "why": "Sequential single-threaded tests cannot uncover race conditions or distributed lock bypasses during high-concurrency billing.",
            "when": "10:15 AM - 10:45 AM (Immediately after Docker baseline verification).",
            "where": "qa/postman/URQR_Phase1_POS_API_Collection.json (Folder: 06 - Orders & Billing).",
            "how": "Author pre-request script in Postman generating UUID v4: pm.environment.set('testIdempotencyKey', 'idem-' + crypto.randomUUID()); configure concurrent runner script scripts/run-idempotency-test.js.",
            "verification": "Harness executes and logs 5 parallel requests in < 200ms without socket timeouts."
        },
        {
            "num": "Task 2",
            "title": "Dispatch 5 Concurrent Identical Checkout Requests",
            "what": "Fire 5 simultaneous POST /api/v1/orders requests carrying the exact same Idempotency-Key header and payload.",
            "why": "Simulates rapid touch terminal finger bounces ('double-tapping' on touchscreens) or cashier retries during network latency.",
            "when": "10:45 AM - 11:15 AM.",
            "where": "Target endpoint: http://localhost:8089/api/v1/orders (or port 8080 backend).",
            "how": "Use Promise.all() in Node.js firing 5 parallel axios/fetch requests with headers: {'Idempotency-Key': currentKey, 'Authorization': 'Bearer ' + token, 'X-Tenant-ID': hotelId}.",
            "verification": "Console logs 5 response codes received within 300ms window."
        },
        {
            "num": "Task 3",
            "title": "Assert Redis Idempotency Lock: Exactly 1 OK, 4 Blocked with 409",
            "what": "Assert that Redis 8.2.11 distributed lock allows strictly the 1st request through and rejects remaining 4 with HTTP 409.",
            "why": "Guarantees zero double-billing, prevents multiple charges on the customer, and eliminates phantom kitchen tickets.",
            "when": "11:15 AM - 11:45 AM.",
            "where": "Assertion logic in Postman Collection tests and IdempotencyFilter.java.",
            "how": "Write assertion: pm.test('Lock blocks concurrent duplicates', function() { var codes = pm.environment.get('codes'); pm.expect(codes.filter(c => c === 200 || c === 201).length).to.eql(1); pm.expect(codes.filter(c => c === 409).length).to.eql(4); }); assert RFC 7807 ProblemDetail error format.",
            "verification": "Newman run confirms: 1 request returns HTTP 200/201, 4 requests return HTTP 409 Conflict."
        },
        {
            "num": "Task 4",
            "title": "Verify Safe Retry Returns Cached Original Order Payload",
            "what": "Re-send an identical request with the same Idempotency-Key after order completion and assert cached response is returned.",
            "why": "If POS terminal Wi-Fi drops while awaiting response, client retries safely. Backend must return existing order without re-creating.",
            "when": "11:45 AM - 12:15 PM.",
            "where": "Endpoint POST /api/v1/orders querying Redis response cache (TTL 120s).",
            "how": "Send 6th request with same key after 2s delay. Assert: pm.response.to.have.status(200); pm.expect(pm.response.json().orderId).to.eql(pm.environment.get('firstOrderId')); assert totals and line items match exactly.",
            "verification": "Status is 200 OK; response latency < 20ms (cache hit); order ID matches first order 1:1."
        },
        {
            "num": "Task 5",
            "title": "Database Order Audit: Verify Zero Ghost / Duplicate Rows in DB",
            "what": "Query PostgreSQL 18.7 tables (orders, order_items, payments) to ensure only 1 single order record was inserted.",
            "why": "Validates database financial integrity; ensures no orphan records or tax calculation discrepancies exist in database ledger.",
            "when": "12:15 PM - 12:45 PM (Before midday sign-off).",
            "where": "PostgreSQL 18.7 database container on port 5432.",
            "how": "Execute SQL query: SELECT count(*) FROM orders WHERE idempotency_key = :testKey; and SELECT count(*) FROM order_items WHERE order_id = :orderId; assert count is strictly 1 and line items match expected cart count.",
            "verification": "SQL query returns count = 1. Zero duplicate rows; surefire/newman reports 0 errors."
        }
    ]

    for t in morning_tasks:
        pdf.set_fill_color(241, 245, 249)
        pdf.set_draw_color(203, 213, 225)
        pdf.rect(10, pdf.get_y(), 190, 31, 'DF')
        
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(30, 58, 138)
        pdf.cell(30, 5, f"[{t['num']}]", 0, 0)
        pdf.cell(160, 5, t['title'], 0, 1)

        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(15, 4, 'WHAT: ', 0, 0)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(175, 4, t['what'], 0, 1)

        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(15, 4, 'WHY: ', 0, 0)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(175, 4, t['why'], 0, 1)

        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(15, 4, 'WHEN: ', 0, 0)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(75, 4, t['when'], 0, 0)

        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(15, 4, 'WHERE: ', 0, 0)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(85, 4, t['where'], 0, 1)

        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(15, 4, 'HOW: ', 0, 0)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(175, 4, t['how'], 0, 1)

        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(16, 185, 129) # Emerald
        pdf.cell(22, 4, 'VERIFICATION: ', 0, 0)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(168, 4, t['verification'], 0, 1)
        pdf.ln(3)

    # -------------------------------------------------------------
    # PAGE 3: AFTERNOON SESSION DEEP DIVE (TASKS 6 - 10)
    # -------------------------------------------------------------
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 8, 'Afternoon Session (2:10 PM - 4:10 PM): Tasks 6 to 10 Detailed 5W1H', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)

    afternoon_tasks = [
        {
            "num": "Task 6",
            "title": "Author Playwright E2E Billing Page Cashier Flow",
            "what": "Author end-to-end browser test script tests/screen2-billing.spec.ts automating complete cashier flow on Screen 2.",
            "why": "Verifies that UI components, touch targets, state stores, and backend endpoints work cohesively in a real browser.",
            "when": "2:10 PM - 2:40 PM.",
            "where": "tests/screen2-billing.spec.ts configured for 1366x768 fixed terminal viewport.",
            "how": "Script navigates to /login, authenticates cashier, redirects to /pos/billing, asserts catalog grid renders with categories and search input.",
            "verification": "npx playwright test tests/screen2-billing.spec.ts executes headless with 0 failures."
        },
        {
            "num": "Task 7",
            "title": "Automate Cart Actions (Search -> Add -> Stepper Quantity -> Subtotal)",
            "what": "Automate searching a product, adding item to cart, incrementing quantity via stepper, and asserting subtotal math.",
            "why": "Confirms Swaroopa's Zustand cart store reactivity and BigDecimal rounding (half-up) match UI display accurately.",
            "when": "2:40 PM - 3:15 PM.",
            "where": "tests/screen2-billing.spec.ts targeting QuantityStepper.tsx and OrderTotals.tsx.",
            "how": "Fill search: 'Paneer'; click 'Add to Cart'; click stepper '+' twice; assert quantity = 3; assert subtotal = price * 3; assert CGST (2.5%) and SGST (2.5%) update dynamically.",
            "verification": "DOM assertions confirm values update in < 16ms without rendering lag or NaN glitches."
        },
        {
            "num": "Task 8",
            "title": "Verify Order Completion Modal, Tender Math & Print Trigger",
            "what": "Automate opening PosCheckoutModal.tsx, entering Cash/UPI tender, validating change due, and triggering receipt print.",
            "why": "Validates final cashier step: cashier enters cash received, POS calculates change owed to guest, and fires bridge print event.",
            "when": "3:15 PM - 3:40 PM.",
            "where": "frontend/manager-pos/src/pages/.../PosCheckoutModal.tsx and bridgeClient.ts.",
            "how": "Click 'Charge / Checkout'; enter tender amount '500.00' for total '350.00'; assert change due displayed is '150.00'; click 'Complete Order'; spy WebSocket send() to ws://localhost:9101.",
            "verification": "Modal confirms order completion; toast notification displays success; WebSocket frame captured."
        },
        {
            "num": "Task 9",
            "title": "Verify PostgreSQL 18.7 Multi-Table Atomic Records",
            "what": "Assert that completing checkout creates atomic, relational records across orders, order_items, payments, and outbox tables.",
            "why": "Ensures that POS frontend checkout committed all transactional records and outbox event with zero partial writes.",
            "when": "3:40 PM - 4:00 PM.",
            "where": "PostgreSQL 18.7 database container tables (orders, order_items, payments, outbox_events).",
            "how": "Run SQL query matching order ID from Playwright test: assert orders.status = 'COMPLETED', payments.amount = total, and outbox_events.event_type = 'OrderCreatedEvent'.",
            "verification": "All 4 tables contain matching rows with valid foreign keys and timestamps."
        },
        {
            "num": "Task 10",
            "title": "Triage Billing Defects & Sign-Off with Swaroopa and Girish T",
            "what": "Perform final review of calculation tolerances, edge-case tax roundings, and compile formal Day 5 QA sign-off certificate.",
            "why": "Prevents tax audit penalties and certifies that frontend and backend calculations have zero discrepancy.",
            "when": "4:00 PM - 4:10 PM.",
            "where": "qa/defect-reports/DEFECT_LOG_DAY5.md and qa/test-execution/PHASE1_DAY5_QA_SIGNOFF.md.",
            "how": "Audit defect tracker with Swaroopa and Girish T; verify all reported issues are marked RESOLVED; commit sign-off file and push to origin/Nayana.",
            "verification": "git push origin Nayana succeeds; GitHub Actions CI reports 5/5 PASSED."
        }
    ]

    for t in afternoon_tasks:
        pdf.set_fill_color(241, 245, 249)
        pdf.set_draw_color(203, 213, 225)
        pdf.rect(10, pdf.get_y(), 190, 31, 'DF')
        
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(30, 58, 138)
        pdf.cell(30, 5, f"[{t['num']}]", 0, 0)
        pdf.cell(160, 5, t['title'], 0, 1)

        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(15, 4, 'WHAT: ', 0, 0)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(175, 4, t['what'], 0, 1)

        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(15, 4, 'WHY: ', 0, 0)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(175, 4, t['why'], 0, 1)

        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(15, 4, 'WHEN: ', 0, 0)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(75, 4, t['when'], 0, 0)

        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(15, 4, 'WHERE: ', 0, 0)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(85, 4, t['where'], 0, 1)

        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(15, 4, 'HOW: ', 0, 0)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(175, 4, t['how'], 0, 1)

        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(16, 185, 129)
        pdf.cell(22, 4, 'VERIFICATION: ', 0, 0)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(168, 4, t['verification'], 0, 1)
        pdf.ln(3)

    # -------------------------------------------------------------
    # PAGE 4: CHECKLIST, COMMANDS & SIGN-OFF FORM
    # -------------------------------------------------------------
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 8, 'Operational Commands, Defect Severity Matrix & Sign-Off Form', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)

    # Command Cheat-Sheet
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(0, 6, '1. Nayana Day 5 Terminal Command Cheat-Sheet', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_fill_color(15, 23, 42) # Dark Slate
    pdf.set_draw_color(30, 41, 59)
    pdf.rect(10, pdf.get_y(), 190, 36, 'DF')
    pdf.set_y(pdf.get_y() + 2)
    pdf.set_font('Courier', 'B', 8)
    pdf.set_text_color(248, 250, 252)

    cmds = [
        "# Git Baseline Pull (10:00 AM Kickoff):",
        "git fetch origin && git checkout Nayana && git reset --hard origin/Nayana",
        "# Execute Automated Postman / Newman Regression Suite:",
        "node scripts/run-newman-smoke.js",
        "# Run Playwright Screen 2 Billing E2E Suite:",
        "pnpm exec playwright test tests/screen2-billing.spec.ts",
        "# Daily Commit & Push (3:45 PM):",
        "git add qa/ tests/ && git commit -m 'feat(qa): complete Day 5 idempotency and billing E2E' && git push origin Nayana"
    ]
    for c in cmds:
        pdf.cell(0, 4, f"  {c}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(6)

    # Defect Severity Matrix
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(0, 6, '2. Defect Severity & Escalation Classification Matrix', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_fill_color(226, 232, 240)
    pdf.cell(25, 5, 'Severity Level', 1, 0, 'C', True)
    pdf.cell(65, 5, 'Failure Criteria / Condition', 1, 0, 'L', True)
    pdf.cell(50, 5, 'Escalation Target', 1, 0, 'L', True)
    pdf.cell(50, 5, 'Resolution SLA', 1, 1, 'L', True)

    pdf.set_font('Helvetica', '', 7.5)
    severities = [
        ("Blocker", "Double-charging customer; data loss in cart; lock bypass", "Prajval V K & CTO Manjunatha", "Immediate (< 30 mins)"),
        ("Critical", "HTTP 500 on valid checkout; missing outbox event row", "Girish T (Backend Orders)", "< 1 hour"),
        ("Major", "Calculation discrepancy in CGST/SGST (> 0.01 paise)", "Swaroopa & Girish T", "< 2 hours"),
        ("Minor", "Button spinner alignment glitch; modal animation delay", "Vishal (Frontend UI)", "End of Day (Day 5)")
    ]
    for sev, crit, target, sla in severities:
        pdf.cell(25, 4.5, sev, 1, 0, 'C')
        pdf.cell(65, 4.5, crit, 1, 0, 'L')
        pdf.cell(50, 4.5, target, 1, 0, 'L')
        pdf.cell(50, 4.5, sla, 1, 1, 'L')
    pdf.ln(6)

    # Sign-Off Form
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(0, 6, '3. Formal Phase 1 Day 5 QA Execution Sign-Off', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_draw_color(203, 213, 225)
    pdf.set_fill_color(248, 250, 252)
    pdf.rect(10, pdf.get_y(), 190, 42, 'DF')
    pdf.set_y(pdf.get_y() + 3)

    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(51, 65, 85)
    pdf.cell(0, 5, 'I hereby certify that all 10 Day 5 QA tasks have been executed in strict compliance with Nelja Tech standards.', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 5, 'Zero Kafka, zero Kubernetes, zero microservices. Zero double-billing under Redis idempotency distributed lock.', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(3)

    pdf.set_font('Helvetica', 'B', 8)
    pdf.cell(63, 6, 'Nayana (QA Lead): ____________________', 0, 0)
    pdf.cell(63, 6, 'Prajwal B N (Architect): ________________', 0, 0)
    pdf.cell(64, 6, 'CTO Manjunatha S: ___________________', 0, 1)

    pdf.cell(63, 6, 'Date: 27 November 2026', 0, 0)
    pdf.cell(63, 6, 'Morning Status: [ X ] Complete', 0, 0)
    pdf.cell(64, 6, 'Afternoon Status: [ X ] Complete', 0, 1)

    pdf.output(output_path)
    print(f"PDF successfully generated at: {output_path}")

if __name__ == '__main__':
    target = r"P:\URQR\qa\test-execution\URQR_Nayana_Day5_Execution_Guide.pdf"
    os.makedirs(os.path.dirname(target), exist_ok=True)
    create_guide_pdf(target)

    artifact_dir = r"C:\Users\rajan\.gemini\antigravity\brain\880a094d-ffe6-45ad-9916-e0c680e962c5"
    artifact_target = os.path.join(artifact_dir, "URQR_Nayana_Day5_Execution_Guide.pdf")
    shutil.copyfile(target, artifact_target)
    print(f"Copied to artifact directory: {artifact_target}")
