# PowerShell script to create git commits for sync-service implementation
# Run this from the AdminPanelClone directory

Write-Host "Creating git commits for sync-service..." -ForegroundColor Green

# Check if git is initialized
if (-Not (Test-Path .git)) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Commit 1: Project structure
Write-Host "Commit 1: Project structure..." -ForegroundColor Cyan
git add sync-service/package.json sync-service/tsconfig.json sync-service/jest.config.js sync-service/.gitignore sync-service/.env.example
git commit -m "feat(sync-service): initialize project structure and dependencies"

# Commit 2: Configuration and logging
Write-Host "Commit 2: Configuration and logging..." -ForegroundColor Cyan
git add sync-service/src/config.ts sync-service/src/logger.ts
git commit -m "feat(sync-service): add configuration management and structured logging"

# Commit 3: HTTP client
Write-Host "Commit 3: HTTP client..." -ForegroundColor Cyan
git add sync-service/src/http-client.ts
git commit -m "feat(sync-service): implement HTTP client with retry logic and exponential backoff"

# Commit 4: Transformers
Write-Host "Commit 4: Data transformers..." -ForegroundColor Cyan
git add sync-service/src/transformers/
git commit -m "feat(sync-service): add data transformers for API mapping"

# Commit 5: Sync controller
Write-Host "Commit 5: Sync controller..." -ForegroundColor Cyan
git add sync-service/src/syncController.ts
git commit -m "feat(sync-service): implement core sync controller with batch processing"

# Commit 6: API routes and server
Write-Host "Commit 6: API routes and server..." -ForegroundColor Cyan
git add sync-service/src/routes.ts sync-service/src/index.ts
git commit -m "feat(sync-service): add REST API routes and Express server"

# Commit 7: Tests
Write-Host "Commit 7: Tests..." -ForegroundColor Cyan
git add sync-service/src/__tests__/
git commit -m "test(sync-service): add unit tests for sync controller"

# Commit 8: Documentation
Write-Host "Commit 8: Documentation..." -ForegroundColor Cyan
git add sync-service/README.md sync-service/PR_DESCRIPTION.md sync-service/create-commits.sh sync-service/create-commits.ps1
git commit -m "docs(sync-service): add comprehensive documentation and PR description"

Write-Host "`n✓ All commits created successfully!" -ForegroundColor Green
git log --oneline -8
