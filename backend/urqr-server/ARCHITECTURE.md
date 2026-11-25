# URQR backend runbook

## What the backend does

This service runs the standalone hotel manager POS. In MVC terms, REST controllers receive JSON, services apply billing rules, JPA entities and repositories store rows, and DTO records form JSON responses. Spring Modulith checks that the top-level `auth`, `billing`, and `analytics` areas do not depend on each other in a cycle.

The installed Java/Maven stack is Java 21, Spring Boot 4.1.2, Spring Modulith 2.1.2, Spring Data JPA 4.1.2, Hibernate ORM 7.4.13.Final, PostgreSQL JDBC 42.7.14, Flyway 12.4.0, JUnit from the Spring Boot dependency management, and Testcontainers 2.0.5. Compose uses PostgreSQL 18.7, Redis 8.2.11, and Centrifugo 6.10.3.

## Folder map

```text
src/main/java/com/nelja/urqr/
  auth/        login, roles, hotel/tenant provisioning, security, audit, OpenAPI
  billing/     catalog, orders, payments, receipts, and outbox delivery
  analytics/   daily sales reports
  common/      API errors, correlation IDs, shared persistence, and response types
  UrqrServerApplication.java
src/main/resources/
  application*.properties
  db/migration/   immutable, ordered Flyway schema changes V1-V8
  db/dev-seed.sql local-only sample catalog script; Flyway never runs this file
src/test/java/
  auth/ billing/ persistence/ integration and unit checks
```

## Main request flow

1. The security filter checks a signed RS256 JWT. `CurrentTenant` reads the hotel ID from that verified token; callers do not submit tenant IDs in request bodies.
2. The transaction aspect sets PostgreSQL `app.tenant_id` with transaction-local `set_config(..., true)`. PostgreSQL Row-Level Security then filters tenant-owned rows. `urqr_app` is a non-owner role without superuser or `BYPASSRLS` privileges.
3. Hibernate's `@TenantId` fills the tenant column on the normalized billing entities. `BaseTenantEntity` supplies UUID tenant ownership and audit timestamps.
4. The service writes order, items, payments, audit, receipt snapshot, and its custom outbox row inside the same PostgreSQL transaction.
5. A bounded poller claims due events with `FOR UPDATE SKIP LOCKED`, commits that claim, publishes a batch to Centrifugo, then acknowledges success or schedules a retry. The event UUID is the downstream idempotency key.

The custom outbox table is the single delivery source. It is used instead of Spring Modulith's event publication registry because the required worker needs a PostgreSQL `SKIP LOCKED` claim, explicit retry counters, leases, and a dead-letter state. The order transaction records an event row; the poller is the delivery worker. This is like writing a kitchen ticket before it goes to the pass: the ticket cannot disappear just because the network was down.

## Tenant and schema rules

- V1 defines tenants, users, credentials, roles, permissions, and immutable `created_at` triggers.
- V2 defines the tenant-based billing catalog, orders, items, payments, NUMERIC money columns, indexes, and forced RLS policies.
- V3 adds child-table audit timestamps. V4 adds the existing hotel POS tables and custom outbox. V5-V7 are additive Hibernate/outbox fixes.
- Never edit an applied migration. Add a new `V<n>__description.sql` file for schema changes.
- Hibernate uses `ddl-auto=validate`; Flyway is the schema writer. `application-local.properties` also validates rather than silently updating tables.
- Testcontainers applies V1-V8 to clean PostgreSQL 18.7. Check the local Docker database separately with the command below before relying on its state.
- The earlier POS API uses `hotel_id` tables (`menu_category`, `menu_item`, `pos_order`); V2 also defines normalized `tenant_id` catalog and order tables. The current manager POS endpoints use the former for compatibility. Keep these schemas aligned during future catalog migrations; do not assume they are automatically synchronized.

## Money and taxes

All prices, discounts, tax amounts, and totals use `BigDecimal` in Java and `NUMERIC(12,2)` (or a precision-appropriate NUMERIC rate) in PostgreSQL. The calculation order is gross line amount, line discount, then tax on the discounted amount. Each CGST, SGST, and VAT component rounds to cents per line with `RoundingMode.HALF_UP`.

