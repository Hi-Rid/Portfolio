// Konversi semua gambar di dist/img (png/jpg/gif) ke .webp yang diperkecil.
// File asli TIDAK dihapus. Nama output di-slug (huruf kecil, tanpa spasi/kurung)
// dan harus sama dengan yang dipakai di index.html.
//
// Pakai:  npm i  &&  npm run images
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = 'dist/img';
const SRC_EXT = /\.(png|jpe?g|gif)$/i;

const slug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (SRC_EXT.test(entry.name)) yield full;
  }
}

function plan(file) {
  const ext = path.extname(file).toLowerCase();
  const parts = file.split(path.sep);
  if (ext === '.gif') return { width: 600, quality: 72, animated: true };
  if (parts.includes('tech')) return { height: 160, quality: 85 };   // logo: tampil 80px, 2x retina
  if (/^ridho\./i.test(path.basename(file))) return { width: 600, quality: 80 }; // foto profil 300px
  return { width: 1200, quality: 78 };                               // card & carousel
}

const kb = (n) => (n / 1024).toFixed(0) + ' KB';
let before = 0, after = 0, count = 0;

for await (const file of walk(ROOT)) {
  const dir = path.dirname(file);
  const base = path.basename(file, path.extname(file));
  const out = path.join(dir, slug(base) + '.webp');
  const { width, height, quality, animated } = plan(file);

  await sharp(file, { animated: !!animated })
    .resize({ width, height, withoutEnlargement: true, fit: 'inside' })
    .webp({ quality, effort: 5 })
    .toFile(out);

  const [a, b] = [(await stat(file)).size, (await stat(out)).size];
  before += a; after += b; count++;
  console.log(`${file}  ${kb(a)} -> ${kb(b)}`);
}

console.log(`\n${count} gambar: ${kb(before)} -> ${kb(after)} (${((1 - after / before) * 100).toFixed(0)}% lebih kecil)`);
