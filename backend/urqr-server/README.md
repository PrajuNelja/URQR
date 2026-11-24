# URQR Hotel POS backend

Java 21 / Spring Boot 4.1.2 REST backend for a multi-hotel point-of-sale system. Source uses the existing `com.nelja.urqr` application package.

## Implemented modules

- PostgreSQL and Spring Data JPA persistence; Hibernate schema update is enabled for the current development configuration.
- Java 21 virtual threads are enabled for servlet request handling and Spring-managed task execution.
- First-hotel setup and platform hotel provisioning, hotel receipt configuration, activation status, and hotel-scoped Manager, Cashier, Cook, and Waiter roles and staff.
- BCrypt staff password hashing, username-and-password login, RS256 JWTs signed with a 2048-bit RSA private key, and authorization built from current database user/role state on each request. The matching public key verifies JWT signatures. Login identifies the hotel from the matching staff account; tokens remain hotel-scoped.
- Menu category/item management, availability, and soft deactivation.
- Orders with server-calculated totals and item name/price snapshots, order editing/cancellation/history, split Cash/UPI payment records, immutable receipt snapshots, hotel-local daily sales, and audit history.
- Validation errors, stable JSON errors, correlation IDs in response headers/log MDC, Springdoc OpenAPI, and Actuator health.

UPI payments are recorded after hotel staff manually confirm the transfer in the hotel's UPI app; this backend does not verify or move money through an external provider. Refunds, taxes, discounts, inventory, online payment gateways, and customer data are out of Phase 1.

## Requirements

- Java 21
- Maven 3.6.3+
- PostgreSQL 14 or later (a managed PostgreSQL service is also suitable)

Spring Security 7.1.2 is provided by Spring Boot 4.1.2 dependency management. OpenAPI uses springdoc 3.2.0.

## Local database and configuration

### Docker Compose

The local environment file and Compose file are both in `backend/urqr-server`. From the repository root, copy the example file if needed, configure private database and platform administrator credentials, generate the RSA key pair, then start the stack:

```powershell
if (-not (Test-Path backend/urqr-server/.env)) {
    Copy-Item backend/urqr-server/.env.example backend/urqr-server/.env
}
Push-Location backend/urqr-server
if (-not (Select-String -Path .env -Pattern '^JWT_PRIVATE_KEY=.{100}' -Quiet)) {
    java generate-jwt-keys.java
}
Pop-Location
docker compose --env-file backend/urqr-server/.env -f backend/urqr-server/docker-compose.yaml up --build -d
```

The API is available at `http://localhost:8081`; PostgreSQL and Redis are published on localhost only. Compose persists their data in named volumes. Start just Redis with `docker compose --env-file backend/urqr-server/.env -f backend/urqr-server/docker-compose.yaml up -d redis`. Stop the stack with `docker compose --env-file backend/urqr-server/.env -f backend/urqr-server/docker-compose.yaml down`; add `-v` only when you also want to delete the database and Redis data.

Redis stores access and refresh token sessions and short-lived authorization state for hotel staff. Refresh tokens are single use. Disabling a hotel or staff account revokes its registered tokens, and account or role changes clear cached authorization state. Authentication fails closed if Redis is unavailable. Set `REDIS_URL` when Redis is not available at `redis://localhost:6379/0`.

Spring Boot uses virtual threads for Tomcat request handling and its managed task executors through `spring.threads.virtual.enabled=true`. The application also sets `spring.main.keep-alive=true` because virtual threads are daemon threads. Java 21 is required; thread-pool sizing properties such as `server.tomcat.threads.max` do not limit virtual-thread concurrency. Database connection pools remain a separate capacity limit.

Create a local database (the default URL uses the case-sensitive name `Urqr`):

```sql
CREATE DATABASE "Urqr";
```

The key utility writes Base64-encoded PKCS#8 private-key and X.509 public-key values into the ignored local `.env`. It creates a 2048-bit RSA key pair. Use `java generate-jwt-keys.java --force` only when deliberately rotating keys; tokens signed by the previous key will no longer verify. In production, provide the same values through your secret manager or deployment environment rather than a checked-in file.

