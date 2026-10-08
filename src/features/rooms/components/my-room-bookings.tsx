'use client';
import Link from 'next/link';
import {DoorOpen,UserCheck,ChevronRight} from 'lucide-react';
import type {RoomBookingDetail} from '@/shared/data/types';
import {formatDate,formatRange} from '@/shared/lib/datetime';
import {StatusBadge} from '@/shared/ui/status-badge';
import {RoomBookingActions} from './booking-actions';
import {approverLine} from '../lib/labels';
/** การ์ดการจองห้องในหน้า "การจองของฉัน" (§10.4) · แตะการ์ดเพื่อดูรายละเอียด ปุ่มอยู่แถบล่าง */
export function MyRoomBookingCard({booking:b,meId,isAdmin}:{booking:RoomBookingDetail;meId:string;isAdmin:boolean}) {
 const line=approverLine(b);
 return <article className="surface overflow-hidden">
  <Link href={'/rooms/bookings/'+b.id} aria-label={b.room.shortLabel+' · '+b.title} className="flex items-start gap-3 p-3 transition-colors hover:bg-accent/40 active:bg-accent/60 sm:p-4">
   <span className="hidden size-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700 sm:grid" aria-hidden><DoorOpen size={24}/></span>
   <div className="min-w-0 flex-1 space-y-1">
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="font-medium text-indigo-700">{b.room.shortLabel}</span><StatusBadge kind="room" status={b.status}/></div>
    <h3 className="text-lg leading-snug wrap-break-word">{b.title}</h3>
    <p className="font-heading font-medium tabular-nums">{formatDate(b.start)} · <span className="whitespace-nowrap">{formatRange(b.start,b.end)}</span></p>
    {line&&<p className="flex items-center gap-1.5 text-sm text-muted-foreground"><UserCheck size={15} aria-hidden className="shrink-0"/>{line}</p>}
    {b.rejectReason&&<p className="text-sm">เหตุผล: {b.rejectReason}</p>}
   </div>
   <ChevronRight aria-hidden className="mt-1 shrink-0 text-muted-foreground"/>
  </Link>
  <div className="border-t p-3 empty:hidden sm:px-4"><RoomBookingActions booking={b} meId={meId} isAdmin={isAdmin}/></div>
 </article>;
}
