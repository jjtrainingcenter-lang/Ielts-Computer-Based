const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

content = content.replace(
  `listeningAudioUrl,
      listeningAudioParts: [], // Simplified for now`,
  `listeningData: [{ partNumber: 1, title: 'Listening Test', audioUrl: listeningAudioUrl, audioDuration: 0, instructions: '' }],`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