Set environment variables in the run configuration or shell. Do not commit these values:

| Variable | Required | Purpose |
|---|---:|---|
| `DB_URL` | Yes | JDBC URL, e.g. `jdbc:postgresql://localhost:5432/Urqr` |
| `DB_USER` | Yes | PostgreSQL username |
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `JWT_PRIVATE_KEY` | Yes | Base64-encoded PKCS#8 RSA private key used to sign RS256 tokens |
| `JWT_PUBLIC_KEY` | Yes | Base64-encoded X.509 RSA public key used to verify RS256 tokens |
| `JWT_TTL_MINUTES` | No | Access-token lifetime; defaults to 60 minutes |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated exact origins, e.g. `http://localhost:5173`; wildcards and paths are rejected |
| `REDIS_URL` | No | Redis connection URL; defaults to `redis://localhost:6379/0` |
| `AUTHORIZATION_CACHE_TTL_SECONDS` | No | Authorization cache lifetime; defaults to 15 seconds (maximum 300) |
| `PLATFORM_ADMIN_USERNAME` | Hotel provisioning | Username for the URQR platform administrator |
| `PLATFORM_ADMIN_PASSWORD` | Hotel provisioning | Platform administrator password; at least 12 characters |

`DB_URL` and `DB_USER` have local development defaults. Environment variables override the values in `application.properties`. `DB_PASSWORD`, both JWT RSA keys, and the platform admin credentials must be configured privately; do not commit them.

Run locally with Hibernate update:

```powershell
Push-Location backend/urqr-server
$env:DB_URL='jdbc:postgresql://localhost:5432/Urqr'
$env:DB_USER='postgres'
$env:DB_PASSWORD='your-local-password'
$env:PLATFORM_ADMIN_USERNAME='platform-admin'
$env:PLATFORM_ADMIN_PASSWORD='choose-a-private-password-of-at-least-12-characters'
.\mvnw.cmd '-Dspring-boot.run.profiles=local' spring-boot:run
Pop-Location
```

For a focused RSA signing and verification check, run `mvn -Dtest=RsaKeyPropertiesTest test` from `backend/urqr-server`. This unit test generates a temporary 2048-bit RSA pair, loads it through `RsaKeyProperties`, signs an RS256 JWT, verifies its claims, and confirms that a modified signature is rejected. It does not require PostgreSQL or Redis.

The checked-in Maven wrapper properties are present, but wrapper bootstrap may require network access. A local Maven installation can run `mvn spring-boot:run -Dspring-boot.run.profiles=local`.

The current development configuration uses `spring.jpa.hibernate.ddl-auto=update`. Before production, change this to `validate` and deploy a reviewed schema through a controlled process. Hibernate `update` does not provide reviewed migration ordering, rollback, or safe coordination across application instances. Flyway is intentionally not included.

## Platform admin, hotel staff, and tenant isolation

1. Set `PLATFORM_ADMIN_USERNAME` and `PLATFORM_ADMIN_PASSWORD` in the app's private run configuration or deployment environment. These are the URQR operator's credentials; hotel managers and staff do not receive them. Restart the app after changing the environment.
2. Login as the platform admin with `POST /api/v1/platform/auth/login` and body `{"username":"platform-admin","password":"your-private-password"}`. The response contains an access token and a seven-day refresh token. Exchange the refresh token at `POST /api/v1/platform/auth/refresh` with body `{"refreshToken":"<refresh-token>"}`.
3. Create each hotel with `POST /api/v1/platform/hotels`, sending `Authorization: Bearer <platform-admin-token>` and the hotel plus first-Manager JSON. This creates the hotel, its Manager and Cashier roles, and its first Manager account. No setup or admin-key header is used. Use `GET /api/v1/platform/hotels?page=0&size=20` to review the tenant list (up to 100 per page).

