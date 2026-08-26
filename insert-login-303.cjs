const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

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
`;

const returnIndex = lines.findIndex(line => line.startsWith('  return ('));
if (returnIndex !== -1) {
  lines.splice(returnIndex, 0, loginBlock);
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
  console.log("Inserted!");
} else {
  console.log("Could not find '  return ('");
}
