import fs from 'node:fs';
const spec=fs.readFileSync('docs/SPEC.md','utf8');
const theme=spec.slice(spec.indexOf('### 11.2')).split('```css')[1].split('```')[0];
let css=fs.readFileSync('src/app/globals.css','utf8');
css=css.replace(/:root\s*\{[^}]*\}/s,'').replace(/\.dark\s*\{[^}]*\}/s,'');
css=css.replace(/--font-sans:[^;]*;/g,'--font-sans: var(--font-plex-looped), Tahoma, sans-serif;').replace(/--font-mono:[^;]*;/g,'--font-heading: var(--font-plex-thai), var(--font-plex-looped), sans-serif;');
css+='\n'+theme+`
.dark { --destructive: #c2410c; }
html { font-size: 106.25%; }
body { font-family: var(--font-plex-looped), Tahoma, sans-serif; line-height: 1.65; }
h1,h2,h3 { font-family: var(--font-plex-thai),sans-serif; font-weight:600; }
h1 { font-size:1.875rem; } h2 { font-size:1.5rem; } h3 { font-size:1.25rem; }
button,a,input,select,textarea { -webkit-tap-highlight-color: transparent; }
:focus-visible { outline:3px solid var(--ring); outline-offset:3px; }
select { min-height:48px; border:1px solid var(--input); border-radius:8px; padding:8px 12px; background:white; max-width:100%; }
.home-card { display:flex; align-items:center; gap:20px; min-height:140px; padding:24px; border:1px solid var(--border); border-radius:16px; }
.home-card:hover { border-color:var(--primary); background:var(--accent); }
.home-card>svg { color:var(--primary); flex-shrink:0; }
.home-card p { color:var(--muted-foreground); margin-top:4px; }
.mailbox-grid { display:grid; grid-template-columns:360px minmax(0,1fr); gap:24px; }
@media(max-width:1100px) and (min-width:768px) { .app-top>div { flex-wrap:wrap; } .desktop-nav { order:3; width:100%; justify-content:center; } }
@media(max-width:767px) { .mailbox-grid { display:block; } }
@media(prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none!important; transition:none!important; scroll-behavior:auto!important; } }
@media print { .app-top,.bottom-nav,.dev-button,.no-print { display:none!important; } main { padding:0!important; max-width:none!important; } }
`;
fs.writeFileSync('src/app/globals.css',css);
for(const name of fs.readdirSync('src/components/ui')) {
 const p='src/components/ui/'+name;let c=fs.readFileSync(p,'utf8');
 c=c.replaceAll('text-xs','text-sm').replaceAll('>Close<','>ปิด<').replaceAll('>Close</','>ปิด</').replaceAll('"Close"','"ปิด"');
 if(name==='button.tsx')c=c.replace(/default: "[^"]*"/, 'default: "h-12 px-5 text-base"').replace(/sm: "[^"]*"/,'sm: "h-10 px-4"').replace(/lg: "[^"]*"/,'lg: "h-14 px-6 text-lg"').replace(/icon: "[^"]*"/,'icon: "size-12"');
 if(['input.tsx','select.tsx'].includes(name))c=c.replaceAll('h-9','h-12').replaceAll('text-sm','text-base');
 if(['checkbox.tsx','radio-group.tsx'].includes(name))c=c.replaceAll('size-4','size-5');
 fs.writeFileSync(p,c);
}
let eslint=fs.readFileSync('eslint.config.mjs','utf8');
eslint=eslint.replace('defineConfig([',`defineConfig([
 {files:['src/features/cars/**/*.{ts,tsx}'],rules:{'no-restricted-imports':['error',{patterns:['@/shared/data/mock','@/shared/data/mock/*','@/shared/data/api','@/shared/data/api/*','@/features/rooms/*']}] }},
 {files:['src/features/rooms/**/*.{ts,tsx}'],rules:{'no-restricted-imports':['error',{patterns:['@/shared/data/mock','@/shared/data/mock/*','@/shared/data/api','@/shared/data/api/*','@/features/cars/*']}] }},
 {files:['src/app/**/*.{ts,tsx}','src/shared/ui/**/*.{ts,tsx}'],rules:{'no-restricted-imports':['error',{patterns:['@/shared/data/mock','@/shared/data/mock/*','@/shared/data/api','@/shared/data/api/*']}] }},
`);
fs.writeFileSync('eslint.config.mjs',eslint);

