import fs from 'node:fs';
import path from 'node:path';
let count = 0;
function scan(dir) {
 for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
 const file = path.join(dir,entry.name);
 if (entry.isDirectory()) scan(file);
 else if (/\.(ts|tsx|css)$/.test(file)) fs.readFileSync(file,'utf8').split('\n').forEach((line,i)=>{
 if (/\b[a-z-]+-(red|rose)-\d{2,3}\b|#(?:f00|ff0000|ef4444|dc2626|b91c1c|e11d48)\b/i.test(line)) {console.error(file+':'+(i+1)+': '+line.trim());count++;}
 });
 }
}
scan('src'); console.log(count ? 'พบสีต้องห้าม '+count+' จุด' : 'ผ่าน: ไม่พบสีแดง'); process.exitCode=count?1:0;

