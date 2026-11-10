# ApexECU Studio — India Ram Lirthei ECU Flash Remapper, DTC/EEPROM Reader, Immo & Report Suite

He application hi India rama lirthei (Maruti, Mahindra, Tata, Hyundai, Toyota, VW, Royal Enfield, KTM etc.) ECU flash file remap-na, **Flash File / EEPROM aṭanga Stored Fault Code (DTC) Enchhuahna & Tihbona**, a lirthei nihna zawn chhuahna (auto-detection), **Immobilizer (Immo Off / Bypass) Tool**, **Flash File Khawih Danglam Tawh Enna (Tune Forensic)**, **Project-Based System**, leh **Printable Remap Report PDF (Before vs After Compare)** nei a ni.

---

### User Review & Thutlukna Pawimawhte

> [!IMPORTANT]
> Nangma duh dan thar ber zelin:
> - **Flash File / EEPROM Aṭanga Fault Code (DTC) Enna & Tihbona**:
>   - **Stored Fault Memory Scanner (Fehlerspeicher)**: Flash file (`.bin`) emaw EEPROM dump (`.bin`, `.eep`, `.rom`) aṭangin error code lo in-save tawhte (Active & Pending DTC codes) a chhiar chhuak nghal ang.
>   - **Fault Code Hrilhfiahna (Descriptions)**: Error code tinte (e.g. `P0401`, `P0087`, `P0299`, `P2002`) awmzia leh a chhan Mizo leh English-in a tarlang ang (e.g. *P0087: Rail Fuel Pressure hniam lutuk*, *P0299: Turbo boost tlak hniam*).
>   - **1-Click Clear Stored DTCs (Dump Tihfai)**: Bench-a ECU enfiah laiin emaw, scanner hman theih loh laia dump chhung aṭanga fault memory nuaibo (clear) theihna a awm ang.
> - **Immobilizer Support (A Support ECU Tan Khawih Theih)**: Bosch EDC15/16, ME7, Marelli 6F3/8F3, Delphi, Simos te tan Immo Off / Bypass switch.
> - **Tune Forensic & Mod-Detector**: File hi Factory Stock nge Previous Tuner-in a lo khawih tawh tih leh, enge an lo khawih (Boost, DTC wiped, EGR/DPF, Rail pressure etc.) tarlanna.
> - **Printable Remap Report PDF**: Customer hnena pek theih tur Before leh After khaikhinna kimchang, HP/Torque, Boost/Fuel, Map diffs, Stored faults report, leh Workshop sign-off.
> - **Project-First Workflow**: Flash file khawih hmain Project thar hawn phawt zelna, Customer & Vehicle Plate number, leh Original Stock file locked tlatna.
> - **India Ram Lirthei Support Kim Biai**: Maruti, Mahindra, Tata, Hyundai, Toyota, VW, Royal Enfield, KTM, Yamaha, TVS, Bajaj etc.

---

### 1. Flash / EEPROM Stored Fault Code (DTC) Scanner Kalphung

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FLASH / EEPROM FAULT MEMORY SCANNER                  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
          ┌──────────────────────────────────────────────────┐
          │  Scans NVRAM / EEPROM Partition for DTC Log Blocks│
          │  (Standard OBD-II P0xxx/P1xxx & U0xxx Network)   │
          └────────────────────────┬─────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      STORED FAULT CODES DETECTED                       │
