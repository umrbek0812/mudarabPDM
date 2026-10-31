#!/usr/bin/env node
/**
 * Islamic Bank Mudaraba PDM & Pool Management — Command Script (CLI)
 *
 * Usage:
 *   node pdm-cli.js                         -> Run full summary of Baseline + all 12 Scenarios
 *   node pdm-cli.js --list                  -> List all 12 built-in simulation scenarios
 *   node pdm-cli.js --scenario 2            -> Run detailed simulation for Scenario #2 (1..12 or ID)
 *   node pdm-cli.js --all-scenarios         -> Compare all 12 scenarios side-by-side
 *   node pdm-cli.js --weightage             -> Run Weightage Sensitivity Matrix on Retail Pool
 *   node pdm-cli.js --waterflow 10          -> Run 12-Month Mudaraba Waterflow for Scenario #10
 *   node pdm-cli.js --export report.json    -> Export full simulation report to JSON
 */

const fs = require('fs');
const path = require('path');
const PDM_SCENARIOS = require('./src/engine/scenarios');
const PDM_ENGINE = require('./src/engine/pdmEngine');

function fmtMoney(n) {
  const mln = Number(n || 0) / 1e6;
  const sign = mln < 0 ? '-' : '';
  const abs = Math.abs(mln);
  if (abs >= 100) return sign + Math.round(abs).toLocaleString('en-US') + ' mln';
  return sign + abs.toFixed(1) + ' mln';
}

function fmtPct(n) {
  return Number(n || 0).toFixed(2) + '%';
}

function pad(str, len, alignRight = false) {
  const s = String(str);
  if (s.length >= len) return s.slice(0, len);
  const spaces = ' '.repeat(len - s.length);
  return alignRight ? spaces + s : s + spaces;
}

function printDivider(ch = '=', width = 104) {
  console.log(ch.repeat(width));
}

function findScenario(arg) {
  if (!arg) return PDM_SCENARIOS.scenarios[0];
  const num = parseInt(arg, 10);
  if (!isNaN(num) && num >= 1 && num <= PDM_SCENARIOS.scenarios.length) {
    return PDM_SCENARIOS.scenarios[num - 1];
  }
  return PDM_SCENARIOS.scenarios.find(
    s => s.id.toLowerCase() === String(arg).toLowerCase()
  ) || PDM_SCENARIOS.scenarios[0];
}

function printScenarioList() {
  printDivider('=');
  console.log(' ISLAMIC BANK MUDARABA PDM SIMULATOR — 12 BUILT-IN SCENARIOS');
  printDivider('=');
  PDM_SCENARIOS.scenarios.forEach(s => {
    console.log(` [${pad(s.number, 2, true)}] ${pad(s.id, 26)} | ${pad(s.category, 26)} | ${s.title}`);
    console.log(`      UZ: ${s.titleUz}`);
  });
  printDivider('-');
}

