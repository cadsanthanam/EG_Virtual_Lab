<#
.SYNOPSIS
  Unified Git Auto Backup Script - Commit, Push, Watch, and Schedule

.DESCRIPTION
  Production-ready script that fixes all issues from fragmented scripts:
  - Pushes to CURRENT branch (not hard-coded "main")
  - Robust error handling and forensic logging
  - Multiple modes: once, watch, install-task, uninstall-task, test
  - Works with ANY branch name automatically

.USAGE
  # Test if backup works (recommended first step)
  .\git-auto-backup-unified.ps1 -Action test

  # Run once (commit + push if changes exist)
  .\git-auto-backup-unified.ps1 -Action once

  # Watch mode (auto-backup on file changes)
  .\git-auto-backup-unified.ps1 -Action watch -DebounceSeconds 10

  # Install scheduled task (4 times daily: 9AM, 1PM, 6PM, 11PM)
  .\git-auto-backup-unified.ps1 -Action install-task

  # Install custom schedule (every N minutes)
  .\git-auto-backup-unified.ps1 -Action install-task -TaskEveryMinutes 30

  # Uninstall scheduled task
  .\git-auto-backup-unified.ps1 -Action uninstall-task

.PARAMETERS
  -Action: once|test|watch|install-task|uninstall-task|run-task
  -RepoPath: Path to git repository (default: script location)
  -TaskName: Scheduled task name (default: "GitAutoBackup")
  -TaskEveryMinutes: For custom schedule (overrides 4-times-daily)
  -DebounceSeconds: Wait time for watch mode (default: 10)
  -CommitPrefix: Commit message prefix (default: "Auto-backup")

.NOTES
  Author: Forensic Audit & Consolidation
  Version: 1.0 Unified
  Fixed Issues:
    - Hard-coded "main" branch → Now uses current branch via HEAD
    - Missing error handling → Comprehensive try/catch blocks
    - No logging → Forensic logs in <repo>/logs/
    - Git command failures → Proper exit code checking
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("once","test","watch","install-task","uninstall-task","run-task")]
    [string]$Action = "once",

    [Parameter(Mandatory=$false)]
    [string]$RepoPath = "",

    [Parameter(Mandatory=$false)]
    [string]$TaskName = "GitAutoBackup",

    [Parameter(Mandatory=$false)]
    [int]$TaskEveryMinutes = 0,  # 0 = use 4-times-daily schedule

    [Parameter(Mandatory=$false)]
    [int]$DebounceSeconds = 10,

    [Parameter(Mandatory=$false)]
    [string]$CommitPrefix = "Auto-backup"
)

# Strict mode for better error detection
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Global variables
$script:LogFile = $null
$script:GitExe = $null
$script:RepoRoot = $null

#region Helper Functions

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logLine = "[$timestamp] [$Level] $Message"

    # Console output with colors
    switch ($Level) {
        "ERROR"   { Write-Host $logLine -ForegroundColor Red }
        "WARNING" { Write-Host $logLine -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logLine -ForegroundColor Green }
        default   { Write-Host $logLine -ForegroundColor White }
    }

    # File output
    if ($script:LogFile) {
        Add-Content -Path $script:LogFile -Value $logLine -ErrorAction SilentlyContinue
    }
}

