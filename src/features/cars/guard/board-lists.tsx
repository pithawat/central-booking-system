'use client';
import {Clock,CarFront,ChevronRight} from 'lucide-react';
import type {CarBookingDetail} from '@/shared/data/types';
import {appConfig} from '@/shared/config/app.config';
import {formatTime,formatRelative} from '@/shared/lib/datetime';
import {UserAvatar} from '@/shared/ui/user-avatar';
import {millis} from '@/shared/lib/intervals';

function List({icon:Icon,title,hint,count,empty,children}:{icon:typeof Clock;title:string;hint:string;count:number;empty:string;children:React.ReactNode}) {
 return <section className="surface overflow-hidden">
  <header className="border-b bg-muted/50 px-5 py-3">
   <h2 className="flex items-center gap-2 text-2xl"><Icon aria-hidden className="size-6 text-primary"/>{title} ({count})</h2>
   <p className="text-base text-muted-foreground">{hint}</p>
  </header>
  {count?<ul className="divide-y">{children}</ul>:<p className="px-5 py-6 text-center text-muted-foreground">{empty}</p>}
 </section>;
}
const CarTile=({b,tone='plain'}:{b:CarBookingDetail;tone?:'plain'|'overdue'})=><span aria-hidden className={'grid h-14 w-16 shrink-0 place-items-center rounded-xl font-heading text-2xl font-semibold tabular-nums '+(tone==='overdue'?'bg-overdue-bg text-overdue ring-1 ring-overdue-border':'bg-accent text-accent-foreground')}>#{b.car.number}</span>;
const Chip=({tone,children}:{tone:'info'|'warning'|'overdue';children:React.ReactNode})=><span className={'rounded-full px-2.5 py-0.5 text-base font-medium ring-1 '+(tone==='info'?'bg-primary text-primary-foreground ring-primary':tone==='warning'?'bg-warning-bg text-warning ring-warning-border':'bg-overdue-bg text-overdue ring-overdue-border')}>{children}</span>;
const rowClass='flex min-h-16 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring';

/** รายการฝั่งขวา: รอรับวันนี้ และรถที่ออกอยู่ (หัวข้อ 8.5) */
export function BoardLists({board,time,onPick}:{board:{waiting:CarBookingDetail[];out:CarBookingDetail[]};time:Date;onPick:(b:CarBookingDetail,list:'waiting'|'out')=>void}) {
 return <aside className="space-y-5">
  <List icon={Clock} title="รอรับวันนี้" count={board.waiting.length} hint="ผู้จองไม่มี QR หรือรหัส? แตะชื่อ แล้วตรวจบัตรพนักงาน" empty="ไม่มีรถรอรับวันนี้">
   {board.waiting.map(b=>{
    const ready=time.getTime()>=millis(b.start)-appConfig.car.pickupEarlyMinutes*60000,keyOut=board.out.some(x=>x.carId===b.carId);
    return <li key={b.id}><button type="button" onClick={()=>onPick(b,'waiting')} aria-label={formatTime(b.start)+' · #'+b.car.number+' · '+b.user.displayName+(ready?' · ถึงเวลารับ':'')+(keyOut?' · กุญแจยังไม่คืน':'')} className={rowClass+(ready?' bg-accent':'')}>
     <span className="w-16 shrink-0 font-heading text-2xl font-semibold tabular-nums">{formatTime(b.start)}</span>
     <CarTile b={b}/>
     <span className="flex min-w-0 flex-1 items-center gap-3"><UserAvatar user={b.user} className="size-10"/><span className="min-w-0"><span className="block truncate">{b.user.displayName}</span>
      <span className="mt-0.5 flex flex-wrap gap-1.5">{ready&&<Chip tone="info">ถึงเวลารับ</Chip>}{keyOut&&<Chip tone="warning">กุญแจยังไม่คืน</Chip>}</span></span></span>
     <ChevronRight aria-hidden className="size-6 shrink-0 text-muted-foreground"/>
    </button></li>;
   })}
  </List>
  <List icon={CarFront} title="รถที่ออกอยู่" count={board.out.length} hint="มีคนนำกุญแจมาคืน? แตะรถคันนั้น" empty="ไม่มีรถออกอยู่">
   {board.out.map(b=><li key={b.id}><button type="button" onClick={()=>onPick(b,'out')} aria-label={'#'+b.car.number+' · '+b.user.displayName+' · คืน '+formatTime(b.end)+(b.isOverdue?' · '+formatRelative(b.end,time):'')} className={rowClass+(b.isOverdue?' bg-overdue-bg/50':'')}>
    <CarTile b={b} tone={b.isOverdue?'overdue':'plain'}/>
    <span className="min-w-0 flex-1"><span className="block truncate font-medium">{b.user.displayName}</span><span className="block text-muted-foreground">คืน <span className="font-heading tabular-nums">{formatTime(b.end)}</span></span></span>
    {b.isOverdue&&<Chip tone="overdue">{formatRelative(b.end,time)}</Chip>}
    <ChevronRight aria-hidden className="size-6 shrink-0 text-muted-foreground"/>
   </button></li>)}
  </List>
 </aside>;
}
