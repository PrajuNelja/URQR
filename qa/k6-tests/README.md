# URQR Platform — k6 Performance Testing Guide

**Assignee:** Bharath | Role: QA Automation & Hardware Lead  
**Scope:** Performance, Latency & Load Testing  
**Standard:** 95th Percentile Response Time < 200ms, Error Rate < 1%

---

## 1. Tool Installation

### Windows (Chocolatey or Winget)
```powershell
choco install k6 -y
# OR
winget install k6 --accept-source-agreements --accept-package-agreements
```

### macOS (Homebrew)
```bash
brew install k6
```

### Linux (Debian / Ubuntu)
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

---

## 2. Test Execution Commands

### Fast Benchmark Runner (Native or Fallback)
```powershell
pnpm run test:k6
```

### Direct Native k6 Execution
```powershell
k6 run qa/k6-tests/baseline.js
```

### Custom Host & Concurrency
```powershell
$env:BASE_URL="http://localhost:8080"
$env:VUS="10"
$env:DURATION="30s"
pnpm run test:k6
```

---

## 3. Reporting Pipeline

Every k6 execution automatically compiles and emits executive summaries into two locations:
1. `qa/evidence/k6-summary.html` — Rich visual dashboard with KPI cards for p95, p99, median, throughput, and audit pill indicators.
2. `qa/evidence/k6-summary.json` — Structured JSON metrics used by CI quality gates.
3. `k6-results/summary.html` & `k6-results/summary.json` — Local sprint artifacts.
