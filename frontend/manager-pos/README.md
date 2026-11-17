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

## 8. Preview the Production Build

```bash
pnpm preview
```

## 9. Code Quality Commands

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

## 10. Development Guidelines

- Follow the existing project folder structure.
- Use reusable components where appropriate.
- Keep TypeScript types clear and consistent.
- Follow the configured ESLint and Prettier rules.
- Use the existing routing setup for approved pages.
- Do not implement unapproved screens or features.
- Follow the approved Phase 1 Manager POS requirements.

## 11. Current Development Status

- React + TypeScript + Vite setup: Completed
- Initial routing: Completed
- Tailwind CSS setup: Completed
- ESLint configuration: Verified
- Prettier configuration: Verified
- Development and production build: Verified
- Shared application layout: Pending approved design from the design team
