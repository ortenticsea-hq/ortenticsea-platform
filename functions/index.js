const crypto = require('crypto');
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const assertString = (value, label) => {
  if (!value || typeof value !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', `${label} is required.`);
  }
  return value;
};

const assertNumber = (value, label) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new functions.https.HttpsError('invalid-argument', `${label} must be a positive number.`);
  }
  return value;
};

const computeSignature = (rawBody, secret) => {
  if (!secret) return null;
  return crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
};

exports.initPaystackTransaction = functions
  .runWith({ secrets: ['PAYSTACK_SECRET_KEY'] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const orderId = assertString(data?.orderId, 'orderId');
    const email = assertString(data?.email, 'email');
    const amount = assertNumber(data?.amount, 'amount');
    const callbackUrl = typeof data?.callbackUrl === 'string' ? data.callbackUrl : undefined;

    const db = admin.firestore();
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found.');
    }

    const order = orderSnap.data() || {};
    if (order.buyerId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Order does not belong to this user.');
    }
    if (order.status && order.status !== 'pending') {
      throw new functions.https.HttpsError('failed-precondition', 'Order is not pending.');
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      throw new functions.https.HttpsError('failed-precondition', 'Paystack secret key not configured.');
    }

    const payload = {
      email,
      amount: Math.round(amount * 100),
      currency: 'NGN',
      metadata: {
        orderId,
        buyerId: context.auth.uid,
      },
      ...(callbackUrl ? { callback_url: callbackUrl } : {}),
    };

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (!response.ok || !json?.status || !json?.data?.authorization_url) {
      throw new functions.https.HttpsError('internal', json?.message || 'Unable to initialize Paystack.');
    }

    const authorizationUrl = json.data.authorization_url;
    const reference = json.data.reference;
    const now = new Date().toISOString();

    await orderRef.set(
      {
        payment: {
          provider: 'paystack',
          status: 'pending',
          reference,
          checkoutUrl: authorizationUrl,
          metadata: payload.metadata,
        },
        updatedAt: now,
      },
      { merge: true }
    );

    return {
      authorizationUrl,
      reference,
    };
  });

exports.paystackWebhook = functions
  .runWith({ secrets: ['PAYSTACK_SECRET_KEY'] })
  .https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.get('x-paystack-signature');
  const expected = computeSignature(req.rawBody, secret);

  if (!expected || !signature || signature !== expected) {
    res.status(401).send('Invalid signature');
    return;
  }

  const event = req.body;
  if (!event || event.event !== 'charge.success') {
    res.status(200).send('ignored');
    return;
  }

  const data = event.data || {};
  const metadata = data.metadata || {};
  const orderId = metadata.orderId || metadata.order_id || metadata.order || metadata.reference;

  if (!orderId) {
    res.status(200).send('no orderId');
    return;
  }

  const db = admin.firestore();
  const orderRef = db.collection('orders').doc(orderId);

  await db.runTransaction(async (tx) => {
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) return;

    const order = orderSnap.data();
    if (!order) return;

    if (['paid', 'shipped', 'delivered'].includes(order.status)) return;

    const paidAt = new Date().toISOString();
    tx.update(orderRef, {
      status: 'paid',
      payment: {
        provider: 'paystack',
        status: 'paid',
        reference: data.reference || null,
        metadata,
        paidAt,
      },
      updatedAt: paidAt,
    });

    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      if (!item?.productId) continue;
      const productRef = db.collection('products').doc(item.productId);
      const productSnap = await tx.get(productRef);
      if (!productSnap.exists) continue;
      const product = productSnap.data();
      const currentQty = Number.isFinite(product?.availableQuantity) ? product.availableQuantity : 1;
      const nextQty = Math.max(0, currentQty - Number(item.quantity || 1));
      tx.update(productRef, { availableQuantity: nextQty });
    }
  });

  res.status(200).send('ok');
});
