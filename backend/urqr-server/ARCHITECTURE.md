# Backend architecture and implementation review

## Project state

The repository uses Java 21, Maven, PostgreSQL, and the `com.nelja.urqr` package. The current backend targets Spring Boot 3.5.16. PostgreSQL is the only configured database. No executable schema artifact exists elsewhere in the workspace, so local Hibernate update is used to bootstrap development and the entity mappings are the schema source for this phase.

Implemented modules are authentication, tenant setup, hotel configuration, hotel roles/users, menu categories/items, orders/order items, payments, saved receipts, daily sales, audit, API error handling, correlation IDs, OpenAPI, and Actuator health.

## Structure and workflow

Feature packages keep persistence and HTTP code together: `hotel`, `access/user`, `access/role`, `menu/category`, `menu/item`, `order`, `payment`, `receipt`, `report`, and `audit`. Shared packages contain JWT/security configuration, API errors, request correlation, and OpenAPI configuration. Controllers return DTO records rather than entities.

Authentication uses a hotel ID only to select the username namespace at login. The server checks `(hotel_id, username)` and BCrypt password hash, then signs `uid` and `hotel_id` claims. Every request verifies the signature and reloads current active hotel, user, and role from the database. `CurrentTenant` extracts IDs from that verified token. Tenant IDs are not accepted in domain request payloads.

Order creation loads requested menu item IDs, verifies each belongs to the authenticated hotel and is available, snapshots item name and price, and computes line/order totals using `BigDecimal`. Order mutation and payment operations are transactional. Full payment completes the order and saves the receipt JSON snapshot in the same transaction. Receipt reads return the saved snapshot. Daily sales computes `[hotel-local cutoff, next hotel-local cutoff)` instants and aggregates payments for that interval.

## Data ownership and query patterns

Hotel-owned rows carry `hotel_id`; tenant-specific unique constraints cover usernames, role names, order numbers, and receipt numbers. Services reject cross-hotel links, and composite JPA foreign keys cover user-role, category-item, order-item, payment-order, receipt-order, and audit-user associations. Verify these constraints against existing data and apply them in the controlled production schema rollout.

Order history is filtered by hotel, optional status/time range, and pageable ordering. The current page's items are loaded in one batched query to avoid per-order N+1 queries. Menu lookup batches IDs for order construction. The daily report uses aggregate queries and does not load orders or payment entities into memory. Indexes currently cover `(hotel_id, created_at)` for orders/audit, hotel/category/availability for menu, and hotel/order/payment lookups.

No production data, query plans, query counts, or latency measurements were available. The additional three identity-state reads per authenticated request are deliberate so deactivation and role changes apply immediately. Benchmark their impact before considering a short-lived cache.

## Domain rules

- Money is stored as `numeric(12,2)` using `BigDecimal`, with a two-decimal scale policy. Menu price is non-negative; recorded payments must be positive.
- Order state transitions: `OPEN` can remain open, become `COMPLETED` once fully paid, or become `CANCELLED` before any payment. Only unpaid open orders are editable.
- Payment status transitions: `UNPAID -> PARTIAL -> PAID`. Split Cash/UPI payments are supported; overpayment is rejected. UPI receipt is manually verified by a Manager or Cashier before recording; there is no gateway verification.
- Zero-total orders are completed and receipted directly. Receipt snapshots keep hotel receipt details and sale-time item values.
- Menu item deletion is a soft deactivation. Roles have no permission mapping: Manager manages the hotel, staff, and menu; Manager/Cashier use billing and payment routes; Cook/Waiter can only read menu categories and items.

## API and operations

Business routes are under `/api/v1`; generated OpenAPI JSON and Swagger UI are `/v3/api-docs` and `/swagger-ui.html`. `/actuator/health` reports health without detailed diagnostics. Error responses share `timestamp`, `status`, `code`, `message`, `path`, `correlationId`, and validation `fieldErrors`. `X-Correlation-ID` is returned and inserted into log MDC.

`POST /api/v1/setup/first-hotel` uses `SETUP_SECRET` once for the first tenant. `POST /api/v1/platform/hotels` provisions later tenants with `PLATFORM_ADMIN_SECRET`. Those keys must be held in a secret manager and restricted to trusted operators. Hotel manager staff can be provisioned through `/api/v1/users`.

## Production gaps and assumptions

- Hibernate `update` is used during the current development phase. It provides no ordered migrations, review, rollback, or safe multi-instance coordination; switch to `validate` with a deliberate schema deployment process before production. Flyway was not added.
- Tenant isolation is applied in repositories/services, JWT resolution, and composite foreign keys. PostgreSQL row-level security remains an optional defense in depth to evaluate with production operations.
- OpenAPI is generated from the running controllers; endpoint behavior and common errors are summarized in `README.md`.
- Platform hotel provisioning uses a static environment secret; protect it with TLS, restricted network access, secret rotation, and rate limiting.
- `JWT_SECRET` must be at least 32 bytes. Rotate/roll tokens when changing it. JWT expiry defaults to 60 minutes.
- Currency minor-unit rules differ internationally; this product currently applies a fixed two-decimal policy. Confirm supported currencies before accepting zero- or three-decimal currencies.
- No test suite was run or added. Build/runtime verification requires Maven artifacts and a PostgreSQL instance.
