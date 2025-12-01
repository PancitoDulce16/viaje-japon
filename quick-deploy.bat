@echo off
echo.
echo ========================================
echo   JAPITIN QUICK DEPLOY
echo ========================================
echo.

REM Git add all
echo [1/4] Adding files to git...
git add -A

REM Commit with timestamp
echo [2/4] Creating commit...
set timestamp=%date% %time%
git commit -m "QUICK DEPLOY: %timestamp%"

REM Push to GitHub
echo [3/4] Pushing to GitHub...
git push

REM Deploy to Firebase
echo [4/4] Deploying to Firebase...
firebase deploy --only hosting

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo   URL: https://japan-itin-dev.web.app
echo ========================================
echo.

pause
