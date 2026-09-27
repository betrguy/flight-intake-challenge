# Engineering Prompts & Architectural Log

## Prompt 1: Project Initialization & Enterprise Standards Setup

### Prompt (Verbatim)
> Initialize a new, production-ready Angular application in this directory using modern standalone components (Angular 17+ or 18+, no NgModule). Use SCSS/CSS for styling, enable strict TypeScript type-checking, configure routing, and ensure the Karma/Jasmine or Vitest test runner is configured and working out of the box.
>
> Follow these strict enterprise project standards:
> 1. Ensure a comprehensive .gitignore is established (ignoring node_modules, dist, .angular, environment files with secret tokens, and OS artifacts).
> 2. Initialize git if not already initialized. Make an initial clean commit: 'feat: initialize angular standalone application with test harness'.
> 3. Create a 'PROMPTS.md' file in the root. Document Prompt 1 verbatim, explaining the architectural decision to build an Angular standalone architecture with strict type-safety and integrated automated test verification.
> 4. Install and configure Firebase CLI and AngularFire (or modular Firebase SDK) for Firebase Authentication and Firebase Hosting.
> 5. Create a clean README.md with project title, architecture overview, setup steps, commands to run tests, and placeholder sections for Test Credentials and Live Demo Link.
>
> Verification steps before completing this prompt:
> - Run `npm test -- --watch=false` (or equivalent test runner command) and verify the initial test suite passes.
> - Verify `npm start` / `ng serve` builds with zero errors.
>
> Report back with the project structure, confirmation of passing tests, and git status.

---

### Architectural Decisions & Rationale

1. **Standalone Component Architecture (No `NgModule`)**:
   - Modern Angular eliminates the boilerplate, indirection, and cognitive overhead of `NgModule` by leveraging standalone components, directives, and pipes.
   - Eliminates circular module dependencies, simplifies lazy-loaded routing using native dynamic `import()` statements, and provides superior tree-shaking for minimal production bundle payloads.

2. **Strict TypeScript & Template Type-Safety**:
   - Strict mode is enforced through compiler options in `tsconfig.json` (`strict: true`, `noImplicitOverride: true`, `noPropertyAccessFromIndexSignature: true`, `noImplicitReturns: true`, `noFallthroughCasesInSwitch: true`).
   - Angular compiler strictness (`strictTemplates: true`, `strictInjectionParameters: true`, `strictInputAccessModifiers: true`) validates template expressions, inputs/outputs, and DI tokens during compilation rather than failing silently at runtime.

3. **Vitest Unit Test Runner**:
   - Modern Angular unit testing harness configured with Vitest and JSDOM.
   - Vitest delivers near-instantaneous test startup, modern ESM module execution, clean mocking APIs (`vi.fn()`, `vi.mock()`), and eliminates legacy Karma/Chromium headless orchestration bottlenecks.
   - Fully integrated with `npm test` and `npm run test:ci` (`--watch=false`) for robust continuous integration environments.

4. **Modular Firebase Architecture & Angular Signals**:
   - Utilizes the modern, modular Firebase SDK v12 (`firebase/app`, `firebase/auth`) together with the `firebase-tools` CLI.
   - Employs an Angular Dependency Injection strategy using typed `InjectionToken` definitions (`FIREBASE_CONFIG`, `FIREBASE_APP`, `FIREBASE_AUTH`) allowing clean decoupling and painless mocking during unit tests.
   - Implements `FirebaseAuthService` with reactive Angular Signals (`currentUser`, `isAuthenticated`) alongside standard RxJS Observables (`getAuthState()`) for high-performance reactive UI updates.

5. **Security, Secrets Management, and Hosting**:
   - Configured comprehensive `.gitignore` safeguarding environment secrets, `.env` files, build caches (`.angular`), compilation outputs (`dist`), and OS artifacts.
   - Included `src/environments/environment.example.ts` as a tracked schema template while ignoring live local and production secrets.
   - Structured `firebase.json` with Single Page Application (SPA) rewrite rules to route all incoming HTTP requests to `/index.html`, targeting the production build directory `dist/monster-app/browser`.