Example: a ₹100.00 item with a 10% discount has ₹90.00 taxable value. At 9% CGST and 9% SGST, each component is ₹8.10, so the total is ₹106.20. The local seed's 9% + 9% figures are demo data only; verify each real product's tax classification before using it for sales.

## Local setup and verification

Run commands from `backend/urqr-server` in PowerShell. Docker Desktop must be running, Java must report 21, and Maven must be available. The repository uses Maven directly:

```powershell
java -version
mvn -version
docker version
docker compose --env-file .env -f docker-compose.yaml up -d postgres redis
docker compose --env-file .env -f docker-compose.yaml up --build -d api
```

The API listens on container port 8080; Compose maps it to `http://localhost:8081`. Liveness is `GET /actuator/health/liveness`; readiness is `GET /actuator/health/readiness`.

Run the complete checks:

```powershell
mvn -B test
```

The suite starts temporary PostgreSQL 18.7, Redis 8.2.11, and Centrifugo 6.10.3 containers. It verifies Modulith boundaries, Flyway schema creation, JPA CRUD, RLS tenant isolation, rollback, Redis cache behavior, tax arithmetic, catalog filtering/pagination, API documentation, and Centrifugo delivery. Performance is printed from the same test run. `-Dperformance.enforce=true` turns the measured catalog, order-list, and steady outbox targets into assertions; burst load is reported separately because host/Docker scheduling affects it.

Check the Flyway history in the local Docker PostgreSQL database:

```powershell
docker compose --env-file .env -f docker-compose.yaml exec postgres psql -U urqr -d urqr -c "SELECT version, script, checksum, installed_on FROM flyway_schema_history ORDER BY installed_rank;"
```

To seed demo menu data, use an existing hotel/tenant UUID only in a disposable local database. The script is idempotent and outside Flyway's migration folder. This simple command runs as the local database owner, so it bypasses RLS; use the non-owner `urqr_app` role when you specifically want to exercise the policies:

```powershell
$tenantId = "<existing hotel and tenant UUID>"
Get-Content -Raw -Encoding utf8 .\src\main\resources\db\dev-seed.sql |
  docker compose --env-file .env -f docker-compose.yaml exec -T postgres psql -U urqr -d urqr -v "tenant_id=$tenantId"
```

The script requires both `tenants.id` and `hotel.id` to equal the supplied UUID. Keep local database credentials in `.env`; do not put them in source control.

## API contract

The generated OpenAPI 3.1 JSON is `GET /v3/api-docs`; Swagger UI is `GET /swagger-ui.html`. Catalog endpoints are tenant-scoped and paginated:

- `GET /api/v1/catalog/products?page=0&size=20&available=true`
- `GET /api/v1/catalog/categories?page=0&size=20&activeOnly=true`
- `POST /api/v1/orders` creates an order and accepts line items plus optional payments.
- `GET /api/v1/orders/{orderId}/receipt` reprints the stored receipt snapshot.
- `GET /api/v1/orders?status=OPEN&from=2026-11-01T00:00:00Z&to=2026-12-01T00:00:00Z&page=0&size=20` searches tenant orders.

See [API_CONTRACT.md](API_CONTRACT.md) for JSON examples.

## Performance and operations

The warmed catalog path uses the exact Redis key `tenant:{tenantId}:catalog`; committed product changes evict that tenant's key. Order search uses tenant/status/date/id indexes and fetches all page item rows in one batched query. The outbox claim is bounded to 50 rows and performs no HTTP call while holding a database transaction.

Record actual output from `mvn -B test` before declaring a target met. Targets are warm catalog p95 below 15 ms, order list p95 below 50 ms, and commit-to-Centrifugo p95 below 150 ms. A burst result above target remains a reported miss even if steady-state traffic passes.

## Needs from the lead

- The PDF refers to “Section 11 Mandatory Compatibility Verification” but does not include Section 11. Only the named gates 2 (Modulith), 4 (Hibernate 7), and 5 (Flyway 12) can be verified from the available instructions.
- Joint checkout-to-print testing with the named team members and delivery/sign-off by the PM and CTO require their participation.
- GitHub Actions can only be confirmed after a push or a connected CI run. Local Maven success is not a remote CI result.
