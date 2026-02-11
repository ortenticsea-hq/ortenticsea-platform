import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function migrateStatuses() {
  initAdmin();
  const db = getFirestore();
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();

  let updated = 0;
  let skipped = 0;
  const batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const status = data.status;
    if (status === 'pending_approval') {
      batch.update(doc.ref, { status: 'pending' });
      updated += 1;
      batchCount += 1;
    } else if (status === 'live') {
      batch.update(doc.ref, { status: 'approved' });
      updated += 1;
      batchCount += 1;
    } else {
      skipped += 1;
    }

    if (batchCount >= 400) {
      await batch.commit();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`Migration complete. Updated: ${updated}, Skipped: ${skipped}`);
}

migrateStatuses().catch((err) => {
  console.error(err);
  process.exit(1);
});
