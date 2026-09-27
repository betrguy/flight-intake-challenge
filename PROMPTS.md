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

---

## Phase 3: Real Firebase Integration, Route Guard Security Boundary & Authentication View

### Prompt (Verbatim)
> Record this prompt verbatim in PROMPTS.md under Phase 3 with architectural rationale before proceeding.
>
> We will now integrate real Firebase credentials, implement the route guard security boundary, and build the login view adhering to the "Separation of Concerns" and "Defensive Gatekeeper" principles:
>
> 1. Environment Configuration:
>    - Populate `src/environments/environment.ts` and `src/environments/environment.prod.ts` with the following active Firebase configuration:
>      apiKey: "AIzaSyBLPQcOaMyuHluK5pVfezRJFgMyIKhoLew"
>      authDomain: "albert-flight-challenge.firebaseapp.com"
>      projectId: "albert-flight-challenge"
>      storageBucket: "albert-flight-challenge.firebasestorage.app"
>      messagingSenderId: "131582934771"
>      appId: "1:131582934771:web:ee5d7e76d97e5f6e4a8186"
>    - Confirm that both `environment.ts` and `environment.prod.ts` remain safely excluded by `.gitignore` so secrets are never pushed to GitHub. Update `environment.example.ts` with empty placeholder strings to serve as the committed public schema.
>
> 2. Route Guard Security Boundary (`src/app/core/guards/auth.guard.ts`):
>    - Implement a functional route guard `authGuard` using Angular's `canActivateFn`.
>    - Inspect the authentication state via `FirebaseAuthService`.
>    - If authenticated, allow navigation (`true`).
>    - If unauthenticated, redirect the user immediately to `/login` using Angular's `Router.createUrlTree(['/login'])`.
>
> 3. Authentication View (`src/app/features/login/login.component.ts`):
>    - Create a standalone `LoginComponent` with an associated SCSS stylesheet and clean HTML template.
>    - Implement a reactive login form with `email` and `password` fields and client-side validation (required, email format).
>    - Display a clean message stating that access to the Flight Intake System is restricted to authorized candidates and evaluators.
>    - Render a helpful notice detailing default evaluation credentials:
>      * Email: `reviewer@challenge.com`
>      * Password: `Challenge2026!`
>    - Handle login states:
>      * Disable submit button and show a loading spinner during authentication.
>      * On success, navigate immediately to `/flight-entry`.
>      * On failure (e.g., auth/invalid-credential), display a clear, user-friendly error banner without breaking the view.
>
> 4. Routing Setup (`src/app/app.routes.ts`):
>    - `/login` maps to `LoginComponent`.
>    - `/flight-entry` maps to `FlightFormComponent` (create a minimal placeholder if not yet present), strictly protected by `authGuard`.
>    - Default route `''` redirects to `/flight-entry`.
>    - Wildcard route `'**'` redirects to `/flight-entry`.
>
> 5. Automated Unit Tests:
>    - In `src/app/core/guards/auth.guard.spec.ts`:
>      * Test 1: Verify guard permits route activation when user is authenticated.
>      * Test 2: Verify guard redirects to `/login` when user is unauthenticated.
>    - In `src/app/features/login/login.component.spec.ts`:
>      * Test 1: Verify form is invalid when inputs are empty.
>      * Test 2: Verify calling submit invokes `FirebaseAuthService.login()`.
>      * Test 3: Verify successful login redirects to `/flight-entry`.
>
> 6. Verification & Git:
>    - Run `npm test -- --watch=false` to verify all tests pass.
>    - Run `ng build` to confirm clean compilation.
>    - Commit changes:
>      `feat(auth): integrate firebase config, implement auth guard, login component, and tests`
>
> Report back with test results, build status, and git commit details.

---

### Architectural Decisions & Rationale (Phase 3)

Adhering to the **Separation of Concerns** and **Defensive Gatekeeper** patterns:

1. **Defensive Gatekeeper Architecture (`authGuard`)**:
   - Security boundaries must reside outside view logic. By employing Angular's functional `CanActivateFn`, the route guard operates as a deterministic perimeter defense at the router transition lifecycle.
   - When unauthorized access is detected, returning `router.createUrlTree(['/login'])` rather than a raw boolean or imperatively calling `router.navigate()` ensures atomic, cancellable URL transitions without route flickering or ghost history entries.

