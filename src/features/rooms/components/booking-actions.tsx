'use client';
import {useState,useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {BellRing,CalendarPlus,Check,X} from 'lucide-react';
import type {RoomBookingDetail} from '@/shared/data/types';
import {appConfig} from '@/shared/config/app.config';
import {formatRange,formatTime} from '@/shared/lib/datetime';
import {millis} from '@/shared/lib/intervals';
import {useNow} from '@/shared/ui/clock-provider';
import {InlineConfirm} from '@/shared/ui/inline-confirm';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Spinner} from '@/components/ui/spinner';
import {changeRoom} from '../actions';
import {decideRoom} from '../approvals/actions';

/** ปุ่มอนุมัติ / ไม่อนุมัติ ใช้ทั้งในแอป (id) และหน้าลิงก์อีเมล (token) */
export function DecisionButtons({id,token=false,initialReject=false,onDecided,size='default'}:{id:string;token?:boolean;initialReject?:boolean;onDecided?:(b:RoomBookingDetail,decision:'APPROVE'|'REJECT')=>void;size?:'default'|'lg'}) {
 const router=useRouter(),[rejecting,setRejecting]=useState(initialReject),[reason,setReason]=useState(''),[error,setError]=useState(''),[pending,start]=useTransition();
 const decide=(decision:'APPROVE'|'REJECT')=>start(async()=>{
  setError('');const r=await decideRoom(id,decision,decision==='REJECT'&&reason.trim()?reason.trim():undefined,token);
  if(!r.ok){setError(r.error.message);return;}
  onDecided?.(r.data,decision);
  // หน้าลิงก์อีเมลแสดงผลเองในที่เดิม ไม่ต้องโหลดหน้าใหม่
  if(!token){toast.success(decision==='APPROVE'?'อนุมัติแล้ว':'ไม่อนุมัติแล้ว');router.refresh();}
 });
 return <div className="w-full space-y-3" aria-live="polite">
  {!rejecting?<div className="flex flex-wrap gap-2">
   <Button size={size} disabled={pending} onClick={()=>decide('APPROVE')}>{pending?<Spinner/>:<Check aria-hidden/>}อนุมัติ</Button>
   <Button size={size} variant="outline" disabled={pending} onClick={()=>setRejecting(true)}><X aria-hidden/>ไม่อนุมัติ</Button>
  </div>:<div className="space-y-3 rounded-xl border border-overdue-border bg-overdue-bg/60 p-4">
   <label htmlFor={'reason-'+id.slice(0,12)} className="block font-medium">เหตุผล (ไม่บังคับ)</label>
   <Textarea id={'reason-'+id.slice(0,12)} value={reason} maxLength={2000} onChange={e=>setReason(e.target.value)} placeholder="เช่น ขอเลื่อนเป็นช่วงบ่าย"/>
   <div className="flex flex-wrap gap-2">
    <Button size={size} variant="destructive" className="bg-destructive text-white hover:bg-destructive/90" disabled={pending} onClick={()=>decide('REJECT')}>{pending&&<Spinner/>}ยืนยันไม่อนุมัติ</Button>
    <Button size={size} variant="outline" disabled={pending} onClick={()=>{setRejecting(false);setReason('');}}>กลับ</Button>
   </div>
  </div>}
  {error&&<p role="alert" className="text-destructive">{error}</p>}
 </div>;
}

/** ปุ่มตามสถานะของการจองห้อง (หัวข้อ 9.4, 10.4, 10.5) */
export function RoomBookingActions({booking:b,meId,isAdmin,canDecide=false,onDone}:{booking:RoomBookingDetail;meId:string;isAdmin:boolean;canDecide?:boolean;onDone?:()=>void}) {
 const router=useRouter(),now=useNow(),[pending,start]=useTransition(),[error,setError]=useState(''),[nudgedUntil,setNudgedUntil]=useState<string|null>(null);
 const booker=b.bookedById===meId,active=b.status==='PENDING'||b.status==='APPROVED';
 const canCancel=active&&(booker||isAdmin)&&now.getTime()<millis(b.end);
 const nextNudge=nudgedUntil??(b.lastNudgedAt?new Date(millis(b.lastNudgedAt)+appConfig.room.approval.nudgeCooldownHours*3600000).toISOString():null);
 const nudgeLocked=!!nextNudge&&now.getTime()<millis(nextNudge);
 const run=(action:'cancel'|'nudge')=>start(async()=>{
  setError('');const r=await changeRoom(action,b.id);
  if(!r.ok){setError(r.error.message);return;}
  if(action==='nudge'){toast.success('ส่งเตือนหัวหน้าแล้ว');setNudgedUntil((r.data as {nextAllowedAt:string}).nextAllowedAt);}
  else toast.success('ยกเลิกการจองแล้ว');
  router.refresh();onDone?.();
 });
 const decide=canDecide&&b.status==='PENDING'&&(b.approverId===meId||isAdmin)&&now.getTime()<millis(b.start);
 if(!decide&&!canCancel&&!(b.status==='APPROVED'&&b.isMine&&now.getTime()<millis(b.end))&&!(b.status==='PENDING'&&booker))return null;
 return <div className="space-y-3">
  {decide&&<DecisionButtons id={b.id} onDecided={()=>onDone?.()}/>}
  <div className="flex flex-wrap gap-2">
   {b.status==='PENDING'&&booker&&b.approverId&&<Button variant="outline" disabled={pending||nudgeLocked} onClick={()=>run('nudge')}><BellRing aria-hidden/>{nudgeLocked?'เตือนได้อีกครั้ง '+formatTime(nextNudge!):'เตือนหัวหน้า'}</Button>}
   {b.status==='APPROVED'&&b.isMine&&now.getTime()<millis(b.end)&&<Button variant="outline" asChild><a href={'/rooms/bookings/'+b.id+'/ics'} download><CalendarPlus aria-hidden/>เพิ่มลงปฏิทิน</a></Button>}
   {canCancel&&<InlineConfirm label="ยกเลิกการจอง" cancelLabel="ไม่ยกเลิก" question={'ยกเลิกการจอง '+b.room.shortLabel+' '+formatRange(b.start,b.end)+'?'} disabled={pending} onConfirm={()=>run('cancel')}/>}
  </div>
  {error&&<p role="alert" className="text-destructive">{error}</p>}
 </div>;
}
