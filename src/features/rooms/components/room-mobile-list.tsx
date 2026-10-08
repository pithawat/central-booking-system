'use client';
import {useState} from 'react';
import Link from 'next/link';
import {CalendarRange,Building2,ChevronRight,ChevronDown} from 'lucide-react';
import type {Room,RoomBookingDetail} from '@/shared/data/types';
import {appConfig} from '@/shared/config/app.config';
import {formatRange,formatTime,todayInBangkok} from '@/shared/lib/datetime';
import {useNow} from '@/shared/ui/clock-provider';
import {freeRanges,percentOfDay,dayBounds} from '../lib/slots';
import {RoomLabel,blockStyle,blockCaption,blockLabel,groupByBuilding,type BoardProps} from './room-timeline';

/** แถบเวลา 07:00–19:00 ย่อส่วน ให้เห็นช่วงว่าง/ไม่ว่างทั้งวันในแวบเดียว (ข้อมูลจริงอยู่ในชิปและรายการด้านล่าง) */
function DayBar({date,bookings,now}:{date:string;bookings:RoomBookingDetail[];now:Date}) {
 const {start,end}=dayBounds(date),past=todayInBangkok(now)===date?percentOfDay(date,now.getTime()):now.getTime()>end?100:0;
 return <div aria-hidden className="mt-3">
  <div className="relative h-3 overflow-hidden rounded-full bg-success-bg ring-1 ring-success-border">
   {past>0&&<span className="slot-past absolute inset-y-0 left-0" style={{width:past+'%'}}/>}
   {bookings.map(b=>{const left=percentOfDay(date,b.start);return <span key={b.id} className={'absolute inset-y-0 '+(b.status==='PENDING'?'bg-status-pending-border':b.isMine?'bg-status-mine':'bg-slate-400')} style={{left:left+'%',width:Math.max(percentOfDay(date,b.end)-left,1)+'%'}}/>;})}
  </div>
  <div className="mt-1 flex justify-between text-sm tabular-nums text-muted-foreground"><span>{appConfig.room.dayStart}</span><span>{formatTime((start+end)/2)}</span><span>{appConfig.room.dayEnd}</span></div>
 </div>;
}

/** การ์ดห้องเดียว: ช่วงที่ว่าง + การจองของวันนั้น ใช้ทั้งหน้ารายการบนมือถือและมุมมองวันของห้องเดียว */
export function RoomDayCard({room,date,title,bookings,siteName,buildingName,onRange,onBooking,showLink=true,expanded=false}:{room:Room;date:string;title?:string;bookings:RoomBookingDetail[];siteName:string;buildingName:string;onRange:(room:Room,start:string,end:string)=>void;onBooking:(b:RoomBookingDetail)=>void;showLink?:boolean;expanded?:boolean}) {
 const now=useNow(),ranges=freeRanges(date,bookings,now),[open,setOpen]=useState(expanded);
 const sorted=[...bookings].sort((a,b)=>a.start.localeCompare(b.start)),listId='bookings-'+room.id;
 return <article className="surface overflow-hidden">
  <div className="p-4 pb-3">
   <header className="flex items-start justify-between gap-3">
    <div className="min-w-0">{title?<h3 className="font-heading text-lg font-semibold leading-snug">{title}</h3>:<><RoomLabel room={room}/><p className="mt-0.5 truncate text-sm text-muted-foreground">{buildingName} · {siteName}</p></>}</div>
    <span className={'shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 '+(ranges.length?'bg-success-bg text-success ring-success-border':'bg-status-other text-status-other-foreground ring-status-other-border')}>{ranges.length?'ว่าง '+ranges.length+' ช่วง':'เต็มทั้งวัน'}</span>
   </header>
   <DayBar date={date} bookings={bookings} now={now}/>
   <h4 className="mb-2 mt-3 text-sm font-semibold text-muted-foreground">ช่วงที่ว่าง</h4>
   {ranges.length?<ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-thin">{ranges.map(r=><li key={r.start} className="shrink-0"><button type="button" onClick={()=>onRange(room,r.start,r.end)} aria-label={'จอง '+room.shortLabel+' ช่วง '+formatRange(r.start,r.end)} className="min-h-11 whitespace-nowrap rounded-full border border-success-border bg-success-bg px-4 font-heading tabular-nums text-success transition-colors hover:bg-success hover:text-white active:bg-success active:text-white focus-visible:ring-[3px] focus-visible:ring-ring">{formatRange(r.start,r.end)}</button></li>)}</ul>:<p className="text-muted-foreground">เต็มทั้งวัน</p>}
  </div>
  {(sorted.length>0||showLink)&&<div className="flex items-stretch border-t">
   {sorted.length>0&&<button type="button" aria-expanded={open} aria-controls={listId} onClick={()=>setOpen(v=>!v)} className="flex min-h-12 min-w-0 flex-1 items-center gap-1.5 whitespace-nowrap px-3 text-left font-medium text-foreground hover:bg-muted/50 sm:px-4"><ChevronDown aria-hidden className={'size-5 shrink-0 text-muted-foreground transition-transform '+(open?'rotate-180':'')}/><span className="truncate">การจอง {sorted.length}<span className="sr-only min-[360px]:not-sr-only">&nbsp;รายการ</span></span></button>}
   {showLink&&<Link href={'/rooms/'+room.id+'?'+new URLSearchParams({date,view:'day'})} className={'flex min-h-12 shrink-0 items-center gap-0.5 whitespace-nowrap px-3 font-medium text-primary hover:bg-muted/50 sm:px-4 '+(sorted.length?'border-l':'ml-auto')}>ดูตารางทั้งวัน<ChevronRight size={18} aria-hidden/></Link>}
  </div>}
  {open&&sorted.length>0&&<ul id={listId} className="space-y-1.5 border-t bg-muted/30 p-3">{sorted.map(b=><li key={b.id}><button type="button" aria-label={blockLabel(b)} onClick={()=>onBooking(b)} className={'flex min-h-11 w-full flex-col rounded-lg px-3 py-1.5 text-left text-sm '+blockStyle(b)}><span className="w-full truncate font-semibold">{b.title}</span><span className="w-full truncate opacity-90">{blockCaption(b)}</span></button></li>)}</ul>}
 </article>;
}

export function RoomMobileList({date,rooms,buildings,sites,bookings,onRange,onBooking}:Omit<BoardProps,'onSlot'>&{onRange:(room:Room,start:string,end:string)=>void}) {
 const siteName=(id:string)=>sites.find(s=>s.id===id)?.name??'';
 return <div className="space-y-5">{groupByBuilding(rooms,buildings).map(g=><section key={g.building?.id??g.rooms[0].id} aria-label={g.building?.name}>
  <h3 className="sticky top-[calc(4rem+env(safe-area-inset-top))] z-10 -mx-4 mb-2 flex items-center gap-2 bg-canvas/95 px-4 py-2 font-heading text-lg font-semibold backdrop-blur"><Building2 size={18} aria-hidden className="shrink-0 text-primary"/><span className="truncate">{g.building?.name}</span><span className="shrink-0 text-base font-normal text-muted-foreground">· {siteName(g.rooms[0].siteId)}</span></h3>
  <div className="space-y-3">{g.rooms.map(room=><RoomDayCard key={room.id} room={room} date={date} bookings={bookings.filter(b=>b.roomId===room.id)} siteName={siteName(room.siteId)} buildingName={g.building?.name??''} onRange={onRange} onBooking={onBooking}/>)}</div>
 </section>)}
 <p className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarRange size={16} aria-hidden/>แตะช่วงเวลาที่ว่างเพื่อจอง</p>
 </div>;
}
