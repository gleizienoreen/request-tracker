# PHINMA Araullo University — Academic Service Request Tracker

A complete React + Vite + Tailwind CSS web application for the **PHINMA Araullo University Student Portal — Academic Services** (ITE 381 IT Business Solution | Period 2 Requirements).

## Project Documentation & Authors
- **Ruzzel Henry H. Eugenio** (`01-2324-043261`)
- **Grace J. Sangil** (`01-2324-040460`)
- **Gleizie Noreen M. Estipular** (`01-2223-036316`)
- **Submitted to:** Evelyn Salibio Juliano (Subject Teacher)

## Supported Screens & Interactive Paths

### 1. Screens (Direct Sidebar Access & Full Flow Navigation)
1. **My Requests** — Displays both the initial empty state (`No requests yet`) and the populated list of submitted requests with search, status filters (`All`, `Under Review`, `Approved`), and one-click preview of the empty state.
2. **New Request** — Complete form with `Document / Service *`, `Purpose *`, and `Contact Email *`.
3. **Missing Information** — Supports:
   - **Red Error State** (`Missing required information` alert banner & field validation when `Purpose` is empty)
   - **Green Completed State** (`All required fields are complete` banner & green border when `Purpose` is entered)
   - **Edit Your Request Modal** (Triggered via the `Edit Full Form` button)
4. **Submission Success** — Generates a sequential reference number (starting with `COE-2026-001`) and displays the request summary and `View Request Status >` button.
5. **Under Review** — Displays `Request Details`, `WHAT HAPPENS NEXT` steps, and the `PROTOTYPE CONTROL — INSTRUCTOR USE` box (`Advance to Approved >` and `Follow Up`).
6. **Approved** — Displays `Request Approved` confirmation, the 4-step `NEXT STEPS — HOW TO CLAIM YOUR DOCUMENT` guide with the quoted reference number, and `< Back to My Requests`.

### 2. Interactive Paths
- **Happy Path:** `My Requests` → `New Request` → complete fields → `Submit Request` → `Submission Success` → `View Request Status` → `Under Review` → `Advance to Approved` → `Approved` → `Back to My Requests`.
- **Alternate Path:** `New Request` → `Submit Request` with `Purpose` empty → `Missing Information` (Red Error State) → `Edit Full Form` (opens `Edit Your Request` modal) or type directly in `Purpose` (Green Complete State) → `Submit Request` → `Submission Success`.
- **Registrar Staff Panel:** Click `Registrar Staff Panel` in the top header to review all student requests and toggle their statuses between `Under Review` and `Approved`.

## Getting Started

```bash
npm install
npm run dev
```

