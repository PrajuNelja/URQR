# URQR Platform — Phase 1 Standalone Manager POS
## QA Test Data Matrix: POS Catalog, Inventory & Multi-Tax Engine
**Assignee:** Nayana | **Role:** Functional & API QA Lead  
**Document Reference:** `QA-DATAMATRIX-002` | **Version:** 1.0.0  
**Technical Standards:** Postman v2.1.0, Newman 6.2.3, Zod Catalog Schema, Multi-Tenant GST Breakdown

---

### 1. Executive Summary & Objectives
This test data matrix defines standard, out-of-stock, and multi-tax catalog items designed for comprehensive functional, API contract, and E2E validation of the URQR Phase 1 Standalone Manager POS. 

The dataset validates:
1. **Zod Schema Conformance:** Strict alignment with Vishal's `ProductItemSchema` (`id`, `name`, `category`, `description`, `price`) and `CategorySchema` (`key`, `label`).
2. **Multi-Tax Indian GST Calculations:** Exact component verification for 0% (Exempt), 5% (Restaurant Dining), 12% (Packaged Juices), 18% (Beverages/Desserts), and 20% (Multi-Tax with F&B Hospitality Cess).
3. **Inventory State Boundaries:** Out-of-stock item handling (`inStock: false`, `stockQuantity: 0`, POS button disabled state), low-stock warnings, and zero-negative-stock validation.
4. **API Query Filtering & Pagination:** Exact category filtering, substring search, and deterministic multi-page retrieval.

---

### 2. POS Catalog & Inventory Test Data Matrix

| Item ID | Product Name | Category | Base Price (₹) | Tax Slab | Tax Breakdown | In Stock | Stock Qty | Item Classification | Zod Schema Status |
|---|---|---|---|---|---|---|---|---|---|
| **101** | Paneer Butter Masala | Main Course | ₹280.00 | GST 5% | CGST 2.5% (₹7.00) + SGST 2.5% (₹7.00) | `true` | 45 | **Standard** | Conforms |
| **102** | Garlic Naan | Breads | ₹60.00 | GST 5% | CGST 2.5% (₹1.50) + SGST 2.5% (₹1.50) | `true` | 120 | **Standard** | Conforms |
| **103** | Dal Makhani | Main Course | ₹220.00 | GST 5% | CGST 2.5% (₹5.50) + SGST 2.5% (₹5.50) | `true` | 30 | **Standard** | Conforms |
| **104** | Butter Roti | Breads | ₹35.00 | GST 5% | CGST 2.5% (₹0.88) + SGST 2.5% (₹0.88) | `true` | 150 | **Standard** | Conforms |
| **105** | Veg Dum Biryani | Main Course | ₹250.00 | GST 5% | CGST 2.5% (₹6.25) + SGST 2.5% (₹6.25) | `true` | 25 | **Standard** | Conforms |
| **201** | Tandoori Platter Special | Starters | ₹450.00 | GST 5% | CGST 2.5% (₹11.25) + SGST 2.5% (₹11.25) | `false` | 0 | **Out-of-Stock** | Conforms |
| **202** | Alphonso Mango Kulfi | Desserts | ₹120.00 | GST 18% | CGST 9.0% (₹10.80) + SGST 9.0% (₹10.80) | `false` | 0 | **Out-of-Stock** | Conforms |
| **203** | Seasonal Berry Tart | Desserts | ₹180.00 | GST 18% | CGST 9.0% (₹16.20) + SGST 9.0% (₹16.20) | `false` | 0 | **Out-of-Stock** | Conforms |
| **301** | Mineral Water Bottle 1L | Beverages | ₹30.00 | GST 18% | CGST 9.0% (₹2.70) + SGST 9.0% (₹2.70) | `true` | 200 | **Multi-Tax** | Conforms |
| **302** | Fresh Cold-Pressed Juice | Beverages | ₹110.00 | GST 12% | CGST 6.0% (₹6.60) + SGST 6.0% (₹6.60) | `true` | 25 | **Multi-Tax** | Conforms |
| **303** | Farm Fresh Green Salad | Salads | ₹90.00 | GST 0% | Tax Exempt (Nil-rated) (₹0.00) | `true` | 50 | **Multi-Tax (Exempt)** | Conforms |
| **304** | Craft Mocktail Tower | Beverages | ₹650.00 | GST 20% | CGST 9% (₹58.50) + SGST 9% (₹58.50) + Cess 2% (₹13.00) | `true` | 15 | **Multi-Tax & Cess** | Conforms |

---

### 3. Taxation Engine & Arithmetic Verification Rules

1. **Composite Tax Additive Rule:**
   $$\text{Total Tax} = \sum_{i=1}^{n} (\text{Base Price} \times \text{Rate}_i)$$
   - Standard Food Item (5%):
     $$\text{CGST} = ₹280.00 \times 0.025 = ₹7.00, \quad \text{SGST} = ₹280.00 \times 0.025 = ₹7.00 \implies \text{Total Tax} = ₹14.00, \quad \text{Final} = ₹294.00$$
   - Beverage Item with Cess (20%):
     $$\text{CGST} = ₹650.00 \times 0.09 = ₹58.50, \quad \text{SGST} = ₹650.00 \times 0.09 = ₹58.50, \quad \text{Cess} = ₹650.00 \times 0.02 = ₹13.00 \implies \text{Total Tax} = ₹130.00, \quad \text{Final} = ₹780.00$$
2. **Rounding Invariants:**
   All monetary amounts must be rounded to exactly two decimal places using Banker's Rounding (Half Even) or standard half-up as defined in Spring Boot `BigDecimal.setScale(2, RoundingMode.HALF_UP)`.

---

### 4. POS Terminal UI Behavioral Assertions

1. **Standard In-Stock Items (`inStock: true`, `stockQuantity > 0`):**
   - Click/tap on item card adds exactly 1 unit to POS cart.
   - Increment button increases quantity up to `stockQuantity`.
   - Cart subtotal and tax line items update dynamically.
2. **Out-of-Stock Items (`inStock: false`, `stockQuantity: 0`):**
   - Item card renders visual "OUT OF STOCK" badge.
   - Touch tap event is disabled; clicking triggers no state mutation.
   - Item cannot be added to cart via barcode scanner or search selection.
3. **Low-Stock Alerting (`stockQuantity <= lowStockThreshold`):**
   - Amber badge renders indicating "Only X left".

---

### 5. API Contract Retrieval Specs
- **Category Filter:** `GET /api/v1/catalog/products?category=Main+Course` $\to$ Returns items 101, 103, 105.
- **Search Query:** `GET /api/v1/catalog/products?search=Paneer` $\to$ Returns item 101.
- **Pagination:** `GET /api/v1/catalog/products?page=1&size=2` $\to$ Returns first 2 items with pagination headers and metadata.
