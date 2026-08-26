const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

content = content.replace(
  `}
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-[400px]">`,
  `}
            </div>
          )}
          {activeTab === 'json' && (
            <div className="flex flex-col h-full min-h-[400px]">`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
