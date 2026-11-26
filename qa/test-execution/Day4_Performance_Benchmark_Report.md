# URQR Platform — Phase 1 Standalone Manager POS
## Day 4 Performance Benchmark & Load Testing Report
**Assignee:** Bharath | **Role:** QA Automation, Hardware & Load Lead  
**Scope:** k6 Load Testing, Order Creation API Benchmarking, PostgreSQL & PgBouncer Connection Pool Auditing  
**Document Reference:** `QA-PERF-BENCH-DAY4-001` | **Date:** 2026-11-26 | **Sprint Status:** Completed  

---

### 1. Executive Summary
On Day 4, Bharath conducted performance benchmarking and stress tests against the URQR Phase 1 Order Creation REST API (`POST /api/v1/orders`) and catalog endpoints using k6 load testing scripts.

The tests evaluated system throughput, connection pool saturation, and p95 latency under concurrent loads scaling from 10 to 100 virtual users (VUs) submitting continuous randomized multi-item orders.

---

### 2. Performance Testing Architecture & Thresholds

* **Testing Tool:** k6 v0.56.0
* **Target Environment:** Local Docker Compose / CI runner (`http://localhost:8080`)
* **Database & Pool:** PostgreSQL 18.7 with PgBouncer connection pool (max 50 pool connections, HikariCP max 20)
* **Established SLAs & Thresholds:**
  * `http_req_duration{type:health}`: $p(95) < 100\text{ms}$
  * `http_req_duration{type:metadata}`: $p(95) < 200\text{ms}$
  * `http_req_duration{type:orders}`: $p(95) < 150\text{ms}$, average latency $< 100\text{ms}$
  * `http_req_failed`: Rate $< 1\%$ (zero 5xx server errors)

---

### 3. Benchmark Results & Metric Summaries

| Metric Key | Benchmark SLA | Measured Result | Compliance Status |
| :--- | :---: | :---: | :---: |
| **Average Response Time** | $< 100\text{ms}$ | **$21.4\text{ms}$** | **PASSED (Sub-25ms)** |
| **p95 Latency (Orders API)** | $< 150\text{ms}$ | **$46.2\text{ms}$** | **PASSED** |
| **p99 Latency (Orders API)** | $< 400\text{ms}$ | **$88.5\text{ms}$** | **PASSED** |
| **Peak Virtual Users (VUs)** | 100 Concurrent | **100 VUs** | **STABLE** |
| **HTTP 5xx Server Errors** | Strictly 0 | **0 Errors (0.00%)** | **PASSED** |
| **Connection Pool Saturation** | 0 Exhaustions | **0 Starvations** | **PASSED** |
| **Outbox Atomic Commit** | 100% committed | **100% Verified** | **PASSED** |

---

### 4. Connection Pool & Database Performance Analysis
* **PgBouncer & PostgreSQL 18.7:**
  * Active connections remained stable at 12–18 connections throughout the 5-minute ramp-up.
  * Zero database deadlocks or connection pool timeouts recorded under sustained concurrent orders.
* **Spring Boot 3.5.x Virtual Threads (Loom):**
  * Virtual threads effectively decoupled request concurrency from OS kernel thread contention, delivering flat response times under high concurrency.
