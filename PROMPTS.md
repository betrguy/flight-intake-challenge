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

### Architectural Decisions & Rationale (Phase 1)

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

---

## Phase 2: Core Contract, Resilient HTTP Data Service & Automated Test Suite

### Prompt (Verbatim)
> Record this prompt verbatim in PROMPTS.md under Phase 2 with architectural rationale before proceeding.
>
> We will now build the core contract, HTTP data service, and unit tests adhering to Farley's principles of Loose Coupling and Fast Empirical Feedback:
>
> 1. Create Domain Models:
>    - In `src/app/core/models/flight-info.model.ts`, define and export:
>      export interface FlightInfoPayload {
>        airline: string;
>        arrivalDate: string;
>        arrivalTime: string;
>        flightNumber: string;
>        numOfGuests: number;
>        comments?: string;
>      }
>
>      export type SubmissionStatus = 'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR';
>
>      export interface FlightSubmissionResponse {
>        success: boolean;
>        message?: string;
>      }
>
> 2. Create the Flight Service:
>    - In `src/app/core/services/flight.service.ts`:
>      - Ensure Angular's `provideHttpClient()` / `withFetch()` is active in `app.config.ts`.
>      - Define API endpoint:
>        `https://us-central1-crm-sdk.cloudfunctions.net/flightInfoChallenge`
>      - Implement method:
>        `submitFlightInfo(payload: FlightInfoPayload): Observable<FlightSubmissionResponse>`
>      - Set required HTTP headers:
>        * `token`: "WW91IG11c3QgYmUgdGhlIGN1cmlvdXMgdHlwZS4gIEJyaW5nIHRoaXMgdXAgYXQgdGhlIGludGVydmlldyBmb3IgYm9udXMgcG9pbnRzICEh"
>        * `candidate`: "Albert Artemov-Eustace"
>        * `Content-Type`: "application/json"
>      - Include an explicit inline comment explaining the decoded Base64 content of the token header ("You must be the curious type. Bring this up at the interview for bonus points !!").
>      - Implement defensive error handling with RxJS `catchError`: Catch HTTP 4xx/5xx network failures and return a sanitized, typed error observable so the consumer component never receives an unhandled crash.
>
> 3. Automated Test Suite (Fast Feedback Loop):
>    - In `src/app/core/services/flight.service.spec.ts`:
>      - Write unit tests using `HttpTestingController` (or Vitest equivalent).
>      - Test 1: Verify it issues an HTTP POST to the exact endpoint.
>      - Test 2: Verify the request includes the `token` header with the expected Base64 string and `candidate` header with "Albert Artemov-Eustace".
>      - Test 3: Verify the request body matches the `FlightInfoPayload` structure.
>      - Test 4: Verify it catches network errors and emits an error response cleanly.
>
> 4. Verification & Git:
>    - Run the test suite: `npm test -- --watch=false` and confirm all tests pass.
>    - Run `ng build` to verify clean compilation.
>    - Commit the changes:
>      `feat(core): implement flight payload contract, resilient http service, and unit tests`
>
> Report back with the test results, build confirmation, and git status.

---

### Architectural Decisions & Rationale (Phase 2)

Adhering to David Farley's principles from *Modern Software Engineering*—specifically **Loose Coupling**, **Separation of Concerns**, and **Fast Empirical Feedback**:

1. **Explicit Domain Contracts (`FlightInfoPayload`, `FlightSubmissionResponse`, `SubmissionStatus`)**:
   - Isolating domain contracts in `src/app/core/models/flight-info.model.ts` decouples UI view components from transport layer specifics.
   - Strongly typed payloads prevent implicit data coercions (e.g. string guest count instead of number) at compile time.
   - `SubmissionStatus` provides a clean finite state machine model (`IDLE` -> `SUBMITTING` -> `SUCCESS` | `ERROR`) eliminating race conditions and ambiguous boolean flags (`isLoading`, `isError`, `isSuccess`).

2. **Resilient HTTP Service & Defensive Error Containment**:
   - `FlightService` encapsulates all HTTP mechanics, headers (`token`, `candidate`), endpoint URLs, and payload serialization behind a clean abstract interface.
   - Decodes and documents the Base64 inspection bonus token header in-code for clarity and auditability.
   - Employs defensive error handling via RxJS `catchError`: Rather than allowing raw `HttpErrorResponse` errors to propagate unhandled into UI presentation components—potentially causing white screens or broken render cycles—the service normalizes failures into a predictable, typed `FlightSubmissionResponse` (`{ success: false, message: ... }`).
   - Uses `provideHttpClient(withFetch())` for modern, non-blocking browser fetch streaming capabilities.

3. **Fast Empirical Feedback with `HttpTestingController` & Vitest**:
   - Comprehensive unit tests in `src/app/core/services/flight.service.spec.ts` use `provideHttpClientTesting()` and `HttpTestingController` with Vitest.
   - Tests execute in milliseconds without spinning up external servers or issuing real network traffic, validating:
     * Correct HTTP method (`POST`) and endpoint URL.
     * Required enterprise headers (`token`, `candidate`, `Content-Type`).
     * Exact JSON request body serialization.
     * Boundary error containment and clean error emission on 4xx/5xx network failures.
   - This provides developers with instant, deterministic feedback, ensuring long-term maintainability and regression protection.
