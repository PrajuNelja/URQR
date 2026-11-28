# =============================================================================
# URQR Bridge — Go 1.27.4
# Nelja Tech | Phase 1 | Real-time WebSocket bridge & Thermal Printer Daemon
#
# Architecture constraint: single-process, CGO_ENABLED=0, zero external runtime dependencies.
# =============================================================================

BINARY   = urqr-bridge
PKG      = github.com/nelja/urqr-bridge
VERSION  = $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
BUILD_TS = $(shell date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "2026-11-25T00:00:00Z")
LDFLAGS  = -ldflags="-s -w -X main.version=$(VERSION) -X main.buildTime=$(BUILD_TS)"

.PHONY: all build build-windows clean test vet fmt tidy verify sample-receipts

all: verify vet test build

build:
	CGO_ENABLED=0 go build $(LDFLAGS) -o bin/$(BINARY) .

build-windows:
	CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build $(LDFLAGS) -o bin/$(BINARY).exe .

sample-receipts:
	go run ./cmd/receipt-generator -roll=80 -out=receipt_80mm.bin
	go run ./cmd/receipt-generator -roll=58 -out=receipt_58mm.bin

clean:
	rm -rf bin/ receipt_80mm.bin receipt_58mm.bin

test:
	go test -race -coverprofile=coverage.out ./...

vet:
	go vet ./...

fmt:
	gofmt -l -w .

tidy:
	go mod tidy

verify:
	go mod verify
