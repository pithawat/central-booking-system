'use client';
import Link from 'next/link';
import {CalendarRange,Building2,ChevronRight} from 'lucide-react';
import type {Room,RoomBookingDetail} from '@/shared/data/types';
import {formatRange} from '@/shared/lib/datetime';
import {useNow} from '@/shared/ui/clock-provider';
import {freeRanges} from '../lib/slots';
import {RoomLabel,blockStyle,blockCaption,blockLabel,groupByBuilding,type BoardProps} from './room-timeline';

/** การ์ดห้องเดียว: ช่วงที่ว่าง + การจองของวันนั้น ใช้ทั้งหน้ารายการบนมือถือและมุมมองวันของห้องเดียว */
export function RoomDayCard({room,date,bookings,siteName,buildingName,onRange,onBooking,showLink=true}:{room:Room;date:string;bookings:RoomBookingDetail[];siteName:string;buildingName:string;onRange:(room:Room,start:string,end:string)=>void;onBooking:(b:RoomBookingDetail)=>void;showLink?:boolean}) {
 const now=useNow(),ranges=freeRanges(date,bookings,now);
 return <article className="surface p-4">
  <header className="mb-3"><RoomLabel room={room}/><p className="mt-1 text-sm text-muted-foreground">{buildingName} · {siteName}</p></header>
  <h4 className="mb-2 text-sm font-semibold text-muted-foreground">ช่วงที่ว่าง</h4>
  {ranges.length?<ul className="flex flex-wrap gap-2">{ranges.map(r=><li key={r.start}><button type="button" onClick={()=>onRange(room,r.start,r.end)} aria-label={'จอง '+room.shortLabel+' ช่วง '+formatRange(r.start,r.end)} className="min-h-11 rounded-full border border-success-border bg-success-bg px-4 font-heading tabular-nums text-success transition-colors hover:bg-success hover:text-white focus-visible:ring-[3px] focus-visible:ring-ring">{formatRange(r.start,r.end)}</button></li>)}</ul>:<p className="text-muted-foreground">เต็มทั้งวัน</p>}
  {bookings.length>0&&<><h4 className="mb-2 mt-4 text-sm font-semibold text-muted-foreground">รายการจอง</h4><ul className="space-y-1.5">{[...bookings].sort((a,b)=>a.start.localeCompare(b.start)).map(b=><li key={b.id}><button type="button" aria-label={blockLabel(b)} onClick={()=>onBooking(b)} className={'flex min-h-11 w-full flex-col rounded-lg px-3 py-1.5 text-left text-sm '+blockStyle(b)}><span className="truncate font-semibold">{b.title}</span><span className="truncate opacity-90">{blockCaption(b)}</span></button></li>)}</ul></>}
  {showLink&&<Link href={'/rooms/'+room.id+'?'+new URLSearchParams({date,view:'day'})} className="mt-4 inline-flex min-h-11 items-center gap-1 font-medium text-primary">ดูตารางทั้งวัน<ChevronRight size={18} aria-hidden/></Link>}
 </article>;
}

export function RoomMobileList({date,rooms,buildings,sites,bookings,onRange,onBooking}:Omit<BoardProps,'onSlot'>&{onRange:(room:Room,start:string,end:string)=>void}) {
 const siteName=(id:string)=>sites.find(s=>s.id===id)?.name??'';
 return <div className="space-y-6">{groupByBuilding(rooms,buildings).map(g=><section key={g.building?.id??g.rooms[0].id} aria-label={g.building?.name}>
  <h3 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold"><Building2 size={18} aria-hidden className="text-primary"/>{g.building?.name} <span className="text-base font-normal text-muted-foreground">· {siteName(g.rooms[0].siteId)}</span></h3>
  <div className="space-y-3">{g.rooms.map(room=><RoomDayCard key={room.id} room={room} date={date} bookings={bookings.filter(b=>b.roomId===room.id)} siteName={siteName(room.siteId)} buildingName={g.building?.name??''} onRange={onRange} onBooking={onBooking}/>)}</div>
 </section>)}
 <p className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarRange size={16} aria-hidden/>แตะช่วงเวลาที่ว่างเพื่อจอง</p>
 </div>;
}