2. **Decoupled Authentication View (`LoginComponent`)**:
   - Presentation logic is strictly segregated from authentication mechanics: the component interacts solely with `FirebaseAuthService` via injected signals/observables.
   - The reactive form (`ReactiveFormsModule`) enforces immediate client-side validation feedback prior to dispatching network requests, preventing avoidable cloud function or auth endpoint load.
   - Transient UI states (loading spinner, submission disabled, error banners) are tracked explicitly, preventing duplicate submissions (idempotence) while providing clear cognitive feedback to reviewers.

3. **Enterprise Secrets Hygiene**:
   - Active Firebase configuration keys are isolated inside `src/environments/environment.ts` and `src/environments/environment.prod.ts`, which are strictly ignored by `.gitignore`.
   - `src/environments/environment.example.ts` acts as the committed schema blueprint with sanitized empty placeholder strings, preventing secret leaks into version control repositories.

---

## Phase 4: Customer Flight Intake Form, Data Boundary Vault & Defensive UX State Machine

### Prompt (Verbatim)
> Record this prompt verbatim in PROMPTS.md under Phase 4 with architectural rationale before proceeding.
>
> Implement the customer flight intake form in `src/app/features/flight-form/flight-form.component.ts` (standalone) adhering to the "Contract Invariance", "Separation of Presentation and Data", and "Defensive UX State Machine" principles:
>
> 1. Form Model & Validation Rules:
>    - Use Angular's `ReactiveFormsModule` (`FormBuilder` / `FormGroup`).
>    - Fields and explicit validators:
>      * `airline`: Validators.required, trimmed.
>      * `arrivalDate`: Validators.required (HTML `<input type="date">`, ensuring valid ISO/Date format).
>      * `arrivalTime`: Validators.required (HTML `<input type="time">`).
>      * `flightNumber`: Validators.required, auto-uppercase transform or formatted display.
>      * `numOfGuests`: Validators.required, Validators.min(1) (explicit integer validation).
>      * `comments`: optional.
>    - Show inline validation error messages under fields only when touched or dirty (e.g. "Airline is required", "Guests must be at least 1").
>
> 2. The "Data Boundary Vault" Transformation:
>    - In `onSubmit()`, do NOT pass raw form values directly to the service.
>    - Guarantee the shape and types of `FlightInfoPayload`:
>      * Cast `numOfGuests` strictly via `Number(val)`.
>      * Trim text fields (`airline`, `flightNumber`, `comments`).
>      * Omit `comments` or pass `undefined` if empty/whitespace.
>    - Hand the sanitized `FlightInfoPayload` to `FlightService.submitFlightInfo()`.
>
> 3. State Machine & Defensive Presentation UX:
>    - Manage state via explicit `SubmissionStatus`: `'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'`.
>    - When `'SUBMITTING'`:
>      * Disable the submit button and all form controls.
>      * Render an accessible loading spinner to prevent double submissions.
>    - When `'SUCCESS'`:
>      * Hide the intake form.
>      * Render an unambiguous, reassuring completion view: "Flight Details Received! You're all done."
>      * Provide two clear action buttons: "Submit Another Flight" (resets state to 'IDLE') and "Sign Out" (calls `FirebaseAuthService.logout()`).
>    - When `'ERROR'`:
>      * Render a prominent error banner: "Unable to submit flight details. Please verify your connection or try again."
>      * Keep form values intact so the user does not lose their typed information.
>      * Re-enable the submit button.
>
> 4. Layout & Header:
>    - Include a professional app header displaying the authenticated user's email and a clean "Sign Out" button.
>    - Style with responsive SCSS: clean cards, elevated inputs, legible typography, and clear visual hierarchy.
>
> 5. Automated Unit Tests (`src/app/features/flight-form/flight-form.component.spec.ts`):
>    - Test 1: Verify form is invalid when required fields are empty.
>    - Test 2: Verify `numOfGuests` validator rejects 0 or negative numbers.
>    - Test 3: Verify submit button is disabled when form is invalid or when status is 'SUBMITTING'.
>    - Test 4: Verify `onSubmit()` correctly casts `numOfGuests` to a number and passes the exact `FlightInfoPayload` contract to `FlightService`.
>    - Test 5: Verify successful submission switches view to the success screen with "You're all done" messaging.
>    - Test 6: Verify submission failure switches status to 'ERROR' and displays the error alert without clearing form inputs.
>
> 6. Verification & Git:
>    - Run `npm test -- --watch=false` to verify all tests pass.
>    - Run `ng build` to confirm production bundle compiles cleanly.
>    - Commit the changes:
>      `feat(form): implement reactive flight form with boundary validation, defensive ux states, and tests`
>
> Report back with test results, build confirmation, and git commit details.

