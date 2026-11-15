# Instant Percentage Calculator (MERN Stack)

A lightning-fast, production-ready, minimalist **Instant Percentage Calculator** built using the **MERN** stack (MongoDB, Express.js, React 19, Node.js v22) with TypeScript and Tailwind CSS.

## 🚀 Key Features

- **Instant Real-Time Calculation**: Mathematical calculation `(Number × Percentage) / 100` executes entirely in-browser with zero latency as the user types.
- **Strictly 3 Fields**:
  1. `Number` (Editable, placeholder: "Enter Number", accepts integers, decimals, negatives)
  2. `Percentage (%)` (Editable, placeholder: "Enter Percentage (%)", accepts values > 100)
  3. `Answer` (Read-only, automatically computed, strictly non-editable)
- **100% Blank Initial State**: No prefilled sample numbers, no default answer.
- **Zero Flaws & Floating-Point Safety**: Powered by `big.js` arbitrary precision arithmetic. Never displays `NaN`, `Infinity`, or precision artifacts (e.g. `99 × 12.5% = 12.375`). Formats up to 8 decimal places with automatic trailing zero stripping.
- **One Minimal Clear Button**: Resets all three fields to blank and refocuses Number input without page reloads.
- **Context-Aware Copy Action**: Appears beside the answer *only* when a valid answer is present, with tactile feedback ("Copied to clipboard").
- **Clean SaaS UI/UX**: Dark glassmorphic design, JetBrains Mono numbers, responsive mobile-first layout with `inputMode="decimal"` for mobile keyboards.
- **MERN Architecture**: Full Express.js REST API with MongoDB connection via Mongoose, providing health check (`/api/health`) and telemetry (`/api/info`).

---

## 🏗️ Architecture

```
calculator/
├── client/                      # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calculator.tsx   # Core calculator component & state
│   │   │   ├── InputField.tsx   # Sanitized numeric input component
│   │   │   ├── AnswerField.tsx  # Read-only answer display & copy action
│   │   │   └── Calculator.test.tsx # Component DOM & interaction tests
│   │   ├── utils/
│   │   │   ├── calculator.ts    # Arbitrary-precision math engine
│   │   │   └── calculator.test.ts # Math & edge case test suite
│   │   ├── App.tsx              # Main layout & MERN health check
│   │   ├── main.tsx
│   │   └── index.css            # Tailwind CSS styling
│   ├── vite.config.ts
│   └── package.json
├── server/                      # Node.js + Express.js + Mongoose (REST API)
│   ├── src/
│   │   ├── config/db.js         # MongoDB connection handler
│   │   ├── models/AppMetadata.js# Mongoose application model
│   │   ├── routes/apiRoutes.js  # /api/health and /api/info endpoints
│   │   └── server.js            # Express server & static asset host
│   ├── .env
│   └── package.json
├── legacy-calculator/           # Preserved previous static files
├── package.json                 # Unified workspace root scripts
└── README.md
```

---

## 🧪 Verified Test Matrix (39/39 Passing)

| Test Case | Number | Percentage | Expected Answer | Result |
|---|---:|---:|---:|:---:|
| Standard 1 | 100 | 50 | 50 | ✅ PASS |
| Standard 2 | 500 | 20 | 100 | ✅ PASS |
| Standard 3 | 2500 | 10 | 250 | ✅ PASS |
| Standard 4 | 1000 | 75 | 750 | ✅ PASS |
| Percentage > 100 | 200 | 150 | 300 | ✅ PASS |
| Decimal calculation | 99 | 12.5 | 12.375 | ✅ PASS |
| Zero number | 0 | 50 | 0 | ✅ PASS |
| Zero percentage | 100 | 0 | 0 | ✅ PASS |
| Both zero | 0 | 0 | 0 | ✅ PASS |
| Both fields blank | "" | "" | "" (blank) | ✅ PASS |
| Only Number filled | 100 | "" | "" (blank) | ✅ PASS |
| Only Percentage filled | "" | 50 | "" (blank) | ✅ PASS |
| Negative number | -100 | 50 | -50 | ✅ PASS |
| Negative percentage | 100 | -50 | -50 | ✅ PASS |
| Both negative | -200 | -150 | 300 | ✅ PASS |
| Small decimals | 0.5 | 2.5 | 0.0125 | ✅ PASS |
| Large numbers | 1,000,000,000 | 15 | 150,000,000 | ✅ PASS |
| Precision limit | 1 | 0.33333333 | 0.00333333 | ✅ PASS |
| Typing intermediate `-` | "-" | 50 | "" (blank) | ✅ PASS |
| Typing intermediate `.` | "." | 50 | "" (blank) | ✅ PASS |
| Invalid strings | "abc" | 50 | "" (blank) | ✅ PASS |

---

## 🛠️ Running the Application

### 1. Start Both Frontend & Backend Concurrently
```bash
npm run dev
```
- **React Frontend**: [http://localhost:5173](http://localhost:5173)
- **Express Backend**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 2. Run the Test Suite
```bash
npm test
```
Executes all 39 Vitest unit and React Testing Library integration tests.

### 3. Build for Production
```bash
npm run build
```
Creates production-optimized distribution files in `client/dist`. The Express server (`server/src/server.js`) can serve these directly in unified mode on port 5000.
