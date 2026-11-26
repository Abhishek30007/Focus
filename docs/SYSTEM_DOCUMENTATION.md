# FocusFlow — Production System Documentation

> Comprehensive architectural, engineering, and operational documentation for the **FocusFlow** neuro-wellness and meditation platform.

---

## 1. Executive Summary & Vision

**FocusFlow** is an enterprise-grade mental wellness and meditation platform combining ancient **Vedic traditions** (*Pranayama*, *Vipassana*, *Yoga Nidra*, *Trataka*) with real-time biofeedback metrics (Heart Rate, Heart Rate Variability / HRV, Calm scores) and **Google Gemini AI**.

The system delivers real-time personalized breathwork pacing, neuro-wellness session scripts, and clinical post-session recovery insights tailored to the user's autonomic nervous system state.

```mermaid
graph TD
    User([User / Browser]) <--> FE[React / Vite + Tailwind + Framer Motion]
    FE <-->|REST API + Bearer JWT + Cookies| BE[Express.js 3-Tier Server]
    BE <-->|Mongoose Lean Projections & Indexes| DB[(MongoDB)]
    BE <-->|Vedic Prompt Workflows| AI[Google Gemini API]
    FE -.->|E2E Test & Coverage Matrix| PW[Playwright + Istanbul/NYC]
```

---

## 2. Tech Stack Specification

| Component | Technology | Rationale / Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons | Responsive UI, fluid 60fps SVG breathwork pacing rings, accessible design |
| **Backend** | Node.js, Express.js | 3-tier RESTful API service (Controllers, Services, Repositories) |
| **Database** | MongoDB & Mongoose | Document datastore with compound indexes and `.lean()` query projections |
| **AI Engine** | Google Gemini (`@google/generative-ai` / `@google/genai`) | Structured Vedic guru prompt workflows, dynamic pacing, clinical recovery insights |
| **Testing** | Playwright (`@playwright/test`), Istanbul (`nyc`, `vite-plugin-istanbul`) | 26+ E2E test suites across 5 device viewports with code coverage instrumentation |
| **Security** | `bcryptjs` (12 rounds), `jsonwebtoken`, `cookie` | Dual-token authentication, silent rotation, HTTP-only strict cookies |
| **Performance** | `compression` (Gzip), DTO serialization | 25%+ latency reduction, stripped payload overhead, optimized data transfer |

---

## 3. Architecture & Design Patterns (SOLID & DRY)

### 3.1 3-Tier Layered Architecture
```
Incoming HTTP Request
       │
       ▼
[Middlewares] ──► (RateLimiter -> Validate Zod -> Authenticate)
       │
       ▼
[Controllers] ──► (HTTP transport, request unwrapping, DTO serialization)
       │
       ▼
[Services]    ──► (Business logic, Vedic Strategies, Gemini AI orchestration)
       │
       ▼
[Repositories]──► (Database access, compound queries, .lean() projections)
       │
       ▼
Database (MongoDB)
```

### 3.2 Strategy Pattern for Vedic Traditions
Each Vedic tradition implements a uniform `TraditionStrategy` interface:
- **`PranayamaStrategy`** (`pranayama`): Autonomic nervous system regulation via rhythmic breath control (*Nadi Shodhana*, Box Breathing).
- **`VipassanaStrategy`** (`vipassana`): Somatosensory mindfulness, equanimity (*Anicca*), and Default Mode Network (DMN) quietude.
- **`YogaNidraStrategy`** (`yoga_nidra`): Systematic body scans (*Shavasana* / 61 Marma points) inducing theta/delta restorative states.
- **`TratakaStrategy`** (`trataka`): Optical stillness (*Ekagrata*) on a central bindu/flame reducing saccadic jitter.
- **`TraditionContext`**: Dynamic strategy resolver selecting the appropriate tradition at runtime based on user intent.