Example hotel request body:

```json
{
  "hotelName": "Example Hotel",
  "currency": "INR",
  "timezone": "Asia/Kolkata",
  "dayCutoff": "06:00:00",
  "receiptDetails": {},
  "managerUsername": "owner",
  "managerPassword": "set-a-private-password-12-plus"
}
```

The response returns `hotelId`, `managerUserId`, and `managerUsername`; it never returns a password. Give the Manager their username and password privately; the hotel ID is not needed to log in.
4. The Manager logs in through `POST /api/v1/auth/login` with `{"username":"owner","password":"the-manager-password"}`. The response contains a hotel-scoped access token and a seven-day refresh token. Exchange it at `POST /api/v1/auth/refresh` with body `{"refreshToken":"<refresh-token>"}`. They create staff and assign hotel roles, including Cashier, Cook, and Waiter.
5. Staff send their own `Authorization: Bearer <accessToken>` to protected business routes. Tenant operations derive the hotel from the signed staff identity; client-supplied hotel IDs cannot grant access to other hotels. Current staff, role, and hotel status are checked against the database on each request.

Usernames are unique within a hotel. If the same username is used at multiple hotels, the password must identify exactly one active account; an identical active username/password combination in multiple hotels is rejected as ambiguous.

To deactivate or reactivate a tenant, the platform administrator calls `PATCH /api/v1/platform/hotels/{hotelId}/status` with the platform-admin bearer token and body `{"active":false}` or `{"active":true}`. Keep platform credentials private and use HTTPS outside local development.
## Endpoint groups

All business endpoints are versioned under `/api/v1` and return JSON. Date/time fields use ISO-8601. Manager-only management routes are marked below.

| Group | Routes | Access / behavior |
|---|---|---|
| Platform admin | `POST /platform/auth/login`, `POST /platform/auth/refresh`, `GET /platform/hotels?page=&size=`, `POST /platform/hotels`, `PATCH /platform/hotels/{hotelId}/status` | Admin login uses configured operator credentials and returns a seven-day refresh token; tenant listing and provisioning require its access token |
| Authentication | `POST /auth/login`, `POST /auth/refresh` | Manager login returns a hotel-scoped access token and seven-day refresh token; refresh checks the current active hotel and Manager account |
| Hotel | `GET /hotel`, `PATCH /hotel` | Manager/Cashier can read; Manager-only settings update; status changes are restricted to platform admin |
| Users | `POST /users`, `GET /users`, `GET /users/{id}`, `PATCH /users/{id}`, `PATCH /users/{id}/status` | Manager-only; role reassignment and password reset validate hotel ownership; password hashes are never returned |
| Roles | `POST /roles`, `GET /roles`, `PATCH /roles/{id}` | Manager-only; Manager can add Cook/Waiter roles; role names are unique per hotel; no permissions table |
| Menu categories | `POST /menu/categories`, `GET /menu/categories`, `PATCH /menu/categories/{id}`, `PATCH /menu/categories/{id}/status` | Manager/Cashier/Cook/Waiter can read; writes Manager-only |
| Menu items | `POST /menu/items`, `GET /menu/items?categoryId=&available=`, `GET /menu/items/{id}`, `PATCH /menu/items/{id}`, `PATCH /menu/items/{id}/availability`, `DELETE /menu/items/{id}` | Manager/Cashier/Cook/Waiter can read; writes Manager-only; DELETE deactivates, it does not remove historical references |
| Orders | `POST /orders`, `GET /orders?page=&size=&status=&from=&to=`, `GET /orders/{id}`, `PATCH /orders/{id}`, `POST /orders/{id}/cancel`, `GET /orders/{id}/bill` | Manager/Cashier only; history is paged (maximum 100); only unpaid open orders are editable |
| Payments | `POST /orders/{id}/payments` | Manager/Cashier only; Cash/UPI split tender; UPI must be manually confirmed in the hotel's UPI app |
| Receipts | `GET /orders/{id}/receipt`, `GET /receipts/{receiptNumber}` | Manager/Cashier only; returns saved snapshot for reprinting |
| Reports/audit | `GET /reports/daily-sales?date=YYYY-MM-DD`, `GET /audit?page=&size=` | Daily report uses hotel timezone and cutoff; audit history is Manager-only and paginated |
| Docs/health | `/swagger-ui.html`, `/v3/api-docs`, `/actuator/health` | OpenAPI/Swagger and health endpoint; health details hidden |

