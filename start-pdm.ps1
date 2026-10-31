# PowerShell Command Script for Islamic Bank Mudaraba PDM & Pool Simulator
param(
    [string]$Mode = "web",
    [int]$Scenario = 1
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

if ($Mode -eq "cli") {
    node .\pdm-cli.js --scenario $Scenario
} elseif ($Mode -eq "scenarios") {
    node .\pdm-cli.js --all-scenarios
} elseif ($Mode -eq "weightage") {
    node .\pdm-cli.js --weightage
} elseif ($Mode -eq "waterflow") {
    node .\pdm-cli.js --waterflow $Scenario
} else {
    node .\pdm-cli.js --all-scenarios
    Write-Host "`nStarting Multi-Page Islamic Bank PDM Web Server on http://localhost:3088 ..." -ForegroundColor Green
    node .\server.js
}
