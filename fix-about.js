const fs = require('fs');

// Read the current About.tsx file
const aboutPath = 'client/src/pages/About.tsx';
let content = fs.readFileSync(aboutPath, 'utf8');

// Fix the JSX structure by ensuring proper indentation and closing tags
content = content.replace(
  /(\s+){\/\* Company Information \*\/}\s+<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">/,
  '\n          {/* Company Information */}\n          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">'
);

content = content.replace(
  /(\s+)<\/div>\s+{\/\* Team Members \*\/}\s+<div className="mb-12">/,
  '\n          </div>\n\n          {/* Team Members */}\n          <div className="mb-12">'
);

content = content.replace(
  /(\s+)<\/div>\s+{\/\* Contact Information \*\/}\s+<Card className="bg-blue-50">/,
  '\n          </div>\n\n          {/* Contact Information */}\n          <Card className="bg-blue-50">'
);

// Write back to file
fs.writeFileSync(aboutPath, content);
console.log('Fixed About.tsx JSX structure');