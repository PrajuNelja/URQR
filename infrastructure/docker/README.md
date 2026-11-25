# URQR Developer Environment — Docker Compose Runbook

> **Phase 1 | Nelja Tech | Assignee: Prajwal B N — Overall Lead & System Architect**

## Stack at a glance

| Service | Image | Internal port | Host port | Purpose |
|---|---|---|---|---|
| `postgres` | `postgres:18.7-alpine` | 5432 | **5433** | Primary database (direct admin access) |
| `pgbouncer` | `bitnami/pgbouncer:1.24.0` | 6432 | **5432** | Connection pool — app connects here |
| `redis` | `redis:8.2.11-alpine` | 6379 | **6379** | Cache / session / rate-limit |
| `centrifugo` | `centrifugo/centrifugo:v6.10.3` | 8000/9000 | **8000/9000** | Real-time WebSocket hub |

## Prerequisites

- Docker Desktop ≥ 4.28 (Compose V2 built in)
- 4 GB free RAM
- Ports 5432, 5433, 6379, 8000, 9000 free on the host

## Quick start

```bash
# 1 — copy and fill in secrets (already done)
cp .env.example .env

# Always run from P:\URQR (project root) — the --env-file flag is required
# because Docker Compose v2 looks for .env next to the compose file by default.

# 2 — start all services (detached)
docker compose -f infrastructure/docker/docker-compose.yml --env-file .env up -d

# 3 — verify all services are healthy
docker compose -f infrastructure/docker/docker-compose.yml --env-file .env ps

# 4 — tail logs
docker compose -f infrastructure/docker/docker-compose.yml --env-file .env logs -f

# 5 — stop (keep volumes)
docker compose -f infrastructure/docker/docker-compose.yml --env-file .env down

# 6 — stop + wipe volumes (full reset)
docker compose -f infrastructure/docker/docker-compose.yml --env-file .env down -v
```

## Port reference

| Port | Service | Who connects |
|---|---|---|
| **5432** | PgBouncer (pool) | Spring Boot app / backend services |
| **5433** | PostgreSQL (direct) | DBA tools, `psql`, pgAdmin, schema migrations |
| **6379** | Redis | Spring Boot app |
| **8000** | Centrifugo external (WebSocket + HTTP API) | Frontend clients (`/connection/websocket`), backend publishes (`/api`) |
| **9000** | Centrifugo internal (health, admin, Prometheus) | Health probe `/health`, admin UI, metrics `/metrics` |

## Health checks

All four containers expose Docker health checks. `docker compose ps` shows `(healthy)` or `(unhealthy)`.

| Container | Health test |
|---|---|
| `urqr_postgres` | `pg_isready -U <user> -d <db>` |
| `urqr_pgbouncer` | `pg_isready -h 127.0.0.1 -p 6432` |
| `urqr_redis` | `redis-cli -a <pass> ping` → `PONG` |
| `urqr_centrifugo` | `GET http://127.0.0.1:9000/health` |

## PgBouncer connection pool settings

| Setting | Value | Notes |
|---|---|---|
| `pool_mode` | `transaction` | Recommended for Spring Boot / JPA apps |
| `max_client_conn` | 200 | Max simultaneous app connections |
| `default_pool_size` | 20 | Connections forwarded to PostgreSQL |
| `min_pool_size` | 5 | Always-warm connections |
| `reserve_pool_size` | 10 | Burst overflow pool |
| `max_db_connections` | 50 | Hard ceiling on PG connections |

> **Spring Boot JDBC URL** (connect through PgBouncer):
> ```
> jdbc:postgresql://localhost:5432/urqr_db?prepareThreshold=0
> ```
> `prepareThreshold=0` disables server-side prepared statements, which are incompatible with `transaction` pool mode.

## Centrifugo channels

| Namespace | Use case | History | Presence |
|---|---|---|---|
| `orders` | Live order status updates | 100 msgs / 1 min | ✅ |
| `kitchen` | KDS ticket events | 50 msgs / 1 min | ✅ |
| `notifications` | Push alerts | None | ❌ |

## Spring Boot `application.properties` snippet

```properties
# DataSource — via PgBouncer
spring.datasource.url=jdbc:postgresql://localhost:5432/urqr_db?prepareThreshold=0
spring.datasource.username=${POSTGRES_USER}
spring.datasource.password=${POSTGRES_PASSWORD}
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=2
spring.datasource.hikari.connection-timeout=20000

# Redis
spring.data.redis.url=redis://:${REDIS_PASSWORD}@localhost:6379

# Centrifugo
centrifugo.url=${CENTRIFUGO_URL}
centrifugo.api-key=${CENTRIFUGO_API_KEY}
```

## Architecture constraint — BANNED technologies

The following are **strictly prohibited** across all team repositories.  
The CI workflow `.github/workflows/stack-compliance.yml` enforces this on every push and PR.

| Technology | Reason |
|---|---|
| Apache Kafka / Confluent | Phase 1 is single-node; async messaging via Centrifugo + DB |
| Kubernetes / Helm / kustomize | Docker Compose is the mandated deployment target |
| Microservices (Spring Cloud, gRPC cross-service, service mesh) | Monolith-first architecture for Phase 1 |

## Troubleshooting

| Symptom | Fix |
|---|---|
| `pgbouncer` exits immediately | Ensure `postgres` is healthy first; check `POSTGRES_PASSWORD` is set |
| `Error: prepared statement` from JPA | Add `?prepareThreshold=0` to JDBC URL |
| Redis `NOAUTH` error | Verify `REDIS_PASSWORD` matches in `.env` |
| Centrifugo `client.token.hmac_secret_key` warning | `CENTRIFUGO_TOKEN_SECRET` must be ≥ 32 characters |
| Centrifugo restarts with `error unmarshalling config` | The config must follow the v6 schema (`http_server`, `client`, `http_api`, `channel`) — v5 top-level keys are ignored in v6 |
| Port already in use | Check `netstat -ano \| findstr :<port>` on Windows |
