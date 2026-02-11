<#
.SYNOPSIS
  Initialize Git repository and connect to GitHub - Complete Setup Script

.DESCRIPTION
  This script handles all initial Git setup steps:
  - Initializes Git repository
  - Configures user identity
  - Connects to GitHub repository
  - Creates initial commit
  - Pushes to GitHub
  - Supports both HTTPS and SSH authentication

.USAGE
  # Interactive mode (recommended - will prompt for everything)
  .\git-init-setup.ps1

  # Provide parameters upfront
  .\git-init-setup.ps1 -GitHubUsername "yourusername" -RepoName "your-repo" -GitUserName "Your Name" -GitUserEmail "your@email.com"

.PARAMETERS
  -RepoPath: Local folder path (default: current directory)
  -GitHubUsername: Your GitHub username
  -RepoName: GitHub repository name
  -GitUserName: Your name for Git commits
  -GitUserEmail: Your email for Git commits
  -AuthMethod: "https" or "ssh" (default: https)
  -DefaultBranch: Branch name (default: main)
  -CreateGitIgnore: Create .gitignore file (default: true)

.NOTES
  Author: GitHub Setup Assistant
  Version: 1.0
  
  IMPORTANT: For HTTPS authentication, you'll need a GitHub Personal Access Token
  Get one at: https://github.com/settings/tokens
  - Select "repo" scope
  - Save the token securely
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$RepoPath = "",

    [Parameter(Mandatory = $false)]
    [string]$GitHubUsername = "",

    [Parameter(Mandatory = $false)]
    [string]$RepoName = "",

    [Parameter(Mandatory = $false)]
    [string]$GitUserName = "",

    [Parameter(Mandatory = $false)]
    [string]$GitUserEmail = "",

    [Parameter(Mandatory = $false)]
    [ValidateSet("https", "ssh", "")]
    [string]$AuthMethod = "",

    [Parameter(Mandatory = $false)]
    [string]$DefaultBranch = "main",

    [Parameter(Mandatory = $false)]
    [bool]$CreateGitIgnore = $true
)

# Strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

#region Helper Functions

function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    
    switch ($Type) {
        "Success" { Write-Host $Message -ForegroundColor Green }
        "Error" { Write-Host $Message -ForegroundColor Red }
        "Warning" { Write-Host $Message -ForegroundColor Yellow }
        "Info" { Write-Host $Message -ForegroundColor Cyan }
        "Step" { Write-Host $Message -ForegroundColor Magenta }
        default { Write-Host $Message -ForegroundColor White }
    }
}

