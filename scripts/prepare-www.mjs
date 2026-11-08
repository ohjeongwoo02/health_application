// Usage: node scripts/prepare-www.mjs -> copies the web app into www/ for Capacitor.
import fs from "node:fs";

fs.rmSync("www", { recursive: true, force: true });
fs.mkdirSync("www", { recursive: true });
for (const p of ["index.html", "manifest.webmanifest", "css", "js", "icons"]) {
  fs.cpSync(p, `www/${p}`, { recursive: true });
}
console.log("www ready");
