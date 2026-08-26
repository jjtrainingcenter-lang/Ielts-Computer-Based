const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import for addDoc, collection if not present
if (!content.includes('import { collection, addDoc }')) {
  content = content.replace(
    "import { db, isConfigured } from './lib/firebase';",
    "import { db, isConfigured } from './lib/firebase';\nimport { collection, addDoc } from 'firebase/firestore';"
  );
} else if (!content.includes('addDoc')) {
  content = content.replace(
    "import { db, isConfigured } from './lib/firebase';",
    "import { db, isConfigured } from './lib/firebase';\nimport { collection, addDoc } from 'firebase/firestore';"
  );
}

// Ensure db is imported if not
if (!content.includes('db,')) {
  content = content.replace(
    "import { isConfigured } from './lib/firebase';",
    "import { db, isConfigured } from './lib/firebase';\nimport { collection, addDoc } from 'firebase/firestore';"
  );
}

// Add handleFinishTest function
const saveFunction = `
  const handleFinishTest = async () => {
    setIsTimerRunning(false);
    setIsResultsModalOpen(true);
    
    // Save to Firebase
    if (isConfigured) {
      try {
        let listeningCorrect = 0;
        currentTest.listeningQuestions.forEach(q => {
          const uAns = (userAnswers[q.id] || '').trim().toLowerCase();
          const cAns = q.correctAnswer.trim().toLowerCase();
          if (uAns === cAns) listeningCorrect++;
        });

        let readingCorrect = 0;
        currentTest.readingQuestions.forEach(q => {
          const uAns = (userAnswers[q.id] || '').trim().toLowerCase();
          const cAns = q.correctAnswer.trim().toLowerCase();
          if (uAns === cAns) readingCorrect++;
        });

        await addDoc(collection(db, 'results'), {
          candidateId: candidateId,
          candidateName: candidateName,
          testId: currentTest.id,
          listeningScore: listeningCorrect,
          readingScore: readingCorrect,
          writingTask1: writingTask1,
          writingTask2: writingTask2,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error("Error saving result", e);
      }
    }
  };
`;

if (!content.includes('handleFinishTest')) {
  content = content.replace(
    "  // Reset question index when switching sections",
    saveFunction + "\n  // Reset question index when switching sections"
  );
  
  // Replace the interval trigger
  content = content.replace(
    "setIsResultsModalOpen(true);",
    "handleFinishTest();"
  );

  // Add a finish button to the header
  content = content.replace(
    "onOpenSettings={() => setIsSettingsModalOpen(true)}",
    "onOpenSettings={() => setIsSettingsModalOpen(true)}\n          onFinishTest={handleFinishTest}"
  );
}

fs.writeFileSync('src/App.tsx', content);
