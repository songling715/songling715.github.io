@echo off
setlocal
cd /d "%~dp0"

echo [1/5] Building site...
call npx hexo generate
if errorlevel 1 goto fail

echo.
echo [2/5] Deploying to Cloudflare Pages...
call npx wrangler pages deploy public --project-name=songling715 --branch=main --commit-dirty=true
if errorlevel 1 goto fail

echo.
echo [3/5] Pinging search engines (IndexNow)...
call node tools/indexnow.js

echo.
echo [4/5] Syncing to CSDN / cnblogs / juejin...
call node tools/sync-platforms.js
if errorlevel 1 echo        (sync skipped - install the Wechatsync Chrome extension to enable it)

echo.
echo [5/5] Pushing source to GitHub...
git add -A
git commit -m "publish: %date% %time%" >nul 2>&1
git push
if errorlevel 1 echo        (nothing to push, skipped)

echo.
echo ==============================================
echo  Done.  https://songling715.dpdns.org
echo ==============================================
pause
exit /b 0

:fail
echo.
echo Publish FAILED. Check the messages above.
pause
exit /b 1
