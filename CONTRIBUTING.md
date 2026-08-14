# 🤝 Contributing to Agency CRM

Thank you for your interest in contributing! This guide outlines how to get involved, report issues, and submit changes.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Code Style](#code-style)
- [Security](#security)

---

## Code of Conduct

By participating in this project, you agree to maintain a welcoming and respectful environment for everyone. Please be kind, constructive, and professional in all interactions.

---

## Getting Started

1. **Fork the repository** and clone your fork:

   ```bash
   git clone https://github.com/your-username/agency-crm.git
   cd agency-crm
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up your environment:**

   ```bash
   cp .env.example .env.development
   ```

   Fill in your Firebase project credentials. A configured Firebase project (Auth + Firestore + Storage) is required for the app to function.

4. **Run the development server:**

   ```bash
   npm run dev
   ```

---

## How to Contribute

### Reporting Bugs

Open an issue and include:

- A clear, descriptive title
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots or error logs if available
- Environment details (browser, OS, Node version)

### Suggesting Features

Open an issue with:

- The problem you're trying to solve
- A description of the proposed solution
- Any alternatives you've considered

### Submitting Code

1. Create a branch from `master` with a descriptive name:

   ```bash
   git checkout -b feat/my-feature
   ```

2. Make your changes and commit them (see [Commit Guidelines](#commit-guidelines)).
3. Run checks locally:

   ```bash
   npm run lint
   npm run type-check
   npm test
   ```

4. Push your branch and open a Pull Request. Reference the related issue if any.

---

## Development Workflow

### Before you start

Make sure the app runs and tests pass on `master` before branching.

### While you work

- Keep changes focused on a single concern.
- Add or update tests for new behavior.
- Update documentation (e.g., `docs/`) when user-facing behavior changes.

### Before submitting

- `npm run lint` — no errors
- `npm run type-check` — no type errors
- `npm test` — all tests pass

---

## Commit Guidelines

We use clear, conventional commit messages:

```
type(scope): short description
```

Examples:

- `feat(commissions): add partial payment support`
- `fix(applicants): correct branch filter on dashboard`
- `docs(readme): document environment setup`
- `refactor(expenses): extract approval logic`
- `test(notifications): add unit tests for role filtering`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`.

---

## Code Style

- TypeScript for all source files
- Follow the existing ESLint configuration (`npm run lint`)
- Prefer functional React components and hooks
- Keep components focused; move shared logic into `src/hooks/`, `src/utils/`, or `src/services/`
- Write meaningful tests for new logic

---

## Security

- **Never commit secrets, API keys, or service account files** to the repository
- Environment variables belong in gitignored `.env.*` files
- If you discover a security vulnerability, do **not** open a public issue — report it privately per [SECURITY.md](SECURITY.md)

---

Thank you for helping make Agency CRM better! 🙌