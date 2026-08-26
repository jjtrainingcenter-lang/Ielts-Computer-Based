const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

content = content.replace(
  `const addReadingPassage = () => {
    const newPassage: ReadingPassage = {
      id: \`p\${readingPassages.length + 1}_\${Date.now()}\`,
      title: \`Reading Passage \${readingPassages.length + 1}\`,
      content: ''
    };
    setReadingPassages([...readingPassages, newPassage]);
  };`,
  `const addReadingPassage = () => {
    const newPassage: ReadingPassage = {
      id: \`p\${readingPassages.length + 1}_\${Date.now()}\`,
      title: \`Reading Passage \${readingPassages.length + 1}\`,
      partNumber: readingPassages.length + 1,
      paragraphs: [{ id: 'A', text: '' }]
    };
    setReadingPassages([...readingPassages, newPassage]);
  };`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
