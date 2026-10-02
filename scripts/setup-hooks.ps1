# PowerShell script to set up Git hooks on Windows
Write-Host "Setting up Git hooks..." -ForegroundColor Green

# Ensure .husky directory exists
if (!(Test-Path ".husky")) {
    New-Item -ItemType Directory -Path ".husky" -Force
    Write-Host "Created .husky directory" -ForegroundColor Yellow
}

# Install husky if not already installed
Write-Host "Installing husky..." -ForegroundColor Blue
npm install --save-dev husky lint-staged

# Initialize husky
Write-Host "Initializing husky..." -ForegroundColor Blue
npx husky init

# Set executable permissions (Windows equivalent)
Write-Host "Setting up hook permissions..." -ForegroundColor Blue
if (Test-Path ".husky/pre-commit") {
    Write-Host "Pre-commit hook is ready" -ForegroundColor Green
}
if (Test-Path ".husky/commit-msg") {
    Write-Host "Commit-msg hook is ready" -ForegroundColor Green
}
if (Test-Path ".husky/pre-push") {
    Write-Host "Pre-push hook is ready" -ForegroundColor Green
}

Write-Host "Git hooks setup completed!" -ForegroundColor Green
Write-Host "Hooks will run automatically on git commit and git push" -ForegroundColor Yellow