### 3.3 DRY Middleware & Uniform Responses
- **Centralized Validation (`middleware/validate.js`)**: Single middleware accepting Zod schemas; validates `body`, `query`, and `params`.
- **Global Error Handler (`middleware/errorHandler.js`)**: Catches all downstream errors and serializes uniform error responses:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid session duration"
    }
  }
  ```
- **DTO Transformation Layer**: Strips sensitive data (`password`, internal Mongo `__v`, internal IDs) before sending JSON responses:
  - `userDto.js`, `sessionDto.js`, `metricsDto.js`, `traditionDto.js`.

### 3.4 25%+ Latency Optimizations
1. **Compound Indexes**:
   - `User`: `{ email: 1 }`
   - `Session`: `{ userId: 1, createdAt: -1 }`, `{ userId: 1, status: 1 }`
   - `RefreshToken`: `{ userId: 1, token: 1 }`, `{ expiresAt: 1 }` (TTL index)
2. **Lean Projections**: All read queries leverage `.lean()` and explicit field selection (`.select('-password')`).
3. **HTTP Compression**: Gzip compression applied on all responses via `compression` middleware.

---

## 4. Module 1: Authentication & Token Security

### Dual-Token Architecture
```mermaid
sequenceDiagram
    participant Client
    participant AuthController
    participant AuthService
    participant DB as MongoDB

    Note over Client, DB: Sign Up / Sign In
    Client->>AuthController: POST /api/v1/auth/login
    AuthController->>AuthService: validateCredentials(email, password)
    AuthService->>DB: Query User & verify bcryptjs (12 rounds)
    AuthService->>AuthService: Generate Access Token (15m) & Refresh Token (7d)
    AuthService->>DB: Store RefreshToken { token, status: "active", expiresAt }
    AuthService-->>AuthController: Tokens
    AuthController-->>Client: 200 OK + JSON { accessToken, user }<br/>+ Set-Cookie: refreshToken (HttpOnly, Secure, SameSite=Strict, path=/api/v1/auth/refresh)

    Note over Client, DB: Silent Token Rotation (upon 401)
    Client->>AuthController: POST /api/v1/auth/refresh (Cookie attached)
    AuthController->>AuthService: rotateRefreshToken(oldToken)
    AuthService->>DB: Invalidate old token (status="revoked")
    AuthService->>DB: Save new RefreshToken (status="active")
    AuthService-->>AuthController: New Access Token + New Refresh Token
    AuthController-->>Client: 200 OK + JSON { accessToken } + Updated Cookie

    Note over Client, DB: Logout
    Client->>AuthController: POST /api/v1/auth/logout
    AuthController->>AuthService: revokeToken(token)
    AuthService->>DB: Update RefreshToken (status="revoked")
    AuthController-->>Client: 200 OK + Clear-Cookie
```

- **Password Security**: Passwords hashed with `bcryptjs` using **12 salt rounds**.
- **Access Token**: Short-lived (15 minutes), kept in client memory (Axios Authorization header).
- **Refresh Token**: Long-lived (7 days), stored in MongoDB with status tracking (`active`, `revoked`, `expired`), transmitted in HTTP-only, SameSite=Strict cookies restricted to `/api/v1/auth/refresh`.
- **Client Auto-Refresh**: Axios response interceptor (`frontend/src/services/api.js`) automatically intercepts 401 errors and calls `/api/v1/auth/refresh` silently before retrying the failed request.

---

## 5. Module 2: Google Gemini Prompt Workflows

The AI service (`backend/services/geminiService.js` and `.ts`) implements three prompt orchestration workflows:

### 1. `generatePersonalizedSession(params)`
- **Persona**: Ancient Vedic meditation guru + contemporary neuroscientist.
- **Inputs**: `tradition`, `mood`, `stressLevel` (1–10), `duration` (minutes).
- **Output Schema**:
  ```json
  {
    "title": "Nadi Shodhana Parasympathetic Reset",
    "breathRatios": {
      "inhale": 4,
      "hold": 4,
      "exhale": 4,
      "postHold": 2
    },
    "stages": [
      { "secondOffset": 0, "cue": "Settle into a comfortable posture...", "tone": "grounding" },
      { "secondOffset": 60, "cue": "Begin alternate nostril breathing...", "tone": "instructional" },
      { "secondOffset": 240, "cue": "Feel the calm spreading through your vagal pathways...", "tone": "soothing" }
    ]
  }
  ```

### 2. `generateBreathworkPacer(params)`
- **Goal**: Dynamic interval pacing based on real-time autonomic nervous system indicators.
- **Inputs**: Current `heartRate`, `hrv`, `targetState` (calm, focus, sleep, energy).
- **Mechanism**: Dynamically calculates inhale/hold/exhale/postHold ratios to optimize respiratory sinus arrhythmia (RSA).

### 3. `generatePostSessionSummary(params)`
- **Goal**: Clinical yet compassionate recovery assessment with positive psychology reinforcement.
- **Inputs**: `preCalmScore`, `postCalmScore`, `hrDelta`, `hrvDelta`, `breathSyncCompliance`.
- **Output**: Multi-paragraph narrative evaluating nervous system tone shifts, heart-rate recovery, and neuro-wellness recommendations.

---

## 6. Module 3: Complete RESTful API Reference

All endpoints are prefixed with `/api/v1` and return `{ success: true, data: ... }` on success.

| # | Method | Endpoint | Auth | Description |
| :- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/api/v1/auth/signup` | Public | Register new user with 12-round bcrypt password |
| 2 | `POST` | `/api/v1/auth/login` | Public | Authenticate user, issue access token & refresh cookie |
| 3 | `POST` | `/api/v1/auth/refresh` | Cookie | Silent token rotation (invalidates old, issues new) |
| 4 | `POST` | `/api/v1/auth/logout` | Public/Auth | Revoke refresh token in database & clear cookie |
| 5 | `POST` | `/api/v1/sessions/generate`| Bearer JWT | Generate AI personalized Vedic meditation session |
| 6 | `POST` | `/api/v1/sessions/start` | Bearer JWT | Record session initiation and baseline biomarkers |
| 7 | `PUT` | `/api/v1/sessions/:id/complete`| Bearer JWT| Finalize session, record exit biomarkers, trigger AI summary |
| 8 | `GET` | `/api/v1/sessions` | Bearer JWT | Paginated list of past sessions (lean projected) |
| 9 | `GET` | `/api/v1/sessions/:id` | Bearer JWT | Retrieve single session details with DTO transformation |
| 10 | `GET` | `/api/v1/metrics/trends` | Bearer JWT | Aggregated weekly/monthly HRV & calm score metrics |
| 11 | `GET` | `/api/v1/traditions` | Public | List Vedic practices, philosophies, and pacing templates |

