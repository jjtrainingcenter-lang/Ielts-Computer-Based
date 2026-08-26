const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

// Find the line with "timer = setInterval" inside useEffect
// Find the line "return () => clearInterval(timer);"
// Remove everything between "    }" and "return () => clearInterval(timer);"

let startIdx = lines.findIndex(line => line.includes('}, 1000);'));
let endIdx = lines.findIndex(line => line.includes('return () => clearInterval(timer);'));

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx + 2, endIdx - (startIdx + 2));
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
  console.log("Fixed!");
} else {
  console.log("Not found.");
}
