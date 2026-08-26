const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The block we want to remove from inside the useEffect
const blockToRemove = `  if (!isLoggedIn && !isAdminLoggedIn) {
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
`;

content = content.replace(blockToRemove, "");

// Restore the original "return () => clearInterval(timer);" since it got messed up? Wait, let's see what is on line 131.
fs.writeFileSync('src/App.tsx', content);
