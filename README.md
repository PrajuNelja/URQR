# URQR

URQR is the Hotel & Restaurant Operations Platform developed by NELJA TECH. The repository is organized as a modular monolith with shared frontend packages and dedicated documentation, quality assurance, and infrastructure areas.

## Technology stack

- Backend: Java 21, Spring Boot 4.1.2, Spring Security 7
- Frontend: React 19, TypeScript, Vite
- Database: PostgreSQL 16+
- Caching: Redis 7.2
- Real-time communication: Centrifugo
- Build and deployment: Docker and GitHub Actions

Application implementations are not initialized yet. Technical teams will add them through feature branches and pull requests.

## Repository architecture

The monorepo follows a modular-monolith approach. The backend is contained in `backend/urqr-server`, the current frontend workspace is under `frontend/`, and shared operational assets are separated into `qa/`, `docs/`, and `infrastructure/`.

## Prerequisites

Install the versions of Java, Node.js, PostgreSQL, Redis, Docker, and other tools required by the implementation teams. Exact version managers, dependency versions, and local setup requirements are pending application initialization.

## Getting started

Application setup and run commands are pending. They will be documented here when the frontend, backend, and supporting services are initialized.

## Repository structure

```text
docs/             Architecture, API, database, decision, and requirements documentation
frontend/         Frontend applications and shared packages
backend/          Backend applications and services
qa/               Test planning, execution, data, defects, and evidence
infrastructure/   Docker, database, and deployment assets
.github/          GitHub workflows, templates, and ownership rules
```

## Development guidelines

- Keep changes within the owning area and preserve the modular-monolith boundaries.
- Document architectural and operational decisions in `docs/decisions/`.
- Do not commit credentials, secrets, or environment-specific values.
- Add focused tests and supporting evidence for behavior changes.
- Follow the repository formatting rules in `.editorconfig`.

Detailed implementation and coding standards are pending application initialization.

## Branching strategy

The repository will use feature branches for team changes and pull requests for integration into the protected default branch. The exact branch naming and release strategy are pending agreement by the project maintainers.

## Contribution workflow

1. Create a focused feature branch.
2. Link the relevant issue or task.
3. Implement the change in the appropriate repository area.
4. Run the applicable checks and attach evidence.
5. Open a pull request using the repository template.
6. Obtain the required CODEOWNERS reviews before merging.

The final review gates and approval rules are pending setup of the GitHub repository.

## Security guidelines

- Never commit passwords, API keys, JWT secrets, tokens, or private certificates.
- Use `.env.example` only to document variable names; keep actual values local or in approved secret management.
- Report suspected vulnerabilities privately to the maintainers rather than opening a public issue with exploit details.
- Review dependencies and generated artifacts before committing them.

Security contact and formal vulnerability response procedures are pending.
