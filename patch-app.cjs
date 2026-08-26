const fs = require('fs');
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

if (!appTsx.includes('LoginScreen')) {
  appTsx = appTsx.replace(
    "import { Header } from './components/Header';",
    "import { Header } from './components/Header';\nimport { LoginScreen } from './components/LoginScreen';"
  );
}

if (!appTsx.includes('const [isLoggedIn')) {
  appTsx = appTsx.replace(
    "const [candidateName, setCandidateName] = useState('John Doe');\n  const [candidateId, setCandidateId] = useState('JJ-883920');",
    "const [candidateName, setCandidateName] = useState('John Doe');\n  const [candidateId, setCandidateId] = useState('');\n  const [isLoggedIn, setIsLoggedIn] = useState(false);\n  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);"
  );
}

if (!appTsx.includes('if (!isLoggedIn && !isAdminLoggedIn)')) {
  appTsx = appTsx.replace(
    "  return (\n    <div className=\"h-screen w-screen flex flex-col bg-gray-100 font-sans overflow-hidden\">",
    "  if (!isLoggedIn && !isAdminLoggedIn) {\n    return (\n      <LoginScreen\n        onLogin={(id, name) => {\n          setCandidateId(id);\n          setCandidateName(name);\n          setIsLoggedIn(true);\n        }}\n        onAdminLogin={() => {\n          setIsAdminLoggedIn(true);\n          setIsAdminDashboardOpen(true);\n        }}\n      />\n    );\n  }\n\n  return (\n    <div className=\"h-screen w-screen flex flex-col bg-gray-100 font-sans overflow-hidden\">"
  );
}

fs.writeFileSync('src/App.tsx', appTsx);
