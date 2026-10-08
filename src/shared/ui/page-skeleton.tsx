import {Skeleton} from '@/components/ui/skeleton';
/** โครงหน้าระหว่างโหลด ใช้ใน loading.tsx ของแต่ละส่วน */
export function PageSkeleton({variant='list'}:{variant?:'list'|'timeline'|'cards'}) {
 return <div role="status" aria-live="polite" className="space-y-6">
  <span className="sr-only">กำลังโหลด…</span>
  <div className="flex items-center gap-4"><Skeleton className="size-14 rounded-2xl"/><div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-8 w-56 max-w-full"/><Skeleton className="h-5 w-72 max-w-full"/></div></div>
  {variant==='timeline'?<>
   <div className="flex flex-wrap gap-2"><Skeleton className="h-14 w-full max-w-80 rounded-2xl"/><Skeleton className="h-12 w-24"/><Skeleton className="h-12 w-24"/></div>
   <div className="surface space-y-px overflow-hidden p-0">{Array.from({length:8},(_,i)=><div key={i} className="grid grid-cols-[minmax(0,40%)_1fr] gap-4 p-3 md:grid-cols-[minmax(0,240px)_1fr]"><Skeleton className="h-10"/><Skeleton className="h-10" style={{marginLeft:(i*7)%30+'%',width:20+(i*13)%40+'%'}}/></div>)}</div>
  </>:variant==='cards'?<div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">{Array.from({length:6},(_,i)=><Skeleton key={i} className="h-56 rounded-2xl sm:h-72 sm:rounded-[1.25rem]"/>)}</div>
  :<div className="space-y-3">{Array.from({length:4},(_,i)=><Skeleton key={i} className="h-28 rounded-[1.25rem]"/>)}</div>}
 </div>;
}
