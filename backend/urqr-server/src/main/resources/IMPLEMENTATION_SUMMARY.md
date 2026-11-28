# URQR Backend Implementation Summary

This note records the backend work and verification completed for the six-day execution plan, including the requested Modulith, Hibernate, and Flyway gates.

## Dependency and architecture decisions

- Java 21 and Spring Boot 4.1.2 are configured in `pom.xml`.
- Spring Modulith 2.1.2 and Flyway 12.4.0 are pinned. PostgreSQL JDBC and Hibernate are Boot-managed; the resolved versions are PostgreSQL JDBC 42.7.14 and Hibernate ORM 7.4.13.Final.
- JUnit is Boot-managed as requested. Boot 4.1.2 resolves JUnit Jupiter 6.0.3, which differs from the PDF's JUnit 5 line; the user selected the Boot-managed dependency path.
- Application code is organized into `auth`, `billing`, `analytics`, and `common` Modulith packages. The Modulith architecture test passes.
- Virtual threads are enabled. Hikari and Lettuce pool sizes remain explicit resource limits.
- A custom transactional outbox table is used instead of Spring Modulith's event publication registry. It supports the required row claiming, retry/backoff, dead-letter state, and event-ID idempotency in one implementation.

## Implemented behavior

- Tenant identity is resolved from authentication, bound to the transaction, applied by Hibernate `@TenantId`, and enforced again through PostgreSQL RLS. The application database role is non-owner and does not bypass RLS.
- Flyway migrations V1–V8 provide the tenant/auth foundation, billing tables, POS/order tables, outbox, and order-search indexes. Existing applied migrations are not edited; follow-up schema changes use new versions.
- Catalog APIs provide tenant-scoped products and categories, active/status and stock filters, allowlisted sorting, and bounded pagination. Redis keys use `tenant:{id}:catalog`; catalog changes evict the tenant cache.
- Order, items, payments, audit, and outbox event are written in one `READ_COMMITTED` transaction. Integration coverage proves tenant isolation and rollback.
- Money uses `BigDecimal`/`NUMERIC`. Tax is rounded per line with `HALF_UP`. Example: ₹100.00 less a 10% discount gives ₹90.00 taxable; 9% CGST = ₹8.10 and 9% SGST = ₹8.10; total = ₹106.20.
- The outbox poller uses `FOR UPDATE SKIP LOCKED`, retry backoff, dead-letter state, and event IDs. Centrifugo delivery uses its Server API.
- V14 converts staff, audit, category, menu item, order, order item, payment, and receipt IDs to the requested no-underscore string formats. It remaps the related foreign keys and initializes atomic per-prefix counters; hotel role IDs and outbox event IDs remain UUIDs.
- Receipt and order search are tenant-scoped and use stable ordering/indexes. Swagger publishes OpenAPI 3.1.
- `db/dev-seed.sql` is an opt-in local seed script, not a Flyway migration. It requires an existing hotel ID and uses the same formatted business IDs and counter table as the API.

## Verification results

Command run from `backend/urqr-server`:

```powershell
& 'C:\Users\CMIT\Downloads\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd' -B '-Dperformance.enforce=true' test
```

Result: **BUILD SUCCESS; 28 tests, 0 failures, 0 errors, 0 skipped.** The suite started PostgreSQL 18.7, Redis 8.2.11, and Centrifugo 6.10.3 Testcontainers. Flyway validated and applied all eight migrations against a clean PostgreSQL 18.7 database. The Modulith architecture verification passed.

Measured in that run:

| Check | Measurement | Target |
|---|---:|---:|
| Warm Redis catalog read p95 | 4.707 ms | < 15 ms |
| Order page query p95 | 41.667 ms | < 50 ms |
| Order search `EXPLAIN ANALYZE` execution | 0.218 ms | — |
| Centrifugo delivery burst p95 | 121.961 ms | < 150 ms |
| All 20 burst events committed and acknowledged | 368.851 ms | — |
| 80 concurrent order submissions | 2.905 s; no deadlock or pool starvation | — |

The p95 burst delivery met the 150 ms target; the full 20-event batch acknowledgement time was 368.851 ms. These are local Testcontainers measurements, not production-load guarantees.

## Remaining checks and risks

- Docker CLI could not be resolved in the implementation environment, so the persistent Compose database was not queried or migrated. Only the clean Testcontainers PostgreSQL database is verified.
- The local seed script was not run because it requires a real hotel ID.
- GitHub Actions was not run remotely; the local Maven suite is the completed build verification.
- Joint checkout-to-printer acceptance and team sign-off remain manual.
- The PDF references “Section 11 Compatibility Gates” without including its content. The missing gates must come from the lead; they have not been invented here.
- The existing legacy `hotel_id` POS menu tables coexist with normalized `tenant_id` billing catalog tables. Define catalog synchronization/cutover before moving order creation to the normalized catalog.
- The earlier implementation turn did not commit or push. User subsequently requested pushing these updates to `feature/backend-foundation`.

## Quick verification commands

Run the full enforced suite from `backend/urqr-server`:

```powershell
& 'C:\Users\CMIT\Downloads\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd' -B '-Dperformance.enforce=true' test
```

Swagger UI: `http://localhost:8080/swagger-ui/index.html`
OpenAPI JSON: `http://localhost:8080/v3/api-docs`

After the Docker CLI is available, inspect Compose Flyway history from `backend/urqr-server`:

```powershell
docker compose --env-file .env -f docker-compose.yaml exec -T postgres psql -U urqr -d urqr -c "SELECT version, script FROM flyway_schema_history ORDER BY installed_rank;"
```

Expected history: versions 1 through 8, with V8 last.

## MVC map for a new contributor

- Controller receives HTTP and delegates to a service.
- Service contains business rules and transaction boundaries.
- Entity and repository are the model: entity maps a table; repository reads/writes it.
- DTO is the JSON view returned to or accepted from the caller.
- Modulith package markers define module boundaries; configuration, RLS context, cache, and outbox are supporting infrastructure around MVC.

## Project tree

```text
com/nelja/urqr/
├── analytics/                 # Sales reporting endpoints and queries
├── auth/                      # Login, staff, roles, hotels, tenants, and security
│   ├── access/                # Staff and role management
│   ├── audit/                 # Audit records and queries
│   ├── config/                # Hibernate, JSON, and OpenAPI configuration
│   ├── hotel/                 # Hotel and tenant APIs
│   └── security/              # JWT, Redis auth state, and tenant context
├── billing/                   # Catalog, orders, payments, receipts, and outbox
│   ├── catalog/               # Legacy menu and normalized billing catalog
│   ├── order/                 # Order API, calculation, and transaction workflow
│   ├── outbox/                # Event polling and Centrifugo publishing
│   ├── payment/               # Payment data and endpoints
│   └── receipt/               # Receipt data and endpoint
└── common/                    # Shared persistence, exception, and response support
```
