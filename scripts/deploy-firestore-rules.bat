@echo off
REM Firestore Security Rules Deployment Script for Windows
REM This script deploys the Firestore security rules to Firebase

echo.
echo 🔐 Deploying Firestore Security Rules...
echo.

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Firebase CLI is not installed.
    echo 📦 Installing Firebase CLI...
    call npm install -g firebase-tools
)

REM Check if user is logged in
echo 🔑 Checking Firebase authentication...
call firebase login:list

REM Deploy rules
echo.
echo 🚀 Deploying rules to Firebase...
call firebase deploy --only firestore:rules

REM Check deployment status
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Firestore security rules deployed successfully!
    echo.
    echo 📋 Next steps:
    echo   1. Test rules in Firebase Console Rules Playground
    echo   2. Monitor for permission errors in Firebase Console
    echo   3. Review audit logs for security violations
    echo.
    echo 📚 Documentation: docs/SECURITY_RULES_GUIDE.md
) else (
    echo.
    echo ❌ Deployment failed. Please check the error messages above.
    echo.
    echo 💡 Troubleshooting:
    echo   1. Ensure you're logged in: firebase login
    echo   2. Check your Firebase project: firebase use
    echo   3. Verify firestore.rules file exists
    echo.
)

pause
