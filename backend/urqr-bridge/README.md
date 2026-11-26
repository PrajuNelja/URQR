# URQR Bridge
> Real-time WebSocket bridge: Spring Boot → Centrifugo | Go 1.27.4 | Nelja Tech Phase 1

## Purpose
`urqr-bridge` relays internal events (order updates, kitchen tickets, notifications) from the Spring Boot monolith to the correct [Centrifugo](https://centrifugal.dev) channels via its HTTP API.

## Architecture constraint
Single-process, no Kafka, no Kubernetes, no service mesh — consistent with the URQR Phase 1 stack policy enforced by `.github/workflows/stack-compliance.yml`.

## Module structure
```
backend/urqr-bridge/
├── main.go       ← Entry point, HTTP health/ready endpoints, graceful shutdown
├── go.mod        ← Go 1.27.4, strict pinned dependencies
├── go.sum        ← Cryptographic lock file for all transitive deps
└── Makefile      ← build / test / vet / verify targets
```

## Running locally
```bash
export BRIDGE_PORT=9100
go run .

# Health check
curl http://localhost:9100/health
# → {"status":"UP","service":"urqr-bridge"}
```

## Local desktop WebSocket
The desktop frontend connects to `ws://127.0.0.1:9100/ws`. This endpoint
accepts loopback connections from local origins only; it is not exposed as a
remote client API. The bridge sends a `connected` message, then acknowledges
`hello` messages and answers `ping` messages with `pong`.

```json
{"type":"hello","id":"hello-1"}
{"type":"ping","id":"ping-1"}
```

```json
{"type":"ack","id":"hello-1","status":"UP"}
{"type":"pong","id":"ping-1","status":"UP"}
```

## Make targets
```bash
make build    # compile to bin/urqr-bridge
make test     # unit tests with race detector + coverage
make vet      # go vet ./...
make verify   # go mod verify (checks go.sum integrity)
make tidy     # go mod tidy (keep go.sum current)
```

## Dependency pinning policy
All dependencies are pinned to exact versions in `go.mod`. Use `go mod tidy` after any update and commit both `go.mod` and `go.sum`. The CI workflow (`bridge-verify` job) fails if `go mod tidy` produces uncommitted changes.
