const fs = require('fs');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = dir + '/' + file;
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) {}
  });
  return filelist;
}

const files = walkSync('src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Fix broken imports: "import { useSettings } from ...settingsStore"
  // These were partially fixed — the path is right but the imported name is wrong
  if (content.includes("from '../../store/settingsStore'") || content.includes("from '../store/settingsStore'") || content.includes("from '../../../store/settingsStore'")) {
    // Replace "import { useSettings }" with "import { useSettingsStore }"
    if (content.includes('import { useSettings }')) {
      content = content.replace(/import \{ useSettings \}/g, 'import { useSettingsStore }');
      // Also fix the usage — "useSettings()" -> "useSettingsStore()"
      content = content.replace(/\buseSettings\(\)/g, 'useSettingsStore()');
      changed = true;
    }
  }

  // 2. Fix Login.tsx and any file importing useSettings from AppContext
  if (content.includes("useSettings") && content.includes("AppContext")) {
    // Remove useSettings from the AppContext import and add separate import
    content = content.replace(
      /import \{ useApp, useSettings \} from '([^']+)AppContext';/,
      "import { useApp } from '$1AppContext';\nimport { useSettingsStore } from '../store/settingsStore';"
    );
    content = content.replace(
      /import \{ useSettings, useApp \} from '([^']+)AppContext';/,
      "import { useApp } from '$1AppContext';\nimport { useSettingsStore } from '../store/settingsStore';"
    );
    content = content.replace(/\buseSettings\(\)/g, 'useSettingsStore()');
    changed = true;
  }

  // 3. Fix InvoicePreviewModal.tsx importing from AppContext
  if (content.includes("from '../../../context/AppContext'") && content.includes('useSettings')) {
    content = content.replace(
      /import \{ useSettings \} from '\.\.\/\.\.\/\.\.\/context\/AppContext';/,
      "import { useSettingsStore } from '../../../store/settingsStore';"
    );
    content = content.replace(/\buseSettings\(\)/g, 'useSettingsStore()');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
  }
});