function printDetailedScenario(scen) {
  const state = scen.buildState();
  const sim = PDM_ENGINE.calculateBankSimulation(state);

  printDivider('=');
  console.log(` SCENARIO #${scen.number}: ${scen.title} (${scen.id})`);
  console.log(` UZ: ${scen.titleUz}`);
  console.log(` Summary: ${scen.summary}`);
  printDivider('=');

  console.log('\n [PART 1] FINANCING PORTFOLIOS (ASSET SIDE & M:N POOL TAGGING)');
  printDivider('-');
  console.log(
    pad('Portfolio ID', 15) +
    pad('Contract Type', 24) +
    pad('Balance', 12, true) +
    pad('GrossYld', 10, true) +
    pad('NPF+Exp', 10, true) +
    pad('NetYield', 10, true) +
    pad('NetMoInc', 11, true) +
    '  Pool Split (Ret/Corp/RIA)'
  );
  printDivider('-');
  sim.portfolios.forEach(p => {
    const m = sim.assetPoolMatrix[p.id] || {};
    const splitStr = `${m['POOL-RETAIL'] || 0}% / ${m['POOL-CORP'] || 0}% / ${m['POOL-RIA-PROJ'] || 0}%`;
    console.log(
      pad(p.id, 15) +
      pad(p.contractType, 24) +
      pad(fmtMoney(p.balance), 12, true) +
      pad(fmtPct(p.effectiveGrossYieldPct), 10, true) +
      pad(fmtPct(p.directExpensePct + p.effectiveNpfPct), 10, true) +
      pad(fmtPct(p.netAnnualYieldPct), 10, true) +
      pad(fmtMoney(p.netMonthlyIncome), 11, true) +
      '  ' + splitStr
    );
  });

  console.log('\n [PART 2] TREASURY BALANCE CONTROL & SUB-POOL PROFIT WATERFALL');
  printDivider('-');
  console.log(
    pad('Sub-Pool', 15) +
    pad('Total DAB', 11, true) +
    pad('NetInvDAB', 11, true) +
    pad('TaggedAst', 11, true) +
    pad('BankEquity', 11, true) +
    pad('GrossIAH', 10, true) +
    pad('Mudarib$', 10, true) +
    pad('Hiba$', 9, true) +
    pad('NetIAH$', 10, true) +
    pad('PoolRoR', 9, true)
  );
  printDivider('-');
  sim.subPools.forEach(sp => {
    console.log(
      pad(sp.id, 15) +
      pad(fmtMoney(sp.totalDab), 11, true) +
      pad(fmtMoney(sp.netInvestableIahDab), 11, true) +
      pad(fmtMoney(sp.taggedAssetBalance), 11, true) +
      pad(fmtMoney(sp.effectiveBankEquity), 11, true) +
      pad(fmtMoney(sp.iahGrossDistributableIncome), 10, true) +
      pad(fmtMoney(sp.netMudaribShare), 10, true) +
      pad(fmtMoney(sp.hibaAmount), 9, true) +
      pad(fmtMoney(sp.finalDistributableIahProfit), 10, true) +
      pad(fmtPct(sp.blendedPoolIahRorPct), 9, true)
    );
  });

  console.log('\n [PART 3] DEPOSIT POOL TIERS — WEIGHTAGE & IAH RATE OF RETURN (RoR)');
  sim.subPools.forEach(sp => {
    printDivider('-');
    console.log(` >>> ${sp.name} [Mudarib PSR: ${sp.mudaribPsrPct}% | Hiba: ${sp.hibaPctOfMudarib}% | Blended RoR: ${fmtPct(sp.blendedPoolIahRorPct)}]`);
    console.log(
      pad('  Tier Name', 32) +
      pad('DAB', 12, true) +
      pad('Weight', 9, true) +
      pad('WeightedDAB', 14, true) +
      pad('WtShare%', 10, true) +
      pad('Mo.Profit', 12, true) +
      pad('Ann.RoR%', 10, true)
    );
    sp.tiers.forEach(t => {
      console.log(
        pad('  ' + t.name, 32) +
        pad(fmtMoney(t.dab), 12, true) +
        pad(t.weightage.toFixed(2) + 'x', 9, true) +
        pad(fmtMoney(t.weightedDab), 14, true) +
        pad(fmtPct(t.weightSharePct), 10, true) +
        pad(fmtMoney(t.monthlyProfit), 12, true) +
        pad(fmtPct(t.annualizedRorPct), 10, true)
      );
    });
  });

  printDivider('=');
  console.log(
    ` BANK KPI SUMMARY: Financing Assets=${fmtMoney(sim.kpis.totalFinancingAssets)} | ` +
    `IAH Deposits=${fmtMoney(sim.kpis.totalIahDeposits)} | ` +
    `Blended IAH RoR=${fmtPct(sim.kpis.bankBlendedIahRorPct)} | ` +
    `Bank Monthly Income (Mudarib+Equity)=${fmtMoney(sim.kpis.totalBankCombinedIncome)}`
  );
  printDivider('=');
}

function printAllScenariosComparison() {
  printDivider('=');
  console.log(' SIDE-BY-SIDE COMPARISON OF ALL 12 ISLAMIC BANK SCENARIOS');
  printDivider('=');
  console.log(
    pad('#', 3) +
    pad('Scenario Title', 38) +
    pad('Assets', 10, true) +
    pad('Deposits', 10, true) +
    pad('BankEqty', 10, true) +
    pad('RetailRoR', 10, true) +
    pad('CorpRoR', 9, true) +
    pad('RIARoR', 9, true) +
    pad('BankInc/m', 10, true)
  );
  printDivider('-');
  PDM_SCENARIOS.scenarios.forEach(scen => {
    const sim = PDM_ENGINE.calculateBankSimulation(scen.buildState());
    const retRor = sim.subPools[0] ? sim.subPools[0].blendedPoolIahRorPct : 0;
    const corpRor = sim.subPools[1] ? sim.subPools[1].blendedPoolIahRorPct : 0;
    const riaRor = sim.subPools[2] ? sim.subPools[2].blendedPoolIahRorPct : 0;
    console.log(
      pad(scen.number, 3) +
      pad(scen.title, 38) +
      pad(fmtMoney(sim.kpis.totalFinancingAssets), 10, true) +
      pad(fmtMoney(sim.kpis.totalIahDeposits), 10, true) +
      pad(fmtMoney(sim.kpis.totalBankEquityInPools), 10, true) +
      pad(fmtPct(retRor), 10, true) +
      pad(fmtPct(corpRor), 9, true) +
      pad(fmtPct(riaRor), 9, true) +
      pad(fmtMoney(sim.kpis.totalBankCombinedIncome), 10, true)
    );
  });
  printDivider('=');
}