function Initialize-Logging {
    param([string]$repoRoot)

    try {
        $logDir = Join-Path $repoRoot "logs"
        if (-not (Test-Path $logDir)) {
            New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        }

        $logFileName = "git-auto-backup_{0}.log" -f (Get-Date -Format "yyyyMMdd")
        $script:LogFile = Join-Path $logDir $logFileName

        Write-Log "=== Git Auto Backup Started ===" "INFO"
        Write-Log "Action: $Action" "INFO"
        Write-Log "Repository: $repoRoot" "INFO"
        Write-Log "User: $env:USERNAME" "INFO"
        Write-Log "Computer: $env:COMPUTERNAME" "INFO"
    }
    catch {
        Write-Host "Warning: Could not initialize logging: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

function Find-GitExecutable {
    try {
        $gitCmd = Get-Command git -ErrorAction Stop
        $script:GitExe = $gitCmd.Source
        Write-Log "Git executable found: $($script:GitExe)" "INFO"
        return $true
    }
    catch {
        Write-Log "Git executable not found. Please install Git." "ERROR"
        Write-Host ""
        Write-Host "Git is not installed or not in PATH." -ForegroundColor Red
        Write-Host "Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
        return $false
    }
}

function Invoke-GitCommand {
    param(
        [string[]]$Arguments,
        [switch]$SuppressErrors
    )

    try {
        $output = & $script:GitExe @Arguments 2>&1
        $exitCode = $LASTEXITCODE

        return [PSCustomObject]@{
            Success   = ($exitCode -eq 0)
            ExitCode  = $exitCode
            Output    = $output
            Arguments = ($Arguments -join " ")
        }
    }
    catch {
        if (-not $SuppressErrors) {
            Write-Log "Git command failed: git $($Arguments -join ' ')" "ERROR"
            Write-Log "Error: $($_.Exception.Message)" "ERROR"
        }
        return [PSCustomObject]@{
            Success   = $false
            ExitCode  = 1
            Output    = $_.Exception.Message
            Arguments = ($Arguments -join " ")
        }
    }
}

function Get-RepositoryRoot {
    param([string]$startPath)

    if ([string]::IsNullOrWhiteSpace($startPath)) {
        if ($PSScriptRoot) {
            $startPath = $PSScriptRoot
        } else {
            $startPath = Get-Location
        }
    }

    if (-not (Test-Path $startPath)) {
        throw "Path does not exist: $startPath"
    }

    Write-Log "Searching for git repository root from: $startPath" "INFO"

    Push-Location $startPath
    try {
        $result = Invoke-GitCommand -Arguments @("rev-parse", "--show-toplevel")

        if (-not $result.Success) {
            throw "Not a git repository (or any parent up to mount point).`nExecute 'git init' first or provide correct path."
        }

        $repoRoot = ($result.Output | Select-Object -First 1).ToString().Trim()

        # Convert Unix-style path to Windows if needed
        if ($repoRoot -match '^/[a-z]/') {
            $repoRoot = $repoRoot -replace '^/([a-z])/', '$1:/'
        }

        Write-Log "Repository root found: $repoRoot" "SUCCESS"
        return $repoRoot
    }
    finally {
        Pop-Location
    }
}

function Clear-GitLockFiles {
    param([string]$repoRoot)

    $lockFile = Join-Path $repoRoot ".git\index.lock"

    if (Test-Path $lockFile) {
        Write-Log "Stale lock file detected: $lockFile" "WARNING"

        try {
            # Check if lock file is old (more than 5 minutes)
            $lockAge = (Get-Date) - (Get-Item $lockFile).LastWriteTime

            if ($lockAge.TotalMinutes -gt 5) {
                Remove-Item $lockFile -Force -ErrorAction Stop
                Write-Log "Removed stale lock file (age: $([int]$lockAge.TotalMinutes) minutes)" "WARNING"
                Start-Sleep -Seconds 1
            } else {
                Write-Log "Lock file is recent (age: $([int]$lockAge.TotalSeconds) seconds) - another git process may be running" "WARNING"
                Write-Host ""
                Write-Host "⚠️ Git appears to be busy. Please:" -ForegroundColor Yellow
                Write-Host "   1. Close VS Code, GitHub Desktop, or other Git tools" -ForegroundColor White
                Write-Host "   2. Wait a moment and try again" -ForegroundColor White
                Write-Host "   3. Or manually delete: .git\index.lock" -ForegroundColor White
                Write-Host ""
                return $false
            }
        }
        catch {
            Write-Log "Could not remove lock file: $($_.Exception.Message)" "ERROR"
            return $false
        }
    }

    return $true
}

function Test-RemoteOrigin {
    $result = Invoke-GitCommand -Arguments @("remote")

    if (-not $result.Success) {
        Write-Log "Failed to check git remotes" "ERROR"
        return $false
    }

    $remotes = @($result.Output | ForEach-Object { $_.ToString().Trim() } | Where-Object { $_ })

    if ($remotes -notcontains "origin") {
        Write-Log "Remote 'origin' not configured" "ERROR"
        Write-Host ""
        Write-Host "Git remote 'origin' is not set up." -ForegroundColor Red
        Write-Host "Configure it with: git remote add origin <your-repo-url>" -ForegroundColor Yellow
        Write-Host ""
        return $false
    }

    Write-Log "Remote 'origin' verified" "INFO"
    return $true
}

function Get-CurrentBranch {
    # Get current branch name - works for normal branches
    $result = Invoke-GitCommand -Arguments @("symbolic-ref", "--quiet", "--short", "HEAD") -SuppressErrors

    if ($result.Success) {
        $branchName = ($result.Output | Select-Object -First 1).ToString().Trim()
        Write-Log "Current branch: $branchName" "INFO"
        return $branchName
    }

    # Detached HEAD state
    Write-Log "Detached HEAD detected - will push HEAD" "WARNING"
    return ""
}

function Invoke-AutoBackup {
    Write-Log "Starting auto-backup process..." "INFO"

    Push-Location $script:RepoRoot
    try {
        # Check and clear stale lock files
        if (-not (Clear-GitLockFiles -repoRoot $script:RepoRoot)) {
            throw "Git lock file conflict - another process may be using the repository"
        }

        # Verify remote
        if (-not (Test-RemoteOrigin)) {
            throw "Remote 'origin' not configured"
        }

        # Get current branch
        $currentBranch = Get-CurrentBranch
        if ([string]::IsNullOrWhiteSpace($currentBranch)) {
            Write-Log "In detached HEAD state - will push to origin/HEAD" "WARNING"
        }

        # Check for changes
        Write-Log "Checking for uncommitted changes..." "INFO"
        $statusResult = Invoke-GitCommand -Arguments @("status", "--porcelain")

        if (-not $statusResult.Success) {
            throw "Failed to check git status"
        }

        $hasChanges = -not [string]::IsNullOrWhiteSpace(($statusResult.Output | Out-String).Trim())

        if (-not $hasChanges) {
            Write-Log "No changes detected. Working tree is clean." "SUCCESS"
            Write-Host ""
            Write-Host "✅ No changes to backup. Repository is up to date!" -ForegroundColor Green
            return $true
        }

        Write-Log "Changes detected. Proceeding with backup..." "INFO"

        # Stage all changes
        Write-Log "Staging all changes (git add -A)..." "INFO"
        $addResult = Invoke-GitCommand -Arguments @("add", "-A")

        if (-not $addResult.Success) {
            throw "Failed to stage changes: $($addResult.Output)"
        }

        # Create commit
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $commitMessage = "$CommitPrefix : $timestamp"

        Write-Log "Creating commit: $commitMessage" "INFO"
        $commitResult = Invoke-GitCommand -Arguments @("commit", "-m", $commitMessage)

        if (-not $commitResult.Success) {
            $commitOutput = $commitResult.Output | Out-String

            # Check if it's just "nothing to commit" (rare but possible)
            if ($commitOutput -match "nothing to commit") {
                Write-Log "Nothing to commit after staging (likely .gitignore rules)" "WARNING"
            } else {
                throw "Failed to commit: $commitOutput"
            }
        }

        # Push to remote (using HEAD to push current branch, whatever it's named)
        Write-Log "Pushing to origin (git push -u origin HEAD)..." "INFO"
        Write-Host ""
        Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan

        $pushResult = Invoke-GitCommand -Arguments @("push", "-u", "origin", "HEAD")

        if (-not $pushResult.Success) {
            $errorOutput = $pushResult.Output | Out-String
            Write-Log "Push failed: $errorOutput" "ERROR"
            Write-Host ""
            Write-Host "❌ Push failed!" -ForegroundColor Red
            Write-Host ""
            Write-Host "Common causes:" -ForegroundColor Yellow
            Write-Host "  1. Network connectivity issues" -ForegroundColor White
            Write-Host "  2. Authentication failed (credentials expired)" -ForegroundColor White
            Write-Host "  3. Remote repository doesn't exist" -ForegroundColor White
            Write-Host "  4. Branch protection rules" -ForegroundColor White
            Write-Host ""
            Write-Host "Error details:" -ForegroundColor Yellow
            Write-Host $errorOutput -ForegroundColor Red
            throw "Push failed"
        }

        Write-Log "Push completed successfully" "SUCCESS"
        Write-Host ""
        Write-Host "✅ Successfully backed up to GitHub!" -ForegroundColor Green
        Write-Host ""

        return $true
    }
    catch {
        Write-Log "Backup failed: $($_.Exception.Message)" "ERROR"
        Write-Host ""
        Write-Host "❌ Backup failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $false
    }
    finally {
        Pop-Location
    }
}

function Invoke-WatchMode {
    Write-Log "Starting watch mode (debounce: ${DebounceSeconds}s)..." "INFO"
    Write-Host ""
    Write-Host "👀 Watch mode started" -ForegroundColor Cyan
    Write-Host "   Repository: $script:RepoRoot" -ForegroundColor White
    Write-Host "   Debounce: ${DebounceSeconds} seconds" -ForegroundColor White
    Write-Host "   Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""

    $watcher = New-Object System.IO.FileSystemWatcher
    $watcher.Path = $script:RepoRoot
    $watcher.IncludeSubdirectories = $true
    $watcher.NotifyFilter = [IO.NotifyFilters]'FileName, DirectoryName, LastWrite'

    # Exclude common noise directories
    $excludePatterns = @(
        '\.git\\',
        '\\node_modules\\',
        '\\venv\\',
        '\\__pycache__\\',
        '\\logs\\',
        '\\dist\\',
        '\\build\\',
        '\\bin\\',
        '\\obj\\'
    )

    $script:pending = $false
    $script:lastEventTime = Get-Date

    $eventHandler = {
        param($sender, $eventArgs)

        $fullPath = $eventArgs.FullPath

        # Skip excluded directories
        foreach ($pattern in $excludePatterns) {
            if ($fullPath -match $pattern) {
                return
            }
        }

        $script:pending = $true
        $script:lastEventTime = Get-Date
    }

    # Register event handlers
    Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $eventHandler | Out-Null
    Register-ObjectEvent -InputObject $watcher -EventName Created -Action $eventHandler | Out-Null
    Register-ObjectEvent -InputObject $watcher -EventName Deleted -Action $eventHandler | Out-Null
    Register-ObjectEvent -InputObject $watcher -EventName Renamed -Action $eventHandler | Out-Null

    $watcher.EnableRaisingEvents = $true

    try {
        while ($true) {
            Start-Sleep -Seconds 1

            if ($script:pending) {
                $timeSinceLastEvent = (Get-Date) - $script:lastEventTime

                if ($timeSinceLastEvent.TotalSeconds -ge $DebounceSeconds) {
                    $script:pending = $false

                    Write-Log "Debounce window elapsed. Running backup..." "INFO"
                    Write-Host "📝 Changes detected, running backup..." -ForegroundColor Cyan

                    try {
                        Invoke-AutoBackup | Out-Null
                    }
                    catch {
                        Write-Log "Backup error in watch mode: $($_.Exception.Message)" "ERROR"
                    }
                }
            }
        }
    }
    finally {
        $watcher.EnableRaisingEvents = $false
        $watcher.Dispose()
        Get-EventSubscriber | Unregister-Event -Force -ErrorAction SilentlyContinue
        Write-Log "Watch mode stopped" "INFO"
    }
}

function Install-ScheduledBackupTask {
    Write-Log "Installing scheduled task: $TaskName" "INFO"

    $scriptPath = $MyInvocation.ScriptName
    if ([string]::IsNullOrWhiteSpace($scriptPath) -or -not (Test-Path $scriptPath)) {
        throw "Cannot determine script path. Ensure script is saved as .ps1 file."
    }

    Write-Host ""
    Write-Host "Installing scheduled task..." -ForegroundColor Cyan
    Write-Host "   Task name: $TaskName" -ForegroundColor White
    Write-Host "   Script: $scriptPath" -ForegroundColor White
    Write-Host "   Repository: $script:RepoRoot" -ForegroundColor White
    Write-Host ""

    # Remove existing task if present
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "Removing existing task..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }

    # Build PowerShell arguments
    $psExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"

    $scriptArg = $scriptPath.Replace('"', '""')
    $repoArg = $script:RepoRoot.Replace('"', '""')

    $arguments = @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-WindowStyle", "Hidden",
        "-File", "`"$scriptArg`"",
        "-Action", "once",
        "-RepoPath", "`"$repoArg`""
    ) -join " "

    # Create action
    $action = New-ScheduledTaskAction `
        -Execute $psExe `
        -Argument $arguments `
        -WorkingDirectory $script:RepoRoot

    # Create triggers
    if ($TaskEveryMinutes -gt 0) {
        # Custom interval schedule
        Write-Host "Schedule: Every $TaskEveryMinutes minutes" -ForegroundColor White

        $startTime = (Get-Date).AddMinutes(1)
        $trigger = New-ScheduledTaskTrigger `
            -Once `
            -At $startTime `
            -RepetitionInterval (New-TimeSpan -Minutes $TaskEveryMinutes) `
            -RepetitionDuration ([TimeSpan]::MaxValue)

        $triggers = @($trigger)
    }
    else {
        # Default: 4 times daily (9AM, 1PM, 6PM, 11PM)
        Write-Host "Schedule: 4 times daily (9AM, 1PM, 6PM, 11PM)" -ForegroundColor White

        $triggers = @(
            New-ScheduledTaskTrigger -Daily -At 9:00AM
            New-ScheduledTaskTrigger -Daily -At 1:00PM
            New-ScheduledTaskTrigger -Daily -At 6:00PM
            New-ScheduledTaskTrigger -Daily -At 11:00PM
        )
    }

    # Settings
    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RunOnlyIfNetworkAvailable `
        -MultipleInstances IgnoreNew

    # Principal (run as current user, interactive mode, limited privileges)
    $principal = New-ScheduledTaskPrincipal `
        -UserId $env:USERNAME `
        -LogonType Interactive `
        -RunLevel Limited

    # Register task
    try {
        $description = if ($TaskEveryMinutes -gt 0) {
            "Automatically backup git repository every $TaskEveryMinutes minutes"
        } else {
            "Automatically backup git repository 4 times daily at 9AM, 1PM, 6PM, 11PM"
        }

        Register-ScheduledTask `
            -TaskName $TaskName `
            -Action $action `
            -Trigger $triggers `
            -Settings $settings `
            -Principal $principal `
            -Description $description `
            -ErrorAction Stop | Out-Null

        Write-Log "Scheduled task installed successfully" "SUCCESS"
        Write-Host ""
        Write-Host "✅ Scheduled task installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Task Details:" -ForegroundColor Cyan
        Write-Host "   Name: $TaskName" -ForegroundColor White
        Write-Host "   Repository: $script:RepoRoot" -ForegroundColor White
        Write-Host "   Runs as: $env:USERNAME (Interactive)" -ForegroundColor White
        Write-Host ""
        Write-Host "Management Commands:" -ForegroundColor Cyan
        Write-Host "   View in Task Scheduler: taskschd.msc" -ForegroundColor White
        Write-Host "   Run now: .\$($MyInvocation.MyCommand.Name) -Action run-task" -ForegroundColor White
        Write-Host "   Disable: Disable-ScheduledTask -TaskName '$TaskName'" -ForegroundColor White
        Write-Host "   Uninstall: .\$($MyInvocation.MyCommand.Name) -Action uninstall-task" -ForegroundColor White
        Write-Host ""
    }
    catch {
        Write-Log "Failed to install scheduled task: $($_.Exception.Message)" "ERROR"
        Write-Host ""
        Write-Host "❌ Failed to install scheduled task" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "You may need to run PowerShell as Administrator" -ForegroundColor Yellow
        throw
    }
}