---

### Architectural Decisions & Rationale (Phase 4)

Adhering to **Contract Invariance**, **Separation of Presentation and Data**, and **Defensive UX State Machine** principles:

1. **The "Data Boundary Vault" Transformation**:
   - User input from DOM form controls is inherently volatile (stringified numbers, extraneous whitespace, null vs undefined variations).
   - Rather than letting presentation anomalies cross the service boundary, the component acts as a sanitization vault: transforming and casting `numOfGuests` into strict numeric primitives (`Number(val)`), trimming strings, auto-casing flight identifiers, and pruning blank comments.
   - This guarantees that outgoing payloads are 100% compliant with the `FlightInfoPayload` enterprise contract before invoking `FlightService`.

2. **Defensive UX State Machine (`SubmissionStatus`)**:
   - Instead of juggling disjoint boolean flags (`isLoading`, `hasError`, `isSuccess`), the component models its UI cycle using an explicit finite state machine: `'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'`.
   - In `'SUBMITTING'`, form controls and submit actions are locked to enforce idempotency and prevent double submissions.
   - In `'SUCCESS'`, form fields are safely unmounted, preventing accidental edits and presenting an unambiguous confirmation message with clear onward navigation paths.
   - In `'ERROR'`, the form retains all previously entered data, mitigating cognitive frustration while offering retry capability.

3. **Separation of Presentation and Authentication/Data**:
   - The component delegates all data persistence to `FlightService` and session management to `FirebaseAuthService`.
   - Layout is encapsulated with modern responsive SCSS featuring clear input elevation, intuitive field-level validation feedback, and accessible semantic markup.

---

## Phase 5: Repository Finalization, Principles Documentation & Production Deployment

### Prompt (Verbatim)
> Record this prompt verbatim in PROMPTS.md under Phase 5 with architectural rationale before proceeding.
>
> We will now finalize the repository for submission, document the engineering principles, and deploy the application to Firebase Hosting:
>
> 1. Finalize Documentation (`README.md`):
>    - Create a clean, executive-ready README.md that includes:
>      * **Project Title & Overview:** Flight Information Intake System (Angular Standalone + Firebase).
>      * **Live Demo Link:** [Placeholder / Live Firebase URL once deployed].
>      * **Test Credentials for Reviewers:**
>        - Email: `reviewer@challenge.com`
>        - Password: `Challenge2026!`
>      * **Architecture & Engineering Principles:** Highlight Dave Farley's principles applied in this build: Loose Coupling, Separation of Concerns (Components vs. Services vs. Guards), Invariant Type Safety (TypeScript interfaces & boundary sanitization), and Fast Empirical Feedback (28 automated unit tests).
>      * **Prompt Audit Trail:** Explicitly point to `PROMPTS.md` as the complete record of prompt iterations and architectural decisions.
>      * **Local Development & Testing Instructions:** Steps to run `npm install`, `npm start`, and `npm test -- --watch=false`.
>
> 2. Production Build Verification:
>    - Run a final production build (`ng build --configuration production`) and verify zero errors or warnings.
>
> 3. Firebase Hosting Deployment:
>    - Verify `firebase.json` rewrites single-page application routes (`**` to `index.html`).
>    - Execute the deployment command (`firebase deploy --only hosting`). If login/auth token is required by the local CLI environment, document the exact command step or execute successfully.
>
> 4. Final Git Commit:
>    - Make the final commit:
>      `docs: finalize challenge documentation, prompt audit trail, and production deployment config`
>
> Report back with the final deployment URL, verification status, and git log summary.

---

### Architectural Decisions & Rationale (Phase 5)

Adhering to **Continuous Delivery**, **Traceability**, and **Production Operability**:

1. **Dave Farley's Engineering Principles Embodied**:
   - **Loose Coupling**: Components communicate with external systems exclusively through abstract, injectable services (`FlightService`, `FirebaseAuthService`). The persistence/cloud layer can be modified or mocked without altering view components.
   - **Separation of Concerns**: Security boundaries (`authGuard`), authentication views (`LoginComponent`), business domain workflows (`FlightFormComponent`), and transport mechanics (`FlightService`) reside in distinct, self-contained architectural modules.
   - **Invariant Type Safety**: TypeScript strict mode coupled with the "Data Boundary Vault" guarantees that only strictly validated and cast domain objects (`FlightInfoPayload`) penetrate beyond the presentation layer.
   - **Fast Empirical Feedback**: A suite of 28 fine-grained unit tests with Vitest provides sub-second feedback for every state transition, validation rule, error containment path, and guard redirect.

