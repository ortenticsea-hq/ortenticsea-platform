import { collection, getDocs, setDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { PRODUCTS, SELLERS, CATEGORIES, REVIEWS, REPORTS } from '../constants';

/**
 * Initialize Firestore with mock data from constants
 * Run this once to seed the database
 */
export async function initializeFirestore() {
  try {
    console.log('🔄 Initializing Firestore collections...');

    // Check if data already exists
    const productsSnapshot = await getDocs(collection(db, 'products'));
    if (productsSnapshot.size > 0) {
      console.log('✅ Firestore already initialized. Skipping seed.');
      return;
    }

    const batch = writeBatch(db);

    // Seed SELLERS collection
    console.log('📦 Seeding sellers...');
    for (const seller of SELLERS) {
      batch.set(doc(db, 'sellers', seller.id), seller);
    }

    // Seed PRODUCTS collection
    console.log('📦 Seeding products...');
    for (const product of PRODUCTS) {
      batch.set(doc(db, 'products', product.id), product);
    }

    // Seed CATEGORIES collection
    console.log('📦 Seeding categories...');
    for (const category of CATEGORIES) {
      // Store without icon (icon is a React element, can't be serialized)
      const categoryData = {
        id: category.id,
        name: category.name,
        locked: category.locked || false,
        isSpecial: category.isSpecial || false,
      };
      batch.set(doc(db, 'categories', category.id), categoryData);
    }

    // Seed REVIEWS collection
    console.log('📦 Seeding reviews...');
    for (const review of REVIEWS) {
      batch.set(doc(db, 'reviews', review.id), review);
    }

    // Seed REPORTS collection
    console.log('📦 Seeding reports...');
    for (const report of REPORTS) {
      batch.set(doc(db, 'reports', report.id), report);
    }

    // Commit batch
    await batch.commit();
    console.log('✅ Firestore initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    throw error;
  }
}

/**
 * Clear all data from Firestore (useful for testing)
 */
export async function clearFirestore() {
  try {
    console.log('🗑️ Clearing Firestore...');
    const collections = ['products', 'sellers', 'categories', 'reviews', 'reports', 'applications', 'users'];

    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`✅ Cleared ${collectionName}`);
    }

    console.log('✅ Firestore cleared!');
  } catch (error) {
    console.error('❌ Error clearing Firestore:', error);
    throw error;
  }
}
