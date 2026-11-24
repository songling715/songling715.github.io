@echo off
setlocal
cd /d "%~dp0"

echo [1/3] Building site...
call npx hexo generate
if errorlevel 1 goto fail

echo.
echo [2/3] Deploying to Cloudflare Pages...
call npx wrangler pages deploy public --project-name=songling715 --branch=main --commit-dirty=true
if errorlevel 1 goto fail

echo.
echo [3/3] Pushing source to GitHub...
git add -A
git commit -m "publish: %date% %time%" >nul 2>&1
git push
if errorlevel 1 echo        (nothing to push, skipped)

echo.
echo ==============================================
echo  Done.  https://songling715.pages.dev
echo ==============================================
pause
exit /b 0

:fail
echo.
echo Publish FAILED. Check the messages above.
pause
exit /b 1
