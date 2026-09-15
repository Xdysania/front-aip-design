const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'public');
const output = path.join(root, 'dist');

/**
 * 递归复制目录。
 * @param {string} from 源目录
 * @param {string} to 目标目录
 */
function copyDirectory(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const input = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) copyDirectory(input, target);
    else if (entry.isFile()) fs.copyFileSync(input, target);
    else throw new Error('Unsupported entry: ' + input);
  }
}

for (const file of ['index.html', 'health.html']) {
  if (!fs.statSync(path.join(source, file)).isFile()) {
    throw new Error('Missing required page: ' + file);
  }
}
if (fs.existsSync(output)) fs.rmSync(output, { recursive: true, force: true });
copyDirectory(source, output);
console.log('Static preview built in dist/');
