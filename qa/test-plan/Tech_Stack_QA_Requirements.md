# URQR – Technology Stack QA Requirements

## 1. Document Purpose

This document identifies the QA verification requirements based on the finalized URQR Technology Stack and Architecture Decisions.

**Project:** URQR  
**Phase:** Phase 1 – Standalone Manager POS  
**Prepared By:** QA Team  
**Document Type:** QA Requirements

## 2. Technology Stack – QA Verification Requirements

| Component | Selected Technology | QA Verification Requirement |
|---|---|---|
| Frontend | React 19.3.1, TypeScript 6.0.3, Vite 8.3.8 | Verify frontend build, application compatibility and API integration. |
| Backend | Java 21, Spring Boot 4.1.2 | Verify backend build, application startup and API functionality. |
| Security | Spring Security 7.1.2 | Verify authentication, authorization and JWT-based access control. |
| ORM | Hibernate ORM 7.4.13.Final, Spring Data JPA 4.1.2 | Verify database operations and data consistency. |
| Database | PostgreSQL 18.7 | Verify database connectivity, transactions and data integrity. |
| Migration | Flyway 12.4.0 | Verify database migration execution and schema consistency. |
| Cache | Redis 8.2.11 | Verify cache connectivity and required application integration. |
| Real-time | Centrifugo 6.10.3, WebSocket | Verify real-time event delivery and connectivity. |
| API Validation | Zod | Verify frontend request and response validation against approved API contracts. |
| Offline Support | PWA, Service Workers, IndexedDB | Verify offline functionality and data synchronization. |
| Hardware Integration | Go URQR-Bridge, ESC/POS | Verify supported printer connectivity and print operations. |
| Cloud Storage | Cloudflare R2 | Verify file upload and download operations. |
| Deployment | Docker, AWS ECS Fargate | Verify container build and deployment readiness. |
| Backup | pgBackRest 2.60.0, AWS S3 | Verify backup and restoration procedures. |

## 3. Application-Level QA Requirements

The following areas require verification within the approved Phase 1 scope:

1. **Authentication and Authorization**
   - Verify valid and invalid login scenarios.
   - Verify JWT generation and protected API access.
   - Verify role-based authorization.
   - Verify tenant isolation and unauthorized access prevention.

2. **API Testing**
   - Validate API requests and response structures against approved API documentation.
   - Verify HTTP status codes and error responses.
   - Verify request validation and negative scenarios.
   - Verify frontend-backend integration.

3. **Database Testing**
   - Verify database connectivity and CRUD operations.
   - Verify transaction handling and data integrity.
   - Verify migration execution.
   - Verify tenant-level data isolation.

4. **Integration Testing**
   - Verify communication between frontend, backend and database.
   - Verify authentication and authorization across APIs.
   - Verify integration between dependent application components.

5. **Billing and Transaction Testing**
   - Verify billing calculations against approved business rules.
   - Verify payment idempotency.
   - Verify payment failure handling and recovery.
   - Verify transaction data consistency.

6. **Offline and Synchronization Testing**
   - Verify supported offline operations.
   - Verify synchronization after network restoration.
   - Verify data consistency during synchronization.

## 4. Compatibility Verification

The following technology combinations require compatibility verification before production approval:

- Java 21 with Spring Boot 4.1.2.
- Spring Modulith with the selected Spring Boot version.
- Spring Security and JWT authentication.
- Hibernate ORM with PostgreSQL 18.7.
- Flyway database migrations.
- React, TypeScript and Vite.
- Cloudflare R2 upload and download integration.
- Go URQR-Bridge and supported hardware integration.
- Docker deployment on AWS ECS Fargate.
- pgBackRest backup and restoration.

## 5. QA Deliverables

The QA team will maintain:

- Master QA Strategy and Test Plan.
- API testing collections and execution records.
- Functional and integration test cases.
- Defect reports with severity classification.
- Regression test results.
- Test evidence and execution reports.
- Compatibility verification results.

## 6. Pending Verification and Dependencies

The following items require confirmation or evidence before verification can be considered complete:

- Finalized and approved API documentation.
- Authentication and authorization specifications.
- Approved Phase 1 functional requirements.
- Confirmed API request and response payloads.
- Pinned versions for dependencies marked as pending in the technology stack.
- Required development, staging and test environment access.

## 7. Production Readiness Criteria

Production readiness must not be approved until the applicable criteria are verified and supported by test evidence:

- Required frontend and backend builds pass.
- Database migrations execute successfully.
- Authentication and authorization work as expected.
- Tenant isolation is verified.
- Required integration tests pass.
- Deployment verification is completed.
- Backup and restoration are verified.

## 8. QA Status

**Current Status:** Requirements documented – verification pending.

Technology compatibility and application functionality must be marked as verified only after successful execution and supporting evidence.

**Reference:** URQR – Finalized Technology Stack & Architecture Decisions, dated 16 November 2026.