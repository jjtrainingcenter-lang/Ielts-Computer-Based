import https from 'https';

const projectId = "ielts-computer-based";
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/candidates`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log("Response:", data));
}).on('error', (err) => console.log("Error:", err.message));
