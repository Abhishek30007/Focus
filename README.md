# FocusFlow 🧘‍♂️⚡

> **A Neuro-Wellness and Meditation Platform Combining Ancient Vedic Traditions, Real-Time Biomarkers, and Google Gemini AI.**

[![Playwright Tests](https://img.shields.io/badge/playwright-26%2B%20suites%20passing-brightgreen)](https://playwright.dev/)
[![Coverage](https://img.shields.io/badge/coverage-85%25%2B%20Istanbul-blue)](https://istanbul.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Quick Links
- 📘 [Full System Architecture & Engineering Documentation](file:///c:/Users/BIT/focusFlow/docs/SYSTEM_DOCUMENTATION.md)
- 🌐 [GitHub Repository](https://github.com/Abhishek30007/Focus.git)
- 💻 Local Frontend: [http://localhost:5173](http://localhost:5173)
- 🔌 Local API: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🌟 Core Highlights

1. **Vedic Traditions Engine (SOLID Strategy Pattern)**
   - **Pranayama**: Autonomic regulation via rhythmic breath control (*Nadi Shodhana*, Box Breathing).
   - **Vipassana**: Somatosensory awareness and Default Mode Network (DMN) down-regulation.
   - **Yoga Nidra**: Guided psychic sleep (*Shavasana* & 61 Marma points) facilitating theta/delta brainwave states.
   - **Trataka**: Fixed-gaze optical stillness (*Ekagrata*) on a central bindu reducing saccadic jitter.

2. **Google Gemini Prompt Workflows**
   - Vedic Guru + Neuro-Wellness prompt engineering producing structured session schemas.
   - Dynamic real-time breathwork pacer calculation based on Heart Rate & HRV.
   - Clinical post-session cognitive and physiological recovery summaries.

3. **Enterprise Security & Dual-Token Architecture**
   - Passwords hashed with `bcryptjs` (salt rounds: 12).
   - 15-minute Access Token (memory) + 7-day Refresh Token (database tracked).
   - Silent token rotation via `httpOnly`, `SameSite=Strict` cookies and automatic Axios response interceptors.

4. **Rigorous Quality & Coverage**
   - 26 Playwright E2E test suites across 6 categories.
   - Cross-browser coverage: Desktop Chrome, Firefox, Safari/WebKit, iPhone 13, Pixel 5.
   - Istanbul / NYC coverage instrumentation extracted from `window.__coverage__`.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas)

### 2. Install Dependencies
```bash
git clone https://github.com/Abhishek30007/Focus.git
cd Focus
npm install
npm run install:all
```

### 3. Launch Services
```bash
# Start backend API (port 5000)
npm run start:backend

# Start frontend UI (port 5173)
npm run start:frontend
```

### 4. Run Tests & Coverage
```bash
# Run tests in Chromium
npm run test:chromium

# Run full cross-browser test matrix
npx playwright test

# Generate code coverage report
npm run test:coverage
```

For complete architectural details, REST API documentation, and database schemas, see [docs/SYSTEM_DOCUMENTATION.md](file:///c:/Users/BIT/focusFlow/docs/SYSTEM_DOCUMENTATION.md).
