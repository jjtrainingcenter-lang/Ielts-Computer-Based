import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'candidates'));
  const candidates = snap.docs.map(d => d.data());
  console.log("Cloud Candidates:", JSON.stringify(candidates, null, 2));
}

run().catch(console.error);
