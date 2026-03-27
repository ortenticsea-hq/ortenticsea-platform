# Deployment Scripts

This directory contains scripts for deploying various Firebase resources.

## Available Scripts

### 0. Manage Admin Claims

Verify, assign, or revoke Firebase Auth admin claims and keep the Firestore `users` role in sync.

**Check default admin emails:**
```bash
npm run admin:claims:check
```

**Assign admin to specific emails:**
```bash
npm run admin:claims:assign -- "admin1@example.com,admin2@example.com"
```

**Revoke admin from specific emails:**
```bash
npm run admin:claims:revoke -- "admin1@example.com"
```

**Using environment variables instead of the default local service account file:**
```bash
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccount.json ADMIN_EMAILS=admin@example.com npm run admin:claims:check
```

### 1. Deploy Firestore Security Rules

Deploy the Firestore security rules defined in [`firestore.rules`](../firestore.rules).

**Linux/Mac:**
```bash
chmod +x scripts/deploy-firestore-rules.sh
./scripts/deploy-firestore-rules.sh
```

**Windows:**
```cmd
scripts\deploy-firestore-rules.bat
```

**Manual Deployment:**
```bash
firebase deploy --only firestore:rules
```

## Prerequisites

1. **Firebase CLI** - Install globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Login** - Authenticate:
   ```bash
   firebase login
   ```

3. **Project Selection** - Select your Firebase project:
   ```bash
   firebase use <project-id>
   ```

## Script Details

### deploy-firestore-rules.sh / .bat

**Purpose:** Deploy Firestore security rules to Firebase

**What it does:**
1. Checks if Firebase CLI is installed
2. Verifies authentication status
3. Deploys security rules
4. Provides deployment status and next steps

**Requirements:**
- Firebase CLI installed
- User authenticated with Firebase
- Valid `firestore.rules` file in project root

**Output:**
- ✅ Success message with next steps
- ❌ Error message with troubleshooting tips

## Troubleshooting

### Issue: Firebase CLI not found

**Solution:**
```bash
npm install -g firebase-tools
```

### Issue: Not authenticated

**Solution:**
```bash
firebase login
```

### Issue: Wrong project

**Solution:**
```bash
firebase use <project-id>
```

### Issue: Permission denied (Linux/Mac)

**Solution:**
```bash
chmod +x scripts/deploy-firestore-rules.sh
```

## Documentation

For detailed information about Firestore security rules, see:
- [`docs/SECURITY_RULES_GUIDE.md`](../docs/SECURITY_RULES_GUIDE.md) - Comprehensive security rules guide
- [`docs/FIRESTORE_MIGRATION.md`](../docs/FIRESTORE_MIGRATION.md) - Migration documentation
- [`firestore.rules`](../firestore.rules) - Security rules definition

## Future Scripts

Additional deployment scripts to be added:
- `deploy-functions.sh` - Deploy Cloud Functions
- `deploy-hosting.sh` - Deploy to Firebase Hosting
- `deploy-all.sh` - Deploy all Firebase resources
- `backup-firestore.sh` - Backup Firestore data
- `seed-data.sh` - Seed initial data

## Contributing

When adding new scripts:
1. Create both `.sh` (Linux/Mac) and `.bat` (Windows) versions
2. Add documentation to this README
3. Include error handling and user feedback
4. Test on both platforms
5. Update the "Future Scripts" section when implemented