2. **Auditability & Provenance**:
   - `PROMPTS.md` maintains an unbroken, verbatim record of every engineering phase and prompt instruction, pairing requirements with architectural justifications.
   - `README.md` serves as the authoritative, executive-facing entry point for reviewers and maintainers.

3. **Deterministic Deployment**:
   - Production bundle output is verified against Angular strict budgets with zero warnings and zero errors.
   - `firebase.json` configures atomic SPA URL rewrites targeting `dist/monster-app/browser` for seamless client-side routing on Google Cloud global CDN infrastructure.

---

## Phase 6: Brand Title Refinement, Typography Unification & Public Intake Streamlining

### Prompt (Verbatim)
> Whatever font is being used for the 'Flight Intake System' header needs to be used as the only font on the entire site. Document this in the prompt logs too. You can also remove 'Evaluator Credentials' section entirely. Remove the string 'Access to the Flight Intake System is restricted to authorized candidates and evaluators.' entirely. Change 'Evaluator / Candidate Email' to 'Email'. Change 'Flight Intake System' to 'Enter Your Flight Info'

---

### Architectural Decisions & Rationale (Phase 6)

1. **Global Unified Typography Invariance**:
   - The primary brand header font stack (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`) was established as the single, universal typography across the entire DOM tree in `src/styles.scss`.
   - By eliminating disjoint font families, monospace overrides, and external web font dependencies, the application achieves visual harmony, instantaneous layout rendering, and zero cumulative layout shifts (CLS: 0).

2. **Streamlined Production Presentation (Zero Clutter)**:
   - Purged evaluation helper artifacts (such as the Evaluator Credentials card) and restrictive internal jargon from the login view to deliver a clean customer-facing production presentation.
   - Refined input affordances (`Email` instead of verbose compound labels) and elevated the brand title across the application to an active call-to-action: **"Enter Your Flight Info"**.

---

## Phase 7: Numeric Input Hardening & Exponential Notation Containment

### Prompt (Verbatim)
> For some reason the letter 'e' is a permitted text input in the 'Number of Guests' field

---

### Architectural Decisions & Rationale (Phase 7)

1. **HTML5 Scientific Notation Containment (`<input type="number">`)**:
   - By default in the HTML5 specification, `type="number"` inputs permit characters associated with exponential notation (`'e'`, `'E'`) and numeric signs (`'+'`, `'-'`, `'.'`). For integer-only business domains such as passenger/guest counts, permitting scientific notation introduces ambiguity and potential NaN/float anomalies.
   - Attached an explicit `(keydown)` gatekeeper (`blockInvalidNumberKeys`) to prevent the default action whenever `'e'`, `'E'`, `'+'`, `'-'`, or `'.'` keystrokes are received.
   - Configured `inputmode="numeric"` and `pattern="[0-9]*"` to prompt mobile and touch devices with standard numeric ten-key layouts.

2. **Clipboard Paste Sanitization**:
   - Added an `(paste)` handler (`onGuestsPaste`) that inspects clipboard data via the Clipboard API and cancels paste events containing non-digit strings, scientific notation, or decimals.

3. **Multi-Layer Defensive Enforcement (The Boundary Vault)**:
   - In accordance with the "Defensive Gatekeeper" principle, the UI input restrictions are backed by Angular Reactive Form step validation (`step="1"`, `min="1"`) with clear inline feedback (`"Guests must be a whole number."`).
   - Reinforced the underlying `FlightFormComponent.onSubmit()` Data Boundary Vault with runtime integer validation (`Number.isInteger(rawGuests) && rawGuests >= 1`), guaranteeing that only strictly verified, whole-number integer payloads are forwarded to `FlightService`.

---

## Phase 8: Defensive Validation Constraints & Input Boundary Hardening

### Prompt (Verbatim)
> Audit and reinforce client-side and boundary validation constraints across all FlightFormComponent inputs to prevent invalid or unrealistic user data:
> 
> 1. Audit & Test Existing Field Boundaries:
>    - Inspect existing validators in `src/app/features/flight-form/flight-form.component.ts`.
>    - Identify missing real-world constraints across `airline`, `flightNumber`, `arrivalDate`, `arrivalTime`, and `numOfGuests`.
> 
> 2. Implement Sensible Real-World Validation Rules:
>    - `arrivalDate`:
>      * Must not be in the past. Implement a custom Angular validator `futureDateValidator` ensuring `arrivalDate >= today` (midnight baseline).
>      * Set the HTML `min` attribute on the date input dynamically to today's date (`YYYY-MM-DD`) as a native UI guardrail.
>    - `numOfGuests`:
>      * Maintain `Validators.required` and `Validators.min(1)`.
>      * Add `Validators.max(20)` (reasonable upper threshold for an individual airport transfer booking).
>      * Add integer-only check (`Validators.pattern(/^[0-9]+$/)`) to reject decimals.
>      * Enforce HTML attributes: `min="1"` and `max="20"`.
>    - `flightNumber`:
>      * Standard airline flight number format pattern (e.g. 2-3 alphanumeric characters followed by 1-4 digits: `^[A-Za-z0-9]{2,3}\s?[0-9]{1,4}$`, e.g., "DL1234", "AA 452", "UA88").
>      * Max length constraint (e.g., max 10 characters).
>      * Auto-uppercase formatting upon blur or input.
>    - `airline`:
>      * Min length 2 characters, max length 50 characters (`Validators.minLength(2)`, `Validators.maxLength(50)`).
>      * Trim leading and trailing whitespace.
>    - `arrivalTime`:
>      * Ensure valid standard 24-hour / 12-hour format string (`HH:MM`).
> 
> 3. Accessible UX Feedback:
>    - Provide explicit, helpful inline error messages displayed when controls are touched or dirty:
>      * "Arrival date cannot be in the past."
>      * "Number of guests must be between 1 and 20."
>      * "Please enter a valid flight number (e.g., DL1234 or AA 452)."
>      * "Airline name must be between 2 and 50 characters."
> 
> 4. Automated Unit Test Verification:
>    - In `flight-form.component.spec.ts`, write dedicated unit tests verifying:
>      * A past arrival date marks `arrivalDate` invalid.
>      * Today's or a future arrival date marks `arrivalDate` valid.
>      * `numOfGuests` greater than 20 or less than 1 marks the form invalid.
>      * `flightNumber` rejects malformed strings and accepts valid airline flight identifiers.
>      * `airline` rejects 1-character names.
>    - Run `npm test -- --watch=false` to verify the entire test suite passes without regression.
> 
> 5. Production Build, Deploy, & Git:
>    - Execute production build: `ng build --configuration production`.
>    - Deploy to Firebase Hosting: `npm run firebase:deploy` (or `npx firebase deploy --only hosting`).
>    - Commit and push to GitHub:
>      `feat(form): implement defensive validation constraints and boundary limits across flight inputs`
>      `git push origin main`

---

### Architectural Decisions & Rationale (Phase 8)

1. **Temporal Domain Invariance (`futureDateValidator`)**:
   - Airport intake manifests represent future or immediate arrival logistics; allowing dates in the past is a domain violation.
   - Built a timezone-resilient `futureDateValidator` normalizing input dates to midnight (00:00:00 local time) and comparing against midnight today.
   - Paired reactive validation with the native HTML5 `[min]="todayDateString"` attribute to guide user selection via the browser picker interface before submission.

2. **Real-World Airline & Transfer Bounds**:
   - **`airline`**: Enforced `Validators.minLength(2)` and `Validators.maxLength(50)` with whitespace trimming on blur to prevent 1-letter abbreviations or blank-padded inputs.
   - **`flightNumber`**: Applied IATA/ICAO airline code regex pattern (`/^\s*[A-Za-z0-9]{2,3}\s?[0-9]{1,4}\s*$/`) and `Validators.maxLength(10)` to reject non-airline identifiers while accommodating optional intra-code spacing and uppercase transformation on blur and input.
   - **`numOfGuests`**: Bound transfer party sizes between 1 and 20 (`min(1)`, `max(20)`, pattern `/^[0-9]+$/`), preventing unrealistic capacity allocations.

3. **Two-Tiered Defensive Gatekeeper Architecture**:
   - **Presentation Layer**: Helpful, real-time accessible inline error indicators (`field-error`) surfaced only when inputs are dirty/touched.
   - **Data Boundary Vault (`onSubmit`)**: Completely re-validates and strictly casts all incoming payload values (ensuring date string format, non-past dates, time regex match, flight number pattern, and integer bounds) before the payload penetrates into `FlightService`.


