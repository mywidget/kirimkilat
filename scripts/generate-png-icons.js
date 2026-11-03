import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to generate a valid PNG buffer from RGBA raw buffer
function createPNG(width, height, getPixelRGBA) {
  // 1. PNG Signature (8 bytes)
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // 2. IHDR Chunk (13 bytes data)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // Bit depth: 8
  ihdrData.writeUInt8(6, 9); // Color type: 6 (RGBA)
  ihdrData.writeUInt8(0, 10); // Compression method: 0
  ihdrData.writeUInt8(0, 11); // Filter method: 0
  ihdrData.writeUInt8(0, 12); // Interlace method: 0
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // 3. Raw Scanline Data: each scanline has 1 filter byte (0) + width * 4 bytes RGBA
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = getPixelRGBA(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Deflate compressed IDAT
  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);

  // 4. IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation for PNG chunks
function makeChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeInt32BE(crc, 8 + length);
  return chunk;
}

// Standard CRC32 table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ -1;
}

// KirimKilat Brand Icon Renderer
function renderKirimKilatIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Corner radius for standard app icon
  const rx = Math.abs(dx);
  const ry = Math.abs(dy);
  const isOutsideRoundedRect = !isMaskable && (Math.pow(rx, 4) + Math.pow(ry, 4) > 1.05);

  if (isOutsideRoundedRect) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Base background gradient: Deep Indigo to Violet (#4F46E5 -> #3730A3)
  const gradT = (y / h) * 0.7 + (x / w) * 0.3;
  let bgR = Math.round(79 * (1 - gradT) + 55 * gradT);
  let bgG = Math.round(70 * (1 - gradT) + 48 * gradT);
  let bgB = Math.round(229 * (1 - gradT) + 163 * gradT);

  // Scale factor: maskable icons keep logo inside central 75%
  const scale = isMaskable ? 0.75 : 0.9;
  const px = (x - cx) / scale;
  const py = (y - cy) / scale;

  // Render 3D isometric box
  // Box Top Face (Rhombus centered near py = -25)
  // Polygon: (0, -70), (70, -35), (0, 0), (-70, -35)
  const boxTop = isPointInPoly(px, py, [
    [0, -70],
    [70, -35],
    [0, 0],
    [-70, -35],
  ]);

  // Box Left Face: (-70, -35), (0, 0), (0, 75), (-70, 40)
  const boxLeft = isPointInPoly(px, py, [
    [-70, -35],
    [0, 0],
    [0, 75],
    [-70, 40],
  ]);

  // Box Right Face: (0, 0), (70, -35), (70, 40), (0, 75)
  const boxRight = isPointInPoly(px, py, [
    [0, 0],
    [70, -35],
    [70, 40],
    [0, 75],
  ]);

  if (boxTop) {
    // Amber-Gold Yellow (#FCD34D to #F59E0B)
    return [245, 180, 50, 255];
  }
  if (boxLeft) {
    // Warm Amber Orange (#F59E0B to #D97706)
    return [217, 119, 6, 255];
  }
  if (boxRight) {
    // Deep Amber Brown (#B45309)
    return [180, 83, 9, 255];
  }

  // Delivery motion dash trails on right side
  if (px > 80 && px < 130 && py > 10 && py < 22) {
    return [52, 211, 153, 255]; // Mint green speed streak
  }
  if (px > 90 && px < 145 && py > 30 && py < 40) {
    return [52, 211, 153, 255]; // Mint green speed streak
  }

  return [bgR, bgG, bgB, 255];
}

function isPointInPoly(px, py, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Generate files
const outDir = path.resolve(process.cwd(), 'public');

console.log('Generating PWA icons...');

// 1. 192x192
const pwa192 = createPNG(192, 192, (x, y, w, h) => renderKirimKilatIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), pwa192);
console.log('Created pwa-192x192.png');

// 2. 512x512
const pwa512 = createPNG(512, 512, (x, y, w, h) => renderKirimKilatIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), pwa512);
console.log('Created pwa-512x512.png');

// 3. Maskable 512x512 (with safe-zone bleed padding)
const pwaMaskable = createPNG(512, 512, (x, y, w, h) => renderKirimKilatIcon(x, y, w, h, true));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), pwaMaskable);
console.log('Created pwa-maskable-512x512.png');

// 4. Apple Touch Icon 180x180
const appleTouch = createPNG(180, 180, (x, y, w, h) => renderKirimKilatIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), appleTouch);
console.log('Created apple-touch-icon.png');

// 5. Favicon 32x32 PNG as fallback / favicon.ico
const fav32 = createPNG(32, 32, (x, y, w, h) => renderKirimKilatIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'favicon.ico'), fav32);
console.log('Created favicon.ico');

console.log('All PWA icons generated successfully!');