function printWeightageSensitivity() {
  const base = PDM_SCENARIOS.createBaselineBank();
  const rows = PDM_ENGINE.simulateWeightageSensitivity(base, 'POOL-RETAIL', 'TR-12M');
  printDivider('=');
  console.log(' WEIGHTAGE SENSITIVITY SIMULATION — Varying 12M Term Weightage in Retail Pool');
  printDivider('-');
  console.log(
    pad('12M Weight', 12) +
    pad('Savings RoR', 14, true) +
    pad('3M RoR', 12, true) +
    pad('6M RoR', 12, true) +
    pad('12M RoR (Target)', 18, true) +
    pad('24M RoR', 12, true) +
    pad('Pool Avg RoR', 14, true)
  );
  printDivider('-');
  rows.forEach(r => {
    const getRor = id => fmtPct((r.tiers.find(t => t.id === id) || {}).annualizedRorPct);
    console.log(
      pad(r.testedWeightage.toFixed(2) + 'x', 12) +
      pad(getRor('TR-SAV'), 14, true) +
      pad(getRor('TR-3M'), 12, true) +
      pad(getRor('TR-6M'), 12, true) +
      pad(getRor('TR-12M'), 18, true) +
      pad(getRor('TR-24M'), 12, true) +
      pad(fmtPct(r.poolBlendedRorPct), 14, true)
    );
  });
  printDivider('=');
}

function printWaterflow(scenArg) {
  const scen = findScenario(scenArg);
  const wf = PDM_ENGINE.run12MonthWaterflow(scen.buildState());
  printDivider('=');
  console.log(` 12-MONTH MUDARABA DEPOSIT WATERFLOW — Scenario #${scen.number}: ${scen.title}`);
  printDivider('-');
  console.log(
    pad('Month', 12) +
    pad('Open IAH', 11, true) +
    pad('+Inflow', 10, true) +
    pad('-Withdraw', 10, true) +
    pad('+ProfReinv', 11, true) +
    pad('CashPayout', 11, true) +
    pad('Close IAH', 11, true) +
    pad('IAH RoR', 9, true) +
    pad('BankInc', 10, true)
  );
  printDivider('-');
  wf.forEach(m => {
    console.log(
      pad(m.label, 12) +
      pad(fmtMoney(m.openingDeposits), 11, true) +
      pad(fmtMoney(m.newInflows), 10, true) +
      pad(fmtMoney(m.withdrawals), 10, true) +
      pad(fmtMoney(m.profitReinvested), 11, true) +
      pad(fmtMoney(m.profitCashPayout), 11, true) +
      pad(fmtMoney(m.closingDeposits), 11, true) +
      pad(fmtPct(m.blendedIahRorPct), 9, true) +
      pad(fmtMoney(m.bankCombinedIncome), 10, true)
    );
  });
  printDivider('=');
}

// Parse CLI arguments
const args = process.argv.slice(2);
if (args.includes('--list')) {
  printScenarioList();
} else if (args.includes('--scenario')) {
  const idx = args.indexOf('--scenario');
  printDetailedScenario(findScenario(args[idx + 1]));
} else if (args.includes('--all-scenarios')) {
  printAllScenariosComparison();
} else if (args.includes('--weightage')) {
  printWeightageSensitivity();
} else if (args.includes('--waterflow')) {
  const idx = args.indexOf('--waterflow');
  printWaterflow(args[idx + 1]);
} else if (args.includes('--export')) {
  const idx = args.indexOf('--export');
  const outFile = args[idx + 1] || 'simulation_report.json';
  const report = PDM_SCENARIOS.scenarios.map(s => ({
    scenario: { id: s.id, number: s.number, title: s.title, titleUz: s.titleUz },
    simulation: PDM_ENGINE.calculateBankSimulation(s.buildState()),
    waterflow12M: PDM_ENGINE.run12MonthWaterflow(s.buildState())
  }));
  fs.writeFileSync(path.resolve(outFile), JSON.stringify(report, null, 2), 'utf8');
  console.log(`Exported full 12-scenario report to ${path.resolve(outFile)}`);
} else {
  printDetailedScenario(PDM_SCENARIOS.scenarios[0]);
  console.log('');
  printAllScenariosComparison();
  console.log('');
  printWeightageSensitivity();
  console.log('');
  printWaterflow(1);
}
