# ApexECU Studio — AI Calibration & Software Engineer Copilot Integration

He upgrade hian manual tuning i khawih laia cell dik lo, hlauhawm, leh engine chhiat theihna tur a lo awm pawha zilhna leh rawtna lo pe zung zung thei tur **AI Calibration & Software Engineer Copilot** a thun dawn a ni. Dual assistance system a nei ang a: **Live Warning Alert Bar** (cell khawih ruala overboost, knock hazard, leh steep cliff lo en nghal zung zungtu) leh **Conversational AI Engineer Copilot Drawer** (Gemini 3.8 Flash hmanga map pumpui endik a, Mizo ṭawnga thurawn pe a, 1-click fix siamsaktu) a awm dawn a ni.

---

### User Review & Thutlukna Pawimawhte

> [!IMPORTANT]
> Nangma duh dan thar ber zelin:
> - **Dual Assistance Mode**:
>   1. **Live Warning Alert Bar (A Khawih Ruala Warning & Quick Fix)**: Manual table-a cell i khawih lai mekin, physics leh engine limits (Overboost > factory safety, Knock / detonation hazard, AFR lean spike, leh cell inkar inthlau lutuk steep cliffs) a lo scan zung zung ang a, "Auto-Smooth Cell" emaw "Clamp to Safe Limit" button vawikhat hmehin a siamrem nghal thei ang.
>   2. **Conversational AI Calibration Copilot Drawer**: Gemini 3.8 Flash server-side API hmangin screen sirah AI Engineer drawer a awm ang a; map i khawih mek chu AI-in a lo analyze vek ang a, engvangin nge a hlauhawm, engtianga khawih tur nge tih Mizo ṭawng ngeiin a hrilhfiah ang a, rawtna (recommended values) a pe nghal zel ang.
> - **Server-Side Architecture**: `@google/genai` TypeScript SDK hmangin `server.ts` Express backend-ah `/api/tune-advisor` route siam a ni ang a, API key chu server-ah him takin a awm ang.

---

### 1. AI Calibration Engineer Kalphung & Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      MANUAL TABLE CELL EDITING                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
        ┌───────────────────────────────────────────────────────┐
        │ 1. REAL-TIME CLIENT HEURISTICS (Sub-millisecond)      │
        │ • Steep Cliff Delta > 35% between adjacent cells      │
        │ • Overboost Ceiling > 2400 mbar (Turbo mechanical PR) │
        │ • Excessive Spark Advance > 38° BTDC (Knock hazard)   │
        │ • Fuel Rail Pressure > 1850 Bar (Pump over-pressure)  │
        └──────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
        ┌───────────────────────────────────────────────────────┐
        │ 2. LIVE HAZARD ALERT BANNER (Directly above table)    │
        │ ⚠️ Hazard Detected: Cell [R8, C12] Boost raised to   │
        │    2650 mbar (+32%). Danger of turbine overspeed!     │
        │ [✨ 1-Click Auto-Smooth] [🛡️ Clamp to Safe 2350 mbar]│
        └──────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
        ┌───────────────────────────────────────────────────────┐
        │ 3. CONVERSATIONAL AI ENGINEER COPILOT (Gemini 3.8)    │
        │ • Deep map topology and gradient analysis             │
        │ • Mizo & English technical advice tailored to engine  │
        │ • "He map-ah hian low-end torque ti sang rawh le"     │
        │   -> AI creates smooth calibrated curve in 1 click!   │
        └───────────────────────────────────────────────────────┘
```

---

### 2. Live Hazards Detected While Manual Tuning

1. **Turbo Overboost & Compressor Surge**: Boost target a san lutuk chuan turbo impellor vawrh chak lutuk vanga turbo puak theihna a lo hria ang.
2. **Ignition Advance Detonation / Knocking**: Piston chhipa plug meipui chhem hma lutuk vanga engine cylinder chhiat theihna a zilh ang.
3. **Lean AFR Lambda Spike**: Boruak luh tam a thau tlem lutuk chuan cylinder a sa lutuk a, exhaust valve leh piston a tui thei (engine melt).
4. **Steep Cell Gradient / Jagged Cliffs**: Cell pakhat a san vak a, a bul chiah a hniam vak chuan car a phut zawk zawk ang a, drivability a chhe vek ang. AI-in smooth tura a siamrem theihna a pe nghal ang.
5. **Rail Pump Over-pressurization**: Diesel high-pressure pump leh common rail tana hlauhawm a veng ang.

---

### 3. User Experience & UI Design

- **Floating AI Engineer Assistant Pill**: Screen dinglam hnuailamah "🤖 AI Calibration Engineer (Online)" pill a awm ang a, hmeh rualin copilot drawer a rawn inhawng ang.
- **In-Table Live Alert Strip**: Table Editor chung chiahah alert a rawn lang zung zung ang a, cell khawih sual apiangin a rawn hrilh nghal zel ang.
- **1-Click AI Fix Affordance**: AI-in rawtna a pek apiangin "Apply AI Recommendation" button a awm ang a, hmeh rualin table matrix-ah values a thlak fel nghal thlap ang.
- **Mizo Ṭawnga Biak Theihna**: AI hnenah "Khawngaihin Mizoram tlang lawn nan low-end torque tlem min lo tihsan sak teh" tih te zawt la, engine zia a zirin fiah takin Mizo-in a chhang ang.

---

### 4. Technical Architecture (`server.ts` & Gemini API)

- **Backend Route**: `server.ts` running Express on port 3000 mounting Vite middlewares in dev mode.
- **Route Endpoint**: `POST /api/tune-advisor`
  - Input: Current map metadata, vehicle identity, cell values, and tuner prompt.
  - Server invokes: `@google/genai` with model `gemini-3.8-flash` and `httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }`.
  - System Prompt: Expert automotive ECU calibration and software engineer specializing in Indian diesel/petrol/bike engines (Bosch, Delphi, Marelli, Keihin) with native Mizo and English fluency.
- **Client Copilot Component**: `src/components/AiCalibrationCopilot.tsx` & `src/components/LiveHazardAlert.tsx`.
