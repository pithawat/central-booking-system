'use client';
import {Fragment} from 'react';
import {Plus,Users,Tv,Coins,Building2} from 'lucide-react';
import type {Building,Room,RoomBookingDetail,Site} from '@/shared/data/types';
import {appConfig} from '@/shared/config/app.config';
import {formatRange,formatTime,timeOptions,todayInBangkok} from '@/shared/lib/datetime';
import {useNow} from '@/shared/ui/clock-provider';
import {daySlots,isPastSlot,percentOfDay,roomFree,slotEnd,dayBounds} from '../lib/slots';
import {roomStatusLabels} from '@/shared/ui/status-badge';
import {seatsLabel} from '../lib/labels';

export type BoardProps={date:string;rooms:Room[];buildings:Building[];sites:Site[];bookings:RoomBookingDetail[];onSlot:(room:Room,start:string)=>void;onBooking:(b:RoomBookingDetail)=>void};

export function blockStyle(b:Pick<RoomBookingDetail,'isMine'|'status'>) {
 if(b.status==='PENDING')return 'bg-status-pending text-status-pending-foreground '+(b.isMine?'border-2 border-dashed border-status-pending-border':'border border-status-pending-border');
 return b.isMine?'bg-status-mine text-status-mine-foreground border border-status-mine shadow-sm':'bg-status-other text-status-other-foreground border border-status-other-border';
}
export function blockCaption(b:RoomBookingDetail) {
 const time=formatRange(b.start,b.end);
 return b.status==='PENDING'?(b.isMine?'รออนุมัติ · ของคุณ · ':'รออนุมัติ · ')+time:b.isMine?'ของคุณ · '+time:time+' · '+b.bookedBy.shortName;
}
export const blockLabel=(b:RoomBookingDetail)=>b.title+' · '+b.room.shortLabel+' '+formatRange(b.start,b.end)+' · '+roomStatusLabels[b.status]+(b.isMine?' · ของคุณ':'')+' · จองโดย '+b.bookedBy.displayName;

