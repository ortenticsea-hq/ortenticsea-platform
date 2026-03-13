import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultAdminEmails = [
  'francisetham01@gmail.com',
  'ortenticseateam@gmail.com',
];

function getAdminEmails() {
  const fromEnv = process.env.ADMIN_EMAILS;
  if (!fromEnv) return defaultAdminEmails;
  return fromEnv
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function loadServiceAccount() {
  const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const localPath = path.join(__dirname, 'serviceAccount.json');
  const resolvedPath = envPath ? path.resolve(envPath) : localPath;
  const raw = readFileSync(resolvedPath, 'utf-8');
  return JSON.parse(raw);
}

function initAdmin() {
  if (getApps().length > 0) return;
  const sa = loadServiceAccount();
  if (!sa?.client_email || !sa?.private_key || !sa?.project_id) {
    throw new Error('Invalid service account JSON. Expected project_id, client_email, private_key.');
  }
  initializeApp({
    credential: cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key.replace(/\\n/g, '\n'),
    }),
  });
}

async function setAdminClaims(emails) {
  initAdmin();
  const auth = getAuth();
  const db = getFirestore();

  for (const email of emails) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await auth.getUserByEmail(normalizedEmail);
    const existingClaims = user.customClaims || {};

    await auth.setCustomUserClaims(user.uid, { ...existingClaims, role: 'admin' });

    await db.collection('users').doc(user.uid).set(
      {
        id: user.uid,
        email: normalizedEmail,
        role: 'admin',
        emailVerified: user.emailVerified,
      },
      { merge: true }
    );

    console.log(`Admin claim + user role set for ${normalizedEmail} (uid: ${user.uid})`);
  }
}

setAdminClaims(getAdminEmails()).catch((err) => {
  console.error(err);
  process.exit(1);
});
