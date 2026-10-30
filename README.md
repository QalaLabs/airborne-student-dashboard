# Airborne Aviation Academy — Cadet Flight Operations Portal

> **"From Dream to Cockpit"**  
> Official cadet portal and flight deck operations management platform for **Airborne Aviation Academy** (Dwarka Campus, New Delhi), built in strict compliance with the **Airborne Brand Book 2026** and DGCA Civil Aviation Requirements (CAR).

---

## Overview

The **Airborne Aviation Student Dashboard** is a mission-critical web application serving pilot cadets, flight instructors, and operations commanders. It unifies DGCA ground school academic tracking, biometric-geofenced attendance logging, tuition accounting, real-time timetable dispatch, and 24/7 AI-powered flight mentoring via **AeroBot Copilot**.

---

## Key Features

### 1. Cockpit HUD & Telemetry Overview
- **Live METAR Ticker**: Real-time ICAO weather cable decoding (`VIDP 300600Z 28010KT 5000 HZ NSC 28/14 Q1012 NOSIG`).
- **Flight KPIs**: 4 real-time telemetry cards tracking DGCA Attendance Compliance (80% mandatory threshold), DGCA Syllabus Progress, Account Ledger balance, and Next Flight Briefing.
- **Flight Schedule Today**: Live Friday timeline with lecture status badges (`In Progress`, `Upcoming`), classroom assignments (Hall 2A, Radio Simulation Lab), and 1-tap lecture attendance check-in.
- **Chief Mentor Desk**: Direct line and doubt-clearing hotline with Capt. Navrang Singh (Airline Pilot & Chief Ground Mentor).

### 2. DGCA Ground Courses & Interactive Practice Drills
- Comprehensive coverage of all **5 DGCA CPL Ground Examination Papers**:
  1. Air Navigation (Radio aids, 1-in-60 rule, flight planning)
  2. Aviation Meteorology (Synoptic charts, altimetry corrections, hazardous weather)
  3. Air Regulations & ICAO Annexes (CAR Section 7, airspace classes)
  4. Technical General & Systems (Turbofans, hydraulics, flight instruments)
  5. Technical Specific & Performance (Aircraft weight & balance, performance charts)
- **Interactive Practice Drill Modal**: Live multi-question DGCA test simulation with instant scoring and concept explanations.

### 3. Biometric Attendance & DGCA Endorsement Tracker
- **80% Minimum Threshold**: Dynamic color-coded gauge tracking compliance margin required for DGCA exam endorsement.
- **Geofenced Check-In**: 1-click biometric attendance logging synced directly with the academy's operations database.
- **Excused Duty Leave**: Form request system for medical clearance and official DGCA administrative duty.

### 4. Fees & Accounts Ledger
- Real-time tuition accounting displaying total fees, paid amounts, and due installments.
- **Encrypted Checkout Gateway**: Modal supporting UPI, NetBanking, and Debit/Credit Cards.
- **Tax Invoice & GST Receipt**: Printable GST-compliant tax receipt generator with official corporate CIN.

### 5. AeroBot — 24/7 AI Flight Deck Copilot
- Aviation-trained conversational mentor with direct access to student ledger, schedules, and DGCA syllabus.
- Built-in aeronautical reasoning tools:
  - METAR weather decoder
  - 1-in-60 navigation track error & closing angle formula calculator
  - Altimetry comparisons (QNH vs QFE vs QNE)
  - Live attendance margin calculator and fee dues inquiry

### 6. Operations Command (Admin Deck)
- Role-based dual authentication (Cadet & Operations Admin).
- Cadet roster management, fee collection tracking, ground class timetable scheduling, and live biometric audit logs.
- Cadet View simulation mode allowing instructors to view live cadet dashboards.

---

## Brand System Compliance (Brand Book 2026)

This project strictly implements the **Airborne Aviation Brand Book 2026**:
- **Color Architecture (60-30-10 Rule)**:
  - `60%` Stark White (`#FFFFFF`) — Clean, high-legibility canvas
  - `30%` Captain's Navy (`#00274C` / `#00172E`) — Authority, stability, cockpit avionics
  - `10%` Ascend Red (`#DB241E`) — Action triggers, contrails, brand focal points
  - Accent Gold (`#D8A027`) — Reserved exclusively for success metrics, flight badges, and captain wings
- **Official Brand Mark (`AirborneLogo.tsx`)**:
  - Ascending commercial jet silhouette climbing at a 45° angle.
  - Aerodynamic sweeping contrail swoosh in Ascend Red.
  - Bold italic `AIRB`**`O`**`RNE` wordmark with signature red 'O'.
- **Bespoke Copilot Icon (`AeroBotIcon.tsx`)**:
  - Aviator pilot headset, cockpit HUD visor with telemetry crosshairs, and aviation gold wings.
- **Zero Raw Emojis**: All iconography uses accessible vector SVGs from Lucide.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS
- **Icons & Typography**: Lucide React, Montserrat, Roboto, JetBrains Mono
- **Backend**: FastAPI / Python (located in `server/`) with SQLite database (`airborne_students.db`)
- **Linting & Verification**: Oxlint, TypeScript strict checking

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Installation
```bash
# Install frontend dependencies
npm install

# Run frontend development server
npm run dev

# Run backend API server
uvicorn server.main:app --port 8000 --reload
```

### Build & Lint
```bash
# Type check and build production bundle
npm run build

# Run fast linter
npm run lint
```

---

## License & Credits
© 2026 Airborne Aviation Private Limited (CIN: U85306DL2026PTC465670). All rights reserved.  
Campus: E-549, 2nd Floor, Ramphal Chowk, Sector-7, Dwarka, New Delhi-110075.