export function RoomLabel({room}:{room:Room}) {
 return <>
  <p className="truncate font-heading font-semibold leading-snug">{room.shortLabel}</p>
  <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-sm text-muted-foreground">
   <span className="inline-flex items-center gap-1"><Users size={14} aria-hidden/>{seatsLabel(room)}</span>
   {room.hasTv===true&&<span className="inline-flex items-center gap-1"><Tv size={14} aria-hidden/>จอทีวี</span>}
   {room.hasCost&&<span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-1.5 text-warning ring-1 ring-warning-border"><Coins size={13} aria-hidden/>มีค่าใช้จ่าย</span>}
   {room.note&&<span className="truncate">{room.note}</span>}
  </p>
 </>;
}

export function groupByBuilding(rooms:Room[],buildings:Building[]) {
 const groups:{building:Building|undefined;rooms:Room[]}[]=[];
 for(const room of rooms){const last=groups.at(-1);if(last&&last.building?.id===room.buildingId)last.rooms.push(room);else groups.push({building:buildings.find(b=>b.id===room.buildingId),rooms:[room]});}
 return groups;
}

export function RoomTimeline({date,rooms,buildings,sites,bookings,onSlot,onBooking}:BoardProps) {
 const now=useNow(),slots=daySlots(date),{start:dayStart,end:dayEnd}=dayBounds(date);
 const hours=timeOptions(appConfig.room.dayStart,appConfig.room.dayEnd,60);
 const showNow=todayInBangkok(now)===date&&now.getTime()>=dayStart&&now.getTime()<=dayEnd,nowPct=percentOfDay(date,now.getTime());
 const siteName=(id:string)=>sites.find(s=>s.id===id)?.name??'';
 const nowLine=showNow&&<span aria-hidden className="pointer-events-none absolute inset-y-0 z-[3] w-0.5 -translate-x-1/2 bg-primary" style={{left:nowPct+'%'}}/>;
 return <div className="surface overflow-x-auto scrollbar-thin lg:overflow-x-visible">
  <div className="min-w-[1080px] lg:min-w-0">
   <div className="grid grid-cols-[240px_minmax(0,1fr)] border-b bg-muted/50">
    <div className="sticky left-0 z-10 border-r bg-[#f8fafc] px-4 py-4 text-sm font-medium text-muted-foreground">ห้อง</div>
    <div className="relative h-14">
     {hours.map((h,i)=><span key={h} className={'absolute top-1.5 text-sm tabular-nums text-muted-foreground '+(i===0?'pl-1.5':i===hours.length-1?'-translate-x-full pr-1.5':'-translate-x-1/2')} style={{left:(i/(hours.length-1))*100+'%'}}>{h}</span>)}
     {showNow&&<span className="absolute -bottom-px z-[4] -translate-x-1/2 rounded-t-md bg-primary px-2 py-0.5 text-sm font-medium text-primary-foreground" style={{left:nowPct+'%'}}>ตอนนี้ {formatTime(now)}</span>}
    </div>
   </div>
   {groupByBuilding(rooms,buildings).map(g=><Fragment key={g.building?.id??g.rooms[0].id}>
    <div className="grid grid-cols-[240px_minmax(0,1fr)] border-b bg-accent/60">
     <h3 className="sticky left-0 z-10 col-span-2 flex items-center gap-2 px-4 py-2 font-heading text-base font-semibold text-accent-foreground"><Building2 size={16} aria-hidden/>{g.building?.name} · {siteName(g.rooms[0].siteId)}</h3>
    </div>
    {g.rooms.map(room=>{
     const own=bookings.filter(b=>b.roomId===room.id);
     return <div key={room.id} className="grid min-h-16 grid-cols-[240px_minmax(0,1fr)] border-b last:border-b-0">
      <div className="sticky left-0 z-10 border-r bg-white px-4 py-2.5"><RoomLabel room={room}/></div>
      <div className="relative">
       <div className="absolute inset-0 grid" style={{gridTemplateColumns:'repeat('+slots.length+',minmax(0,1fr))'}}>
        {slots.map((slot,i)=>{
         const edge=i%2===0?'border-l border-slate-200':'border-l border-dashed border-slate-100';
         if(isPastSlot(slot,now))return <div key={slot} aria-hidden className={'slot-past '+edge}/>;
         if(!roomFree(slot,slotEnd(slot),own))return <div key={slot} aria-hidden className={edge}/>;
         return <button key={slot} type="button" aria-label={'จอง '+room.shortLabel+' เวลา '+formatRange(slot,slotEnd(slot))} onClick={()=>onSlot(room,slot)} className={'group grid place-items-center bg-white outline-none transition-colors hover:bg-status-free-hover focus-visible:z-[5] focus-visible:bg-status-free-hover focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-inset '+edge}>
          <Plus size={16} aria-hidden className="text-primary opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"/>
         </button>;
        })}
       </div>
       {own.map(b=>{const left=percentOfDay(date,b.start),width=Math.max(percentOfDay(date,b.end)-left,0.8);return <button key={b.id} type="button" aria-label={blockLabel(b)} onClick={()=>onBooking(b)} className={'absolute inset-y-1.5 z-[2] min-w-0 overflow-hidden rounded-lg px-2 py-1 text-left text-sm leading-snug transition-[filter,box-shadow] hover:brightness-95 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none '+blockStyle(b)} style={{left:left+'%',width:'calc('+width+'% - 3px)',marginLeft:'1.5px'}}>
        <span className="block truncate font-semibold">{b.title}</span>
        <span className="block truncate opacity-90">{blockCaption(b)}</span>
       </button>;})}
       {nowLine}
      </div>
     </div>;
    })}
   </Fragment>)}
  </div>
 </div>;
}
