'use client';
import Link from 'next/link';
import {DoorOpen,UserCheck,ChevronRight} from 'lucide-react';
import type {RoomBookingDetail} from '@/shared/data/types';
import {formatDate,formatRange} from '@/shared/lib/datetime';
import {StatusBadge} from '@/shared/ui/status-badge';
import {RoomBookingActions} from './booking-actions';
import {approverLine} from '../lib/labels';
/** การ์ดการจองห้องในหน้า "การจองของฉัน" (หัวข้อ 10.4) */
export function MyRoomBookingCard({booking:b,meId,isAdmin}:{booking:RoomBookingDetail;meId:string;isAdmin:boolean}) {
 const line=approverLine(b);
 return <article className="surface flex flex-col gap-4 p-4 md:p-5">
  <div className="flex flex-col gap-3 md:flex-row md:items-start">
   <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent text-primary" aria-hidden><DoorOpen size={26}/></span>
   <div className="min-w-0 flex-1">
    <div className="flex flex-wrap items-center gap-2"><p className="font-medium text-primary">{b.room.shortLabel}</p><StatusBadge kind="room" status={b.status}/></div>
    <h3 className="mt-0.5 text-lg wrap-break-word">{b.title}</h3>
    <p className="mt-1 font-heading tabular-nums">{formatDate(b.start)} · {formatRange(b.start,b.end)}</p>
    {line&&<p className="mt-0.5 flex items-center gap-1.5 text-muted-foreground"><UserCheck size={15} aria-hidden/>{line}</p>}
    {b.rejectReason&&<p className="mt-1 text-sm">เหตุผล: {b.rejectReason}</p>}
   </div>
   <Link href={'/rooms/bookings/'+b.id} className="inline-flex min-h-11 shrink-0 items-center gap-1 font-medium text-primary">รายละเอียด<ChevronRight size={18} aria-hidden/></Link>
  </div>
  <RoomBookingActions booking={b} meId={meId} isAdmin={isAdmin}/>
 </article>;
}
