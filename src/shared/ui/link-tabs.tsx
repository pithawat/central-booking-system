import Link from 'next/link';
/** แท็บที่เก็บค่าไว้ใน URL (เช่น ?tab=rooms) ใช้ลิงก์จริงเพื่อให้ refresh และส่งต่อได้ */
export function LinkTabs({items,active,label}:{items:{key:string;label:string;href:string;count?:number}[];active:string;label:string}) {
 return <nav aria-label={label} className="mb-6 inline-flex w-full max-w-full gap-1 overflow-x-auto rounded-2xl border bg-white p-1 shadow-card sm:w-auto">
  {items.map(t=><Link key={t.key} href={t.href} scroll={false} aria-current={t.key===active?'page':undefined} className={'flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 font-medium transition-colors sm:flex-none '+(t.key===active?'bg-primary text-primary-foreground shadow-sm':'text-muted-foreground hover:bg-muted hover:text-foreground')}>
   {t.label}{t.count!==undefined&&<span className={'inline-flex min-w-6 justify-center rounded-full px-1.5 text-sm tabular-nums '+(t.key===active?'bg-white/20':'bg-muted')}>{t.count}</span>}
  </Link>)}
 </nav>;
}
