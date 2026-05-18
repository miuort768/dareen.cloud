const fs = require('fs');
const files = [
    'src/pages/Teachers.tsx',
    'src/pages/TeacherInvoices.tsx',
    'src/pages/Settings.tsx',
    'src/pages/Schedule.tsx',
    'src/pages/Finance.tsx',
    'src/pages/Chat.tsx',
    'src/features/students/components/StudentHeader.tsx',
    'src/features/attendance/components/AttendanceHeader.tsx'
];

const replacement = `<div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.3)] shrink-0 bg-white/5 backdrop-blur-md">
                        <img src="/chat-avatar.jpg" alt="Logo" className="w-full h-full object-cover" />
                    </div>`;

files.forEach(file => {
    try {
        if (!fs.existsSync(file)) {
            console.log(`Skipping missing file: ${file}`);
            return;
        }
        let content = fs.readFileSync(file, 'utf8');
        // Match ANY div that directly wraps the logo.png image
        let newContent = content.replace(/<div[^>]*?>\s*<img src="\/logo\.png" alt="Logo"[^>]*?>\s*<\/div>/g, replacement);
        if (content !== newContent) {
            fs.writeFileSync(file, newContent);
            console.log(`Updated ${file}`);
        } else {
            console.log(`Unchanged ${file}`);
        }
    } catch (e) {
        console.error(`Failed ${file}:`, e);
    }
});