function Uninstall-ScheduledBackupTask {
    Write-Log "Uninstalling scheduled task: $TaskName" "INFO"

    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

    if ($task) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Log "Scheduled task removed" "SUCCESS"
        Write-Host ""
        Write-Host "✅ Scheduled task '$TaskName' removed successfully" -ForegroundColor Green
        Write-Host ""
    }
    else {
        Write-Log "Scheduled task not found: $TaskName" "WARNING"
        Write-Host ""
        Write-Host "ℹ️ Scheduled task '$TaskName' not found" -ForegroundColor Yellow
        Write-Host ""
    }
}

function Invoke-TaskNow {
    Write-Log "Running scheduled task immediately: $TaskName" "INFO"

    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

    if (-not $task) {
        Write-Host ""
        Write-Host "❌ Task '$TaskName' not found" -ForegroundColor Red
        Write-Host "   Install it first with: -Action install-task" -ForegroundColor Yellow
        Write-Host ""
        return
    }

    try {
        Start-ScheduledTask -TaskName $TaskName
        Write-Log "Scheduled task started" "SUCCESS"
        Write-Host ""
        Write-Host "✅ Task '$TaskName' started" -ForegroundColor Green
        Write-Host "   Check logs for results: $script:RepoRoot\logs\" -ForegroundColor White
        Write-Host ""
    }
    catch {
        Write-Log "Failed to start task: $($_.Exception.Message)" "ERROR"
        Write-Host ""
        Write-Host "❌ Failed to start task: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

function Show-TestResults {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "           GIT AUTO-BACKUP TEST             " -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""

    $allGood = $true

    # Test 1: Git installed
    Write-Host "[1/5] Checking Git installation..." -ForegroundColor Yellow
    if ($script:GitExe) {
        Write-Host "   ✅ Git found: $script:GitExe" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Git not found" -ForegroundColor Red
        $allGood = $false
    }

    # Test 2: Repository detected
    Write-Host "[2/5] Checking repository..." -ForegroundColor Yellow
    if ($script:RepoRoot) {
        Write-Host "   ✅ Repository: $script:RepoRoot" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Not in a git repository" -ForegroundColor Red
        $allGood = $false
    }

    # Test 3: Remote origin
    Write-Host "[3/5] Checking remote 'origin'..." -ForegroundColor Yellow
    if (Test-RemoteOrigin) {
        $remoteUrl = Invoke-GitCommand -Arguments @("remote", "get-url", "origin")
        if ($remoteUrl.Success) {
            Write-Host "   ✅ Remote origin: $($remoteUrl.Output)" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ Remote 'origin' not configured" -ForegroundColor Red
        $allGood = $false
    }

    # Test 4: Current branch
    Write-Host "[4/5] Checking current branch..." -ForegroundColor Yellow
    $branch = Get-CurrentBranch
    if ($branch) {
        Write-Host "   ✅ Current branch: $branch" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Detached HEAD (will push to origin/HEAD)" -ForegroundColor Yellow
    }

    # Test 5: Credentials
    Write-Host "[5/5] Testing credentials (fetch)..." -ForegroundColor Yellow
    $fetchTest = Invoke-GitCommand -Arguments @("fetch", "--dry-run") -SuppressErrors
    if ($fetchTest.Success) {
        Write-Host "   ✅ Credentials working" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Credentials may need update" -ForegroundColor Yellow
        Write-Host "   (This is OK if you'll be prompted when pushing)" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan

    if ($allGood) {
        Write-Host "         ✅ ALL TESTS PASSED               " -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Ready to use! Try:" -ForegroundColor Cyan
        Write-Host "   .\git-auto-backup-unified.ps1 -Action once" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "         ❌ SOME TESTS FAILED              " -ForegroundColor Red
        Write-Host "============================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Fix the issues above before using this script." -ForegroundColor Yellow
        Write-Host ""
    }
}

#endregion

#region Main Execution

try {
    # Find git executable
    if (-not (Find-GitExecutable)) {
        exit 1
    }

    # Get repository root (except for uninstall action)
    if ($Action -ne "uninstall-task") {
        $script:RepoRoot = Get-RepositoryRoot -startPath $RepoPath
        Initialize-Logging -repoRoot $script:RepoRoot
    }

    # Execute requested action
    switch ($Action) {
        "test" {
            Show-TestResults
        }

        "once" {
            $success = Invoke-AutoBackup
            if (-not $success) {
                exit 1
            }
        }

        "watch" {
            Invoke-WatchMode
        }

        "install-task" {
            Install-ScheduledBackupTask
        }

        "uninstall-task" {
            Uninstall-ScheduledBackupTask
        }

        "run-task" {
            Invoke-TaskNow
        }
    }

    exit 0
}
catch {
    Write-Log "Fatal error: $($_.Exception.Message)" "ERROR"
    Write-Host ""
    Write-Host "❌ Fatal error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Stack trace:" -ForegroundColor Gray
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    Write-Host ""
    exit 1
}

#endregion
