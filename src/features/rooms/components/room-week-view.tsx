'use client';
import {useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {ChevronLeft,ChevronRight,Plus} from 'lucide-react';
import type {Building,Room,RoomBookingDetail,Site,User} from '@/shared/data/types';
import {appConfig} from '@/shared/config/app.config';
import {addDays,bangkokDateTime,formatDate,formatRange,timeOptions,todayInBangkok} from '@/shared/lib/datetime';
import {millis} from '@/shared/lib/intervals';
import {useNow} from '@/shared/ui/clock-provider';
import {useMobile} from '@/shared/ui/responsive-panel';
import {Button} from '@/components/ui/button';
import {ToggleGroup,ToggleGroupItem} from '@/components/ui/toggle-group';
import {daySlots,isPastSlot,percentOfDay,roomFree,slotEnd,weekStart} from '../lib/slots';
import {blockStyle,blockLabel} from './room-timeline';
import {RoomDayCard} from './room-mobile-list';
import {DateNav} from './room-filters';
import {BookingSheet} from './booking-sheet';
import {BookingDetailSheet} from './booking-detail';
import {useBookingPanels} from './rooms-board';

const weekdays=['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์','อาทิตย์'];
type Props={room:Room;building?:Building;site?:Site;date:string;view:'week'|'day'|null;bookings:RoomBookingDetail[];today:string;maxDate:string;me:User;supervisor:User|null};

export function RoomWeekView({room,building,site,date,view,bookings,today,maxDate,me,supervisor}:Props) {
 const router=useRouter(),mobile=useMobile(),now=useNow(),[pending,start]=useTransition(),panels=useBookingPanels(bookings);
 const mode=view??(mobile?'day':'week');
 const go=(patch:{date?:string;view?:string})=>start(()=>router.replace('/rooms/'+room.id+'?'+new URLSearchParams({date,view:mode,...patch}),{scroll:false}));
 const monday=weekStart(date),days=Array.from({length:7},(_,i)=>addDays(monday,i)),thisWeek=weekStart(today);
 const hours=timeOptions(appConfig.room.dayStart,appConfig.room.dayEnd,appConfig.room.slotMinutes).slice(0,-1);
 return <div className="space-y-5">
  <div className="flex flex-wrap items-center justify-between gap-3">
   <ToggleGroup type="single" variant="outline" aria-label="มุมมอง" value={mode} onValueChange={v=>{if(v)go({view:v});}} className="bg-white">
    <ToggleGroupItem value="week" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">สัปดาห์</ToggleGroupItem>
    <ToggleGroupItem value="day" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">วัน</ToggleGroupItem>
   </ToggleGroup>
   {mode==='week'?<div className="flex flex-wrap items-center gap-2">
    <Button variant="outline" onClick={()=>go({date:addDays(monday,-7)})}><ChevronLeft aria-hidden/>สัปดาห์ก่อน</Button>
    <Button variant={monday===thisWeek?'secondary':'outline'} onClick={()=>go({date:today})}>สัปดาห์นี้</Button>
    <Button variant="outline" disabled={addDays(monday,7)>maxDate} onClick={()=>go({date:addDays(monday,7)})}>สัปดาห์ถัดไป<ChevronRight aria-hidden/></Button>
   </div>:<DateNav compact={mobile} date={date} today={today} maxDate={maxDate} onChange={d=>go({date:d})}/>}
  </div>
  <div className={pending?'opacity-60 transition-opacity':'transition-opacity'}>
  {mode==='week'?<>
   <p className="mb-3 font-heading text-lg font-semibold">{formatDate(bangkokDateTime(days[0],'12:00'))} – {formatDate(bangkokDateTime(days[6],'12:00'))}</p>
   <div className="surface overflow-x-auto scrollbar-thin">
    <div className="grid min-w-[760px] grid-cols-[56px_repeat(7,minmax(0,1fr))]">
     <div className="sticky left-0 z-10 border-b border-r bg-white"/>
     {days.map((d,i)=><div key={d} className={'border-b border-r px-2 py-2 text-center last:border-r-0 '+(d===today?'bg-accent text-accent-foreground':'')}><p className="text-sm text-muted-foreground">{weekdays[i]}</p><p className="font-heading font-semibold tabular-nums">{formatDate(bangkokDateTime(d,'12:00')).split(' ').slice(1,3).join(' ')}</p></div>)}
     <div className="sticky left-0 z-10 border-r bg-white">{hours.map((h,i)=><div key={h} className="relative h-6 pr-1.5 text-right text-sm tabular-nums text-muted-foreground">{i%2===0&&<span className="absolute -top-2 right-1.5">{h}</span>}</div>)}</div>
     {days.map(d=>{
      const own=bookings.filter(b=>todayInBangkok(b.start)===d),showNow=d===todayInBangkok(now)&&now.getTime()>=millis(bangkokDateTime(d,appConfig.room.dayStart))&&now.getTime()<=millis(bangkokDateTime(d,appConfig.room.dayEnd));
      return <div key={d} className="relative border-r last:border-r-0">
       {daySlots(d).map((slot,i)=>{
        const edge=i%2===0?'border-t border-slate-200':'border-t border-dashed border-slate-100';
        if(isPastSlot(slot,now))return <div key={slot} aria-hidden className={'h-6 slot-past '+edge}/>;
        if(!roomFree(slot,slotEnd(slot),own))return <div key={slot} aria-hidden className={'h-6 '+edge}/>;
        return <button key={slot} type="button" aria-label={'จอง '+room.shortLabel+' '+formatDate(slot)+' เวลา '+formatRange(slot,slotEnd(slot))} onClick={()=>panels.openSlot(room,d,slot)} className={'group grid h-6 w-full place-items-center bg-white hover:bg-status-free-hover focus-visible:relative focus-visible:z-[5] focus-visible:bg-status-free-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring '+edge}><Plus size={14} aria-hidden className="text-primary opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"/></button>;
       })}
       {own.map(b=>{const top=percentOfDay(d,b.start),height=Math.max(percentOfDay(d,b.end)-top,2);return <button key={b.id} type="button" aria-label={blockLabel(b)} onClick={()=>panels.openBooking(b)} className={'absolute inset-x-1 z-[2] overflow-hidden rounded-md px-1.5 py-0.5 text-left text-sm leading-tight hover:brightness-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring '+blockStyle(b)} style={{top:'calc('+top+'% + 1px)',height:'calc('+height+'% - 2px)'}}><span className="block truncate font-semibold">{b.title}</span><span className="block truncate opacity-90">{b.status==='PENDING'?'รออนุมัติ · ':''}{formatRange(b.start,b.end)}</span></button>;})}
       {showNow&&<span aria-hidden className="pointer-events-none absolute inset-x-0 z-[3] h-0.5 bg-primary" style={{top:percentOfDay(d,now.getTime())+'%'}}/>}
      </div>;
     })}
    </div>
   </div>
  </>:<div className="max-w-2xl"><RoomDayCard room={room} date={date} bookings={bookings.filter(b=>todayInBangkok(b.start)===date)} siteName={site?.name??''} buildingName={building?.name??''} showLink={false} onRange={(r,s,e)=>panels.openSlot(r,date,s,e)} onBooking={panels.openBooking}/></div>}
  </div>
  <p className="sr-only" aria-live="polite">{panels.announce}</p>
  <BookingSheet draft={panels.draft} onClose={panels.closeDraft} bookings={bookings} buildings={building?[building]:[]} siteName={()=>site?.name??''} me={me} supervisor={supervisor} onBooked={panels.booked} onCloseAutoFocus={panels.restoreFocus}/>
  <BookingDetailSheet booking={panels.detail} onClose={panels.closeDetail} onCloseAutoFocus={panels.restoreFocus} meId={me.id} isAdmin={me.roles.includes('ADMIN')}/>
 </div>;
}
