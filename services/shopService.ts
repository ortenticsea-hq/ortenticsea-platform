import { collection, doc, setDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from './firestoreDb';
import { storage } from './firebaseStorage';
import { Shop, ShopDocument } from '../types';

const DOC_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const DOC_MAX_SIZE = 10 * 1024 * 1024;

export interface ShopApplicationPayload {
  ownerId: string;
  shopType: 'buyer' | 'seller';
  shopName: string;
  description: string;
  documents: {
    id?: File;
    cac?: File;
    address?: File;
  };
}

function validateDocuments(docs: ShopApplicationPayload['documents'], existingDocs?: ShopDocument[]) {
  const hasExistingId = existingDocs?.some((d) => d.documentType === 'ID') || false;
  const hasExistingAddress = existingDocs?.some((d) => d.documentType === 'ADDRESS') || false;
  const requiredDocs = [
    { file: docs.id, label: 'ID', hasExisting: hasExistingId },
    { file: docs.address, label: 'Proof of address', hasExisting: hasExistingAddress },
  ];
  for (const { file, label, hasExisting } of requiredDocs) {
    if (!file && !hasExisting) throw new Error(`Missing required document: ${label}`);
    if (!file) continue;
    if (!DOC_ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Unsupported ${label} file type: ${file.type}`);
    }
    if (file.size > DOC_MAX_SIZE) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      throw new Error(`${label} file too large (${mb}MB). Max is 10MB.`);
    }
  }
  if (docs.cac) {
    if (!DOC_ALLOWED_TYPES.includes(docs.cac.type)) {
      throw new Error(`Unsupported CAC file type: ${docs.cac.type}`);
    }
    if (docs.cac.size > DOC_MAX_SIZE) {
      const mb = (docs.cac.size / 1024 / 1024).toFixed(1);
      throw new Error(`CAC file too large (${mb}MB). Max is 10MB.`);
    }
  }
}

async function uploadDocument(ownerId: string, shopId: string, type: 'ID' | 'CAC' | 'ADDRESS', file: File) {
  const ext = file.name.split('.').pop() || 'bin';
  const fileName = `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const storageRef = ref(storage, `shops/${ownerId}/${shopId}/${fileName}`);
  const snapshot = await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(snapshot.ref);
}

export async function deleteShopDocument(docItem: ShopDocument): Promise<void> {
  try {
    const fileRef = ref(storage, docItem.fileUrl);
    await deleteObject(fileRef);
  } catch {
    // Ignore storage deletion errors to allow cleanup of firestore doc
  }
  await deleteDoc(doc(db, 'shopDocuments', docItem.id));
}

async function deleteDocumentsByType(existingDocs: ShopDocument[] | undefined, type: 'ID' | 'CAC' | 'ADDRESS') {
  if (!existingDocs || existingDocs.length === 0) return;
  const matches = existingDocs.filter((docItem) => docItem.documentType === type);
  for (const docItem of matches) {
    await deleteShopDocument(docItem);
  }
}

export async function submitShopApplication(payload: ShopApplicationPayload, existingDocs?: ShopDocument[]): Promise<void> {
  validateDocuments(payload.documents, existingDocs);

  const shopRef = doc(db, 'shops', payload.ownerId);
  const shopId = shopRef.id;

  const shop: Shop = {
    id: shopId,
    ownerId: payload.ownerId,
    shopName: payload.shopName.trim(),
    description: payload.description.trim(),
    shopType: payload.shopType,
    status: 'SUBMITTED',
    rejectionReason: '',
    createdAt: new Date().toISOString(),
  };

  await setDoc(
    shopRef,
    {
      ...shop,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  const docs = payload.documents;
  if (docs.id) await deleteDocumentsByType(existingDocs, 'ID');
  if (docs.address) await deleteDocumentsByType(existingDocs, 'ADDRESS');
  if (docs.cac) await deleteDocumentsByType(existingDocs, 'CAC');
  const uploads: Array<Promise<{ type: 'ID' | 'CAC' | 'ADDRESS'; url: string }>> = [];
  if (docs.id) {
    uploads.push(uploadDocument(payload.ownerId, shopId, 'ID', docs.id).then((url) => ({ type: 'ID', url })));
  }
  if (docs.address) {
    uploads.push(uploadDocument(payload.ownerId, shopId, 'ADDRESS', docs.address).then((url) => ({ type: 'ADDRESS', url })));
  }
  if (docs.cac) {
    uploads.push(uploadDocument(payload.ownerId, shopId, 'CAC', docs.cac).then((url) => ({ type: 'CAC', url })));
  }

  const uploaded = await Promise.all(uploads);
  for (const docInfo of uploaded) {
    const docRef = doc(collection(db, 'shopDocuments'));
    const shopDoc: ShopDocument = {
      id: docRef.id,
      shopId,
      documentType: docInfo.type,
      fileUrl: docInfo.url,
      verified: false,
    };
    await setDoc(docRef, shopDoc);
  }
}

export async function resubmitShopApplication(payload: ShopApplicationPayload, existingDocs?: ShopDocument[]): Promise<void> {
  await submitShopApplication(payload, existingDocs);
  const shopRef = doc(db, 'shops', payload.ownerId);
  await updateDoc(shopRef, { status: 'SUBMITTED', rejectionReason: '' });
}
