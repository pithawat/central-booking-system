import fs from 'node:fs/promises';
import {createRequire} from 'node:module';

// Reuse the image encoder already installed with Next.js; no extra dependency.
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const source = new URL('../docs/branding/bam-wordmark-source.png', import.meta.url);
const publicDir = new URL('../public/brand/', import.meta.url);
const appDir = new URL('../src/app/', import.meta.url);

// Normalize the extracted wordmark's transparent margins for consistent sizing.
const {data, info} = await sharp(await fs.readFile(source)).ensureAlpha().raw().toBuffer({resolveWithObject: true});
let left = info.width, top = info.height, right = -1, bottom = -1;
for (let y = 0; y < info.height; y++) {
 for (let x = 0; x < info.width; x++) {
  if (data[(y * info.width + x) * 4 + 3] > 128) {
   left = Math.min(left, x); top = Math.min(top, y);
   right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
 }
}
if (right < left) throw new Error('The BAM wordmark is empty.');
const bounds = {
 left: Math.max(0, left - 2), top: Math.max(0, top - 2),
 width: Math.min(info.width - 1, right + 2) - Math.max(0, left - 2) + 1,
 height: Math.min(info.height - 1, bottom + 2) - Math.max(0, top - 2) + 1,
};
const logo = await sharp(data, {raw: info}).extract(bounds).resize({width: 960}).png().toBuffer();
await fs.mkdir(publicDir, {recursive: true});
await fs.writeFile(new URL('bam-logo.png', publicDir), logo);

// Keep the complete unframed wordmark, centered without stretching, in every icon.
const icon = size => sharp(logo).resize(size, size, {
 fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0},
}).png().toBuffer();
await fs.writeFile(new URL('icon.png', appDir), await icon(192));
await fs.writeFile(new URL('apple-icon.png', appDir), await icon(180));

// ICO directory with PNG entries for browser tabs and higher-density displays.
const sizes = [16, 32, 48, 64, 128, 256];
const images = await Promise.all(sizes.map(icon));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
for (let i = 0; i < sizes.length; i++) {
 const entry = 6 + i * 16;
 directory[entry] = sizes[i] === 256 ? 0 : sizes[i];
 directory[entry + 1] = directory[entry];
 directory.writeUInt16LE(1, entry + 4);
 directory.writeUInt16LE(32, entry + 6);
 directory.writeUInt32LE(images[i].length, entry + 8);
 directory.writeUInt32LE(offset, entry + 12);
 offset += images[i].length;
}
await fs.writeFile(new URL('favicon.ico', appDir), Buffer.concat([directory, ...images]));
const metadata = await sharp(logo).metadata();
console.log(`BAM logo: ${metadata.width}x${metadata.height}; favicon: ${sizes.join(', ')}px; app icons: 192px / 180px.`);
