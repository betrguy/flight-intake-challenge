# Monster App

A modern, production-ready Angular application built with standalone components, strict TypeScript typing, SCSS styling, Vitest testing harness, and modular Firebase integration (Authentication & Hosting).

---

## Architecture Overview

- **Framework**: Angular (Latest Standalone Architecture, no `NgModule`)
- **Language**: TypeScript with strict mode (`strict: true`, `strictTemplates: true`)
- **Styling**: SCSS (Sass)
- **State & Reactivity**: Angular Signals (`signal`, `computed`) & RxJS Observables
- **Unit Testing**: Vitest test runner with JSDOM
- **Backend & Cloud**: Firebase Modular SDK v12 (`firebase/app`, `firebase/auth`)
- **Hosting & Deployment**: Firebase Hosting with SPA rewrite routing
- **Tooling**: Angular CLI, Prettier, Firebase CLI (`firebase-tools`)

---

## Directory Structure

```text
monster-dev/
├── .vscode/                     # VS Code recommended configurations
├── public/                      # Static assets and icons
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   └── firebase/        # Firebase DI providers & authentication service
│   │   │       ├── firebase-auth.service.spec.ts
│   │   │       ├── firebase-auth.service.ts
│   │   │       └── firebase.providers.ts
│   │   ├── app.config.ts        # Application configuration & dependency providers
│   │   ├── app.html             # Root component template
│   │   ├── app.routes.ts        # Application route definitions
│   │   ├── app.scss             # Root component styles
│   │   ├── app.spec.ts          # Root component unit tests
│   │   └── app.ts               # Root standalone component
│   ├── environments/            # Typed environment configurations
│   │   ├── environment.example.ts
│   │   ├── environment.model.ts
│   │   ├── environment.prod.ts
│   │   └── environment.ts
│   ├── index.html               # Main HTML entry point
│   ├── main.ts                  # Application bootstrap entry point
│   └── styles.scss              # Global application styles
├── .firebaserc                  # Firebase project aliases
├── .gitignore                   # Comprehensive enterprise Git ignore configuration
├── angular.json                 # Angular workspace configuration
├── firebase.json                # Firebase Hosting configuration & SPA rewrites
├── package.json                 # Dependencies and npm script targets
├── PROMPTS.md                   # Engineering prompts and architectural decisions log
├── README.md                    # Project documentation
└── tsconfig.json                # TypeScript strict configuration
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.19.0+ or v20+ / v22+
- **npm**: v10+

### Installation

1. Clone repository:
   ```bash
   git clone <repository-url>
   cd monster-dev
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy the example environment template and populate your Firebase credentials:
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   cp src/environments/environment.example.ts src/environments/environment.prod.ts
   ```

---

## Development & Build Commands

- **Start Local Dev Server**:
  ```bash
  npm start
  # or
  npx ng serve
  ```
  Navigate to `http://localhost:4200/`. The application will automatically reload if you change any source files.

- **Build for Production**:
  ```bash
  npm run build
  ```
  The production build artifacts will be stored in `dist/monster-app/browser`.

---

## Testing

Execute unit tests via Vitest:

- **Run Tests in Watch Mode**:
  ```bash
  npm test
  ```

- **Run Single-Pass Tests (CI Mode)**:
  ```bash
  npm run test:ci
  # or
  npm test -- --watch=false
  ```

---

## Firebase Hosting & Deployment

1. Login to Firebase CLI:
   ```bash
   npx firebase login
   ```

2. Deploy to Firebase Hosting:
   ```bash
   npm run firebase:deploy
   ```

---

## Test Credentials

> [!NOTE]
> The following credentials can be used for evaluation and automated integration testing.

- **Email**: `test.user@monster.dev` (Placeholder)
- **Password**: `TestPass123!` (Placeholder)
- **Role**: `Standard User`

---

## Live Demo Link

- **Live URL**: `https://monster-app-dev.web.app` (Placeholder)
