<#
.SYNOPSIS
  Configure Git Authentication with Personal Access Token

.DESCRIPTION
  Stores your GitHub Personal Access Token in Windows Credential Manager
  so Git scripts can use it for HTTPS authentication.

.USAGE
  # Interactive mode (will prompt for token securely)
  .\git-setup-token.ps1

.PARAMETERS
  -Token: Your GitHub Personal Access Token
  -Username: Your GitHub username (default: current git config user.name)

.NOTES
  Get a token at: https://github.com/settings/tokens
  Required scope: 'repo'
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$Token = "",

    [Parameter(Mandatory = $false)]
    [string]$Username = ""
)

# Don't use strict error handling for credential manager detection
$ErrorActionPreference = "Continue"

function Write-ColorMessage {
    param([string]$Message, [string]$Type = "Info")
    
    $color = switch ($Type) {
        "Success" { "Green" }
        "Error" { "Red" }
        "Warning" { "Yellow" }
        "Info" { "Cyan" }
        default { "White" }
    }
    
    Write-Host $Message -ForegroundColor $color
}

function Get-SecureInput {
    param([string]$Prompt)
    
    $secureString = Read-Host -Prompt $Prompt -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
    $plainText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    
    return $plainText
}

try {
    Write-Host ""
    Write-ColorMessage "===================================================================" "Cyan"
    Write-ColorMessage " GITHUB PERSONAL ACCESS TOKEN SETUP" "Cyan"
    Write-ColorMessage "===================================================================" "Cyan"
    Write-Host ""

    # Get username
    if ([string]::IsNullOrWhiteSpace($Username)) {
        # Try to get from git config
        $gitUsername = git config user.name 2>$null
        if ($gitUsername) {
            Write-ColorMessage "Found Git username: $gitUsername" "Info"
            $useIt = Read-Host "Use this username? (Y/n)"
            if ($useIt -match '^[Yy]' -or [string]::IsNullOrWhiteSpace($useIt)) {
                $Username = $gitUsername
            }
        }
        
        if ([string]::IsNullOrWhiteSpace($Username)) {
            $Username = Read-Host "Enter your GitHub username"
        }
    }

    Write-ColorMessage "Username: $Username" "Success"
    Write-Host ""

    # Get token
    if ([string]::IsNullOrWhiteSpace($Token)) {
        Write-ColorMessage "[INFO] Get your Personal Access Token at: https://github.com/settings/tokens" "Info"
        Write-ColorMessage "   Required scope: 'repo'" "Info"
        Write-Host ""
        
        $Token = Get-SecureInput "Enter your Personal Access Token (hidden)"
    }

    if ([string]::IsNullOrWhiteSpace($Token)) {
        Write-ColorMessage "[ERROR] Token is required" "Error"
        exit 1
    }

    # Validate token format
    if (-not ($Token -match '^(ghp_|github_pat_)[a-zA-Z0-9_]+$')) {
        Write-ColorMessage "[WARNING] Token doesn't match expected format" "Warning"
        Write-ColorMessage "   Classic tokens start with: ghp_" "Warning"
        Write-ColorMessage "   Fine-grained tokens start with: github_pat_" "Warning"
        Write-Host ""
        $continue = Read-Host "Continue anyway? (y/N)"
        if (-not ($continue -match '^[Yy]')) {
            Write-ColorMessage "Setup cancelled" "Info"
            exit 0
        }
    }

    Write-Host ""
    Write-ColorMessage "Setting up authentication..." "Info"
    Write-Host ""

    # Configure Git to use the standard credential helper
    Write-ColorMessage "[1/2] Configuring Git credential storage..." "Info"
    
    # Set to wincred which works on all Windows Git installations
    git config --global credential.helper wincred 2>$null
    Write-ColorMessage "   [OK] Set credential.helper to wincred" "Success"

    # Store the credential using git credential approve
    Write-ColorMessage "[2/2] Storing your GitHub credentials..." "Info"
    
    $credentialInput = @"
protocol=https
host=github.com
username=$Username
password=$Token

"@

    # Use git credential approve which works with all credential helpers
    try {
        $credentialInput | git credential approve 2>&1 | Out-Null
        Write-ColorMessage "   [OK] Credentials stored in Windows Credential Manager" "Success"
    }
    catch {
        Write-ColorMessage "   [WARNING] Standard method had issues, trying alternative..." "Warning"
        
        # Alternative: use git credential fill and approve
        $fillResult = $credentialInput | git credential fill 2>&1
        $fillResult | git credential approve 2>&1 | Out-Null
        Write-ColorMessage "   [OK] Credentials stored using alternative method" "Success"
    }

    Write-Host ""
    Write-ColorMessage "===================================================================" "Cyan"
    Write-ColorMessage " SETUP COMPLETE" "Cyan"
    Write-ColorMessage "===================================================================" "Cyan"
    Write-Host ""

    Write-ColorMessage "[OK] Your Personal Access Token is now stored!" "Success"
    Write-Host ""
    
    Write-ColorMessage "What was configured:" "Info"
    Write-Host "   * Git credential helper: wincred (Windows Credential Manager)"
    Write-Host "   * GitHub username: $Username"
    Write-Host "   * Token: stored securely and encrypted"
    Write-Host ""
    
    Write-ColorMessage "Verification:" "Info"
    Write-Host "   You can verify the credentials are stored by opening:" -ForegroundColor Gray
    Write-Host "   Control Panel > Credential Manager > Windows Credentials" -ForegroundColor Gray
    Write-Host "   Look for 'git:https://github.com' entries" -ForegroundColor Gray
    Write-Host ""

    Write-ColorMessage "Next steps - Run these commands:" "Info"
    Write-Host ""
    Write-Host "   # Initialize your repository" -ForegroundColor Yellow
    Write-Host "   .\git-init-setup.ps1 -GitHubUsername `"$Username`" -RepoName `"EG_Virtual_Lab`" -GitUserName `"$Username`" -GitUserEmail `"cadsanthanam@gmail.com`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   # Test with a one-time backup" -ForegroundColor Yellow
    Write-Host "   .\git-auto-backup-unified.ps1 -Action once" -ForegroundColor Gray
    Write-Host ""

    Write-ColorMessage "Note: Git will now use your token automatically for all GitHub operations!" "Success"
    Write-Host ""
}
catch {
    Write-Host ""
    Write-ColorMessage "[ERROR] Setup failed: $($_.Exception.Message)" "Error"
    Write-Host ""
    Write-Host "Please try the following:" -ForegroundColor Yellow
    Write-Host "1. Make sure Git is installed and in your PATH" -ForegroundColor Gray
    Write-Host "2. Run 'git --version' to verify Git is accessible" -ForegroundColor Gray
    Write-Host "3. Try running this script again" -ForegroundColor Gray
    Write-Host ""
    exit 1
}