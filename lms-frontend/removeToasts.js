const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findFiles(fullPath, fileList);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const files = findFiles(srcDir);
let updatedCount = 0;

files.forEach(file => {
  // We will manually add it to App.jsx later, so skip it just in case
  if (file.endsWith('App.jsx')) return;

  let content = fs.readFileSync(file, 'utf-8');
  let original = content;
  
  // Remove <ToastContainer ... /> tag
  content = content.replace(/<ToastContainer[\s\S]*?\/>/g, '');
  
  // Clean up imports
  content = content.replace(/import\s*{\s*ToastContainer\s*,\s*toast\s*}\s*from\s*['"]react-toastify['"];?/g, "import { toast } from 'react-toastify';");
  content = content.replace(/import\s*{\s*toast\s*,\s*ToastContainer\s*}\s*from\s*['"]react-toastify['"];?/g, "import { toast } from 'react-toastify';");
  content = content.replace(/import\s*{\s*ToastContainer\s*}\s*from\s*['"]react-toastify['"];?/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated:', file);
    updatedCount++;
  }
});

console.log(`Total files updated: ${updatedCount}`);
