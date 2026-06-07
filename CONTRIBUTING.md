# Contributing to SEISMICA

Thank you for your interest in contributing! This document outlines the process for contributing to SEISMICA.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

This project adheres to a simple principle: **be respectful, be constructive**. Harassment, discrimination, or hostile communication of any kind will not be tolerated.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/SEISMICA.git
   cd SEISMICA
   ```
3. Install dependencies for both workspaces:
   ```bash
   cd backend  && npm install && cd ..
   cd frontend && npm install && cd ..
   ```
4. Copy the environment example:
   ```bash
   cp backend/.env.example backend/.env
   ```
5. Start both servers:
   ```bash
   # Terminal 1
   cd backend && npm start

   # Terminal 2
   cd frontend && npm start
   ```

---

## Development Workflow

```
main
 └── develop          ← integration branch
      ├── feature/*   ← new features
      ├── fix/*        ← bug fixes
      └── docs/*       ← documentation only
```

- All work should branch off `develop`
- PRs should target `develop`, **not** `main`
- `main` is always production-ready

---

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/<short-description>` | `feature/3d-globe-view` |
| Bug fix | `fix/<issue-or-description>` | `fix/nan-magnitude-crash` |
| Docs | `docs/<topic>` | `docs/api-reference` |
| Chore | `chore/<task>` | `chore/update-dependencies` |

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```
feat(backend): add /api/history endpoint for 7-day histogram
fix(frontend): prevent drone animation memory leak on unmount
docs(readme): add architecture diagram and API reference
```

---

## Pull Request Process

1. Ensure your branch is up to date with `develop`
2. Make sure the app starts and runs without console errors
3. Run existing tests: `cd frontend && npm test -- --watchAll=false`
4. Fill in the PR template completely
5. Reference any related issues with `Closes #<issue-number>`
6. A maintainer will review and merge once approved

### PR Checklist
- [ ] Code runs without errors (`npm start` for both backend and frontend)
- [ ] No new `console.error` or unhandled promise rejections
- [ ] Commit messages follow Conventional Commits
- [ ] Documentation updated if behaviour changed
- [ ] No sensitive data (API keys, `.env` files) committed

---

## Reporting Bugs

When filing a bug report, please include:

- **Environment**: OS, Node.js version, browser
- **Steps to reproduce**: Numbered list of exact steps
- **Expected behaviour**: What should happen
- **Actual behaviour**: What actually happens
- **Screenshots / logs**: If applicable

> [Open a bug report](https://github.com/tiyamisu/SEISMICA/issues/new?labels=bug)

---

## Requesting Features

Feature requests are welcome! Please check existing issues first to avoid duplicates.

> [Open a feature request](https://github.com/tiyamisu/SEISMICA/issues/new?labels=enhancement)

---

## Areas Where Contributions Are Especially Welcome

- [ ] Alternative TSP algorithms (Or-Opt, Lin-Kernighan)
- [ ] WebSocket for true real-time earthquake streaming
- [ ] Export route as KML / GPX
- [ ] Unit tests for TSP solver functions
- [ ] Docker Compose setup for one-command startup
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

---

Thank you for helping make SEISMICA better! 🌍
