const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

if (!content.includes('onFinishTest?: () => void;')) {
  content = content.replace(
    "onAdminClick?: () => void;",
    "onAdminClick?: () => void;\n  onFinishTest?: () => void;"
  );
  
  content = content.replace(
    "onAdminClick,",
    "onAdminClick,\n  onFinishTest,"
  );

  content = content.replace(
    `<button type="button" className="hover:opacity-70 transition-opacity">
            <Monitor className="w-5 h-5" />
          </button>`,
    `<button type="button" className="hover:opacity-70 transition-opacity">
            <Monitor className="w-5 h-5" />
          </button>
          {onFinishTest && (
            <button
              onClick={onFinishTest}
              className="ml-4 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded shadow transition-colors"
            >
              Finish Test
            </button>
          )}`
  );
}

fs.writeFileSync('src/components/Header.tsx', content);