function Write-StepHeader {
    param([string]$StepNumber, [string]$Title)
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " STEP ${StepNumber}: $Title" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Test-GitInstalled {
    try {
        $null = Get-Command git -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

function Get-UserInput {
    param(
        [string]$Prompt,
        [string]$CurrentValue = "",
        [bool]$Required = $true,
        [switch]$IsSecret
    )
    
    if ($CurrentValue) {
        Write-ColorMessage "  Using: $CurrentValue" "Info"
        return $CurrentValue
    }
    
    do {
        if ($IsSecret) {
            $input = Read-Host -Prompt "  $Prompt" -AsSecureString
            $input = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [Runtime.InteropServices.Marshal]::SecureStringToBSTR($input))
        }
        else {
            $input = Read-Host -Prompt "  $Prompt"
        }
        
        if ([string]::IsNullOrWhiteSpace($input) -and $Required) {
            Write-ColorMessage "  ⚠ This field is required. Please try again." "Warning"
        }
    } while ([string]::IsNullOrWhiteSpace($input) -and $Required)
    
    return $input.Trim()
}

function Get-YesNoInput {
    param([string]$Prompt, [bool]$Default = $true)
    
    $defaultText = if ($Default) { "Y/n" } else { "y/N" }
    $response = Read-Host -Prompt "  $Prompt [$defaultText]"
    
    if ([string]::IsNullOrWhiteSpace($response)) {
        return $Default
    }
    
    return $response -match '^[Yy]'
}

function New-BasicGitIgnore {
    param([string]$RepoPath)
    
    $gitignorePath = Join-Path $RepoPath ".gitignore"
    
    if (Test-Path $gitignorePath) {
        Write-ColorMessage "  ℹ .gitignore already exists, skipping creation" "Info"
        return
    }
    
    $gitignoreContent = @"
# Logs
logs/
*.log

# OS generated files
.DS_Store
Thumbs.db
desktop.ini

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Temporary files
*.tmp
*.temp
~$*

# Build outputs
bin/
obj/
dist/
build/

# Dependencies
node_modules/
vendor/

# Environment files
.env
.env.local
"@

    try {
        Set-Content -Path $gitignorePath -Value $gitignoreContent -Encoding UTF8
        Write-ColorMessage "  ✅ Created .gitignore file" "Success"
    }
    catch {
        Write-ColorMessage "  ⚠ Could not create .gitignore: $($_.Exception.Message)" "Warning"
    }
}

#endregion

#region Main Setup Process

try {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                        ║" -ForegroundColor Green
    Write-Host "║     GIT REPOSITORY INITIALIZATION & GITHUB SETUP       ║" -ForegroundColor Green
    Write-Host "║                                                        ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    # ============================================================
    # STEP 1: Verify Git Installation
    # ============================================================
    Write-StepHeader "1" "Verify Git Installation"
    
    if (-not (Test-GitInstalled)) {
        Write-ColorMessage "❌ Git is not installed or not in PATH!" "Error"
        Write-Host ""
        Write-ColorMessage "Please install Git from: https://git-scm.com/download/win" "Info"
        Write-ColorMessage "After installation, restart PowerShell and run this script again." "Info"
        Write-Host ""
        exit 1
    }
    
    $gitVersion = git --version
    Write-ColorMessage "✅ Git is installed: $gitVersion" "Success"
    
    # ============================================================
    # STEP 2: Set Repository Path
    # ============================================================
    Write-StepHeader "2" "Set Repository Path"
    
    if ([string]::IsNullOrWhiteSpace($RepoPath)) {
        $RepoPath = Get-Location
        Write-ColorMessage "  Using current directory: $RepoPath" "Info"
        
        if (-not (Get-YesNoInput "Is this the correct project folder?" $true)) {
            $RepoPath = Get-UserInput "Enter the full path to your project folder" -Required $true
        }
    }
    
    if (-not (Test-Path $RepoPath)) {
        Write-ColorMessage "❌ Directory does not exist: $RepoPath" "Error"
        exit 1
    }
    
    Set-Location $RepoPath
    Write-ColorMessage "✅ Working in: $RepoPath" "Success"
    
    # Check if already a Git repository
    if (Test-Path ".git") {
        Write-ColorMessage "⚠ This directory is already a Git repository!" "Warning"
        
        if (-not (Get-YesNoInput "Do you want to continue anyway? (This may reconfigure settings)" $false)) {
            Write-ColorMessage "Setup cancelled." "Info"
            exit 0
        }
    }
    
    # ============================================================
    # STEP 3: Gather User Information
    # ============================================================
    Write-StepHeader "3" "Configure Git User Identity"
    
    Write-ColorMessage "  This information will appear in your commit history." "Info"
    Write-Host ""
    
    $GitUserName = Get-UserInput "Your full name (e.g., 'John Doe')" $GitUserName
    $GitUserEmail = Get-UserInput "Your email (e.g., 'john@example.com')" $GitUserEmail
    
    Write-Host ""
    Write-ColorMessage "✅ User identity configured" "Success"
    
    # ============================================================
    # STEP 4: Gather GitHub Information
    # ============================================================
    Write-StepHeader "4" "GitHub Repository Details"
    
    $GitHubUsername = Get-UserInput "Your GitHub username" $GitHubUsername
    $RepoName = Get-UserInput "GitHub repository name (e.g., 'engineering-graphics-lab')" $RepoName
    
    # ============================================================
    # STEP 5: Choose Authentication Method
    # ============================================================
    Write-StepHeader "5" "Authentication Method"
    
    if ([string]::IsNullOrWhiteSpace($AuthMethod)) {
        Write-Host ""
        Write-ColorMessage "  Choose how to authenticate with GitHub:" "Info"
        Write-Host "    1. HTTPS (recommended for beginners) - requires Personal Access Token"
        Write-Host "    2. SSH - requires SSH key setup"
        Write-Host ""
        
        $authChoice = Read-Host "  Enter 1 or 2"
        $AuthMethod = if ($authChoice -eq "2") { "ssh" } else { "https" }
    }
    
    # Build remote URL
    if ($AuthMethod -eq "ssh") {
        $remoteUrl = "git@github.com:$GitHubUsername/$RepoName.git"
        Write-ColorMessage "  Using SSH: $remoteUrl" "Info"
        Write-Host ""
        Write-ColorMessage "  ⚠ Make sure you have SSH keys set up on GitHub!" "Warning"
        Write-ColorMessage "  See: https://docs.github.com/en/authentication/connecting-to-github-with-ssh" "Info"
    }
    else {
        $remoteUrl = "https://github.com/$GitHubUsername/$RepoName.git"
        Write-ColorMessage "  Using HTTPS: $remoteUrl" "Info"
        Write-Host ""
        Write-ColorMessage "  ⚠ You'll need a Personal Access Token (PAT) to push!" "Warning"
        Write-ColorMessage "  Create one at: https://github.com/settings/tokens" "Info"
        Write-ColorMessage "  Required scope: 'repo'" "Info"
        Write-Host ""
        
        if (Get-YesNoInput "Do you have a Personal Access Token ready?" $true) {
            Write-ColorMessage "  Great! You'll be prompted for it when pushing." "Info"
        }
        else {
            Write-ColorMessage "  Please create a PAT before continuing:" "Warning"
            Write-ColorMessage "  1. Go to: https://github.com/settings/tokens" "Info"
            Write-ColorMessage "  2. Click 'Generate new token (classic)'" "Info"
            Write-ColorMessage "  3. Select 'repo' scope" "Info"
            Write-ColorMessage "  4. Copy the token (you won't see it again!)" "Info"
            Write-Host ""
            
            if (-not (Get-YesNoInput "Ready to continue?" $false)) {
                Write-ColorMessage "Setup cancelled. Run this script again when you have your PAT." "Info"
                exit 0
            }
        }
    }
    
    # ============================================================
    # STEP 6: Initialize Git Repository
    # ============================================================
    Write-StepHeader "6" "Initialize Git Repository"
    
    if (-not (Test-Path ".git")) {
        Write-ColorMessage "  Initializing Git repository..." "Info"
        git init
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorMessage "✅ Git repository initialized" "Success"
        }
        else {
            throw "Failed to initialize Git repository"
        }
    }
    else {
        Write-ColorMessage "  Repository already initialized" "Info"
    }
    
    # Set default branch name
    git branch -M $DefaultBranch
    Write-ColorMessage "✅ Default branch set to: $DefaultBranch" "Success"
    
    # ============================================================
    # STEP 7: Configure Git User
    # ============================================================
    Write-StepHeader "7" "Configure Git User Settings"
    
    git config user.name $GitUserName
    git config user.email $GitUserEmail
    
    Write-ColorMessage "✅ Git user configured:" "Success"
    Write-Host "     Name:  $GitUserName"
    Write-Host "     Email: $GitUserEmail"
    
    # ============================================================
    # STEP 8: Create .gitignore
    # ============================================================
    Write-StepHeader "8" "Create .gitignore File"
    
    if ($CreateGitIgnore) {
        New-BasicGitIgnore -RepoPath $RepoPath
    }
    else {
        Write-ColorMessage "  Skipping .gitignore creation" "Info"
    }
    
    # ============================================================
    # STEP 9: Create Initial Commit
    # ============================================================
    Write-StepHeader "9" "Create Initial Commit"
    
    # Check if there are any files
    $files = Get-ChildItem -Path $RepoPath -Recurse -File | Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' }
    
    if ($files.Count -eq 0) {
        Write-ColorMessage "  No files found. Creating README.md..." "Info"
        $readmeContent = @"
# $RepoName

Engineering Graphics Virtual Lab

## Description

Add your project description here.

## Setup

1. Clone this repository
2. Follow setup instructions

## Usage

Add usage instructions here.
"@
        Set-Content -Path "README.md" -Value $readmeContent -Encoding UTF8
        Write-ColorMessage "✅ Created README.md" "Success"
    }
    
    Write-ColorMessage "  Staging all files..." "Info"
    git add .
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to stage files"
    }
    
    Write-ColorMessage "  Creating initial commit..." "Info"
    git commit -m "Initial commit: Virtual lab setup"
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorMessage "✅ Initial commit created" "Success"
    }
    else {
        Write-ColorMessage "⚠ No changes to commit (this is OK if repo already has commits)" "Warning"
    }
    
    # ============================================================
    # STEP 10: Add Remote Origin
    # ============================================================
    Write-StepHeader "10" "Connect to GitHub"
    
    # Check if remote already exists
    $existingRemote = git remote get-url origin 2>$null
    
    if ($existingRemote) {
        Write-ColorMessage "  Remote 'origin' already exists: $existingRemote" "Warning"
        
        if (Get-YesNoInput "Do you want to replace it with $remoteUrl?" $false) {
            git remote remove origin
            git remote add origin $remoteUrl
            Write-ColorMessage "✅ Remote 'origin' updated" "Success"
        }
        else {
            Write-ColorMessage "  Keeping existing remote" "Info"
        }
    }
    else {
        git remote add origin $remoteUrl
        Write-ColorMessage "✅ Remote 'origin' added: $remoteUrl" "Success"
    }
    
    # ============================================================
    # STEP 11: Push to GitHub
    # ============================================================
    Write-StepHeader "11" "Push to GitHub"
    
    Write-ColorMessage "  Attempting to push to GitHub..." "Info"
    Write-Host ""
    
    if ($AuthMethod -eq "https") {
        Write-ColorMessage "  📌 When prompted, use your GitHub username and Personal Access Token (NOT password)" "Warning"
        Write-Host ""
    }
    
    git push -u origin $DefaultBranch
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorMessage "✅ Successfully pushed to GitHub!" "Success"
        $setupSuccess = $true
    }
    else {
        Write-ColorMessage "⚠ Push failed. This might be because:" "Warning"
        Write-Host "   • Repository doesn't exist on GitHub yet"
        Write-Host "   • Authentication failed (wrong token/SSH key)"
        Write-Host "   • Network connection issues"
        Write-Host ""
        Write-ColorMessage "  You can manually create the repository on GitHub and try pushing again:" "Info"
        Write-ColorMessage "  git push -u origin $DefaultBranch" "Info"
        $setupSuccess = $false
    }
    
    # ============================================================
    # FINAL SUMMARY
    # ============================================================
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                    SETUP COMPLETE!                     ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    Write-ColorMessage "📋 Summary:" "Info"
    Write-Host "   Repository:     $RepoPath"
    Write-Host "   Branch:         $DefaultBranch"
    Write-Host "   Remote:         $remoteUrl"
    Write-Host "   User:           $GitUserName <$GitUserEmail>"
    Write-Host ""
    
    if ($setupSuccess) {
        Write-ColorMessage "🎉 Your repository is now connected to GitHub!" "Success"
        Write-Host ""
        Write-ColorMessage "Next Steps:" "Info"
        Write-Host "   1. Verify your code is on GitHub:"
        Write-Host "      https://github.com/$GitHubUsername/$RepoName"
        Write-Host ""
        Write-Host "   2. Make changes to your files"
        Write-Host ""
        Write-Host "   3. Use the auto-backup script for ongoing commits:"
        Write-Host "      .\git-auto-backup-unified.ps1 -Action test"
        Write-Host "      .\git-auto-backup-unified.ps1 -Action once"
        Write-Host ""
    }
    else {
        Write-ColorMessage "⚠ Setup partially complete - manual push needed" "Warning"
        Write-Host ""
        Write-ColorMessage "To complete setup:" "Info"
        Write-Host "   1. Create repository on GitHub:"
        Write-Host "      https://github.com/new"
        Write-Host "      Repository name: $RepoName"
        Write-Host "      Keep it empty (no README, no .gitignore)"
        Write-Host ""
        Write-Host "   2. Then push:"
        Write-Host "      git push -u origin $DefaultBranch"
        Write-Host ""
    }
    
    Write-ColorMessage "📚 Useful Git Commands:" "Info"
    Write-Host "   git status              - Check repository status"
    Write-Host "   git add .               - Stage all changes"
    Write-Host "   git commit -m 'msg'     - Commit changes"
    Write-Host "   git push                - Push to GitHub"
    Write-Host "   git pull                - Pull from GitHub"
    Write-Host ""
    
}
catch {
    Write-Host ""
    Write-ColorMessage "❌ Setup failed: $($_.Exception.Message)" "Error"
    Write-Host ""
    Write-ColorMessage "Stack trace:" "Info"
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    Write-Host ""
    exit 1
}

#endregion