### Representative sale flow

1. `GET /api/v1/menu/items` shows active menu items for the caller's hotel (optionally filter with `categoryId` and availability).
2. `POST /api/v1/orders` accepts `{"items":[{"menuItemId":"<menu item UUID>","quantity":2}]}`. It accepts menu item IDs and quantities only. The server loads current hotel-owned prices, stores name/price snapshots, and calculates subtotal and grand total.
3. `GET /api/v1/orders/{id}/bill` returns the server-calculated bill.
4. Accept cash or show the hotel's UPI scanner. For UPI, staff first verifies the transfer in the hotel app, then records the payment with `POST /api/v1/orders/{id}/payments`. Overpayment is rejected; the order becomes completed when fully paid. Payment, order state, receipt snapshot, and audit write are transactional.
5. `GET /api/v1/orders/{id}/receipt` returns the stored receipt snapshot, unaffected by future menu or hotel configuration changes.

## Validation, transitions, and data rules

- Currency values are ISO-4217 codes; money uses `numeric(12,2)`/`BigDecimal` with a two-decimal rounding/storage policy for all configured currencies. Prices may be zero but not negative. Quantities are integers 1–999.
- Orders start `OPEN / UNPAID`. Split payments move payment status to `PARTIAL`, then `PAID` and order status to `COMPLETED` at the exact grand total. Zero-total orders are completed and receipted immediately. Only unpaid open orders can be edited/cancelled; cancellation requires a reason and is rejected once any payment exists.
- Usernames, role names, order numbers, and receipt numbers are unique within a hotel. Menu item prices and names are copied to order-line snapshots. Menu items are deactivated, never hard-deleted through the API.
- Every tenant-owned repository query scopes by hotel ID. Cross-tenant categories, menu items, orders, payments, roles, and users return not found or validation errors without exposing another hotel's data.

## Error format and logging

Errors contain `timestamp`, `status`, `code`, `message`, `path`, `correlationId`, and optional `fieldErrors`. Authentication/authorization return 401/403, validation 400, missing tenant-scoped records 404, unique/transaction conflicts 409, and unexpected failures a generic 500. SQL details and stack traces are not returned.

`X-Correlation-ID` is returned for each request (or a new UUID is generated); the same value is placed in logging MDC. Do not put credentials, JWTs, password hashes, or payment credentials in logs or audit values.

## Performance notes and limitations

Order history uses a hotel/time index and one batched item query for the current page to avoid per-order N+1 reads. Payment queries are hotel-scoped and order/payment lookups are indexed. JWT authorization checks the Redis token session on every request and caches database-derived hotel/user/role state in Redis for 15 seconds by default. Hotel deactivation revokes tenant tokens; staff deactivation and password reset revoke that staff member's tokens. Role and account updates clear authorization cache entries after the database transaction commits. Direct database changes can take up to the configured cache TTL to affect authorization. No latency or query-count benchmark has been run; measure p50/p95 and cache/database query rates using representative multi-tenant data.

Hibernate `update` does not produce a reviewed production schema migration. Composite JPA foreign keys cover user-role, category-item, order-item, payment-order, receipt-order, and audit-user associations; verify these constraints against existing data and apply them in the controlled production schema rollout. Login throttling is deferred during development and should be added before production. Store platform admin credentials securely and apply TLS at the edge. If the development database already has a refund table, removing the entity does not necessarily drop that table; back it up and remove it separately only if desired. Integration/runtime verification depends on a reachable PostgreSQL database and Maven dependencies.
