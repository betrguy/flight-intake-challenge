# Flight Information Intake System

> An enterprise-grade, production-ready Angular web application built with modern standalone architecture, strict TypeScript typing, reactive state machines, resilient HTTP communication, and modular Firebase integration.

---

## Live Demo & Reviewer Credentials

- **Live Application URL**: [https://albert-flight-challenge.web.app](https://albert-flight-challenge.web.app)
  *(Alternative domain: [https://albert-flight-challenge.firebaseapp.com](https://albert-flight-challenge.firebaseapp.com))*

### Evaluator Test Credentials
The authentication security perimeter restricts access to authorized evaluators. Use the following pre-configured credentials (or click the **Auto-fill** button directly on the login view):

| Parameter | Value |
| :--- | :--- |
| **Email** | `reviewer@challenge.com` |
| **Password** | `Challenge2026!` |
| **Role** | Evaluator / Authorized Candidate |

---

## Architectural Intent & Strategy (Pre-Prompt Synthesis)

Prior to writing code or executing generative prompts, we conducted a strategic design session to establish foundational production constraints. Enterprise software engineering is not about generating rapid, happy-path prototypes; it is fundamentally about managing failure modes, protecting domain invariants, and isolating volatility.

### 1. Operational Values & Real-World Constraints
- **Production Rigor Over Superficial Prototypes:** We recognized that software operating in enterprise environments must anticipate network instability, credential revocation, malformed inputs, and concurrency anomalies. Building software defensibly requires designing the system around failure scenarios before writing presentation logic.
- **Cost of Late Feedback:** Ad-hoc prompting ("vibecoding") defers integration errors to the end of the development lifecycle. By treating architecture as a deliberate engineering discipline, we front-loaded risk mitigation, interface definitions, and automated verification.

### 2. First Principles & Referenced Literature
Our pre-prompt synthesis was grounded in foundational engineering literature:
- **_Modern Software Engineering_ by Dave Farley:**
  Farley describes software engineering as having two essential pillars:
  1. **Managing Complexity:** Tackled through high cohesion, loose coupling, separation of concerns, and modularity. In this codebase, the persistence/cloud layer ([`FirebaseAuthService`](src/app/core/firebase/firebase-auth.service.ts)), transport layer ([`FlightService`](src/app/core/services/flight.service.ts)), perimeter authorization ([`authGuard`](src/app/core/guards/auth.guard.ts)), and user presentation ([`LoginComponent`](src/app/features/login/login.component.ts), [`FlightFormComponent`](src/app/features/flight-form/flight-form.component.ts)) are strictly decoupled.
  2. **Optimizing for Learning:** Achieved via fast empirical feedback. We established a localized, ESM-native Vitest testing harness capable of executing 41 unit tests in ~2.5 seconds, providing instantaneous feedback on every code mutation without spinning up external servers or manual browser loops.
- **_First, Break All the Rules_ by Marcus Buckingham & Curt Coffman:**
  Applying the core managerial thesis to system architecture:
  * **Focus on Outcomes, Not Just Steps:** The primary objective was a secure, resilient, and verifiable flight intake workflow. Rather than dictating brittle micro-steps, the architecture defines crystal-clear boundaries, responsibilities, and acceptance contracts for each module.
  * **Define Clear Boundaries & Strong Invariants:** Every component has unambiguous ownership. Presentation components do not manipulate HTTP headers or raw transport protocols; services do not manipulate UI states. Clear boundaries ensure maintainers play to architectural strengths without leaking adjacent concerns.

### 3. The Meta-Prompting Philosophy (Architect vs. Vibecoder)
The prompt sequence in [`PROMPTS.md`](PROMPTS.md) was designed deliberately **"inside-out"**, contrasting sharply with opportunistic AI code generation:
- **Contract-First Modeling:** Domain models ([`FlightInfoPayload`](src/app/core/models/flight-info.model.ts), [`SubmissionStatus`](src/app/core/models/flight-info.model.ts), [`FlightSubmissionResponse`](src/app/core/models/flight-info.model.ts)) and HTTP service layers were specified and tested *before* building UI templates.
- **The "Data Boundary Vault":** Client-side DOM inputs are inherently volatile (e.g. numeric input fields emitting strings, whitespace artifacts). The presentation layer acts as a strict sanitization vault: transforming and strictly casting types (e.g., `Number(val)` for guests, auto-uppercase for flight numbers, pruning empty comments) before dispatching to the domain service.
- **Defensive Finite State Machines:** Instead of error-prone disjoint boolean flags (`isLoading`, `isError`), views operate on explicit finite states (`IDLE` -> `SUBMITTING` -> `SUCCESS` | `ERROR`), preventing duplicate submissions (idempotency) and ensuring deterministic recovery.
- **Cryptographic & Perimeter Security:** Relying on cryptographic tokens (Firebase Auth JWTs) and automated router gatekeepers ([`authGuard`](src/app/core/guards/auth.guard.ts)) rather than cosmetic visual toggles.

---

## Architectural Highlights & Engineering Principles

Adhering to Dave Farley's principles throughout the application implementation:

### 1. Loose Coupling
- Components never couple to external transport APIs or Firebase SDK internals directly.
- The cloud backend and HTTP protocols are encapsulated behind abstract Angular injectable services:
  - [`FlightService`](src/app/core/services/flight.service.ts) encapsulates endpoint URLs, candidate identifiers, and secret inspection token headers.
  - [`FirebaseAuthService`](src/app/core/firebase/firebase-auth.service.ts) encapsulates Firebase authentication instances, reactive Angular Signals (`currentUser`, `isAuthenticated`), and session lifecycles.
- Swapping the transport layer, data persistence, or authentication provider does not require modifying view components.

### 2. Separation of Concerns
- **Defensive Route Guard Boundary**: [`authGuard`](src/app/core/guards/auth.guard.ts) operates as a gatekeeper at router transitions, evaluating session validity and executing atomic redirects to `/login` via `UrlTree`.
- **Authentication Presentation**: [`LoginComponent`](src/app/features/login/login.component.ts) manages credential capture, client-side format validation, transient UI loading states, and localized error banner feedback.
- **Business Domain Workflow**: [`FlightFormComponent`](src/app/features/flight-form/flight-form.component.ts) handles customer flight registration, party guest count enforcement, and post-submission lifecycle views.
- **Contract & Domain Isolation**: Core contracts reside strictly in [`src/app/core/models/flight-info.model.ts`](src/app/core/models/flight-info.model.ts).

### 3. Invariant Type Safety & "The Data Boundary Vault"
- Full TypeScript compiler strictness (`strict: true`, `strictTemplates: true`, `noImplicitOverride: true`).
- Presentation form controls can produce volatile DOM strings (e.g. numeric inputs returning string values, untrimmed whitespace). 
- Prior to dispatching network requests, [`FlightFormComponent`](src/app/features/flight-form/flight-form.component.ts) acts as a sanitization vault:
  - Prunes and trims strings (`airline`, `flightNumber`).
  - Guarantees uppercase formatting on flight codes.
  - Strictly casts `numOfGuests` to a numeric primitive (`Number(val)`).
  - Normalizes empty/whitespace comments to `undefined`.
- The outgoing payload strictly conforms to the invariant [`FlightInfoPayload`](src/app/core/models/flight-info.model.ts) domain contract.

### 4. Fast Empirical Feedback (Automated Test Suite)
- Built with **Vitest** and **JSDOM**, running an automated suite of **35 unit tests** in **~2.5 seconds**:
  - `auth.guard.spec.ts`: Verifies route activation allowance and unauthorized redirection.
  - `login.component.spec.ts`: Validates input validation, auth delegation, and route navigation.
  - `flight-form.component.spec.ts`: Tests form validation rules, guest boundary bounds, submission locking, and success/error view rendering.
  - `flight.service.spec.ts`: Utilizes `HttpTestingController` to verify HTTP verbs, headers (`candidate`, `token`), body payloads, and 4xx/5xx network error containment.
  - `firebase-auth.service.spec.ts`: Verifies authentication session state signals and error handling.
  - `app.spec.ts`: Validates root router outlet rendering and end-to-end route redirections.

---

## Prompt Audit Trail

Every engineering requirement, architectural choice, and implementation decision has been recorded verbatim in:
👉 **[`PROMPTS.md`](PROMPTS.md)**

It documents:
- **Phase 1**: Initial project setup, strict type checking, comprehensive `.gitignore`, Vitest harness, and modular Firebase initialization.
- **Phase 2**: Flight domain contract, Base64 token header integration, and resilient HTTP data service with `catchError` containment.
- **Phase 3**: Active Firebase project credentials, functional `authGuard` gatekeeper, and responsive `LoginComponent`.
- **Phase 4**: Reactive flight intake form, Data Boundary Vault sanitization, and finite state machine (`IDLE` -> `SUBMITTING` -> `SUCCESS` | `ERROR`).
- **Phase 5**: Documentation finalization, principles synthesis, and production deployment configuration.
- **Phase 6**: Brand title refinement ("Enter Your Flight Info"), unified typography invariance, and public intake streamlining.
- **Phase 7**: Numeric input hardening, exponential notation containment (`e`, `E`, `+`, `-`, `.`), clipboard paste sanitization, and integer boundary vault enforcement.

---

## Project Structure

```text
monster-dev/
├── .firebaserc                          # Firebase project configuration (albert-flight-challenge)
├── .gitignore                           # Enterprise git-ignore rules (excluding secrets & artifacts)
├── angular.json                         # Build configurations & style budgets
├── firebase.json                        # Firebase Hosting & SPA rewrite routing
├── package.json                         # Dependencies & test/build scripts
├── PROMPTS.md                           # Verbatim prompt log & architectural rationale
├── README.md                            # Project documentation & review guide
├── tsconfig.json                        # Strict TypeScript compiler options
└── src/
    ├── main.ts                          # Standalone application bootstrap
    ├── styles.scss                      # Global styles
    ├── environments/                    # Environment configurations
    │   ├── environment.example.ts       # Public schema blueprint
    │   ├── environment.model.ts         # Strongly-typed environment contract
    │   ├── environment.prod.ts          # Active production config (git-ignored)
    │   └── environment.ts               # Active local dev config (git-ignored)
    └── app/
        ├── app.component.html           # Root application template (<router-outlet></router-outlet>)
        ├── app.config.ts                # Application providers (HttpClient, Router, Firebase)
        ├── app.routes.ts                # Route definitions & security guard attachments
        ├── core/
        │   ├── firebase/                # Firebase DI tokens & authentication service
        │   ├── guards/                  # Route guard security boundary (authGuard)
        │   ├── models/                  # Domain contracts (FlightInfoPayload, SubmissionStatus)
        │   └── services/                # Resilient HTTP data service (FlightService)
        └── features/
            ├── login/                   # Authentication view (LoginComponent)
            └── flight-form/             # Flight intake form (FlightFormComponent)
```

---

## Local Development & Testing Instructions

### 1. Prerequisites
- **Node.js**: `v20.x` or `v24.x` (Engine tested on Node v24.14.0)
- **npm**: `v10.x` or `v11.x`

### 2. Setup
Clone the repository and install dependencies:
```bash
git clone https://github.com/betrguy/flight-intake-challenge.git
cd "monster dev"
npm install
```

### 3. Running Unit Tests
Execute the entire 35-test automated suite via Vitest:
```bash
# CI single-pass mode
npm test -- --watch=false

# Or via npm script alias
npm run test:ci
```

### 4. Local Development Server
Launch the development server:
```bash
npm start
# or
npx ng serve
```
Navigate to `http://localhost:4200/`. The application will automatically reload upon code modification.

### 5. Production Build
Compile optimized production assets:
```bash
npm run build
```
Build output is emitted to `dist/monster-app/browser` with zero warnings and zero budget violations.

### 6. Firebase Deployment
To deploy the compiled application to Firebase Hosting:
```bash
# 1. Authenticate with Firebase (if not previously logged in on the machine)
npx firebase login

# 2. Deploy to Firebase Hosting
npm run firebase:deploy
# (runs 'ng build' followed by 'firebase deploy --only hosting')
```
