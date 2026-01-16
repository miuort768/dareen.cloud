const fs = require('fs');
const content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('isActive') && !line.includes('({ isActive })')) {
        console.log(`Line ${i + 1}: ${line}`);
    }
});
