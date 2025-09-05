import fs from 'fs';
import path from 'path';

function walk(dir, cb) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      walk(full, cb);
    } else {
      cb(full);
    }
  }
}

const cjsDir = 'dist/cjs';

// rename .js → .cjs and fix imports
walk(cjsDir, (file) => {
  if (file.endsWith('.js')) {
    const newFile = file.replace(/\.js$/, '.cjs');
    fs.renameSync(file, newFile);
  }
});

walk(cjsDir, (file) => {
  if (file.endsWith('.cjs')) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/(require\(["'].*)\.js(["']\))/g, '$1.cjs$2');
    code = code.replace(/(from ["'].*)\.js(["'])/g, '$1.cjs$2');
    fs.writeFileSync(file, code);
  }
});
