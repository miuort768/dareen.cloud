const fs = require('fs');
const glob = require('glob');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = dir + '/' + file;
    try { filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile); } catch(err) {}
  });
  return filelist;
}

const files = walkSync('src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace SettingsContext
  if (content.includes('SettingsContext')) {
    content = content.replace(/context\/SettingsContext/g, 'store/settingsStore');
    content = content.replace(/useSettings\(/g, 'useSettingsStore(');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
  }
});
