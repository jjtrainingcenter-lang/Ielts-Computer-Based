const fs = require('fs');

function replaceOrThrow(content, from, to, label) {
  if (!content.includes(from)) {
    if (content.includes(to)) {
      console.log(`${label}: already applied`);
      return content;
    }
    throw new Error(`${label}: expected source block not found`);
  }
  console.log(`${label}: applied`);
  return content.replace(from, to);
}

// 1) Make runtime scoring accept the public JSON alias directly.
{
  const path = 'src/App.tsx';
  let content = fs.readFileSync(path, 'utf8');
  content = replaceOrThrow(
    content,
    "      if (q.type === 'multiple-response') {",
    "      if (q.type === 'multiple-response' || q.type === 'multiple-choice-multiple-answer') {",
    'App multi-answer scoring'
  );
  fs.writeFileSync(path, content);
}

// 2) Preserve rich imported tests by editing them in JSON Builder and make new Visual Builder tests structurally complete.
{
  const path = 'src/components/AdminDashboard.tsx';
  let content = fs.readFileSync(path, 'utf8');

  content = replaceOrThrow(
    content,
    "    // Switch to visual builder tab\n    setActiveTab('visual-builder');\n    setStatus(`Editing test: \"${testToEdit.title}\" (ID: ${testToEdit.id})`);",
    "    // Rich imported tests must be edited in JSON Builder so no listening/speaking/media arrays are flattened.\n    setActiveTab('json-builder');\n    setStatus(`Editing full test in JSON Builder: \"${testToEdit.title}\" (ID: ${testToEdit.id})`);",
    'Admin rich-test edit mode'
  );

  const oldSpeaking = `      speakingTasks: [
        {
          partNumber: 1,
          title: 'Speaking Part 1',
          topic: 'General Introduction & Everyday Life',
          questions: ['Introduce yourself.', 'Describe your studies or work.']
        }
      ],`;

  const newSpeaking = `      speakingTasks: [
        {
          partNumber: 1,
          title: 'Speaking Part 1',
          topic: 'Introduction and Interview',
          questions: [
            'Tell me about your home, work or studies.',
            'What do you enjoy doing in your free time?'
          ]
        },
        {
          partNumber: 2,
          title: 'Speaking Part 2',
          topic: 'Individual Long Turn',
          cueCard: {
            mainTopic: 'Describe an experience, person, place or object that is important to you.',
            bulletPoints: [
              'what or who it was',
              'when or where it happened',
              'why it was important to you',
              'and explain how you felt about it'
            ]
          },
          questions: [],
          prepTimeSeconds: 60,
          speakTimeSeconds: 120
        },
        {
          partNumber: 3,
          title: 'Speaking Part 3',
          topic: 'Two-way Discussion',
          questions: [
            'Why do significant experiences affect people differently?',
            'How can society help people learn from important experiences?'
          ]
        }
      ],`;

  content = replaceOrThrow(content, oldSpeaking, newSpeaking, 'Admin Visual Builder speaking structure');
  fs.writeFileSync(path, content);
}

console.log('Full mock-test engine patch completed successfully.');
