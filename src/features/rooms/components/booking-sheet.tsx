'use client';
import {useEffect,useRef,useState,useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {CheckCircle2,AlertTriangle,Mail,ChevronDown,Search,Users,Tv,Coins,CalendarDays,Clock} from 'lucide-react';
import type {Building,Room,RoomBookingDetail,User} from '@/shared/data/types';
import {appConfig} from '@/shared/config/app.config';
import {formatDate,formatRange,formatTime} from '@/shared/lib/datetime';
import {millis} from '@/shared/lib/intervals';
import {useNow} from '@/shared/ui/clock-provider';
import {ResponsivePanel} from '@/shared/ui/responsive-panel';
import {UserAvatar} from '@/shared/ui/user-avatar';
import {Choice} from '@/shared/ui/fields';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Checkbox} from '@/components/ui/checkbox';
import {Spinner} from '@/components/ui/spinner';
import {ToggleGroup,ToggleGroupItem} from '@/components/ui/toggle-group';
import {Collapsible,CollapsibleContent,CollapsibleTrigger} from '@/components/ui/collapsible';
import {startOptions,endOptions,maxEndFor,conflictOf} from '../lib/slots';
import {durationOptions,requestToast,seatsLabel} from '../lib/labels';
import {createRoom,searchEmployees} from '../actions';

export type BookingDraft={room:Room;date:string;start:string;end:string};
type Props={draft:BookingDraft|null;onClose:()=>void;bookings:RoomBookingDetail[];buildings:Building[];siteName:(siteId:string)=>string;me:User;supervisor:User|null;onBooked:(booking:RoomBookingDetail,message:string)=>void;onCloseAutoFocus?:(e:Event)=>void};

