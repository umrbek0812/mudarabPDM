# Islamic Bank Mudaraba PDM & Pool Simulator — Team Instructions (Qo'llanma)

This application simulates end-to-end **Islamic Bank Mudaraba Investment Account Holder (IAH)** Profit Distribution Management (PDM), Multi-Pool & Sub-Pool management, Many-to-Many (M:N) Financing Asset tagging, Weightage sensitivity, Treasury balance control, and 12-Month Mudaraba deposit waterflow.

---

## 1. Quick Start & Command Scripts (Ishga Tushirish)

### Option A: Launch Multi-Page Web Application + CLI Summary
Run the Windows batch or PowerShell script:
```powershell
.\start-pdm.bat
# OR in PowerShell:
.\start-pdm.ps1
# OR directly via Node:
node server.js
```
Then open `http://localhost:3088` in your browser.

### Option B: Run Command-Line (CLI) Simulation Script (`pdm-cli.js`)
```powershell
# Run full simulation (Baseline + All 12 Scenarios + Weightage Sensitivity + 12M Waterflow)
node pdm-cli.js

# List all 12 built-in Islamic banking scenarios (EN & UZ)
node pdm-cli.js --list

# Run detailed waterfall for a specific scenario (1..12)
node pdm-cli.js --scenario 2

# Compare all 12 scenarios side-by-side
node pdm-cli.js --all-scenarios

# Run Weightage Sensitivity Matrix
node pdm-cli.js --weightage

# Run 12-Month Mudaraba Waterflow for any scenario (e.g. Scenario #10 Withdrawal Stress)
node pdm-cli.js --waterflow 10

# Export full 12-scenario audit report to JSON
node pdm-cli.js --export simulation_report.json
```

---

## 2. Multi-Page Application Structure (7 Alohida Sahifa)

Every module has its own **dedicated page**:
1. **Page 1 — Executive Dashboard (`/dashboard.html`)**: Consolidated bank balance sheet, KPIs, Sub-Pool summary, and all IAH tiers' Rates of Return (RoR).
2. **Page 2 — Financing Portfolio (`/financing.html`)**: Manage *Murabaha, Ijara, Diminishing Musharaka, Istisna, Salam, Sukuk, Wakala* portfolios, yields, direct expenses, and NPF provisions.
3. **Page 3 — Deposit Pools & Weightages (`/pools.html`)**: Manage Unrestricted (URIA) and Restricted (RIA) sub-pools, Mudarib PSR, Hiba (Tanazul), and interactive Weightage sliders ($w_i$) for each deposit tier.
4. **Page 4 — Treasury & M:N Allocation Matrix (`/treasury.html`)**: Connect multiple Financing Portfolios to multiple Sub-Pools (M:N matrix), configure CRR/SLR statutory reserves, and control Bank Equity Co-Investment (Musharaka).
5. **Page 5 — Profit Waterfall, Reserves & Weightage Lab (`/waterfall.html`)**: Step-by-step 8-stage Shariah profit waterfall (PER, Mudarib PSR, Hiba, IRR) and live Weightage Sensitivity Matrix.
6. **Page 6 — 12-Month Mudaraba Waterflow (`/waterflow.html`)**: Month-by-month simulation (M1–M12) of opening balances, inflows, withdrawals, profit compounding vs. cash payout, and macro stress factors.
7. **Page 7 — Scenario Simulation Lab (`/scenarios.html`)**: Dedicated simulation window with **12 pre-built Islamic banking scenarios** (in English & Uzbek) and a side-by-side comparison matrix.
