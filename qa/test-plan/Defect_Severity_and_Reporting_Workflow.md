# URQR – Defect Severity Classification and Reporting Workflow

## 1. Document Information

| Field | Details |
|---|---|
| Project | URQR |
| Phase | Phase 1 – Standalone Manager POS |
| Document Type | Defect Management Process |
| Prepared By | QA Team |
| Status | Draft – Pending Review |

## 2. Objective

Define a standardized process for identifying, classifying, reporting, tracking, retesting and closing software defects.

The objective is to ensure defects are documented accurately, prioritized according to business impact and resolved within agreed timelines.

## 3. Defect Severity Classification

Severity represents the technical and functional impact of a defect on the application.

| Severity | Classification | Description | Example |
|---|---|---|---|
| S1 | Critical | Application or critical business workflow is unusable, with no acceptable workaround. | Unauthorized access to another tenant's data; critical billing transactions failing completely. |
| S2 | High | Major functionality is broken and significantly affects business operations. | Login failure for affected users; incorrect billing calculations. |
| S3 | Medium | Functionality is partially affected, but a workaround is available. | Incorrect validation message; non-critical workflow issue. |
| S4 | Low | Minor issue with limited functional impact. | UI alignment issue; spelling mistake. |

**Note:** Severity must be assigned based on actual impact and verified evidence.

## 4. Defect Priority

Priority represents how urgently a defect should be fixed.

| Priority | Description |
|---|---|
| P1 – Urgent | Requires immediate attention due to critical business impact. |
| P2 – High | Requires resolution in the current development or testing cycle. |
| P3 – Medium | Should be resolved in a planned upcoming cycle. |
| P4 – Low | Can be scheduled based on available resources and release priorities. |

Severity and priority are different. QA assesses severity, while fix priority should be agreed with the responsible project stakeholders.

## 5. Defect Reporting Template

Every defect must include the following information:

| Field | Description |
|---|---|
| Defect ID | Unique defect identification number. |
| Title | Short and descriptive defect summary. |
| Module | Affected application module or workflow. |
| Environment | Local, staging or other applicable environment. |
| Build Version | Application build or version tested. |
| Preconditions | Conditions required to reproduce the issue. |
| Steps to Reproduce | Clear step-by-step reproduction instructions. |
| Expected Result | Expected application behavior. |
| Actual Result | Actual observed behavior. |
| Severity | S1, S2, S3 or S4. |
| Priority | P1, P2, P3 or P4. |
| Evidence | Screenshot, API response, logs or other supporting evidence. |
| Reported By | QA team member who identified the defect. |
| Assigned To | Responsible developer or owner. |
| Status | Current defect lifecycle status. |

## 6. Defect Lifecycle

The defect lifecycle defines how an issue moves from identification to closure.

1. **New:** QA identifies and reports a defect.
2. **Triaged:** The defect is reviewed, validated and assigned severity and priority.
3. **Assigned:** The defect is assigned to the responsible developer.
4. **In Progress:** Developer starts investigating and fixing the issue.
5. **Fixed:** Developer provides the fix for QA verification.
6. **Retest:** QA verifies the fix using the reported reproduction steps.
7. **Closed:** QA confirms the issue is resolved.
8. **Reopened:** QA identifies that the issue still exists or the fix is incomplete.

Additional statuses such as Rejected, Duplicate or Deferred may be used according to the company's defect tracking process.

## 7. Defect Retesting and Closure Criteria

A defect can be closed only when:

- The reported issue is no longer reproducible.
- Actual behavior matches the expected result.
- Relevant test cases pass.
- Supporting retest evidence is recorded.
- Related functionality is not adversely affected.

If the issue persists, QA must reopen the defect with updated evidence.

## 8. Defect Reporting and Communication

- Report defects with clear reproduction steps.
- Attach relevant screenshots, API responses and logs.
- Assign defects to the appropriate development owner.
- Communicate critical and high-severity issues promptly.
- Track unresolved defects during QA status reviews.
- Escalate blockers that affect planned testing or release readiness.
- Maintain an updated defect report.

## 9. Defect Metrics

The QA team will track the following metrics:

- Total defects reported.
- Defects by severity.
- Defects by priority.
- Open and closed defects.
- Reopened defects.
- Defects pending developer action.
- Defect resolution trends.
- Defect distribution by module.

## 10. Roles and Responsibilities

| Role | Responsibility |
|---|---|
| QA Engineer | Identify, reproduce, document and retest defects. |
| QA Lead | Review defect quality, validate severity, coordinate triage and monitor defect status. |
| Developer | Investigate assigned defects, implement fixes and provide build details. |
| Project Stakeholders | Review business impact, agree priorities and resolve escalations. |

## 11. Reporting and Review

Defect status will be reviewed regularly with the relevant QA and development teams.

Critical defects and release-blocking issues must be escalated immediately through the agreed company communication channel.

Defect reports must reflect actual findings and verified execution evidence.

## 12. Approval

This document establishes the proposed defect management workflow for URQR Phase 1.

Severity definitions, priority assignments, response expectations and lifecycle statuses must be aligned with the company's approved defect management policy.

**Current Status:** Draft – Pending Review and Approval.