│ • P0401 — Exhaust Gas Recirculation (EGR) Flow Insufficient            │
│   (Mizo: EGR valve a hnathawk tha lo / a tawt emaw a in-jam)           │
│ • P0299 — Turbocharger Underboost Condition                            │
│   (Mizo: Turbo boost a hniam lutuk / boost pipe a leak emaw actuator)  │
│ • P0087 — Fuel Rail/System Pressure Too Low                            │
│   (Mizo: Rail pressure a tlem lutuk / diesel filter emaw pump chhia)   │
│                                                                        │
│ Actions: [🧹 CLEAR STORED FAULT MEMORY]  [❌ DISABLE DTC LOGIC (MASK)] │
└────────────────────────────────────────────────────────────────────────┘
```

#### A Hman Dan Pawimawhte:
1. **ECU Table Scan**: Flash file chhung aṭangin fault table offsets a zawng a, ECU-in error code a lo chhinchhiah (logged) tawhte a tarlang chhuak vek ang.
2. **EEPROM File Support**: Flash file `.bin` bakah EEPROM `.eep` / `.bin` (e.g. 95080, 95160, 95320, 95640, 24C04) dump te upload theih a ni ang.
3. **Khaikhin Theihna (Two Modes)**:
   - *Mode A: Stored Faults (A lo awmsa chhiar chhuah)*: Lirtheiin chhiatna a lo neih tawhte dump aṭanga chhiar chhuah.
   - *Mode B: DTC Masking (Hma lam tana block)*: Remap huna check engine light tieng lo tura DTC disable hmak theihna.
4. **Clear Stored DTC**: Button vawikhat hmehin fault log bytes zawng zawng `0x00`-in a thlak fai vek thei ang.

---

### 2. Workspace Layout & Hman Dan

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ApexECU Studio — India Remap Suite                   │
├────────────────────────────────────────────────────────────────────────┤
│ Top Bar: Brand [ApexECU] — [Detect · Forensic · DTCs · Maps · Immo · PDF]│
├────────────────────────────────────────────────────────────────────────┤
│ [Project: Swift 1.3 DDiS | Plate: MZ-01-B-9988 | Customer: Zothana]    │
├────────────────────────────────────────────────────────────────────────┤
│ 🔍 FORENSIC: [🟢 STOCK] | ⚠️ STORED FAULTS: 3 ACTIVE DTCs | 🔑 IMMO: OK│
├─────────────────┬───────────────────────────────────┬──────────────────┤
│ Map Directory   │ Central Visualizer & DTC Viewer   │ Controls         │
│ ─────────────── │ ───────────────────────────────── │ ──────────────── │
│ • Drivers Wish  │ ┌───────────────────────────────┐ │ • Stage 1 Wizard │
│ • Boost Target  │ │ 3D Surface / 2D Before-After  │ │ • Rev Limiter    │
│ • Smoke Limiter │ └───────────────────────────────┘ │ • DTC / EGR Off  │
│ • Rail Pressure │ ┌───────────────────────────────┐ │ • Immo Off       │
│ • DTC Fault Log │ │ Stored Fault Memory Scanner   │ │ 🧹 Clear Faults  │
│   (P0401, P0299)│ │ (Error code awmzia Mizo-in)   │ │                  │
│ • Immo Sector   │ └───────────────────────────────┘ │ [📄 Print PDF]   │
│                 │                                   │ [⬇️ Export .BIN] │
└─────────────────┴───────────────────────────────────┴──────────────────┘
```

---

### 3. Implementation Plan Summary

- **Project-First Enforcement**: Project thar hawn hmasak phawt ngai tur (Customer details, Vehicle Plate No, Date, Notes).
- **DTC / EEPROM Stored Fault Reader**: Flash file leh EEPROM file aṭanga fault code chhiar chhuahna, Mizo hrilhfiahna, leh Clear memory option.
- **Immo Module**: A support ECU tan Immo Off / Bypass leh Virginize toggle, a support lo tan OTP Locked notice.
- **Tune Forensic Engine**: File lo thlen dan (Factory Stock nge Already Modified) leh an lo khawih tawh zawng zawng hriatchhuahna.
- **Printable Report PDF**: Before leh After chipchiar taka khaikhinna, performance gains, boost/fuel deltas, stored faults status, map diff log, leh workshop sign-off certificate.
- **India Ram Lirthei Support**: Maruti, Mahindra, Tata, Hyundai, Toyota, VW, Royal Enfield, KTM, Yamaha, TVS, Bajaj etc.
- **3D & 2D Visualizer Engine**: Rotatable 3D surface mesh leh 2D curve.
- **Mizo & English Dual Language**: Mizo ṭawng leh technical terms hrilhfiahna kimchang.
