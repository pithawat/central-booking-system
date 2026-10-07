'use client';
import Link from 'next/link';
import {ArrowUpRight,Send,UserCheck,CircleCheck,CircleX,Ban,Hourglass,Clock3} from 'lucide-react';
import type {RoomBookingDetail} from '@/shared/data/types';
import {formatDate,formatRange,formatTime} from '@/shared/lib/datetime';
import {ResponsivePanel} from '@/shared/ui/responsive-panel';
import {StatusBadge} from '@/shared/ui/status-badge';
import {UserAvatar} from '@/shared/ui/user-avatar';
import {RoomBookingActions} from './booking-actions';

const stamp=(iso:string)=>formatDate(iso)+' '+formatTime(iso);

export function BookingInfo({booking:b}:{booking:RoomBookingDetail}) {
 const rows:[string,React.ReactNode][]=[
  ['ห้อง',b.room.shortLabel],
  ['วัน',formatDate(b.start)],
  ['เวลา',<span key="t" className="font-heading tabular-nums">{formatRange(b.start,b.end)}</span>],
  ['คนกดจอง',<span key="b" className="inline-flex items-center gap-2"><UserAvatar user={b.bookedBy} className="size-7"/>{b.bookedBy.displayName}</span>],
  ['ผู้ใช้งานห้อง',b.attendee.displayName],
  ['แผนก',b.attendee.departmentName],
  ['เบอร์ติดต่อ',b.contactPhone],
  ['สถานะ',<StatusBadge key="s" kind="room" status={b.status}/>],
  ['ผู้อนุมัติ',b.approver?b.approver.displayName:'อนุมัติอัตโนมัติ'],
 ];
 if(b.rejectReason)rows.push(['เหตุผลที่ไม่อนุมัติ',b.rejectReason]);
 return <dl className="divide-y rounded-2xl border bg-white">{rows.map(([k,v])=><div key={k} className="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-3 px-4 py-3"><dt className="text-muted-foreground">{k}</dt><dd className="min-w-0 break-words">{v}</dd></div>)}</dl>;
}

/** ไทม์ไลน์สถานะ เช่น ส่งคำขอ 09:41 → ส่งถึง วิชัย ส. → อนุมัติ 10:05 */
export function StatusTimeline({booking:b}:{booking:RoomBookingDetail}) {
 const steps:{icon:typeof Send;label:string;tone:'done'|'wait'|'end'}[]=[{icon:Send,label:'ส่งคำขอ '+stamp(b.createdAt),tone:'done'}];
 if(b.approver)steps.push({icon:UserCheck,label:'ส่งถึง '+b.approver.shortName,tone:'done'});
 if(b.status==='APPROVED')steps.push({icon:CircleCheck,label:(b.approver?'อนุมัติ ':'อนุมัติอัตโนมัติ ')+stamp(b.decidedAt??b.createdAt),tone:'done'});
 if(b.status==='REJECTED')steps.push({icon:CircleX,label:'ไม่อนุมัติ '+stamp(b.decidedAt??b.updatedAt),tone:'end'});
 if(b.status==='PENDING')steps.push({icon:Hourglass,label:'รออนุมัติ',tone:'wait'});
 if(b.status==='EXPIRED')steps.push({icon:Clock3,label:'หมดอายุ '+stamp(b.updatedAt)+' หัวหน้ายังไม่ได้อนุมัติ',tone:'end'});
 if(b.status==='CANCELLED')steps.push({icon:Ban,label:'ยกเลิก '+stamp(b.updatedAt),tone:'end'});
 return <ol aria-label="ไทม์ไลน์สถานะ" className="space-y-0">{steps.map((s,i)=><li key={i} className="relative flex gap-3 pb-5 last:pb-0">
  {i<steps.length-1&&<span aria-hidden className="absolute left-[17px] top-9 bottom-0 w-0.5 bg-border"/>}
  <span className={'grid size-9 shrink-0 place-items-center rounded-full ring-4 ring-white '+(s.tone==='done'?'bg-accent text-primary':s.tone==='wait'?'bg-status-pending text-status-pending-foreground':'bg-status-other text-status-other-foreground')}><s.icon size={18} aria-hidden/></span>
  <span className="pt-1.5">{s.label}</span>
 </li>)}</ol>;
}

export function BookingDetailSheet({booking,onClose,meId,isAdmin,onCloseAutoFocus}:{booking:RoomBookingDetail|null;onClose:()=>void;meId:string;isAdmin:boolean;onCloseAutoFocus?:(e:Event)=>void}) {
 const canOpen=!!booking&&(booking.isMine||booking.approverId===meId||isAdmin);
 return <ResponsivePanel open={!!booking} onOpenChange={v=>{if(!v)onClose();}} title={booking?.title??'รายละเอียดการจอง'} description={booking?booking.room.shortLabel+' · '+formatDate(booking.start)+' '+formatRange(booking.start,booking.end):undefined} onCloseAutoFocus={onCloseAutoFocus}>
  {booking&&<div className="space-y-6">
   <BookingInfo booking={booking}/>
   {canOpen&&<RoomBookingActions booking={booking} meId={meId} isAdmin={isAdmin} canDecide onDone={onClose}/>}
   {canOpen&&<Link href={'/rooms/bookings/'+booking.id} className="inline-flex min-h-12 items-center gap-1.5 font-medium text-primary underline underline-offset-4">เปิดหน้ารายละเอียด<ArrowUpRight size={18} aria-hidden/></Link>}
  </div>}
 </ResponsivePanel>;
}
