const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

content = content.replace(
  "const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');",
  "const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'users' | 'results'>('visual');\n  const [usersList, setUsersList] = useState<any[]>([]);\n  const [resultsList, setResultsList] = useState<any[]>([]);\n  const [newUserId, setNewUserId] = useState('');\n  const [newUserDob, setNewUserDob] = useState('');\n  const [newUserName, setNewUserName] = useState('');"
);

if (!content.includes('import { doc, setDoc, collection')) {
  content = content.replace(
    "import { doc, setDoc } from 'firebase/firestore';",
    "import { doc, setDoc, collection, getDocs, addDoc } from 'firebase/firestore';"
  );
}

const fetchFunctions = `
  const fetchUsers = async () => {
    if (!isConfigured) return;
    try {
      const q = await getDocs(collection(db, 'users'));
      const users = q.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsersList(users);
    } catch(e) {}
  };

  const fetchResults = async () => {
    if (!isConfigured) return;
    try {
      const q = await getDocs(collection(db, 'results'));
      const results = q.docs.map(d => ({ id: d.id, ...d.data() }));
      setResultsList(results);
    } catch(e) {}
  };

  const handleCreateUser = async () => {
    if (!newUserId || !newUserDob) return;
    if (!isConfigured) {
      alert("Firebase not configured");
      return;
    }
    try {
      await addDoc(collection(db, 'users'), {
        id: newUserId,
        dob: newUserDob,
        name: newUserName || 'Student'
      });
      alert('User created!');
      setNewUserId('');
      setNewUserDob('');
      setNewUserName('');
      fetchUsers();
    } catch(e: any) {
      alert('Error creating user: ' + e.message);
    }
  };
`;

if(!content.includes('fetchUsers')) {
  content = content.replace(
    "const generateTestObject = (): TestConfiguration => {",
    fetchFunctions + "\n  const generateTestObject = (): TestConfiguration => {"
  );
}

const newTabs = `
              <button
                onClick={() => { setActiveTab('users'); fetchUsers(); }}
                className={\`flex items-center space-x-1 px-3 py-1.5 rounded text-sm font-medium transition-colors \${activeTab === 'users' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'}\`}
              >
                <span>Users</span>
              </button>
              <button
                onClick={() => { setActiveTab('results'); fetchResults(); }}
                className={\`flex items-center space-x-1 px-3 py-1.5 rounded text-sm font-medium transition-colors \${activeTab === 'results' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'}\`}
              >
                <span>Results</span>
              </button>
`;

if(!content.includes('>Users<')) {
  content = content.replace(
    `<button
                onClick={() => setActiveTab('json')}
                className={\`flex items-center space-x-1 px-3 py-1.5 rounded text-sm font-medium transition-colors \${activeTab === 'json' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'}\`}
              >
                <Code className="w-4 h-4" />
                <span>JSON</span>
              </button>`,
    `<button
                onClick={() => setActiveTab('json')}
                className={\`flex items-center space-x-1 px-3 py-1.5 rounded text-sm font-medium transition-colors \${activeTab === 'json' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'}\`}
              >
                <Code className="w-4 h-4" />
                <span>JSON</span>
              </button>
              ${newTabs}`
  );
}

// Convert ternary to logical AND
content = content.replace(
  "{activeTab === 'visual' ? (",
  "{activeTab === 'visual' && ("
);

// We need to find the `) : (` for the json part. It's usually right before `activeTab === 'json'`.
// Let's look for `</div>\n          ) : (\n            <div className="flex-1`
content = content.replace(
  /<\/div>\s*\) : \(\s*<div className="flex-1 overflow-y-auto p-6 bg-gray-50/g,
  `</div>\n          )}\n          {activeTab === 'json' && (\n            <div className="flex-1 overflow-y-auto p-6 bg-gray-50`
);

const usersView = `
          {activeTab === 'users' && (
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col space-y-6">
              <div className="bg-white p-6 rounded shadow border border-gray-200">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Create New User</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Registration ID (6 Digits)</label>
                    <input type="text" value={newUserId} onChange={e => setNewUserId(e.target.value)} maxLength={6} className="w-full p-2 border border-gray-300 rounded" placeholder="e.g. 123456" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth (YYYY-MM-DD)</label>
                    <input type="date" value={newUserDob} onChange={e => setNewUserDob(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Name (Optional)</label>
                    <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="John Doe" />
                  </div>
                </div>
                <button onClick={handleCreateUser} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">Create User</button>
              </div>

              <div className="bg-white p-6 rounded shadow border border-gray-200">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Existing Users</h3>
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Registration ID</th>
                      <th className="py-2 px-4 border-b text-left">DOB</th>
                      <th className="py-2 px-4 border-b text-left">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u, i) => (
                      <tr key={i}>
                        <td className="py-2 px-4 border-b">{u.id}</td>
                        <td className="py-2 px-4 border-b">{u.dob}</td>
                        <td className="py-2 px-4 border-b">{u.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col space-y-6">
              <div className="bg-white p-6 rounded shadow border border-gray-200">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Test Results</h3>
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Candidate ID</th>
                      <th className="py-2 px-4 border-b text-left">Test ID</th>
                      <th className="py-2 px-4 border-b text-left">Listening Score</th>
                      <th className="py-2 px-4 border-b text-left">Reading Score</th>
                      <th className="py-2 px-4 border-b text-left">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsList.map((r, i) => (
                      <tr key={i}>
                        <td className="py-2 px-4 border-b">{r.candidateId}</td>
                        <td className="py-2 px-4 border-b">{r.testId}</td>
                        <td className="py-2 px-4 border-b">{r.listeningScore}</td>
                        <td className="py-2 px-4 border-b">{r.readingScore}</td>
                        <td className="py-2 px-4 border-b">{r.timestamp ? new Date(r.timestamp).toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
`;

content = content.replace(
  "{activeTab === 'visual' && (",
  usersView + "\n          {activeTab === 'visual' && ("
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
