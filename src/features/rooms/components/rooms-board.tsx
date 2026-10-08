'use client';
import {useOptimistic,useRef,useState,useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {SearchX} from 'lucide-react';
import type {Building,Room,RoomBookingDetail,RoomDaySchedule,User} from '@/shared/data/types';
import {Button} from '@/components/ui/button';
import {EmptyState} from '@/shared/ui/empty-state';
import {useAutoRefresh} from '@/shared/ui/use-auto-refresh';
import {RoomFilters,Legend,type RoomQuery} from './room-filters';
import {RoomTimeline} from './room-timeline';
import {RoomMobileList} from './room-mobile-list';
import {BookingSheet,type BookingDraft} from './booking-sheet';
import {BookingDetailSheet} from './booking-detail';
import {draftRange} from '../lib/slots';

/** สถานะแผงจองและแผงรายละเอียด ใช้ร่วมกันระหว่างหน้าตารางห้องและหน้าห้องเดียว */
export function useBookingPanels(bookings:RoomBookingDetail[]) {
 const router=useRouter(),[draft,setDraft]=useState<BookingDraft|null>(null),[detailId,setDetailId]=useState<string|null>(null),[announce,setAnnounce]=useState('');
 const detail=bookings.find(b=>b.id===detailId)??null,opener=useRef<HTMLElement|null>(null);
 const remember=()=>{opener.current=document.activeElement instanceof HTMLElement?document.activeElement:null;};
 return {
  draft,detail,announce,
  // คืน focus ไปที่ช่องหรือบล็อกที่เปิดแผง เพื่อให้ใช้คีย์บอร์ดต่อได้
  restoreFocus:(e:Event)=>{e.preventDefault();if(opener.current?.isConnected)opener.current.focus();},
  openSlot:(room:Room,date:string,start:string,limit?:string)=>{remember();setDraft({room,date,...draftRange(date,start,bookings.filter(b=>b.roomId===room.id),limit)});},
  openBooking:(b:RoomBookingDetail)=>{remember();setDetailId(b.id);},
  closeDraft:()=>setDraft(null),closeDetail:()=>setDetailId(null),
  booked:(b:RoomBookingDetail,message:string)=>{setDraft(null);toast.success(message);setAnnounce(message+' · '+b.room.shortLabel);router.refresh();},
 };
}

type Props={schedule:RoomDaySchedule;query:RoomQuery;today:string;maxDate:string;me:User;supervisor:User|null};
export function RoomsBoard({schedule,query,today,maxDate,me,supervisor}:Props) {
 const router=useRouter(),[pending,start]=useTransition(),panels=useBookingPanels(schedule.bookings);
 // ตัวเลือกวันและตัวกรองแสดงค่าใหม่ทันทีระหว่างโหลด กด ‹ › ติดกันหลายครั้งจึงนับต่อจากค่าล่าสุด (ข้อมูลตารางยังเป็นของจริงจากเซิร์ฟเวอร์)
 const [shown,setShown]=useOptimistic(query);
 useAutoRefresh(!panels.draft);
 const navigate=(patch:Partial<RoomQuery>)=>{
  const next={...shown,...patch},params=new URLSearchParams({date:next.date,site:next.site});
  if(next.building)params.set('building',next.building);if(next.cap)params.set('cap',String(next.cap));if(next.tv)params.set('tv','1');
  start(()=>{setShown(next);router.replace('/rooms?'+params,{scroll:false});});
 };
 const siteName=(id:string)=>schedule.sites.find(s=>s.id===id)?.name??'';
 const buildings:Building[]=schedule.buildings;
 const common={date:schedule.date,rooms:schedule.rooms,buildings,sites:schedule.sites,bookings:schedule.bookings,onBooking:panels.openBooking};
 return <div className="space-y-5">
  <RoomFilters query={shown} sites={schedule.sites} buildings={schedule.buildings} today={today} maxDate={maxDate} onChange={navigate}/>
  <div className="flex flex-wrap items-center justify-between gap-3"><Legend/><p className="text-sm text-muted-foreground" aria-live="polite">{pending?'กำลังโหลด…':'แสดง '+schedule.rooms.length+' ห้อง'}</p></div>
  <p className="sr-only" aria-live="polite">{panels.announce}</p>
  <div className={pending?'opacity-60 transition-opacity':'transition-opacity'}>
   {schedule.rooms.length===0?<EmptyState icon={SearchX} title="ไม่มีห้องที่ตรงกับตัวกรอง" description="ลองลดจำนวนคน หรือเลือกฝั่งหรืออาคารอื่น"><Button onClick={()=>navigate({site:'all',building:'',cap:0,tv:false})}>ล้างตัวกรอง</Button></EmptyState>:<>
    <div className="hidden md:block"><RoomTimeline {...common} onSlot={(room,slot)=>panels.openSlot(room,schedule.date,slot)}/></div>
    <div className="md:hidden"><RoomMobileList {...common} onRange={(room,s,e)=>panels.openSlot(room,schedule.date,s,e)}/></div>
   </>}
  </div>
  <BookingSheet draft={panels.draft} onClose={panels.closeDraft} bookings={schedule.bookings} buildings={buildings} siteName={siteName} me={me} supervisor={supervisor} onBooked={panels.booked} onCloseAutoFocus={panels.restoreFocus}/>
  <BookingDetailSheet booking={panels.detail} onClose={panels.closeDetail} onCloseAutoFocus={panels.restoreFocus} meId={me.id} isAdmin={me.roles.includes('ADMIN')}/>
 </div>;
}
