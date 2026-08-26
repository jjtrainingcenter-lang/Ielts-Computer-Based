const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const loginBlock = `  if (!isLoggedIn && !isAdminLoggedIn) {
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

  return (`;

content = content.replace("  return (", loginBlock);

fs.writeFileSync('src/App.tsx', content);
