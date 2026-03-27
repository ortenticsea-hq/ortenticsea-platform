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

function parseEmailList(raw) {
  if (!raw) return [];
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getDefaultAdminEmails() {
  const fromEnv = process.env.ADMIN_EMAILS;
  return parseEmailList(fromEnv).length > 0 ? parseEmailList(fromEnv) : defaultAdminEmails;
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

function parseArgs(argv) {
  const [maybeCommand, ...rest] = argv;
  const command = ['assign', 'check', 'revoke'].includes(maybeCommand) ? maybeCommand : 'assign';
  const remainingArgs = command === maybeCommand ? rest : argv;

  const inlineEmailArg = remainingArgs.find((arg) => arg.startsWith('--emails='));
  const positionalEmailArg = remainingArgs.find((arg) => !arg.startsWith('--'));
  const parsedEmails = parseEmailList(inlineEmailArg?.slice('--emails='.length) || positionalEmailArg);
  const emails = parsedEmails.length > 0 ? parsedEmails : getDefaultAdminEmails();

  return { command, emails };
}

function formatStatus(label, value) {
  return `${label}: ${value ?? 'n/a'}`;
}

async function getUserSnapshot(auth, db, email) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await auth.getUserByEmail(normalizedEmail);
    const userDoc = await db.collection('users').doc(user.uid).get();
    const customClaims = user.customClaims || {};
    const firestoreRole = userDoc.exists ? userDoc.data()?.role ?? null : null;

    return {
      ok: true,
      email: normalizedEmail,
      uid: user.uid,
      customRole: customClaims.role ?? null,
      firestoreRole,
      emailVerified: user.emailVerified,
      userDocExists: userDoc.exists,
    };
  } catch (error) {
    return {
      ok: false,
      email: normalizedEmail,
      error,
    };
  }
}

async function assignAdminClaims(auth, db, emails) {
  let hadError = false;

  for (const email of emails) {
    const snapshot = await getUserSnapshot(auth, db, email);
    if (!snapshot.ok) {
      hadError = true;
      console.error(`Could not load ${snapshot.email}:`, snapshot.error?.message || snapshot.error);
      continue;
    }

    const user = await auth.getUser(snapshot.uid);
    const existingClaims = user.customClaims || {};

    await auth.setCustomUserClaims(user.uid, { ...existingClaims, role: 'admin' });

    await db.collection('users').doc(user.uid).set(
      {
        id: user.uid,
        email: snapshot.email,
        role: 'admin',
        emailVerified: user.emailVerified,
      },
      { merge: true }
    );

    console.log(`Assigned admin claim to ${snapshot.email} (uid: ${snapshot.uid})`);
  }

  if (hadError) {
    process.exitCode = 1;
  }
}

async function checkAdminClaims(auth, db, emails) {
  let hadError = false;

  for (const email of emails) {
    const snapshot = await getUserSnapshot(auth, db, email);
    if (!snapshot.ok) {
      hadError = true;
      console.error(`Could not load ${snapshot.email}:`, snapshot.error?.message || snapshot.error);
      continue;
    }

    console.log(
      [
        `User: ${snapshot.email}`,
        `  ${formatStatus('uid', snapshot.uid)}`,
        `  ${formatStatus('custom claim role', snapshot.customRole)}`,
        `  ${formatStatus('firestore role', snapshot.firestoreRole)}`,
        `  ${formatStatus('email verified', snapshot.emailVerified)}`,
        `  ${formatStatus('user doc exists', snapshot.userDocExists)}`,
      ].join('\n')
    );
  }

  if (hadError) {
    process.exitCode = 1;
  }
}

async function revokeAdminClaims(auth, db, emails) {
  let hadError = false;

  for (const email of emails) {
    const snapshot = await getUserSnapshot(auth, db, email);
    if (!snapshot.ok) {
      hadError = true;
      console.error(`Could not load ${snapshot.email}:`, snapshot.error?.message || snapshot.error);
      continue;
    }

    const user = await auth.getUser(snapshot.uid);
    const existingClaims = { ...(user.customClaims || {}) };
    delete existingClaims.role;

    await auth.setCustomUserClaims(user.uid, existingClaims);
    await db.collection('users').doc(user.uid).set({ role: 'buyer' }, { merge: true });

    console.log(`Revoked admin claim for ${snapshot.email} (uid: ${snapshot.uid})`);
  }

  if (hadError) {
    process.exitCode = 1;
  }
}

async function main() {
  initAdmin();
  const auth = getAuth();
  const db = getFirestore();
  const { command, emails } = parseArgs(process.argv.slice(2));

  if (emails.length === 0) {
    throw new Error('No emails provided. Pass a comma-separated list or set ADMIN_EMAILS.');
  }

  if (command === 'check') {
    await checkAdminClaims(auth, db, emails);
    return;
  }

  if (command === 'revoke') {
    await revokeAdminClaims(auth, db, emails);
    return;
  }

  await assignAdminClaims(auth, db, emails);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
