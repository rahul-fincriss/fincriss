param(
    [string]$VpsUser = "root",
    [string]$VpsHost = "104.237.11.83",
    [string]$VpsDir  = "~/fincriss-ui/fincriss",
    [string]$AppUrl  = "https://app.fincriss.com",
    [string]$VpsPass = ""
)

function Write-Log  { param($msg) Write-Host "[deploy] $msg" }
function Write-Fail { param($msg) Write-Error "[deploy] ERROR: $msg"; exit 1 }

# Prompt for password if not supplied
if (-not $VpsPass) {
    $secure  = Read-Host "VPS password" -AsSecureString
    $bstr    = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $VpsPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
}

# Require plink (PuTTY) for password-based SSH on Windows
$plink = Get-Command plink -ErrorAction SilentlyContinue
if (-not $plink) {
    Write-Fail "plink not found. Install PuTTY (https://www.putty.org) or run: winget install PuTTY.PuTTY"
}

function Invoke-Remote {
    param([string]$Command)
    & plink -ssh -pw $VpsPass -batch "${VpsUser}@${VpsHost}" $Command
    if ($LASTEXITCODE -ne 0) { Write-Fail "Remote command failed: $Command" }
}

# Pre-flight
Write-Log "Checking SSH connectivity to ${VpsHost}..."
Invoke-Remote "echo SSH OK"

# Deploy
Write-Log "Pulling latest code on VPS..."
Invoke-Remote "cd ${VpsDir} && git pull --ff-only"

Write-Log "Rebuilding and restarting container..."
Invoke-Remote "cd ${VpsDir} && docker compose up -d --build"

# Health check
Write-Log "Waiting for app to come up..."
$maxAttempts = 12
for ($i = 1; $i -le $maxAttempts; $i++) {
    try {
        $response = Invoke-WebRequest -Uri $AppUrl -MaximumRedirection 0 -TimeoutSec 5 -ErrorAction SilentlyContinue -UseBasicParsing
        $code = $response.StatusCode
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
    }

    if ($code -in @(200, 301, 302)) {
        Write-Log "Health check passed (HTTP $code) - ${AppUrl} is live."
        exit 0
    }

    Write-Log "  attempt $i/${maxAttempts}: got HTTP $code, retrying in 5s..."
    Start-Sleep -Seconds 5
}

Write-Fail "App did not respond after 60s. SSH in and run: docker compose logs -f"
