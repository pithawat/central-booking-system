import fs from 'node:fs';
for(const line of fs.readFileSync('.env.example','utf8').split(/\r?\n/)) {
 const m=/^([A-Z_]+)=(.*)$/.exec(line);
 if(m && !process.env[m[1]]) process.env[m[1]]=m[2].replace(/^"|"$/g,'');
}
process.env.MOCK_LATENCY_MS='0';

