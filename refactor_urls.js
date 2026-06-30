const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'lms-frontend', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(targetDir);
let changedFilesCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace template literals: `http://localhost:5000/api/...` -> `${import.meta.env.VITE_API_URL}/api/...`
    content = content.replace(/`http:\/\/localhost:5000\//g, '`${import.meta.env.VITE_API_URL}/');
    content = content.replace(/`http:\/\/localhost:5000/g, '`${import.meta.env.VITE_API_URL}');

    // Replace exact string matches used as base URLs
    content = content.replace(/"http:\/\/localhost:5000\/"/g, 'import.meta.env.VITE_API_URL + "/"');
    content = content.replace(/'http:\/\/localhost:5000\/'/g, 'import.meta.env.VITE_API_URL + "/"');
    content = content.replace(/"http:\/\/localhost:5000"/g, 'import.meta.env.VITE_API_URL');
    content = content.replace(/'http:\/\/localhost:5000'/g, 'import.meta.env.VITE_API_URL');

    // Replace within string quotes (like axios calls)
    content = content.replace(/'http:\/\/localhost:5000\//g, 'import.meta.env.VITE_API_URL + \'/');
    content = content.replace(/"http:\/\/localhost:5000\//g, 'import.meta.env.VITE_API_URL + "/');
    

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
        changedFilesCount++;
    }
});

console.log(`\nRefactoring complete. Modified ${changedFilesCount} files.`);
