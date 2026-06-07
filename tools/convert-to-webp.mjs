import sharp from 'sharp';
import { readdirSync, statSync, unlinkSync } from 'fs';
import path from 'path';

const ROOT = path.join(import.meta.dirname, '../public/images');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(jpe?g|png)$/i.test(entry)) out.push(full);
  }
  return out;
}

const files = walk(ROOT);
console.log(`Found ${files.length} images to convert`);

for (const file of files) {
  const dest = file.replace(/\.(jpe?g|png)$/i, '.webp');
  await sharp(file).webp({ quality: 80 }).toFile(dest);
  unlinkSync(file);
  console.log(`${path.relative(ROOT, file)} -> ${path.relative(ROOT, dest)}`);
}

console.log('Done.');
