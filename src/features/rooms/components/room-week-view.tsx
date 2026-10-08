'use client';
import {useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {ChevronLeft,ChevronRight,Plus} from 'lucide-react';
import type {Building,Room,RoomBookingDetail,Site,User} from '@/shared/data/types';
import {appConfig} from '@/shared/config/app.config';
import {addDays,bangkokDateTime,formatDate,formatDateLong,formatDateShort,formatRange,timeOptions,todayInBangkok,dayParts} from '@/shared/lib/datetime';
import {millis} from '@/shared/lib/intervals';
import {useNow} from '@/shared/ui/clock-provider';
import {useMobile} from '@/shared/ui/responsive-panel';
import {Button} from '@/components/ui/button';
import {ToggleGroup,ToggleGroupItem} from '@/components/ui/toggle-group';
import {daySlots,isPastSlot,percentOfDay,roomFree,slotEnd,weekStart} from '../lib/slots';
import {blockStyle,blockLabel} from './room-timeline';
import {RoomDayCard} from './room-mobile-list';
import {DateNav,DayStrip} from './room-filters';
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
 const selected=days.includes(date)?date:monday,navBtn='px-4';
 // เช่น "5 – 11 ต.ค." หรือ "28 ก.ย. – 4 ต.ค." ถ้าข้ามเดือน
 const dm=(d:string)=>formatDateShort(bangkokDateTime(d,'12:00')).replace(/^\S+\s/,''),first=dm(days[0]),last=dm(days[6]);
 const weekRange=(first.split(' ')[1]===last.split(' ')[1]?first.split(' ')[0]:first)+' – '+last;
 return <div className="space-y-5">
  <div className="space-y-3">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <ToggleGroup type="single" variant="outline" aria-label="มุมมอง" value={mode} onValueChange={v=>{if(v)go({view:v});}} className="grid w-full grid-cols-2 bg-white sm:inline-flex sm:w-auto">
     <ToggleGroupItem value="week" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">สัปดาห์</ToggleGroupItem>
     <ToggleGroupItem value="day" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">วัน</ToggleGroupItem>
    </ToggleGroup>
    {mode==='week'?<>
     {/* มือถือ: ปุ่มเลื่อนสัปดาห์แบบ ‹ ช่วงวันที่ › */}
     <div className="flex w-full items-center gap-1 rounded-2xl border bg-white p-1 shadow-card sm:hidden">
      <Button variant="ghost" size="icon" className="shrink-0" aria-label="สัปดาห์ก่อน" onClick={()=>go({date:addDays(monday,-7)})}><ChevronLeft aria-hidden/></Button>
      <div className="flex min-w-0 flex-1 flex-col items-center leading-tight"><span className="truncate font-heading text-lg font-semibold tabular-nums">{weekRange}</span>{monday!==thisWeek?<button type="button" onClick={()=>go({date:today})} className="min-h-6 text-sm font-medium text-primary underline underline-offset-2">กลับสัปดาห์นี้</button>:<span className="text-sm text-muted-foreground">สัปดาห์นี้</span>}</div>
      <Button variant="ghost" size="icon" className="shrink-0" aria-label="สัปดาห์ถัดไป" disabled={addDays(monday,7)>maxDate} onClick={()=>go({date:addDays(monday,7)})}><ChevronRight aria-hidden/></Button>
     </div>
     <div className="hidden flex-wrap gap-2 sm:flex">
      <Button variant="outline" className={navBtn} onClick={()=>go({date:addDays(monday,-7)})}><ChevronLeft aria-hidden/>สัปดาห์ก่อน</Button>
      <Button variant={monday===thisWeek?'secondary':'outline'} className={navBtn} onClick={()=>go({date:today})}>สัปดาห์นี้</Button>
      <Button variant="outline" className={navBtn} disabled={addDays(monday,7)>maxDate} onClick={()=>go({date:addDays(monday,7)})}>สัปดาห์ถัดไป<ChevronRight aria-hidden/></Button>
     </div>
    </>:<div className="w-full sm:w-auto"><DateNav compact={mobile} date={date} today={today} maxDate={maxDate} onChange={d=>go({date:d})}/></div>}
   </div>
   {mode==='day'&&<div className="md:hidden"><DayStrip date={date} today={today} maxDate={maxDate} onChange={d=>go({date:d})}/></div>}
  </div>
  <div className={pending?'opacity-60 transition-opacity':'transition-opacity'}>
  {mode==='week'&&<div className="space-y-3 md:hidden">
   {/* มือถือ: แถบ 7 วันของสัปดาห์ + ตารางของวันที่เลือก แทนตารางที่ต้องเลื่อนแนวนอน */}
   <div role="group" aria-label="เลือกวันในสัปดาห์" className="grid grid-cols-7 gap-1">{days.map(d=>{const p=dayParts(bangkokDateTime(d,'12:00')),n=bookings.filter(b=>todayInBangkok(b.start)===d).length,on=d===selected;
    return <button key={d} type="button" aria-pressed={on} aria-label={formatDateLong(bangkokDateTime(d,'12:00'))+(n?' · การจอง '+n+' รายการ':' · ไม่มีการจอง')} onClick={()=>go({date:d})} className={'flex min-h-16 min-w-0 flex-col items-center justify-center rounded-2xl border transition focus-visible:ring-[3px] focus-visible:ring-ring '+(on?'border-primary bg-primary text-primary-foreground':d===today?'border-primary/40 bg-accent':'bg-white')}>
     <span className={'text-sm '+(on?'text-primary-foreground/90':'text-muted-foreground')}>{p.weekday}</span><span className="font-heading text-lg font-semibold leading-tight tabular-nums">{p.day}</span>
     <span aria-hidden className="flex h-2 items-center gap-0.5">{Array.from({length:Math.min(n,3)},(_,i)=><span key={i} className={'size-1.5 rounded-full '+(on?'bg-white':'bg-primary')}/>)}</span>
    </button>;})}</div>
   <RoomDayCard room={room} date={selected} title={formatDateLong(bangkokDateTime(selected,'12:00'))} bookings={bookings.filter(b=>todayInBangkok(b.start)===selected)} siteName={site?.name??''} buildingName={building?.name??''} showLink={false} expanded onRange={(r,s,e)=>panels.openSlot(r,selected,s,e)} onBooking={panels.openBooking}/>
  </div>}
  {mode==='week'?<div className="hidden md:block">
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
  </div>:<div className="max-w-2xl"><RoomDayCard room={room} date={date} title={formatDateLong(bangkokDateTime(date,'12:00'))} bookings={bookings.filter(b=>todayInBangkok(b.start)===date)} siteName={site?.name??''} buildingName={building?.name??''} showLink={false} expanded onRange={(r,s,e)=>panels.openSlot(r,date,s,e)} onBooking={panels.openBooking}/></div>}
  </div>
  <p className="sr-only" aria-live="polite">{panels.announce}</p>
  <BookingSheet draft={panels.draft} onClose={panels.closeDraft} bookings={bookings} buildings={building?[building]:[]} siteName={()=>site?.name??''} me={me} supervisor={supervisor} onBooked={panels.booked} onCloseAutoFocus={panels.restoreFocus}/>
  <BookingDetailSheet booking={panels.detail} onClose={panels.closeDetail} onCloseAutoFocus={panels.restoreFocus} meId={me.id} isAdmin={me.roles.includes('ADMIN')}/>
 </div>;
}
