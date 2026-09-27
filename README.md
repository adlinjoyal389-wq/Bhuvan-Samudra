# 🌊 Bhuvan-Samudra – ORCA
### Marine Ecosystem Reasoning with Collaborative Agents (ORCA)

**Smart India Hackathon 2026**
* **Problem Statement ID:** SIH26176
* **Theme:** Space Technology
* **Category:** Software
* **Team:** REPHOENIX
* **Primary Target:** Artisanal & Mechanized Fishermen, Coastal Communities, Maritime Safety Authorities

---

## 📌 Executive Summary

**Bhuvan-Samudra – ORCA** is an agentic marine intelligence and safety platform developed specifically for Indian fishermen. Powered by collaborative multi-agent architecture and spatial telemetry from **ISRO Bhuvan, INCOIS (OceanSat-3 / Oceansat-2), and MOSDAC**, the system provides:
1. **Daily Marine Intelligence:** Real-time sea conditions, wave heights, wind vectors, and Sea Surface Temperature (SST).
2. **Potential Fishing Zones (PFZ):** High-confidence fish shoal zones derived from thermal gradients and chlorophyll-a concentrations.
3. **Dynamic Geofence & Maritime Boundary Alerts:** Real-time proximity warnings for the International Maritime Boundary Line (IMBL) and Marine Protected Areas (MPA, e.g. Gulf of Mannar).
4. **Explainable AI (XAI) Reasoning:** Transparent evidence cards showing the exact oceanographic indicators behind every ORCA recommendation.
5. **Multilingual Voice Assistant:** Outdoor-friendly, voice-driven queries in **Tamil, English, Telugu, Malayalam, Hindi, and Gujarati**.
6. **Unified WhatsApp Bot Gateway:** Connected to the identical PostgreSQL/SQLite database and spatial memory layer as the mobile app.
7. **Offline Mesh & Cache Simulation:** Offline spatial tiles and Bluetooth Low Energy (BLE) / Wi-Fi Direct peer-to-peer hazard exchange between boat clusters at sea.

---

## 🏗 System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND APPLICATIONS                          │
├───────────────────────────────────┬────────────────────────────────────┤
│     React Native / Expo App       │       WhatsApp Bot Gateway         │
│   (Android Phone / Web UI)        │     (Cloud API / Sim Window)       │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND ENGINE                          │
├────────────────────────────────────────────────────────────────────────┤
│  • Marine Spatial Routing (/marine)   • User Profile & Auth (/user)   │
│  • ORCA Conversational Hub (/orca)    • Marine Memory Layer (/memory)  │
│  • BLE Mesh / Offline Sync (/sync)    • WhatsApp Webhook (/whatsapp)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               ORCA MULTI-AGENT COLLABORATIVE CORE                     │
├────────────────────────────────────────────────────────────────────────┤
│  1. MarineOceanDiscoveryAgent (PFZ shoals, SST, Chlorophyll-a)         │
│  2. WeatherHazardAgent (Wind vectors, wave heights, sea states)        │
│  3. GeospatialGeofenceAgent (IMBL border buffers, MPA polygon safety) │
│  4. TrajectoryOptimizerAgent (A* risk-weighted maritime paths)        │
│  5. ExplainableAIAgent (Transparent multi-sensor evidence chains)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                SHARED DATABASE & MARINE SPATIAL MEMORY                │
├────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL / PostGIS (or SQLite with PostGIS-ready schemas)           │
│  • users  • boats  • pfz_locations  • weather_data  • alerts           │
│  • marine_daily_memory  • user_memory  • whatsapp_messages             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Launch Backend Service
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```
*API Swagger Documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)*

### 2. Launch Mobile Application (React Native / Expo)
```bash
cd mobile
npm install
npx expo start
```
- Press **`w`** in the terminal to open the web preview in your browser.
- Or scan the QR code with **Expo Go** on an Android phone.

---

## 🔑 SIH Evaluation Demo Credentials

| Parameter | Demo Value | Note |
|---|---|---|
| **Mobile Number** | `9876543210` | Auto-filled on login |
| **Demo OTP** | `123456` | Works offline and online |
| **Demo Fisherman** | `Amogh` | Registered user |
| **Vessel Name** | `Sea Star` | IND-TN-06-MM-4421 |
| **Home Port** | `Kanyakumari` | Tamil Nadu Coast |
| **Demo Coordinates** | `8.0883° N, 77.5385° E` | Wadge Bank Offshore |

---

## 📱 Application Screens & Features

1. **Splash Screen:** SIH 2026 Space Technology and Team REPHOENIX branding.
2. **Mobile OTP Login:** Fast OTP login with demo bypass button (`123456`).
3. **Profile Onboarding:** Name, Boat, Home Port, Emergency Contact, and Preferred Language selection.
4. **Home Screen:**
   - 🔊 "Listen to Today's Marine Update" audio bar.
   - Live Sea Condition Card (Wave: 1.4 m, Wind: 12 km/h).
   - Potential Fishing Zone Card (PFZ-01, 18 km NE, 28.2°C).
   - Marine Safety Status Card (IMBL: 8.4 km separation).
   - Today's ORCA Recommendation with "Why this recommendation?" XAI modal.
5. **Interactive Satellite Map:**
   - Esri Satellite Imagery, Standard, and Bathymetric Terrain switcher.
   - Dynamic Geofence Warning banner: `⚠ IMBL PROXIMITY: Distance 8.4 km – Safe / Monitor`.
   - Vessel marker and PFZ shoal markers with detailed bottom cards.
   - A* Safe Route calculation avoiding restricted zones.
   - Offline Marine Area Download (`Kanyakumari Coast`).
6. **Safety Alerts:** Chronological warnings with severity badges and **Listen Alert** audio buttons.
7. **Ask ORCA Assistant:** Multilingual voice assistant with microphone pulse, speech confirmation, quick questions, and explainable evidence drawer.
8. **WhatsApp Bot Simulator:** Real-time chat tab connected to the same backend memory layer (supports `TODAY`, `PFZ`, `WEATHER`, `BORDER`, `ALERTS`, `HELP`).
9. **Profile & BLE Mesh:** Language switcher (6 Indian languages), WhatsApp notification toggles, and **"Sync Nearby Boats"** peer-to-peer hazard exchange simulation.

---

## 🧪 Automated Backend Verification

You can verify all endpoints, database schemas, and multi-agent reasoning chains at any time:
```bash
cd backend
python test_backend.py
```
Outputs 11 automated test checks passing successfully.
