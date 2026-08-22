<#
.SYNOPSIS
    Packages Wired into dist/wired-<version>.zip, ready to upload to itch.io.

.DESCRIPTION
    Runs the test suite, stages the shipping files, and zips them with
    index.html at the root of the archive — itch.io looks for it there and
    silently refuses the upload if it is nested inside a folder.

    Compress-Archive ships with Windows PowerShell, so packaging adds no
    dependency (see README, "Dependencies").

.PARAMETER SkipTests
    Package without running node tools/test.mjs first. For when you already ran
    it; not for when it is failing.

.EXAMPLE
    .\tools\build.ps1
#>
[CmdletBinding()]
param(
    [switch]$SkipTests
)

$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $repo 'dist'

# Everything the game needs at runtime. screenshots/ is in here because
# manifest.json points at it for the install prompt, not just for the store page.
$ship = @(
    'index.html',
    'manifest.json',
    'sw.js',
    'icon.svg',
    'icons',
    'screenshots'
)

# --- tests ------------------------------------------------------------------

if (-not $SkipTests) {
    Write-Host 'Running tests...' -ForegroundColor Cyan
    & node (Join-Path $PSScriptRoot 'test.mjs')
    if ($LASTEXITCODE -ne 0) {
        throw "tests failed (exit $LASTEXITCODE) - not packaging a broken build"
    }
    Write-Host ''
}

# --- version ----------------------------------------------------------------

# One source of truth: the About panel's credit line. Naming the zip from
# anywhere else lets the download and the in-game version disagree.
$indexPath = Join-Path $repo 'index.html'
$index = Get-Content -Raw -Path $indexPath
if ($index -notmatch '<div id="settingsCredits">v(\d+\.\d+(?:\.\d+)?)') {
    throw "could not read a version from the #settingsCredits line in index.html"
}
$version = $Matches[1]

# --- stage ------------------------------------------------------------------

foreach ($item in $ship) {
    $path = Join-Path $repo $item
    if (-not (Test-Path $path)) {
        throw "missing $item - run 'node tools/make-icons.mjs' and 'node tools/make-screenshots.mjs' first"
    }
}

$stage = Join-Path ([System.IO.Path]::GetTempPath()) ("wired-build-" + [System.Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $stage -Force | Out-Null

try {
    foreach ($item in $ship) {
        Copy-Item -Path (Join-Path $repo $item) -Destination $stage -Recurse -Force
    }

    if (-not (Test-Path (Join-Path $stage 'index.html'))) {
        throw "index.html did not land at the root of the staging folder"
    }

    # --- zip ----------------------------------------------------------------

    New-Item -ItemType Directory -Path $dist -Force | Out-Null
    $zip = Join-Path $dist "wired-v$version.zip"
    if (Test-Path $zip) { Remove-Item $zip -Force }

    # "$stage\*" rather than "$stage" so the archive has no wrapping folder.
    Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zip -CompressionLevel Optimal

    $size = [Math]::Round((Get-Item $zip).Length / 1KB, 1)
    Write-Host "Built $zip" -ForegroundColor Green
    Write-Host "  version  v$version"
    Write-Host "  size     $size KB"
    Write-Host ''
    Write-Host 'Upload to itch.io as a HTML project, tick "This file will be played in the browser".'
}
finally {
    Remove-Item -Path $stage -Recurse -Force -ErrorAction SilentlyContinue
}
