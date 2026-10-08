'use client';
import {useState,useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {CheckCheck,Clock,DoorOpen,Inbox} from 'lucide-react';
import type {RoomBookingDetail} from '@/shared/data/types';
import {formatDate,formatTime} from '@/shared/lib/datetime';
import {PeriodText} from '@/shared/ui/period-text';
import {UserAvatar} from '@/shared/ui/user-avatar';
import {StatusBadge} from '@/shared/ui/status-badge';
import {EmptyState} from '@/shared/ui/empty-state';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Spinner} from '@/components/ui/spinner';
import {DecisionButtons} from '../components/booking-actions';
import {approveMany} from './actions';

function RequestSummary({b}:{b:RoomBookingDetail}) {
 return <div className="min-w-0 flex-1">
  <div className="flex min-w-0 items-center gap-3"><UserAvatar user={b.bookedBy} className="size-10 shrink-0"/><div className="min-w-0"><p className="truncate font-heading font-semibold">{b.bookedBy.displayName}</p><p className="truncate text-sm text-muted-foreground">{b.bookedBy.departmentName}</p></div></div>
  <h3 className="mt-3 text-xl wrap-break-word">{b.title}</h3>
  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground"><span className="inline-flex items-center gap-1.5"><DoorOpen size={16} aria-hidden/>{b.room.shortLabel}</span><span className="inline-flex items-start gap-1.5 font-heading tabular-nums text-foreground"><Clock size={16} aria-hidden className="mt-1 shrink-0"/><span><PeriodText start={b.start} end={b.end}/></span></span></p>
  {b.attendeeId!==b.bookedById&&<p className="mt-1 text-sm text-muted-foreground">ผู้ใช้งานห้อง: {b.attendee.displayName}</p>}
  <p className="mt-1 text-sm text-muted-foreground">ขอเมื่อ {formatTime(b.createdAt)}{formatDate(b.createdAt)!==formatDate(b.start)?' · '+formatDate(b.createdAt):''}</p>
 </div>;
}

export function ApprovalList({items}:{items:RoomBookingDetail[]}) {
 const router=useRouter(),[selected,setSelected]=useState<string[]>([]),[pending,start]=useTransition();
 const chosen=selected.filter(id=>items.some(b=>b.id===id));
 if(!items.length)return <EmptyState icon={Inbox} title="ไม่มีคำขอรออนุมัติ" description="คำขอใหม่จะแสดงที่นี่และส่งถึงอีเมลของคุณ"/>;
 const bulk=()=>start(async()=>{const r=await approveMany(chosen);if(!r.ok){toast.error(r.error.message);router.refresh();return;}toast.success('อนุมัติแล้ว '+r.data.length+' รายการ');setSelected([]);router.refresh();});
 return <div className="pb-36 md:pb-24">
  <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><label className="flex min-h-12 items-center gap-3"><Checkbox checked={chosen.length===items.length?true:chosen.length?'indeterminate':false} onCheckedChange={v=>setSelected(v===true?items.map(b=>b.id):[])}/>เลือกทั้งหมด</label><p className="text-sm text-muted-foreground">เรียงตามเวลาประชุมที่ใกล้ที่สุด</p></div>
  <ul className="space-y-4">{items.map(b=><li key={b.id} className={'surface overflow-hidden transition-shadow '+(chosen.includes(b.id)?'ring-2 ring-primary':'')}>
   <div className="flex flex-col lg:flex-row lg:items-start">
    <div className="flex min-w-0 flex-1 gap-3 p-4 md:p-5">
     <Checkbox className="mt-2.5 shrink-0" aria-label={'เลือกคำขอ '+b.title+' ของ '+b.bookedBy.displayName} checked={chosen.includes(b.id)} onCheckedChange={v=>setSelected(s=>v===true?[...s,b.id]:s.filter(x=>x!==b.id))}/>
     <RequestSummary b={b}/>
    </div>
    <div className="border-t bg-muted/30 p-3 sm:px-4 lg:w-96 lg:border-t-0 lg:border-l lg:bg-transparent lg:p-5"><DecisionButtons id={b.id}/></div>
   </div>
  </li>)}</ul>
  {/* แถบล่างลอยเหนือเมนูมือถือ: บนมือถือเรียง 2 แถวไม่ให้ล้นจอ */}
  {chosen.length>0&&<div data-action-bar className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t bg-white/95 px-4 py-3 shadow-raised backdrop-blur md:bottom-0"><div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
   <div className="flex items-center justify-between gap-2"><p className="font-medium">เลือกแล้ว {chosen.length} รายการ</p><Button variant="ghost" className="sm:hidden" onClick={()=>setSelected([])}>ล้างที่เลือก</Button></div>
   <div className="flex gap-2"><Button variant="outline" className="hidden sm:inline-flex" onClick={()=>setSelected([])}>ล้างที่เลือก</Button><Button className="flex-1 sm:flex-none" disabled={pending} onClick={bulk}>{pending?<Spinner/>:<CheckCheck aria-hidden/>}อนุมัติที่เลือก ({chosen.length})</Button></div>
  </div></div>}
 </div>;
}

export function ApprovalHistory({items}:{items:RoomBookingDetail[]}) {
 if(!items.length)return <EmptyState title="ยังไม่มีประวัติการอนุมัติ" description="แสดงรายการที่ตัดสินแล้วใน 30 วันล่าสุด"/>;
 return <ul className="space-y-3">{items.map(b=><li key={b.id} className="surface flex min-w-0 flex-col gap-3 p-4 md:flex-row md:items-start md:p-5"><RequestSummary b={b}/><div className="flex flex-col items-start gap-1 md:items-end"><StatusBadge kind="room" status={b.status}/>{b.decidedAt&&<p className="text-sm text-muted-foreground">ตัดสินเมื่อ {formatDate(b.decidedAt)} {formatTime(b.decidedAt)}</p>}{b.rejectReason&&<p className="text-sm">เหตุผล: {b.rejectReason}</p>}</div></li>)}</ul>;
}
