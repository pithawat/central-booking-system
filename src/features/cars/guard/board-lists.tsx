'use client';
import {useState} from 'react';
import {Clock,CarFront,ChevronRight} from 'lucide-react';
import type {CarBookingDetail} from '@/shared/data/types';
import {appConfig} from '@/shared/config/app.config';
import {formatTime,formatRelative} from '@/shared/lib/datetime';
import {UserAvatar} from '@/shared/ui/user-avatar';
import {millis} from '@/shared/lib/intervals';
import {LicensePlate} from '../components/car-visual';

const CarTile=({b,tone='plain'}:{b:CarBookingDetail;tone?:'plain'|'overdue'})=><span aria-hidden className="flex shrink-0 flex-col items-start gap-1"><LicensePlate plate={b.car.plate} size="md" className={tone==='overdue'?'border-overdue! text-overdue!':''}/><span className="text-sm text-muted-foreground">รถ #{b.car.number}</span></span>;
const Chip=({tone,children}:{tone:'info'|'warning'|'overdue';children:React.ReactNode})=><span className={'whitespace-nowrap rounded-full px-2.5 py-0.5 text-base font-medium ring-1 '+(tone==='info'?'bg-primary text-primary-foreground ring-primary':tone==='warning'?'bg-warning-bg text-warning ring-warning-border':'bg-overdue-bg text-overdue ring-overdue-border')}>{children}</span>;
const rowClass='flex min-h-16 w-full items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring';

/** แถบด้านข้างแบบแอป iPad: สลับ "รอรับวันนี้" / "รถที่ออกอยู่" ด้วยแท็บ (§8.5) */
export function BoardLists({board,time,onPick}:{board:{waiting:CarBookingDetail[];out:CarBookingDetail[]};time:Date;onPick:(b:CarBookingDetail,list:'waiting'|'out')=>void}) {
 const [tab,setTab]=useState<'waiting'|'out'>('waiting'),overdue=board.out.filter(b=>b.isOverdue).length;
 const tabs=[{key:'waiting' as const,label:'รอรับวันนี้',count:board.waiting.length,icon:Clock,hint:'ผู้จองไม่มี QR หรือรหัส? แตะชื่อ แล้วตรวจบัตรพนักงาน'},{key:'out' as const,label:'รถที่ออกอยู่',count:board.out.length,icon:CarFront,hint:'มีคนนำกุญแจมาคืน? แตะรถคันนั้น'}];
 const current=tabs.find(t=>t.key===tab)!;
 return <aside aria-label="รายการรถ" className="surface flex min-w-0 flex-col overflow-hidden lg:sticky lg:top-4 lg:max-h-[calc(100dvh-8.5rem)]">
  <div role="tablist" aria-label="รายการรถ" className="m-3 grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
   {tabs.map(t=><button key={t.key} type="button" role="tab" id={'tab-'+t.key} aria-selected={tab===t.key} aria-controls="board-panel" onClick={()=>setTab(t.key)} className={'relative flex min-h-14 items-center justify-center gap-2 rounded-xl px-2 font-heading text-lg font-semibold transition focus-visible:ring-[3px] focus-visible:ring-ring '+(tab===t.key?'bg-white text-foreground shadow-card':'text-muted-foreground')}>
    <t.icon aria-hidden className="size-5 shrink-0"/>{t.label}<span className={'min-w-7 rounded-full px-1.5 text-base tabular-nums '+(tab===t.key?'bg-primary text-primary-foreground':'bg-white/80')}>{t.count}</span>
    {t.key==='out'&&overdue>0&&<span className="absolute -right-1 -top-1 rounded-full bg-overdue px-1.5 text-sm text-white">เกิน {overdue}</span>}
   </button>)}
  </div>
  <p className="px-4 pb-2 text-base text-muted-foreground">{current.hint}</p>
  <div id="board-panel" role="tabpanel" aria-labelledby={'tab-'+tab} className="min-h-0 flex-1 overflow-y-auto border-t">
   {tab==='waiting'?(board.waiting.length?<ul className="divide-y">{board.waiting.map(b=>{
    const ready=time.getTime()>=millis(b.start)-appConfig.car.pickupEarlyMinutes*60000,keyOut=board.out.some(x=>x.carId===b.carId);
    return <li key={b.id}><button type="button" onClick={()=>onPick(b,'waiting')} aria-label={formatTime(b.start)+' · #'+b.car.number+' · '+b.user.displayName+(ready?' · ถึงเวลารับ':'')+(keyOut?' · กุญแจยังไม่คืน':'')} className={rowClass+(ready?' bg-accent':'')}>
     <span className="w-16 shrink-0 font-heading text-2xl font-semibold tabular-nums">{formatTime(b.start)}</span>
     <CarTile b={b}/>
     <span className="flex min-w-0 flex-1 items-center gap-3"><UserAvatar user={b.user} className="hidden size-10 xl:flex"/><span className="min-w-0"><span className="block truncate">{b.user.displayName}</span>
      <span className="mt-0.5 flex flex-wrap gap-1.5">{ready&&<Chip tone="info">ถึงเวลารับ</Chip>}{keyOut&&<Chip tone="warning">กุญแจยังไม่คืน</Chip>}</span></span></span>
     <ChevronRight aria-hidden className="size-6 shrink-0 text-muted-foreground"/>
    </button></li>;})}</ul>:<p className="px-5 py-10 text-center text-muted-foreground">ไม่มีรถรอรับวันนี้</p>)
   :(board.out.length?<ul className="divide-y">{board.out.map(b=><li key={b.id}><button type="button" onClick={()=>onPick(b,'out')} aria-label={'#'+b.car.number+' · '+b.user.displayName+' · คืน '+formatTime(b.end)+(b.isOverdue?' · '+formatRelative(b.end,time):'')} className={rowClass+(b.isOverdue?' bg-overdue-bg/50':'')}>
    <CarTile b={b} tone={b.isOverdue?'overdue':'plain'}/>
    <span className="min-w-0 flex-1"><span className="block truncate font-medium">{b.user.displayName}</span><span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground"><span>คืน <span className="font-heading tabular-nums">{formatTime(b.end)}</span></span>{b.isOverdue&&<Chip tone="overdue">{formatRelative(b.end,time)}</Chip>}</span></span>
    <ChevronRight aria-hidden className="size-6 shrink-0 text-muted-foreground"/>
   </button></li>)}</ul>:<p className="px-5 py-10 text-center text-muted-foreground">ไม่มีรถออกอยู่</p>)}
  </div>
 </aside>;
}
