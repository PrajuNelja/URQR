import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class NayanaManualPDF(FPDF):
    def __init__(self):
        super().__init__(orientation='P', unit='mm', format='A4')
        self.set_auto_page_break(auto=False) # Manual strict single-page control per session
        self.set_margins(12, 10, 12)

    def header(self):
        # Top banner
        self.set_fill_color(15, 23, 42) # Slate 900
        self.rect(0, 0, 210, 11, 'F')
        self.set_xy(12, 2.2)
        self.set_font('Helvetica', 'B', 8)
        self.set_text_color(255, 255, 255)
        self.cell(100, 6.5, 'NELJA TECH  |  URQR PLATFORM  -  PHASE 1 STANDALONE MANAGER POS', new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.set_font('Helvetica', 'B', 8)
        self.set_text_color(148, 163, 184) # Slate 400
        self.cell(86, 6.5, 'NAYANA -- QA (API CONTRACTS & E2E TESTING)', align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(3)

    def footer(self):
        # Footer rule and text
        self.set_y(-12)
        self.set_draw_color(226, 232, 240)
        self.line(12, self.get_y(), 198, self.get_y())
        self.set_y(-10)
        self.set_font('Helvetica', '', 7.5)
        self.set_text_color(100, 116, 139)
        self.cell(120, 5, 'Technical Standard: Postman, Newman, Playwright E2E, Multi-Tenant Security, Idempotency QA', new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.set_font('Helvetica', 'B', 7.5)
        self.set_text_color(71, 85, 105)
        self.cell(66, 5, f'Page {self.page_no()} of 12', align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

def render_session_page(pdf, day_num, day_str, session_type, status_type, tasks, remarks, is_complete=True):
    pdf.add_page()
    w = 186 # Usable width (210 - 24)

    # 1. Page Title & Meta Block
    y_start = 14
    pdf.set_xy(12, y_start)
    
    # Title
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(130, 6.5, 'URQR Platform -- Phase 1 Standalone Manager POS', new_x=XPos.RIGHT, new_y=YPos.TOP)
    
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(56, 6.5, 'NELJA TECH', align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # Subtitle line
    pdf.set_x(12)
    pdf.set_font('Helvetica', '', 8.2)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(130, 4.5, 'Assignee: Nayana  |  Role: Functional & API QA  |  Scope: API Contracts, Playwright E2E & Multi-Tenancy', new_x=XPos.RIGHT, new_y=YPos.TOP)

    # Status Pill
    if is_complete:
        pdf.set_fill_color(220, 252, 231) # Emerald 100
        pdf.set_text_color(22, 101, 52)   # Emerald 800
        status_text = 'Status: Complete [X]'
    else:
        pdf.set_fill_color(224, 231, 255) # Indigo 100
        pdf.set_text_color(30, 58, 138)   # Indigo 800
        status_text = 'Status: Scheduled [ ]'
        
    pdf.set_font('Helvetica', 'B', 8)
    pdf.cell(56, 5, status_text, align='R', fill=False, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1.5)

    # 2. Session Banner Bar
    pdf.set_fill_color(241, 245, 249) # Slate 100
    pdf.set_draw_color(203, 213, 225)
    pdf.rect(12, pdf.get_y(), w, 7.5, 'DF')
    
    pdf.set_xy(15, pdf.get_y() + 1.2)
    pdf.set_font('Helvetica', 'B', 9.5)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(100, 5, f'Day {day_num} -- {day_str}', new_x=XPos.RIGHT, new_y=YPos.TOP)
    
    pdf.set_font('Helvetica', 'B', 9)
    if 'Morning' in session_type:
        pdf.set_text_color(2, 132, 199) # Sky 600
        session_icon = '  Morning session (10:00 AM - 1:00 PM)'
    else:
        pdf.set_text_color(124, 58, 237) # Purple 600
        session_icon = '  Afternoon session (2:10 PM - 5:10 PM)'
    pdf.cell(83, 5, session_icon, align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(3.5)

    # 3. Tasks List
    task_count = len(tasks)
    # Available height budgeting
    card_h = 24.5 if task_count == 5 else 30.5

    for idx, t in enumerate(tasks):
        y_card = pdf.get_y()
        pdf.set_fill_color(255, 255, 255)
        pdf.set_draw_color(226, 232, 240)
        pdf.rect(12, y_card, w, card_h, 'DF')

        # Left vertical accent line
        accent_color = (16, 185, 129) if is_complete else (59, 130, 246)
        pdf.set_fill_color(*accent_color)
        pdf.rect(12, y_card, 2.5, card_h, 'F')

        # Task Header Line
        pdf.set_xy(16, y_card + 1.5)
        pdf.set_font('Helvetica', 'B', 8.5)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(145, 4.5, f"* Task {idx + 1} | {t['title']}", new_x=XPos.RIGHT, new_y=YPos.TOP)

        # Status badge / Checkbox
        if is_complete:
            pdf.set_fill_color(220, 252, 231)
            pdf.set_text_color(22, 101, 52)
            chk_text = '[X] VERIFIED'
        else:
            pdf.set_fill_color(241, 245, 249)
            pdf.set_text_color(100, 116, 139)
            chk_text = '[ ] PENDING'
            
        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.cell(23, 4.5, chk_text, align='C', fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Description / Scope
        pdf.set_xy(16, y_card + 6.2)
        pdf.set_font('Helvetica', '', 7.6)
        pdf.set_text_color(51, 65, 85)
        pdf.multi_cell(168, 3.6, t['desc'])

        # Deliverable in Codebase
        pdf.set_x(16)
        pdf.set_font('Helvetica', 'B', 7.4)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(20, 3.8, 'Deliverable:', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font('Courier', 'B', 7.2)
        pdf.set_text_color(30, 58, 138)
        pdf.cell(148, 3.8, t['deliverable'], new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Verification command / Result
        pdf.set_x(16)
        pdf.set_font('Helvetica', 'B', 7.4)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(20, 3.8, 'Verification:', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font('Courier', '', 7.0)
        pdf.set_text_color(16, 100, 60) if is_complete else pdf.set_text_color(70, 70, 70)
        pdf.cell(148, 3.8, t['verify'], new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.set_y(y_card + card_h + 1.2)

    pdf.ln(1)

    # 4. Remarks Box
    y_rem = pdf.get_y()
    rem_h = 37.0 if task_count == 5 else 39.0
    
    # Outer box
    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(203, 213, 225)
    pdf.rect(12, y_rem, w, rem_h, 'DF')

    # Top accent bar
    pdf.set_fill_color(226, 232, 240)
    pdf.rect(12, y_rem, w, 5.5, 'F')
    pdf.set_xy(15, y_rem + 0.8)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(100, 4, 'Remarks & Quantitative Test Evidence', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # Remarks text items
    pdf.set_y(y_rem + 7.0)
    for i, r_text in enumerate(remarks):
        pdf.set_x(15)
        pdf.set_font('Helvetica', 'B', 7.8)
        pdf.set_text_color(30, 58, 138)
        pdf.cell(5, 4.2, f'{i+1}.', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font('Helvetica', '', 7.6)
        pdf.set_text_color(30, 41, 59)
        pdf.multi_cell(164, 4.2, r_text)

    # 5. Reviewer / Lead Signature Block
    y_sig = y_rem + rem_h + 2.0
    pdf.set_xy(12, y_sig)
    pdf.set_fill_color(255, 255, 255)
    pdf.set_draw_color(226, 232, 240)
    pdf.rect(12, y_sig, w, 11, 'DF')

    pdf.set_xy(15, y_sig + 3)
    pdf.set_font('Helvetica', 'B', 7.8)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(38, 5, 'Reviewer / Lead Signature:', new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.set_font('Helvetica', 'B', 8.2)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(50, 5, 'Prajwal B N / Manjunatha S', new_x=XPos.RIGHT, new_y=YPos.TOP)

    pdf.set_font('Helvetica', 'B', 7.8)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(12, 5, 'Date:', new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(26, 5, f'{day_str.split()[-3]} Nov 2026', new_x=XPos.RIGHT, new_y=YPos.TOP)

    pdf.set_font('Helvetica', 'B', 7.8)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(24, 5, 'Session Status:', new_x=XPos.RIGHT, new_y=YPos.TOP)
    
    if is_complete:
        pdf.set_font('Helvetica', 'B', 8)
        pdf.set_text_color(22, 101, 52)
        pdf.cell(30, 5, '[X] Complete  [ ] In Progress', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    else:
        pdf.set_font('Helvetica', 'B', 8)
        pdf.set_text_color(30, 58, 138)
        pdf.cell(30, 5, '[ ] Complete  [X] Scheduled', new_x=XPos.LMARGIN, new_y=YPos.NEXT)


def generate_full_pdf(output_path):
    pdf = NayanaManualPDF()

    # -------------------------------------------------------------
    # PAGE 1: DAY 1 MORNING
    # -------------------------------------------------------------
    render_session_page(
        pdf=pdf,
        day_num=1,
        day_str='Monday, 23 November 2026',
        session_type='Morning',
        status_type='DONE',
        is_complete=True,
        tasks=[
            {
                'title': 'Review finalized URQR tech stack & extract QA verification requirements',
                'desc': 'Extracted test requirements across Java 21 Spring Boot 3.4, React 18, PostgreSQL 18.7, and Go bridge.',
                'deliverable': 'qa/test-plan/Tech_Stack_QA_Requirements.md',
                'verify': 'Audited 24 core architectural standards; zero-tenant auth & RLS baseline established.'
            },
            {
                'title': 'Author Master QA Strategy and Test Plan for Phase 1 (3-screen POS scope)',
                'desc': 'Established standardized 4-tier testing pyramid: Unit (Vitest/JUnit), Integration, API, and Playwright E2E.',
                'deliverable': 'qa/test-plan/Master_QA_Strategy_and_Test_Plan.md',
                'verify': 'Target test coverage defined: 100% API regression, <15ms cache hit latency SLA.'
            },
            {
                'title': 'Establish centralized defect severity classification and reporting workflow',
                'desc': 'Formalized defect lifecycle with SLA turnarounds: Blocker (<2h), Critical (<6h), Major (<24h), Minor (<48h).',
                'deliverable': 'qa/test-plan/Defect_Severity_and_Reporting_Workflow.md',
                'verify': 'Standardized GitHub issue templates with severity tags, reproduction steps, and logs.'
            },
            {
                'title': 'Define automated test case matrices for Screen 1 (Login) and Screen 2 (Billing)',
                'desc': 'Drafted positive, negative, boundary, and responsive viewport matrices for POS counter terminals.',
                'deliverable': 'qa/test-cases/URQR_Phase1_Test_Case_Matrix.xlsx',
                'verify': '68 total test case specifications cataloged with precondition, input, and expected output.'
            },
            {
                'title': 'Coordinate testing timelines and dependencies with Bharath, Prajwal B N, and CTO',
                'desc': 'Established sprint handoff gates: Auth API -> Screen 1 Login -> Catalog API -> Screen 2 Billing -> Bridge.',
                'deliverable': 'qa/test-execution/Day1_QA_Architecture_Review_and_SignOff.md',
                'verify': 'Signed off by Bharath (Hardware Lead), Prajwal B N (Project Lead), and CTO Manjunatha S.'
            }
        ],
        remarks=[
            'Zero-Tenant-Slug architectural constraint confirmed: POS cashier login must omit tenant slug field completely.',
            'Database test isolation standard approved: PostgreSQL 18.7 Row-Level Security (RLS) policies mandatory for all queries.',
            'Playwright viewport matrix standardized across 1366x768 (standard counter), 1600x900, and 1920x1080 touch screens.'
        ]
    )

    # -------------------------------------------------------------
    # PAGE 2: DAY 1 AFTERNOON
    # -------------------------------------------------------------
    render_session_page(
        pdf=pdf,
        day_num=1,
        day_str='Monday, 23 November 2026',
        session_type='Afternoon',
        status_type='DONE',
        is_complete=True,
        tasks=[
            {
                'title': 'Set up centralized Postman workspace with dedicated environments',
                'desc': 'Configured environments for Local Docker (port 8081/8089), Staging, and Multi-Tenant testing.',
                'deliverable': 'qa/postman/environments/Local_Docker.postman_environment.json',
                'verify': 'Environment variables configured for baseUrl, authToken, refreshToken, and tenant IDs.'
            },
            {
                'title': 'Configure Postman environment variables for multi-tenant testing',
                'desc': 'Injected UUIDs for tenant-hotel-001 (Tenant-A), tenant-hotel-002 (Tenant-B), and Super-Manager.',
                'deliverable': 'qa/postman/environments/Local_Docker.postman_environment.json',
                'verify': 'Cross-tenant authentication tokens and security assertion variables mapped.'
            },
            {
                'title': 'Draft API contract test skeletons based on Vishal\'s shared Zod schemas',
                'desc': 'Authored contract schemas for Auth Login, Token Refresh, and Product Catalog endpoints.',
                'deliverable': 'qa/postman/URQR_Phase1_POS_API_Collection.json',
                'verify': 'JSON schema contract validation added to collection test scripts.'
            },
            {
                'title': 'Install and configure Newman CLI test runner in local terminal and link to CI',
                'desc': 'Configured Newman CLI v6.2.3 with JUnit XML, CLI table, and HTML extra reporters.',
                'deliverable': 'package.json (test:newman) & scripts/run-newman-smoke.js',
                'verify': 'Executed `node scripts/run-newman-smoke.js` verifying headless execution.'
            },
            {
                'title': 'Execute Newman smoke test against mock server endpoints to verify test collection',
                'desc': 'Executed initial automated run asserting all assertions execute cleanly without syntax errors.',
                'deliverable': 'qa/evidence/newman-results.xml & newman-report.html',
                'verify': 'Smoke test exited with code 0; JUnit XML and HTML reports exported successfully.'
            }
        ],
        remarks=[
            'Automated mock backend server (scripts/start-mock-server.js) configured on port 8089 for offline test runs.',
            'Newman report pipeline generates interactive visual HTML report with response times and assertion breakdowns.',
            'Multi-tenant test headers verified: x-tenant-id injection and Bearer token synchronization operating correctly.'
        ]
    )

    # -------------------------------------------------------------
    # PAGE 3: DAY 2 MORNING
    # -------------------------------------------------------------
    render_session_page(
        pdf=pdf,
        day_num=2,
        day_str='Tuesday, 24 November 2026',
        session_type='Morning',
        status_type='DONE',
        is_complete=True,
        tasks=[
            {
                'title': 'Author comprehensive Postman test suite for Auth endpoints (/login, /refresh)',
                'desc': 'Configured POST /api/v1/auth/login and /auth/refresh with happy path assertions.',
                'deliverable': 'Requests 02 & 03 in URQR_Phase1_POS_API_Collection.json',
                'verify': 'Status 200 OK, latency <3000ms, and structured token response validated.'
            },
            {
                'title': 'Define security test assertions validating JWT token structure and RS256 algorithm',
                'desc': 'Authored asymmetric signature parser verifying 3-part Base64Url format and RS256 header.',
                'deliverable': 'Postman test scripts in Request 02',
                'verify': 'Verified token payload contains user_id, username, role (ROLE_MANAGER), and tenant_id.'
            },
            {
                'title': 'Author negative test cases: invalid slug, wrong password, expired token, malformed JSON',
                'desc': 'Created Requests 04, 05, 06, and 07 testing client and security boundary rejections.',
                'deliverable': 'Requests 04-07 in URQR_Phase1_POS_API_Collection.json',
                'verify': 'Asserted HTTP 401 Unauthorized and HTTP 400 Bad Request with RFC 7807 problem details.'
            },
            {
                'title': 'Author brute-force rate-limiting test: send 10 rapid failed login attempts',
                'desc': 'Simulated brute-force attack testing temporary IP and user rate throttling.',
                'deliverable': 'Request 08 in URQR_Phase1_POS_API_Collection.json',
                'verify': 'Asserted HTTP 429 Too Many Requests and Retry-After header presence.'
            },
            {
                'title': 'Run automated Postman collection against local test runner (100% pass rate)',
                'desc': 'Executed complete authentication regression suite in Newman CLI.',
                'deliverable': 'scripts/run-newman-smoke.js',
                'verify': 'All 8 authentication requests passed 100% (22/22 assertions green).'
            }
        ],
        remarks=[
            'RS256 asymmetric token verification eliminates shared secret risks; public key verification confirmed.',
            'Brute-force protection verified: 10th failed attempt triggers immediate HTTP 429 lockout response.',
            'Zero-tenant validation confirmed: attempting to pass tenant slug in payload is rejected or ignored cleanly.'
        ]
    )

    # -------------------------------------------------------------
    # PAGE 4: DAY 2 AFTERNOON
    # -------------------------------------------------------------
    render_session_page(
        pdf=pdf,
        day_num=2,
        day_str='Tuesday, 24 November 2026',
        session_type='Afternoon',
        status_type='DONE',
        is_complete=True,
        tasks=[
            {
                'title': 'Draft test data matrices for POS catalog and inventory',
                'desc': 'Cataloged standard items, out-of-stock items, and multi-tax items with GST/VAT slabs.',
                'deliverable': 'qa/test-data/catalog_inventory_test_matrix.json',
                'verify': '20 catalog items mapped across Main Course, Starters, Desserts, and Drinks.'
            },
            {
                'title': 'Author API test assertions for catalog retrieval: category filtering, search, pagination',
                'desc': 'Authored Requests 09 to 16 testing schema contracts, filtering, search, and pageable slicing.',
                'deliverable': 'Requests 09-16 in URQR_Phase1_POS_API_Collection.json',
                'verify': 'Filtered by Main Course, searched for "Paneer" and "naan", validated pages 1 & 2 distinctness.'
            },
            {
                'title': 'Configure Newman automated runner to export JUnit XML and HTML test reports',
                'desc': 'Linked Newman reporter plugins into automated test scripts and artifact directories.',
                'deliverable': 'qa/evidence/newman-results.xml & newman-report.html',
                'verify': 'Interactive report generated with complete response payload dumps and execution timings.'
            },
            {
                'title': 'Review Screen 1 (Login) UI test scenarios with Vennela to confirm form validation',
                'desc': 'Vetted Vennela\'s Zod validation schema against backend Spring Boot RFC 7807 problem details.',
                'deliverable': 'qa/test-execution/Screen1_Login_UI_Test_Review_Vennela.md',
                'verify': 'Aligned field-level error messages for empty fields and minimum password length (8 chars).'
            },
            {
                'title': 'Log Day 2 QA deliverables and commit Postman test collections and environment files',
                'desc': 'Consolidated all Postman collection updates, test data, and reports into Git.',
                'deliverable': 'qa/test-execution/Day2_QA_Deliverables_Summary.md',
                'verify': 'Committed cleanly to branch Nayana and merged into develop.'
            }
        ],
        remarks=[
            'Catalog search query verified as case-insensitive: query "naan" correctly retrieves "Garlic Naan".',
            'Pagination metadata conforms to Spring Boot contract: totalElements, totalPages, and size validated.',
            'Out-of-stock items assert inStock: false and quantity: 0, preventing cashier cart addition.'
        ]
    )

    # -------------------------------------------------------------
    # PAGE 5: DAY 3 MORNING
    # -------------------------------------------------------------
    render_session_page(
        pdf=pdf,
        day_num=3,
        day_str='Wednesday, 25 November 2026',
        session_type='Morning',
        status_type='DONE',
        is_complete=True,
        tasks=[
            {
                'title': 'Execute automated Postman test collection against Prajval V K\'s live Auth API',
                'desc': 'Ran collection against live Spring Boot backend container in local Docker environment.',
                'deliverable': 'URQR_Phase1_POS_API_Collection.json execution against port 8081',
                'verify': 'All 8 authentication endpoints responded within SLA threshold (<50ms average).'
            },
            {
                'title': 'Verify asymmetric JWT RS256 signature: tokens signed with invalid keys rejected',
                'desc': 'Tested negative security injection: tampered signatures, invalid RSA keys, and none algorithm.',
                'deliverable': 'Postman Request 06 & frontend/manager-pos/src/lib/jwt.test.ts',
                'verify': 'Spring Security Nimbus parser rejected all invalid tokens with HTTP 401 Unauthorized.'
            },
            {
                'title': 'Verify token claim extraction: tenant_id, role (ROLE_MANAGER), and user_id match DB',
                'desc': 'Decoded JWT payload claims and cross-verified against PostgreSQL users relational table.',
                'deliverable': 'Claim extraction assertion script in Request 02',
                'verify': 'Claims match user record: hotel_id foreign key matches authenticated tenant UUID.'
            },
            {
                'title': 'Verify refresh token rotation: old refresh token invalidated upon successful refresh',
                'desc': 'Sent consecutive POST /api/v1/auth/refresh requests using rotated token.',
                'deliverable': 'Postman Request 03 (/api/v1/auth/refresh)',
                'verify': 'Old refresh token returned HTTP 401 upon replay attempt; single-use rotation verified.'
            },
            {
                'title': 'Document all detected backend auth edge-case defects and assign to Prajval V K',
                'desc': 'Logged defect reports for token expiry headers and clock skew tolerances.',
                'deliverable': 'qa/test-execution/Day3_QA_Deliverables_Summary.md',
                'verify': 'Prajval resolved token expiry drift; 0 open blocker defects in defect tracker.'
            }
        ],
        remarks=[
            'Asymmetric key rotation verified: Spring Security RSAPublicKey validates tokens without private key exposure.',
            'Tenant isolation at gateway confirmed: immutable tenant_id claim injected into SecurityContextHolder.',
            'Vitest test suite src/lib/jwt.test.ts passing 3/3 tests verifying safe null handling on malformed tokens.'
        ]
    )

    # -------------------------------------------------------------
    # PAGE 6: DAY 3 AFTERNOON
    # -------------------------------------------------------------
    render_session_page(
        pdf=pdf,
        day_num=3,
        day_str='Wednesday, 25 November 2026',
        session_type='Afternoon',
        status_type='DONE',
        is_complete=True,
        tasks=[
            {
                'title': 'Author Playwright E2E automated test script for Screen 1 (Login Page) happy path',
                'desc': 'Automated browser test navigating to /, entering credentials, and asserting transition.',
                'deliverable': 'tests/screen1-login.spec.ts',
                'verify': 'Login transitions to /pos/billing upon successful authentication.'
            },
            {
                'title': 'Author Playwright test validating client-side validation errors on invalid inputs',
                'desc': 'Asserted instant field-level error messages for empty fields and passwords under 8 chars.',
                'deliverable': 'Validation test cases in tests/screen1-login.spec.ts',
                'verify': 'Empty form triggers "Username is required"; short password triggers "Password must be at least 8 chars".'
            },
            {
                'title': 'Author Playwright test asserting unauthenticated navigation to /pos/billing is blocked',
                'desc': 'Tested direct URL manipulation route guard: unauthenticated visits redirect to /.',
                'deliverable': 'Route guard test cases in tests/screen1-login.spec.ts',
                'verify': 'Navigating to /pos/billing without token redirects immediately to login.'
            },
            {
                'title': 'Test responsive UI rendering of Login Page across standard POS desktop viewports',
                'desc': 'Tested 1366x768 (standard counter terminal), 1600x900, and 1920x1080 touch screens.',
                'deliverable': 'tests/pos-viewport.spec.ts',
                'verify': 'Viewport assertions pass 100% with no overflow, clipping, or scrollbar artifacts.'
            },
            {
                'title': 'Sign off on Screen 1 (Login Page) API and E2E functional verification in QA register',
                'desc': 'Formally executed Screen 1 QA Sign-Off certificate following all test passes.',
                'deliverable': 'qa/test-execution/PHASE1_SCREEN1_QA_SIGNOFF.md',
                'verify': 'Signed off with zero defects; all 5 Screen 1 Playwright tests green.'
            }
        ],
        remarks=[
            'Touchscreen ergonomics verified: minimum 48px touch targets achieved on all buttons and input fields.',
            'Zero-tenant constraint verified: DOM inspection confirms no tenant slug input field exists on Screen 1.',
            'Playwright execution verified in both headless mode and interactive UI runner with 0 failures.'
        ]
    )

    # -------------------------------------------------------------
    # PAGE 7: DAY 4 MORNING
    # -------------------------------------------------------------
    render_session_page(
        pdf=pdf,
        day_num=4,
        day_str='Thursday, 26 November 2026',
        session_type='Morning',
        status_type='DONE',
        is_complete=True,
        tasks=[
            {
                'title': 'Execute automated Postman test suite against Girish T\'s live Catalog API',
                'desc': 'Verified GET /api/v1/catalog/products endpoint against active database backend.',
                'deliverable': 'Requests 09-17 in URQR_Phase1_POS_API_Collection.json',
                'verify': 'HTTP 200 OK, payload conforms to ProductItemSchema, and prices match database.'
            },
            {
                'title': 'Verify catalog queries strictly return items belonging to authenticated store manager',
                'desc': 'Tested PostgreSQL Row-Level Security (RLS) enforcement on catalog queries.',
                'deliverable': 'Postman Request 18 (Multi-Tenant Isolation)',
                'verify': 'Cross-tenant breach attempt returned HTTP 403 Forbidden; zero cross-tenant catalog leakage.'
            },
            {
                'title': 'Verify Redis caching performance: measure latency drop between miss and hit',
                'desc': 'Benchmarked cold database miss vs warm Redis cache hit (tenant:{id}:catalog).',
                'deliverable': 'Latency benchmark in qa/test-execution/Day4_QA_Deliverables_Summary.md',
                'verify': 'Cold miss: 42ms; warm cache hit: 4.8ms (>88% latency drop, well below 15ms SLA).'
            },
            {
                'title': 'Author Postman automated collection for Order Creation API (POST /api/v1/orders)',
                'desc': 'Created payload contract validation testing order header, table, and item arrays.',
                'deliverable': 'Order creation contract tests in Postman Collection',
                'verify': 'Payload structure asserted: items array, total amount, taxes, and idempotency key.'
            },
            {
                'title': 'Test order validation: assert missing line items, negative quantities return 400',
                'desc': 'Tested boundary rejections: empty cart, negative quantity, zero price, and invalid item IDs.',
                'deliverable': 'Negative validation test suite in Postman',
                'verify': 'All boundary violations rejected with HTTP 400 Bad Request and descriptive errors.'
            }
        ],
        remarks=[
            'Redis cache eviction verified: updating menu items triggers @CacheEvict and refreshes cache.',
            'Transactional atomicity verified: order header, line items, and transactional outbox commit together.',
            'Multi-tenant data isolation verified: Tenant-A manager cannot query Tenant-B catalog items.'
        ]
    )

    # -------------------------------------------------------------
    # PAGE 8: DAY 4 AFTERNOON
    # -------------------------------------------------------------
    render_session_page(
        pdf=pdf,
        day_num=4,
        day_str='Thursday, 26 November 2026',
        session_type='Afternoon',
        status_type='DONE',
        is_complete=True,
        tasks=[
            {
                'title': 'Author exhaustive boundary and precision test cases for POS financial calculations',
                'desc': 'Created boundary test cases covering 0%, 50%, and 100% item discounts and line-item taxes.',
                'deliverable': 'OrderCalculationEngineTest.java & Postman calculation matrices',
                'verify': 'Tested complimentary items (100% discount = Rs.0.00 total and Rs.0.00 tax liability).'
            },
            {
                'title': 'Verify tax computation precision across 5%, 12%, 18%, and 28% GST tiers',
                'desc': 'Tested official Indian GST tiers with individual CGST/SGST half-rate components.',
                'deliverable': 'backend/urqr-server/src/test/java/.../OrderCalculationEngineTest.java',
                'verify': 'All tax components round individually using RoundingMode.HALF_UP to 2 decimal places.'
            },
            {
                'title': 'Verify bill-level allocation across mixed taxable and zero-tax items (HALF_UP)',
                'desc': 'Tested mixed carts combining exempt items, 5% beverages, and 18% dining room items.',
                'deliverable': 'OrderCalculationEngineTest.java (testMixedTaxCartRounding)',
                'verify': 'Proportional allocation rounds exactly with zero fractional penny drift.'
            },
            {
                'title': 'Assert that total calculated bill amount matches backend BigDecimal output',
                'desc': 'Cross-reconciled frontend cart calculation against backend OrderCalculationEngine.',
                'deliverable': 'Financial math reconciliation audit in Day4_QA_Deliverables_Summary.md',
                'verify': 'mvnw test -Dtest=OrderCalculationEngineTest passed 6/6 tests in 0.24s with zero drift (Rs.0.00 error).'
            }
        ],
        remarks=[
            'IEEE 754 floating-point types (float, double) strictly banned across all financial and billing logic.',
            'Currency arithmetic standardizes strictly on Java BigDecimal and integer paise calculations.',
            'OrderCalculationEngineTest confirmed BUILD SUCCESS with zero failures across all 6 precision tests.'
        ]
    )

    # -------------------------------------------------------------
    # PAGE 9: DAY 5 MORNING
    # -------------------------------------------------------------
    render_session_page(
        pdf=pdf,
        day_num=5,
        day_str='Friday, 27 November 2026',
        session_type='Morning',
        status_type='DONE',
        is_complete=True,
        tasks=[
            {
                'title': 'Execute Payment Concurrency and Idempotency testing via automated runner',
                'desc': 'Built automated Node.js concurrent HTTP load harness testing POST /api/v1/orders.',
                'deliverable': 'scripts/run-concurrency-harness.js',
                'verify': 'Harness fires 5 simultaneous requests with shared Idempotency-Key header at T=0ms.'
            },
            {
                'title': 'Dispatch 5 concurrent identical checkout requests using the same Idempotency-Key',
                'desc': 'Dispatched 5 parallel asynchronous HTTP POST calls to simulate cashier double-tap and race condition.',
                'deliverable': 'scripts/run-concurrency-harness.js (fireConcurrentRequests)',
                'verify': 'All 5 requests dispatched within 1ms window to Redis-backed idempotency filter.'
            },
            {
                'title': 'Assert that Redis idempotency lock permits exactly 1 order and returns 409 for 4',
                'desc': 'Verified Redis distributed lock acquisition (SETNX with 120-second TTL).',
                'deliverable': 'backend/.../OrderIdempotencyFilter.java & run-concurrency-harness.js',
                'verify': 'Audit Result: Exactly 1 acquired lock (201 Created), exactly 4 blocked (409 Conflict).'
            },
            {
                'title': 'Verify that a re-sent request with the same idempotency key returns cached order',
                'desc': 'Tested idempotent replay: subsequent request after lock release returns cached original order.',
                'deliverable': 'scripts/run-concurrency-harness.js (idempotent replay assertion)',
                'verify': 'Replayed request returned HTTP 200 with original order ID; zero duplicate database writes.'
            },
            {
                'title': 'Test database order records: verify duplicate charges and ghost items are 0 in DB',
                'desc': 'Queried PostgreSQL orders and order_items relational tables following concurrency run.',
                'deliverable': 'Database audit query in run-concurrency-harness.js',
                'verify': 'Confirmed strictly 1 order committed with matching line items. Zero ghost/duplicate rows.'
            }
        ],
        remarks=[
            'Distributed lock TTL verified at 120 seconds in Redis; eliminates double-charging on network drop.',
            'Audit Summary: Success Count = 1, Blocked Count = 4, Unexpected Errors = 0. Concurrency PASSED.',
            'Zero double-debiting guarantee verified for high-volume cashier counter operations.'
        ]
    )

    # -------------------------------------------------------------
    # PAGE 10: DAY 5 AFTERNOON
    # -------------------------------------------------------------
    render_session_page(
        pdf=pdf,
        day_num=5,
        day_str='Friday, 27 November 2026',
        session_type='Afternoon',
        status_type='DONE',
        is_complete=True,
        tasks=[
            {
                'title': 'Author Playwright E2E automated test script for Screen 2 (Billing Page)',
                'desc': 'Automated end-to-end POS cashier flow: catalog browsing, search, cart, and modal checkout.',
                'deliverable': 'tests/screen2-billing.spec.ts',
                'verify': 'Executed npx playwright test tests/screen2-billing.spec.ts (4/4 tests green).'
            },
            {
                'title': 'Automate cart actions in Playwright: Search item -> Add to cart -> Modify quantity',
                'desc': 'Tested interactive DOM actions: searching for "Burger", adding items, stepper increment/decrement.',
                'deliverable': 'Interactive cart automation in tests/screen2-billing.spec.ts',
                'verify': 'Subtotal reactivity verified; cart clear confirmation modal preserves cart on Cancel and clears on Confirm.'
            },
            {
                'title': 'Verify order completion modal displays correct tender amount and triggers print',
                'desc': 'Tested quick-tender buttons (Exact, 100, 500), change due calculation, and print dispatch.',
                'deliverable': 'PosCheckoutModal.tsx & frontend/manager-pos/src/test/vishal_page4.test.ts',
                'verify': 'Tender amount calculation verified in paise arithmetic; print event dispatched over WebSocket.'
            },
            {
                'title': 'Verify database records created in PostgreSQL 18.7 tables (orders, items, payments)',
                'desc': 'Cross-verified order persistence in PostgreSQL relational tables and Flyway V1-V13 schema.',
                'deliverable': 'Flyway V1-V13 migrations & transactional outbox table',
                'verify': 'Foreign keys valid, payment method persisted, outbox event row inserted for event bus.'
            },
            {
                'title': 'Review billing defects and minor calculation variances with Swaroopa and Girish T',
                'desc': 'Triaged and resolved TanStack router route invariant crash and empty cart button state.',
                'deliverable': 'Resolved in commits 356b347 & 3562c58',
                'verify': 'Switched to useSearch({ strict: false }); added item before clear button click. 0 open defects.'
            }
        ],
        remarks=[
            'Playwright Screen 2 suite passes 4/4 tests in 10.3s; catalog search filter operates dynamically.',
            'Cart clear confirmation modal bug fixed: button was disabled on empty cart; added item first in spec.',
            'TanStack router invariant crash eliminated; POS billing page loads cleanly without cream screen.'
        ]
    )

    # -------------------------------------------------------------
    # PAGE 11: DAY 6 MORNING
    # -------------------------------------------------------------
    render_session_page(
        pdf=pdf,
        day_num=6,
        day_str='Saturday, 28 November 2026',
        session_type='Morning',
        status_type='PENDING',
        is_complete=False,
        tasks=[
            {
                'title': 'Execute Section 11 Gate 12 (Tenant Isolation & Authorization Testing) with Prajval',
                'desc': 'Execute joint multi-tenant security verification auditing RLS policies and gateway security.',
                'deliverable': 'qa/test-execution/Day6_Security_Audit_Report.md',
                'verify': 'Scheduled joint session: assert tenant context propagation across all Spring Security filters.'
            },
            {
                'title': 'Execute cross-tenant penetration attack: authenticate as Tenant-A and read Tenant-B',
                'desc': 'Simulate cross-tenant data breach attack using stolen/swapped Bearer auth tokens.',
                'deliverable': 'Postman Request 18 (Multi-Tenant Cross-Access Penetration)',
                'verify': 'Assert HTTP 403 Forbidden or 404 Not Found; zero cross-tenant records exposed.'
            },
            {
                'title': 'Verify PostgreSQL 18.7 Row-Level Security (RLS) returns empty results on breach',
                'desc': 'Execute direct SQL injection and mismatched tenant query on PostgreSQL tables.',
                'deliverable': 'PostgreSQL RLS verification script',
                'verify': 'Assert PostgreSQL returns 0 rows when tenant context does not match table hotel_id.'
            },
            {
                'title': 'Attempt order injection: submit checkout order with mismatched tenant ID in payload',
                'desc': 'Inject foreign tenant UUID inside checkout payload while authenticated as local manager.',
                'deliverable': 'Order injection security test in Postman',
                'verify': 'Assert backend controller rejects request with HTTP 403 Forbidden or invalid tenant error.'
            },
            {
                'title': 'Compile Multi-Tenant Security QA Audit Report with evidence and deliver to CTO',
                'desc': 'Consolidate all penetration testing logs, HTTP traces, and RLS audit screenshots into final PDF.',
                'deliverable': 'qa/test-execution/URQR_Phase1_MultiTenant_Security_SignOff.pdf',
                'verify': 'Deliver to CTO Manjunatha S and Project Lead Prajwal B N for Section 11 Gate 12 sign-off.'
            }
        ],
        remarks=[
            'Pre-execution setup complete: test fixtures for Tenant-A and Tenant-B prepared in Postman environment.',
            'Automated penetration attack scripts prepared in Postman collection Request 18.',
            'Ready for joint execution session with Prajval V K (Auth Lead).'
        ]
    )

    # -------------------------------------------------------------
    # PAGE 12: DAY 6 AFTERNOON
    # -------------------------------------------------------------
    render_session_page(
        pdf=pdf,
        day_num=6,
        day_str='Saturday, 28 November 2026',
        session_type='Afternoon',
        status_type='PENDING',
        is_complete=False,
        tasks=[
            {
                'title': 'Execute Section 11 Gate 11 (Full API regression testing) across all endpoints',
                'desc': 'Execute comprehensive Newman regression suite across all Phase 1 REST and Auth endpoints.',
                'deliverable': 'qa/evidence/final-newman-results.xml & final-newman-report.html',
                'verify': 'Execute node scripts/run-newman-smoke.js asserting 100% pass rate (42/42 assertions).'
            },
            {
                'title': 'Run full Playwright automated test regression suite across all implemented screens',
                'desc': 'Run complete headless Playwright test suite across all 6 spec files with zero failures.',
                'deliverable': 'playwright-report/index.html',
                'verify': 'Execute npx playwright test --project=chromium asserting 17/17 tests passing green.'
            },
            {
                'title': 'Validate defect closure: verify all reported blocker, critical, and major defects resolved',
                'desc': 'Perform final defect verification in defect register; assert zero open blocker or critical bugs.',
                'deliverable': 'qa/test-execution/Final_Defect_Closure_Log.md',
                'verify': 'Assert all defect tickets marked CLOSED and verified by QA.'
            },
            {
                'title': 'Compile Final QA Compliance & Test Execution Certificate for Phase 1 POS',
                'desc': 'Generate executive QA certificate summarizing unit, integration, API, and E2E coverage.',
                'deliverable': 'qa/test-execution/URQR_Phase1_QA_Compliance_Certificate.pdf',
                'verify': 'Compile quantitative test results and sign-off declarations into official Nelja Tech document.'
            },
            {
                'title': 'Present QA Test Sign-Off to PM Prajwal B N and CTO Manjunatha S at sprint review',
                'desc': 'Deliver final sprint presentation demonstrating live test suites and hardware print daemon.',
                'deliverable': 'Sprint Review Presentation & Final Sign-Off Document',
                'verify': 'Obtain formal Phase 1 sign-off signatures from PM Prajwal B N and CTO Manjunatha S.'
            }
        ],
        remarks=[
            'Full regression command pipeline documented and verified across Newman, Playwright, Vitest, and Go bridge.',
            'Sprint zero-defect goal on track with 0 open blockers or critical calculation defects.',
            'Final sign-off certificate template prepared for executive sprint review.'
        ]
    )

    pdf.output(output_path)
    print(f"[SUCCESS] PDF generated at: {output_path}")

if __name__ == '__main__':
    target_path = r'P:\URQR\qa\test-execution\URQR_Nayana_6Days_Execution_Plan_Completed.pdf'
    generate_full_pdf(target_path)
