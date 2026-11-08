// Usage: node scripts/make-icons.mjs  -> icons/*.png (dependency-free PNG writer)
import fs from "node:fs";
import zlib from "node:zlib";

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (const b of buf) { c = (crc ^ b) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size) {
  const bg = [17, 24, 39], fg = [59, 130, 246];
  const raw = Buffer.alloc((size * 3 + 1) * size);
  const u = size / 24; // barbell icon on a 24-unit grid
  const inRect = (x, y, x0, y0, x1, y1) => x >= x0 * u && x < x1 * u && y >= y0 * u && y < y1 * u;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const on = inRect(x, y, 6, 11, 18, 13) || inRect(x, y, 3, 7, 6, 17) || inRect(x, y, 18, 7, 21, 17) || inRect(x, y, 1, 9, 3, 15) || inRect(x, y, 21, 9, 23, 15);
      const c = on ? fg : bg;
      raw.set(c, y * (size * 3 + 1) + 1 + x * 3);
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
fs.mkdirSync("icons", { recursive: true });
fs.writeFileSync("icons/icon-192.png", png(192));
fs.writeFileSync("icons/icon-512.png", png(512));
fs.writeFileSync("icons/apple-touch-icon.png", png(180));
console.log("icons written");
