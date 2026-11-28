import os
import shutil
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class SwaroopaDay5PDF(FPDF):
    def header(self):
        # Top banner
        self.set_fill_color(15, 23, 42) # Slate 900
        self.rect(0, 0, 210, 14, 'F')
        self.set_y(3)
        self.set_font('Helvetica', 'B', 8.5)
        self.set_text_color(255, 255, 255)
        self.cell(0, 8, '   NELJA TECH  |  URQR PLATFORM -- PHASE 1 POS  |  DAY 5 SWAROOPA MASTER EXECUTION', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(6)

    def footer(self):
        self.set_y(-14)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(100, 116, 139) # Slate 500
        self.cell(100, 8, 'Confidential -- Internal Engineering Execution Protocol', new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.cell(0, 8, f'Page {self.page_no()} of {{nb}}', align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def draw_section_heading(self, title, color_rgb=(30, 41, 59)):
        self.ln(3)
        self.set_fill_color(*color_rgb)
        self.rect(self.get_x(), self.get_y(), 190, 7.5, 'F')
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(255, 255, 255)
        self.cell(190, 7.5, f"  {title}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(2.5)

    def draw_task_card(self, task_num, title, status_type, what, why, where, when, how_code, verification):
        needed_height = 42 if not how_code else 58
        if self.get_y() + needed_height > 275:
            self.add_page()

        # Task Header Box
        if status_type == "DONE":
            bg_color = (240, 253, 244) # Emerald 50
            border_color = (34, 197, 94) # Emerald 500
            badge_bg = (22, 101, 52) # Emerald 800
            badge_text = "[ALREADY DONE - 100%]"
        else:
            bg_color = (254, 243, 199) # Amber 100
            border_color = (245, 158, 11) # Amber 500
            badge_bg = (180, 83, 9) # Amber 700
            badge_text = "[PENDING - TO DO TODAY]"

        self.set_fill_color(*bg_color)
        self.set_draw_color(*border_color)
        self.set_line_width(0.35)
        
        # Header strip
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(15, 23, 42)
        
        # Title left, badge right
        header_text = f"Task {task_num}: {title}"
        self.cell(136, 6.2, header_text, border=0, new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.set_fill_color(*badge_bg)
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 7.5)
        self.cell(54, 6.2, badge_text, border=0, align='C', fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        
        # Card Body details
        self.set_text_color(30, 41, 59)
        self.ln(1)

        fields = [
            ("WHAT", what),
            ("WHY", why),
            ("WHERE", where),
            ("WHEN", when),
        ]

        for label, val in fields:
            self.set_font('Helvetica', 'B', 7.8)
            self.set_text_color(71, 85, 105) # Slate 600
            self.cell(18, 4.3, f"{label}:", border=0, new_x=XPos.RIGHT, new_y=YPos.TOP)
            self.set_font('Helvetica', '', 7.8)
            self.set_text_color(15, 23, 42)
            self.multi_cell(172, 4.3, val, border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        if how_code:
            self.set_font('Helvetica', 'B', 7.8)
            self.set_text_color(71, 85, 105)
            self.cell(18, 4.3, "HOW:", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            
            # Code block container
            self.set_fill_color(241, 245, 249) # Slate 100
            self.set_draw_color(203, 213, 225)
            self.set_font('Courier', '', 7.2)
            self.set_text_color(15, 23, 42)
            for line in how_code.split('\n'):
                self.cell(190, 3.8, f"  {line}", border=0, fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Verification line
        self.set_font('Helvetica', 'B', 7.8)
        if status_type == "DONE":
            self.set_text_color(16, 185, 129)
        else:
            self.set_text_color(217, 119, 6)
        self.cell(22, 4.3, "VERIFY:", border=0, new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.set_font('Helvetica', 'I', 7.8)
        self.set_text_color(15, 23, 42)
        self.multi_cell(168, 4.3, verification, border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Bottom separator
        self.set_draw_color(226, 232, 240)
        self.line(self.get_x(), self.get_y() + 1, self.get_x() + 190, self.get_y() + 1)
        self.ln(2.5)

def generate_pdf():
    pdf = SwaroopaDay5PDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.add_page()

    # Document Header Box
    pdf.set_fill_color(248, 250, 252) # Slate 50
    pdf.set_draw_color(203, 213, 225) # Slate 300
    pdf.rect(10, 18, 190, 26, 'FD')

    pdf.set_xy(14, 20)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(182, 5.5, 'SWAROOPA (FRONTEND POS BILLING LEAD) - DAY 5 MASTER TASKS', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_x(14)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(51, 65, 85)
    pdf.cell(90, 4.2, 'Assignee: Swaroopa (Frontend Engineer)', new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(92, 4.2, 'Scope: Screen 2 (Billing Page & POS Cart Engine)', align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_x(14)
    pdf.cell(90, 4.2, 'Source Doc: URQR_Swaroopa_6Days_Execution_Plan_Manual_Fill.pdf (pp. 9-10)', new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(92, 4.2, 'Status Target: 4 Done (Day 4 Core) | 6 In-Scope Day 5 Actions', align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_y(47)

    # Executive Summary Table
    pdf.draw_section_heading('EXECUTIVE SUMMARY: ALL 10 DAY 5 TASKS AUDIT', (30, 41, 59))
    
    # Table Header
    pdf.set_fill_color(226, 232, 240)
    pdf.set_font('Helvetica', 'B', 7.8)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(18, 5.5, 'Session', 1, align='C', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(14, 5.5, 'Task #', 1, align='C', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(118, 5.5, 'Official Task Title', 1, align='L', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(40, 5.5, 'Status in Codebase', 1, align='C', fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    tasks_summary = [
        ('Morning', 'Task 1', 'Construct POS Checkout Modal (Cash, Card, UPI)', '[DONE - 100%]', (220, 252, 231), (22, 101, 52)),
        ('Morning', 'Task 2', 'Quick-Tender Cash Buttons (Exact, 100, 500, 2000)', '[DONE - 100%]', (220, 252, 231), (22, 101, 52)),
        ('Morning', 'Task 3', 'Client-Side UUID v4 Idempotency-Key Header', '[PENDING - TO DO]', (254, 243, 199), (180, 83, 9)),
        ('Morning', 'Task 4', 'Connect Checkout to POST /api/v1/orders (TanStack)', '[PENDING - TO DO]', (254, 243, 199), (180, 83, 9)),
        ('Morning', 'Task 5', 'Handle Checkout Loading State & Spinner Locking', '[DONE - 100%]', (220, 252, 231), (22, 101, 52)),
        ('Afternoon', 'Task 6', 'Wire Checkout Success to Thermal Receipt Print Bridge', '[PENDING - TO DO]', (254, 243, 199), (180, 83, 9)),
        ('Afternoon', 'Task 7', 'Implement POS Keyboard Shortcuts (F2, F4, Esc)', '[DONE - 100%]', (220, 252, 231), (22, 101, 52)),
        ('Afternoon', 'Task 8', 'Checkout Failure Error Handling (409 Conflict Banner)', '[PENDING - TO DO]', (254, 243, 199), (180, 83, 9)),
        ('Afternoon', 'Task 9', 'Design QA on 1366x768 Viewport with Manasa', '[PENDING - TO DO]', (254, 243, 199), (180, 83, 9)),
        ('Afternoon', 'Task 10', 'Screen 2 Core Functionality Sign-Off (GitHub CI)', '[PENDING - TO DO]', (254, 243, 199), (180, 83, 9)),
    ]

    pdf.set_font('Helvetica', '', 7.5)
    for session, t_num, title, status_text, bg_col, text_col in tasks_summary:
        pdf.cell(18, 4.8, session, 1, align='C', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(14, 4.8, t_num, 1, align='C', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(118, 4.8, f" {title}", 1, align='L', new_x=XPos.RIGHT, new_y=YPos.TOP)
        
        pdf.set_fill_color(*bg_col)
        pdf.set_text_color(*text_col)
        pdf.set_font('Helvetica', 'B', 7.2)
        pdf.cell(40, 4.8, status_text, 1, align='C', fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(15, 23, 42)

    pdf.ln(2)

    # Part 1: Morning Session
    pdf.draw_section_heading('PART 1: MORNING SESSION (10:00 AM - 1:00 PM)', (30, 58, 138)) # Blue 900

    pdf.draw_task_card(
        task_num=1,
        title='Construct POS Checkout Modal (Cash, Card, UPI)',
        status_type='DONE',
        what='Modal dialog containing tabbed payment selection for Cash, Card, and UPI tender options.',
        why='Allows cashiers to switch payment methods instantly with a single tap at the billing counter.',
        where='frontend/manager-pos/src/pages/Table_Management/Components/Billing/PosCheckoutModal.tsx (Lines 150-235)',
        when='Completed during Day 4 foundations.',
        how_code='// Implemented via Radix UI Dialog primitive with dark-theme styling\n<Dialog open={isOpen} onOpenChange={onClose}>\n  <Tabs defaultValue="CASH" ... />\n</Dialog>',
        verification='pnpm test:run passes vishal_page4.test.ts (Mode switcher assertions 100% green).'
    )

    pdf.draw_task_card(
        task_num=2,
        title='Quick-Tender Cash Buttons & Instant Change Due Math',
        status_type='DONE',
        what='Quick cash buttons (Exact Cash, Rs.50, Rs.100, Rs.200, Rs.500, Rs.2000) and real-time change calculation.',
        why='Speeds up counter throughput during peak rush; eliminates manual mental arithmetic.',
        where='PosCheckoutModal.tsx (Line 438 & Lines 190-195)',
        when='Completed during Day 4 foundations.',
        how_code='// Integer paise arithmetic eliminates floating-point rounding errors:\nconst changeDue = Math.max(0, amountTendered - payablePaise) / 100;',
        verification='Cash calculation verified in vishal_page4.test.ts with zero rounding drift.'
    )

    pdf.draw_task_card(
        task_num=3,
        title='Client-Side UUID v4 Generation for Idempotency-Key Header',
        status_type='PENDING',
        what='Generate a cryptographically random UUID v4 on cashier device and inject into request headers as Idempotency-Key.',
        why='Eliminates double-charging or duplicate order creation if the cashier taps Pay twice or network drops.',
        where='frontend/manager-pos/src/pages/Table_Management/Hooks/useBilling.ts (Inside handleConfirmPayment)',
        when='10:15 AM - 11:30 AM',
        how_code='const idempotencyKey = crypto.randomUUID();\nconst headers = { "Idempotency-Key": idempotencyKey };',
        verification='Open browser DevTools Network tab, submit payment, verify request header has Idempotency-Key: UUIDv4.'
    )

    pdf.draw_task_card(
        task_num=4,
        title='Connect Checkout Trigger to Backend Endpoint (POST /api/v1/orders)',
        status_type='PENDING',
        what='Replace local demo receipt state with live TanStack Query useMutation calling Girish backend API.',
        why='Transitions POS from local frontend mock to live backend persistence in PostgreSQL 18.7.',
        where='frontend/manager-pos/src/pages/Table_Management/Hooks/useBilling.ts',
        when='11:30 AM - 12:30 PM',
        how_code='const checkoutMutation = useMutation({\n  mutationFn: async ({ payment, idempotencyKey }) => {\n    const payload = {\n      items: totals.items.map(i => ({ menuItemId: i.dish.id, quantity: i.quantity })),\n      payments: [{\n        method: payment.paymentMode.toUpperCase(),\n        amount: totals.total,\n        reference: payment.paymentMode === "Cash" ? "CASH-TENDER" : "UPI-GATEWAY"\n      }]\n    };\n    const res = await apiClient.post("/api/v1/orders", payload, {\n      headers: { "Idempotency-Key": idempotencyKey }\n    });\n    return res.data;\n  }\n});',
        verification='Completing an order triggers HTTP POST and receives 201 Created with valid orderId and orderNumber.'
    )

    pdf.draw_task_card(
        task_num=5,
        title='Handle Checkout Loading State, Spinner & Double-Submit Lock',
        status_type='DONE',
        what='Lock Pay button, disable tender inputs, and display animated spinner while checkout is processing.',
        why='Prevents cashiers from tapping multiple times while waiting for backend confirmation.',
        where='PosCheckoutModal.tsx (Lines 143 & 178-213)',
        when='Completed during Day 4 foundations.',
        how_code='// Locked via ref and boolean state guard:\nconst submittingRef = useRef(false);\nif (submittingRef.current) return;\nsubmittingRef.current = true;',
        verification='Rapid clicking on Pay button dispatches exactly 1 event; subsequent clicks are blocked.'
    )

    # Part 2: Afternoon Session
    pdf.draw_section_heading('PART 2: AFTERNOON SESSION (2:10 PM - 4:10 PM)', (88, 28, 135)) # Purple 900

    pdf.draw_task_card(
        task_num=6,
        title='Wire Checkout Success Event to Thermal Receipt Print Bridge',
        status_type='PENDING',
        what='On successful order response from backend, dispatch print job to Go urqr-bridge daemon over ws://localhost:9101.',
        why='Automatically prints the 48-column thermal receipt at the cashier counter the moment payment succeeds.',
        where='frontend/manager-pos/src/pages/Table_Management/Hooks/useBilling.ts (Inside onSuccess)',
        when='2:10 PM - 2:50 PM',
        how_code='import { bridgeClient } from "../../../../lib/bridge/bridgeClient";\n\nonSuccess: (orderData) => {\n  bridgeClient.sendPrintJob({\n    orderId: orderData.id,\n    orderNumber: orderData.orderNumber,\n    items: totals.items.map(i => ({ name: i.dish.name, price: i.dish.price, quantity: i.quantity })),\n    subtotal: totals.subtotal,\n    tax: totals.tax,\n    grandTotal: totals.total,\n    paymentMode: payment.paymentMode\n  });\n  clearCart();\n  setIsCheckoutModalOpen(false);\n}',
        verification='Virtual thermal printer on port 9100 receives print stream; console logs print job dispatched.'
    )

    pdf.draw_task_card(
        task_num=7,
        title='Implement POS Keyboard Shortcuts (F2, F4, Esc)',
        status_type='DONE',
        what='Keyboard shortcuts for rapid billing: F2 focuses search, F4 opens cash checkout, Esc dismisses modal.',
        why='Professional POS terminals must be 100% keyboard-navigable without requiring touch or mouse.',
        where='frontend/manager-pos/src/pages/Table_Management/Hooks/posShortcutKeys.ts and BillingHeader.tsx',
        when='Completed during Day 3/4 foundations.',
        how_code='// Custom usePosHotkeys hook attached to window keydown listener:\nusePosHotkeys({ onSearch: focusSearch, onCheckout: openCheckout, onEscape: closeModal });',
        verification='pnpm test:run passes posShortcutKeys.test.ts (17 automated unit tests passed).'
    )

    pdf.draw_task_card(
        task_num=8,
        title='Checkout Failure Error Handling (409 Conflict & Network Drops)',
        status_type='PENDING',
        what='Intercept server error codes (409 Conflict, 500, network drop) and show warning banner without clearing cart.',
        why='If payment encounters conflict or network drop, the cashier must NEVER lose items in the cart.',
        where='useBilling.ts and PosCheckoutModal.tsx',
        when='2:50 PM - 3:30 PM',
        how_code='onError: (error: any) => {\n  if (error?.response?.status === 409) {\n    setError("Payment is currently being processed. Please wait 5 seconds before retrying.");\n  } else {\n    setError(error?.response?.data?.detail || "Checkout failed. Please check network connection.");\n  }\n  // CRITICAL: Do NOT call clearCart() on failure\n}',
        verification='Simulate server 409 Conflict; modal displays amber warning, cart items remain completely intact.'
    )

    pdf.draw_task_card(
        task_num=9,
        title='Design QA on Billing Screen alongside Manasa',
        status_type='PENDING',
        what='Review button padding, contrast, modal popups, and touch target sizes (>48px) with Manasa on 1366x768.',
        why='Ensures cashier does not mis-tap buttons or experience visual clipping on retail counter screens.',
        where='frontend/manager-pos/src/pages/Table_Management/Components/Billing/',
        when='3:30 PM - 3:55 PM',
        how_code='// Verification command:\npnpm dev\n// Inspect in Chrome DevTools responsive mode set to 1366 x 768.',
        verification='Manasa signs off in design register; zero horizontal scrollbars or layout overflow defects.'
    )

    pdf.draw_task_card(
        task_num=10,
        title='Screen 2 Core Functionality Formal Sign-Off',
        status_type='PENDING',
        what='Execute full regression check and compile official QA sign-off document for Screen 2 Billing Page.',
        why='Certifies that Screen 2 is 100% production-ready for customer checkout before Day 6.',
        where='qa/test-execution/PHASE1_SCREEN2_QA_SIGNOFF.md',
        when='3:55 PM - 4:10 PM',
        how_code='pnpm typecheck\npnpm test:run\ngit add . && git commit -m "feat(billing): complete Day 5 Swaroopa POS checkout flow"\ngit push origin swaroopa',
        verification='Remote GitHub Actions CI passes with [5/5 PASSED].'
    )

    # Summary Box: Immediate To-Do
    pdf.ln(2)
    if pdf.get_y() + 36 > 275:
        pdf.add_page()

    pdf.set_fill_color(241, 245, 249) # Slate 100
    pdf.set_draw_color(15, 23, 42)
    pdf.set_line_width(0.5)
    pdf.rect(10, pdf.get_y(), 190, 34, 'FD')

    box_y = pdf.get_y() + 2
    pdf.set_xy(14, box_y)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(182, 5, 'SWAROOPA IMMEDIATE ACTION ITEMS (WHAT TO CODE TODAY):', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(30, 41, 59)
    todos = [
        "1. [Morning - 10:15 AM] Add UUID v4 'Idempotency-Key' in useBilling.ts handleConfirmPayment",
        "2. [Morning - 11:30 AM] Connect checkout mutation to POST /api/v1/orders with Girish backend",
        "3. [Afternoon - 2:10 PM] Call bridgeClient.sendPrintJob() inside mutation onSuccess to print receipt",
        "4. [Afternoon - 2:50 PM] Add 409 Conflict error handler (preserve cart state on failure)",
        "5. [Afternoon - 3:30 PM] Review 1366x768 responsive layout with Manasa and push branch to origin/swaroopa"
    ]

    for item in todos:
        pdf.set_x(16)
        pdf.cell(178, 4.6, item, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    output_dir = r"P:\URQR\qa\test-execution"
    os.makedirs(output_dir, exist_ok=True)
    out_pdf_path = os.path.join(output_dir, "URQR_Swaroopa_Day5_Execution_Guide.pdf")
    pdf.output(out_pdf_path)
    print(f"PDF generated successfully at {out_pdf_path}")
    print(f"Total Page Count: {pdf.page_no()}")

    # Copy to Artifact directory as well
    artifact_dir = r"C:\Users\rajan\.gemini\antigravity\brain\880a094d-ffe6-45ad-9916-e0c680e962c5"
    artifact_pdf = os.path.join(artifact_dir, "URQR_Swaroopa_Day5_Execution_Guide.pdf")
    shutil.copyfile(out_pdf_path, artifact_pdf)
    print(f"Copied to artifact directory: {artifact_pdf}")

if __name__ == "__main__":
    generate_pdf()
