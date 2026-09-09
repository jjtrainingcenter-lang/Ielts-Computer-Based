import https from 'https';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/candidates?key=${config.apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log("Response:", data));
}).on('error', (err) => console.log("Error:", err.message));
