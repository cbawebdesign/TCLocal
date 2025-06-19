// pages/api/priceAlerts.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (same as your other APIs)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS!, 'base64').toString()
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET, POST, DELETE
  if (!['GET','POST','DELETE'].includes(req.method!)) {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Authenticate via Firebase ID token
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }
    const idToken = auth.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    // Collection path: /users/{uid}/priceAlerts
    const coll = db.collection('users').doc(uid).collection('priceAlerts');

    switch (req.method) {
      case 'GET': {
        // List all alerts
        const snap = await coll.orderBy('createdAt','desc').get();
        const alerts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return res.status(200).json(alerts);
      }

      case 'POST': {
        // Create new alert
        const { symbol, target, direction, note } = req.body;
        if (
          typeof symbol !== 'string' ||
          typeof target !== 'number' ||
          !['above','below'].includes(direction)
        ) {
          return res.status(400).json({ error: 'Bad request body' });
        }
        const docRef = await coll.add({
          symbol,
          target,
          direction,
          note: note || '',
          triggered: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        const snap = await docRef.get();
        return res.status(201).json({ id: snap.id, ...snap.data() });
      }

      case 'DELETE': {
        // Delete an alert
        const { id } = req.body;
        if (typeof id !== 'string') {
          return res.status(400).json({ error: 'ID is required' });
        }
        await coll.doc(id).delete();
        return res.status(200).end();
      }
    }
  } catch (err: any) {
    console.error('❌ priceAlerts API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
