const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state
content = content.replace(
  "  const [isLoggedIn, setIsLoggedIn] = useState(false);",
  "  const [isLoggedIn, setIsLoggedIn] = useState(false);\n  const [hasConfirmedInstructions, setHasConfirmedInstructions] = useState(false);"
);

// 2. Add import for CandidateInstructions
content = content.replace(
  "import { AdminDashboard } from './components/AdminDashboard';",
  "import { AdminDashboard } from './components/AdminDashboard';\nimport { CandidateInstructions } from './components/CandidateInstructions';"
);

// 3. Update handleFinishTest
const oldHandleFinish = `  const handleFinishTest = async () => {
    setIsTimerRunning(false);
    setIsResultsModalOpen(true);`;

const newHandleFinish = `  const handleFinishTest = async () => {
    if (!window.confirm("Are you sure you want to finish the test? Your answers will be submitted.")) return;
    setIsTimerRunning(false);
    setIsResultsModalOpen(true);`;

content = content.replace(oldHandleFinish, newHandleFinish);

// 4. Render CandidateInstructions
const renderBlock = `  if (!isLoggedIn && !isAdminLoggedIn) {
    return (
      <LoginScreen
        onLogin={(id, name) => {
          setCandidateId(id);
          setCandidateName(name);
          setIsLoggedIn(true);
        }}
        onAdminLogin={() => {
          setIsAdminLoggedIn(true);
          setIsAdminDashboardOpen(true);
        }}
      />
    );
  }

  if (isLoggedIn && !isAdminLoggedIn && !hasConfirmedInstructions) {
    return (
      <CandidateInstructions
        candidateName={candidateName}
        candidateId={candidateId}
        onStart={() => setHasConfirmedInstructions(true)}
      />
    );
  }`;

content = content.replace(`  if (!isLoggedIn && !isAdminLoggedIn) {
    return (
      <LoginScreen
        onLogin={(id, name) => {
          setCandidateId(id);
          setCandidateName(name);
          setIsLoggedIn(true);
        }}
        onAdminLogin={() => {
          setIsAdminLoggedIn(true);
          setIsAdminDashboardOpen(true);
        }}
      />
    );
  }`, renderBlock);

// 5. Add beforeunload listener
content = content.replace(
  "  // Sync active passage with current question",
  `  // Prevent accidental reload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isLoggedIn && !isAdminLoggedIn && hasConfirmedInstructions && isTimerRunning) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLoggedIn, isAdminLoggedIn, hasConfirmedInstructions, isTimerRunning]);

  // Sync active passage with current question`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx");
