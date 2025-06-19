import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS env variable');
  }

  const decoded = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString();
  const serviceAccount = JSON.parse(decoded);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { uid, watchlists } = req.body;

    if (!uid || !Array.isArray(watchlists)) {
      return res.status(400).json({ error: 'Missing uid or watchlists in body' });
    }

    const ref = db.collection('watchlists').doc(uid);
    await ref.set({ watchlists, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    return res.status(200).json({ message: 'Watchlists saved successfully' });
  } catch (error: any) {
    console.error('Error saving watchlists:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
