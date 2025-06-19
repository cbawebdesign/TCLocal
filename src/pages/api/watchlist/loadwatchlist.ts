// pages/api/loadWatchlist.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'UID is required' });
    }

    const doc = await db.collection('watchlists').doc(uid).get();
    if (!doc.exists) {
      return res.status(200).json({ watchlists: [] }); // return empty if none yet
    }

    const data = doc.data();
    res.status(200).json({ watchlists: data?.watchlists || [] });
  } catch (err: any) {
    console.error('❌ Load error:', err.message);
    res.status(500).json({ error: 'Failed to load watchlists', details: err.message });
  }
}