export function RoomFacts({room,building,siteName}:{room:Room;building?:Building;siteName:string}) {
 return <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
  <span>{building?.name??'–'} · {siteName}</span>
  <span className="inline-flex items-center gap-1"><Users size={16} aria-hidden/>{seatsLabel(room)}</span>
  {room.hasTv===true&&<span className="inline-flex items-center gap-1"><Tv size={16} aria-hidden/>จอทีวี</span>}
  {room.hasCost&&<span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 text-warning ring-1 ring-warning-border"><Coins size={14} aria-hidden/>มีค่าใช้จ่าย</span>}
  {room.note&&<span>{room.note}</span>}
 </span>;
}

export function BookingSheet({draft,onClose,bookings,buildings,siteName,me,supervisor,onBooked,onCloseAutoFocus}:Props) {
 const room=draft?.room;
 return <ResponsivePanel open={!!draft} onOpenChange={v=>{if(!v)onClose();}} title={room?'จอง '+room.shortLabel:'จองห้อง'} description={room?<RoomFacts room={room} building={buildings.find(b=>b.id===room.buildingId)} siteName={siteName(room.siteId)}/>:undefined} onOpenAutoFocus={e=>{e.preventDefault();document.getElementById('room-title')?.focus();}} onCloseAutoFocus={onCloseAutoFocus}>
  {draft&&<BookingForm key={draft.room.id+draft.start} draft={draft} bookings={bookings.filter(b=>b.roomId===draft.room.id)} me={me} supervisor={supervisor} onBooked={onBooked}/>}
 </ResponsivePanel>;
}

function BookingForm({draft,bookings,me,supervisor,onBooked}:{draft:BookingDraft;bookings:RoomBookingDetail[];me:User;supervisor:User|null;onBooked:Props['onBooked']}) {
 const router=useRouter(),now=useNow(),[pending,startTransition]=useTransition();
 const [start,setStart]=useState(draft.start),[end,setEnd]=useState(draft.end),[title,setTitle]=useState(''),[attendee,setAttendee]=useState<User>(me),[phone,setPhone]=useState(me.phone),[ack,setAck]=useState(false);
 const [error,setError]=useState(''),[titleError,setTitleError]=useState(''),[conflict,setConflict]=useState(false),[more,setMore]=useState(false);
 const room=draft.room,cfg=appConfig.room,confirmCost=room.hasCost&&cfg.costRoomBehavior==='confirm';
 const starts=startOptions(draft.date,bookings,now),ends=endOptions(draft.date,start,bookings),max=maxEndFor(draft.date,start,bookings);
 const clash=conflictOf(start,end,bookings),startBlocked=starts.find(o=>o.value===start)?.disabled??true;
 const duration=Math.round((millis(end)-millis(start))/60000);
 function changeStart(value:string) {setStart(value);setConflict(false);const limit=maxEndFor(draft.date,value,bookings);setEnd(new Date(Math.min(millis(value)+Math.max(duration,cfg.slotMinutes)*60000,limit)).toISOString());}
 function submit(e:React.FormEvent) {
  e.preventDefault();setError('');
  if(!title.trim()){setTitleError('กรุณากรอกเรื่องที่ประชุม');document.getElementById('room-title')?.focus();return;}
  if(confirmCost&&!ack){setError('กรุณารับทราบเรื่องค่าใช้จ่ายก่อนส่ง');return;}
  startTransition(async()=>{
   const r=await createRoom({roomId:room.id,start,end,title:title.trim(),attendeeId:attendee.id,contactPhone:phone.trim()||undefined});
   if(r.ok){onBooked(r.data,requestToast(r.data.status==='PENDING'?r.data.approver:null));return;}
   if(r.error.code==='CONFLICT'){setConflict(true);router.refresh();return;}
   if(r.error.fields?.title)setTitleError(r.error.fields.title);else setError(r.error.message);
  });
 }
 return <form onSubmit={submit} className="space-y-6" noValidate>
  {room.hasCost&&<div className="flex gap-3 rounded-xl border border-warning-border bg-warning-bg p-4 text-warning"><Coins aria-hidden className="mt-0.5 shrink-0"/><div><p className="font-medium">ห้องนี้มีค่าใช้จ่าย</p>{confirmCost&&<label className="mt-2 flex min-h-12 items-center gap-3 text-foreground"><Checkbox checked={ack} onCheckedChange={v=>setAck(v===true)}/>รับทราบเรื่องค่าใช้จ่าย</label>}</div></div>}
  {conflict&&<div role="alert" className="flex gap-3 rounded-xl border border-overdue-border bg-overdue-bg p-4 text-overdue"><AlertTriangle aria-hidden className="mt-0.5 shrink-0"/><p className="font-medium">มีคนเพิ่งจองช่วงนี้ไป เลือกเวลาอื่น</p></div>}
  <section className="space-y-4 rounded-2xl bg-muted/60 p-4">
   <p className="flex items-center gap-2 font-medium"><CalendarDays size={18} aria-hidden className="text-primary"/>วันที่ <span className="font-heading">{formatDate(start)}</span></p>
   <div className="grid grid-cols-2 gap-3">
    <Choice id="room-start" label="เริ่ม" value={start} onChange={changeStart} options={starts.map(o=>o.value===start?{...o,disabled:false}:o)}/>
    <Choice id="room-end" label="สิ้นสุด" value={end} onChange={v=>{setEnd(v);setConflict(false);}} options={ends.some(o=>o.value===end)?ends:[{value:end,label:formatTime(end)},...ends]}/>
   </div>
   <div>
    <p id="duration-label" className="mb-2">ระยะเวลา</p>
    <ToggleGroup type="single" variant="outline" aria-labelledby="duration-label" value={durationOptions.some(o=>o.minutes===duration)?String(duration):''} onValueChange={v=>{if(v){setEnd(new Date(millis(start)+Number(v)*60000).toISOString());setConflict(false);}}} className="w-full bg-white">
     {durationOptions.map(o=><ToggleGroupItem key={o.minutes} value={String(o.minutes)} disabled={millis(start)+o.minutes*60000>max} className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{o.label}</ToggleGroupItem>)}
    </ToggleGroup>
   </div>
   <p aria-live="polite" className={'flex items-center gap-2 font-medium '+(clash||startBlocked?'text-overdue':'text-success')}>
    {clash?<><AlertTriangle size={18} aria-hidden/>ชนกับ “{clash.title}” {formatRange(clash.start,clash.end)}</>:startBlocked?<><AlertTriangle size={18} aria-hidden/>เวลาเริ่มนี้เลือกไม่ได้ เลือกเวลาอื่น</>:<><CheckCircle2 size={18} aria-hidden/>ช่วงนี้ว่าง · {formatRange(start,end)}</>}
   </p>
  </section>
  <div>
   <label htmlFor="room-title" className="mb-2 block font-medium">เรื่องที่ประชุม</label>
   <Input id="room-title" value={title} maxLength={cfg.titleMaxLength} placeholder="ประชุมทีมขายประจำสัปดาห์" aria-invalid={!!titleError} aria-describedby="room-title-hint" onChange={e=>{setTitle(e.target.value);setTitleError('');}}/>
   <p id="room-title-hint" className={'mt-1.5 text-sm '+(titleError?'text-destructive':'text-muted-foreground')}>{titleError||title.length+'/'+cfg.titleMaxLength+' ตัวอักษร'}</p>
  </div>
  <Collapsible open={more} onOpenChange={setMore} className="rounded-2xl border">
   <CollapsibleTrigger asChild><button type="button" className="flex min-h-12 w-full items-center justify-between gap-2 rounded-2xl px-4 py-3 text-left font-medium hover:bg-muted/60">
    <span>จองให้คนอื่น / ข้อมูลติดต่อ{attendee.id!==me.id&&<span className="block text-sm font-normal text-muted-foreground">ผู้ใช้งานห้อง: {attendee.displayName}</span>}</span>
    <ChevronDown aria-hidden className={'shrink-0 transition-transform '+(more?'rotate-180':'')}/>
   </button></CollapsibleTrigger>
   <CollapsibleContent className="space-y-5 border-t px-4 pb-4 pt-4">
    <AttendeePicker value={attendee} me={me} onChange={u=>{setAttendee(u);setPhone(u.phone);}}/>
    <div><label htmlFor="room-phone" className="mb-2 block">เบอร์ติดต่อ</label><Input id="room-phone" inputMode="tel" value={phone} maxLength={50} onChange={e=>setPhone(e.target.value)}/></div>
   </CollapsibleContent>
  </Collapsible>
  <p className={'flex items-start gap-2 '+(supervisor?'text-muted-foreground':'text-success font-medium')}>
   {supervisor?<><Mail size={20} aria-hidden className="mt-0.5 shrink-0 text-primary"/><span>ส่งขออนุมัติถึง <strong className="text-foreground">{supervisor.displayName}</strong> (หัวหน้าของคุณ)</span></>:<><CheckCircle2 size={20} aria-hidden className="mt-0.5 shrink-0"/>อนุมัติอัตโนมัติ</>}
  </p>
  {error&&<p role="alert" className="rounded-xl border border-overdue-border bg-overdue-bg p-3 text-overdue">{error}</p>}
  <div className="sticky bottom-0 -mx-4 border-t bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
   <Button type="submit" size="lg" className="w-full" disabled={pending||!!clash||startBlocked}>{pending?<><Spinner/>กำลังส่ง…</>:supervisor?'ส่งขออนุมัติ':'จองห้อง'}</Button>
   <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground"><Clock size={14} aria-hidden/>{formatDate(start)} · {formatRange(start,end)}</p>
  </div>
 </form>;
}

function AttendeePicker({value,me,onChange}:{value:User;me:User;onChange:(u:User)=>void}) {
 const [q,setQ]=useState(''),[results,setResults]=useState<User[]>([]),[searching,startSearch]=useTransition(),seq=useRef(0);
 useEffect(()=>{
  const term=q.trim();if(term.length<1)return;
  const id=++seq.current;const timer=setTimeout(()=>startSearch(async()=>{const r=await searchEmployees(term);if(id===seq.current)setResults(r.ok?r.data.slice(0,8):[]);}),250);
  return ()=>clearTimeout(timer);
 },[q]);
 return <div className="space-y-3">
  <p className="font-medium">ผู้ใช้งานห้อง</p>
  <div className="flex items-center gap-3 rounded-xl bg-accent p-3"><UserAvatar user={value} className="size-10"/><div className="min-w-0 flex-1"><p className="truncate font-medium">{value.displayName}{value.id===me.id&&' (คุณ)'}</p><p className="truncate text-sm text-muted-foreground">{value.departmentName}</p></div>{value.id!==me.id&&<Button type="button" variant="ghost" size="sm" onClick={()=>onChange(me)}>ใช้ชื่อฉัน</Button>}</div>
  <div className="relative">
   <label htmlFor="attendee-search" className="sr-only">ค้นหาพนักงาน</label>
   <Search size={18} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"/>
   <Input id="attendee-search" role="combobox" aria-expanded={!!q.trim()} aria-controls="attendee-results" autoComplete="off" className="pl-10" placeholder="ค้นหาชื่อ แผนก หรือรหัสพนักงาน" value={q} onChange={e=>{setQ(e.target.value);if(!e.target.value.trim())setResults([]);}}/>
  </div>
  {q.trim()&&<ul id="attendee-results" role="listbox" aria-label="ผลการค้นหาพนักงาน" className="max-h-64 overflow-y-auto overscroll-contain rounded-xl border p-1.5 pe-2.5 scrollbar-thin">
   {results.map(u=><li key={u.id} role="option" aria-selected={u.id===value.id}><button type="button" className="flex min-h-12 w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-accent focus-visible:bg-accent" onClick={()=>{onChange(u);setQ('');setResults([]);}}><UserAvatar user={u} className="size-8"/><span className="min-w-0"><span className="block truncate">{u.displayName}</span><span className="block truncate text-sm text-muted-foreground">{u.departmentName} · {u.employeeCode}</span></span></button></li>)}
   {!results.length&&<li className="p-3 text-muted-foreground">{searching?'กำลังค้นหา…':'ไม่พบพนักงาน'}</li>}
  </ul>}
 </div>;
}
