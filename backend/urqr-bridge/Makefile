# =============================================================================
# URQR Bridge — Go 1.27.4
# Nelja Tech | Phase 1 | Real-time WebSocket bridge to Centrifugo
#
# Architecture constraint: single-process, no Kafka, no K8s, no service mesh.
# =============================================================================

BINARY   = urqr-bridge
PKG      = github.com/nelja/urqr-bridge
VERSION  = $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
BUILD_TS = $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")
LDFLAGS  = -ldflags="-s -w -X main.version=$(VERSION) -X main.buildTime=$(BUILD_TS)"

.PHONY: all build clean test vet fmt tidy verify

all: verify vet build

build:
	go build $(LDFLAGS) -o bin/$(BINARY) .

clean:
	rm -rf bin/

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
