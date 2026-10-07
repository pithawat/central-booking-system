import fs from 'node:fs';
let p='src/shared/data/mock/index.ts',s=fs.readFileSync(p,'utf8');s=s.slice(0,s.indexOf(' cars:{'))+s.slice(s.indexOf(' rooms:{'));s=s.replace("import {appConfig} from '@/shared/config/app.config';\n",'');fs.writeFileSync(p,s);
p='src/app/(main)/page.tsx';s=fs.readFileSync(p,'utf8');s="import {CarPass} from '@/features/cars/components/car-pass';\n"+s;s=s.replace(/\{pass&&<div className="border border-primary[^]*?<\/div>\}/,'{pass&&<CarPass booking={pass}/>}');fs.writeFileSync(p,s);