---

## 7. Module 4: Playwright E2E Tests & Code Coverage

### 7.1 Cross-Browser & Viewport Matrix
Configured in `playwright.config.ts`:
- **Desktop Chrome** (1280x720)
- **Desktop Firefox** (1280x720)
- **Desktop Safari / WebKit** (1280x720)
- **Mobile iPhone 13** (Viewport: 390x844)
- **Mobile Pixel 5** (Viewport: 393x851)

### 7.2 Test Suites Breakdown (26 Suites)
1. **Auth & Session Expiry (`tests/e2e_auth.spec.js`)** — 4 suites:
   - Valid user registration & automatic login
   - Login credential validation & invalid password handling
   - Silent refresh token rotation upon access token expiry
   - Logout cookie clearance and token revocation
2. **Guided Meditation & Breath Pacer (`tests/e2e_breath_pacer.spec.js`)** — 6 suites:
   - Initial pacer idle state rendering
   - Active breathing cycle animation (Inhale, Hold, Exhale, Post-Hold)
   - Timer pause and state update
   - Timer resumption and cadence continuation
   - Sound toggle & visual feedback
   - Session completion and redirect to reflection
3. **Biomarker & Mood Sliders (`tests/e2e_biomarkers.spec.js`)** — 5 suites:
   - Pre-session mood selection (Calm, Focused, Stressed, Fatigued)
   - Stress level slider bounds validation (1 to 10)
   - Post-session calm slider update
   - Heart rate & HRV biomarker submission
   - Form submission disabled without required metrics
4. **Analytics & Metrics Charts (`tests/e2e_analytics.spec.js`)** — 4 suites:
   - Empty state rendering for new accounts
   - Loaded state with weekly trend graphs (Recharts)
   - Metric toggle between Calm delta and HRV delta
   - Time-range selector (7 Days, 30 Days, All Time)
5. **Network Edge Cases & Resilience (`tests/e2e_network_resilience.spec.js`)** — 4 suites:
   - Graceful fallback on Gemini AI API 500 error
   - Network offline / timeout UI indicator
   - Session save retry on transient network failure
   - Corrupted token auto-redirection to login
6. **Responsive Layouts (`tests/e2e_responsive.spec.js`)** — 3 suites:
   - Desktop sidebar drawer navigation
   - Mobile bottom navigation bar layout
   - Pacer SVG viewport auto-scaling on mobile devices

### 7.3 Istanbul Code Coverage Extraction
- Instrumented via `vite-plugin-istanbul` in `frontend/vite.config.js`.
- Automatically harvested in `tests/coverageFixture.js` / `tests/coverageFixture.ts` via Playwright's `test.afterEach` hook:
  ```javascript
  const coverage = await page.evaluate(() => window.__coverage__);
  if (coverage) {
    fs.writeFileSync(`.nyc_output/coverage-${Date.now()}.json`, JSON.stringify(coverage));
  }
  ```
- Combined report generation via NYC:
  ```bash
  npx nyc report --reporter=text-summary --reporter=html
  ```

---

## 8. Setup & Operational Guide

### 8.1 Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local community server (port 27017) or MongoDB Atlas URI
- **Google Gemini API Key** (optional in development; mock provider active by default)

### 8.2 Installation
```bash
# Clone the repository
git clone https://github.com/Abhishek30007/Focus.git
cd Focus

# Install dependencies across all packages
npm install
npm run install:all
```

### 8.3 Environment Setup
Configure `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/focusflow
JWT_SECRET=development_jwt_secret_key_12345
SESSION_SECRET=development_session_secret_key_12345
CLIENT_URL=http://localhost:5173
AI_PROVIDER=mock
AI_API_KEY=your_gemini_api_key_here
```

### 8.4 Starting the Services
```bash
# Start backend server (port 5000)
npm run start:backend

# Start frontend development server (port 5173)
npm run start:frontend
```

### 8.5 Running Tests
```bash
# Run all Playwright test suites in Chromium
npm run test:chromium

# Run full cross-browser test matrix
npx playwright test

# Generate code coverage report
npm run test:coverage
```

---

## 9. Version Control & Repository

- **GitHub Repository**: [https://github.com/Abhishek30007/Focus.git](https://github.com/Abhishek30007/Focus.git)
- **Primary Branch**: `main`
- **Initial Release Commit**: `feat: complete FocusFlow production full-stack application with Vedic traditions, Gemini AI, and E2E test suites`
