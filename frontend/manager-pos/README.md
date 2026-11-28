# URQR – Manager POS Frontend

## 1. Project Overview

The URQR Manager POS frontend is built using React, TypeScript, and Vite.

This application is part of the URQR Phase 1 standalone Manager POS project.

## 2. Technology Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- ESLint
- Prettier
- pnpm

## 3. Prerequisites

Install the following before setting up the project:

- Node.js 22 LTS
- pnpm
- Git
- VS Code or another code editor

Verify the installations:

```bash
node --version
pnpm --version
git --version
```

## 4. Project Structure

```text
frontend/
├── package.json
├── pnpm-lock.yaml
└── manager-pos/
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    └── src/
        ├── assets/
        ├── components/
        ├── pages/
        ├── App.tsx
        ├── AppRouter.tsx
        ├── index.css
        └── main.tsx
```

## 5. Installation

Open the terminal in the `frontend` directory.

Install dependencies:

```bash
pnpm install
```

## 6. Run the Development Server

```bash
pnpm dev
```

Open the local URL displayed in the terminal.

## 7. Build the Application

```bash
pnpm build
```

## 8. Local Receipt Printing

The Tauri POS connects to the local Go bridge at `ws://localhost:9101/ws`.
Override the URL with `VITE_BRIDGE_WS_URL` when needed. After a valid checkout,
the frontend sends the receipt with the authenticated `tenant_id` and reports
the bridge print response in a notification. A completed payment is not
reversed if the bridge or printer is unavailable.

The header badge reflects printer readiness, disconnection, paper-out, cover,
and warning states. The receipt modal reprints through the bridge and reports
printed, queued, and failed outcomes.

The 50 ms target measures checkout confirmation through WebSocket dispatch; it
does not measure the time for the printer to finish feeding paper.

## 9. Preview the Production Build

```bash
pnpm preview
```

## 10. Code Quality Commands

Check code using ESLint:

```bash
pnpm lint
```

Automatically fix supported ESLint issues:

```bash
pnpm lint:fix
```

Format source files:

```bash
pnpm format
```

Check formatting without modifying files:

```bash
pnpm format:check
```

## 11. Development Guidelines

- Follow the existing project folder structure.
- Use reusable components where appropriate.
- Keep TypeScript types clear and consistent.
- Follow the configured ESLint and Prettier rules.
- Use the existing routing setup for approved pages.
- Do not implement unapproved screens or features.
- Follow the approved Phase 1 Manager POS requirements.

## 12. Current Development Status

- React + TypeScript + Vite setup: Completed
- Initial routing: Completed
- Tailwind CSS setup: Completed
- ESLint configuration: Verified
- Prettier configuration: Verified
- Development and production build: Verified
- Tauri POS bridge status and reprint flows: Implemented
- Go bridge and virtual printer round-trip: Verified
- Joint hardware sign-off report: Pending
- Shared application layout: Pending approved design from the design team
