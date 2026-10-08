import Link from 'next/link';
import {Car,CalendarDays,ChevronRight,DoorOpen,BellRing,CalendarClock,ArrowUpRight,CarFront} from 'lucide-react';
import {CarPass} from '@/features/cars/components/car-pass';
import {MyCarBookingCard} from '@/features/cars/components/my-car-bookings';
import {LicensePlate} from '@/features/cars/components/car-visual';
import {loadCarPlaces} from '@/features/cars/lib/load-places';
import {requireUser} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {env} from '@/shared/config/env';
import {appConfig} from '@/shared/config/app.config';
import {PeriodText} from '@/shared/ui/period-text';
import {StatusBadge} from '@/shared/ui/status-badge';
import {EmptyState} from '@/shared/ui/empty-state';

function SectionTitle({id,icon:Icon,title,href,link}:{id:string;icon:typeof Car;title:string;href?:string;link?:string}) {
 return <div className="mb-3 flex items-center justify-between gap-3"><h2 id={id} className="flex min-w-0 items-center gap-2 text-lg sm:text-xl"><Icon aria-hidden className="size-5 shrink-0 text-primary"/>{title}</h2>{href&&<Link href={href} className="inline-flex min-h-11 shrink-0 items-center gap-0.5 font-medium text-primary">{link}<span className="sr-only"> · {title}</span><ChevronRight aria-hidden className="size-4"/></Link>}</div>;
}

export default async function HomePage() {
 const user=await requireUser(),s=await getServices(),cars=env.NEXT_PUBLIC_ENABLE_CARS,rooms=env.NEXT_PUBLIC_ENABLE_ROOMS;
 const supervisor=rooms&&(user.roles.includes('ADMIN')||await s.users.isSupervisor(user.id));
 const [carList,roomList,pass,count]=await Promise.all([cars?s.carBookings.listMine('upcoming'):[],rooms?s.roomBookings.listMine('upcoming'):[],cars?s.carBookings.activePass():null,supervisor?s.approvals.pendingCount():0]);
 // สถานะการจองรถ: บัตรรับรถถ้าอยู่ในช่วงรับรถหรือกำลังใช้ ไม่งั้นแสดงการจองรถถัดไป
 const nextCar=pass?null:carList[0]??null,shown=pass?.id??nextCar?.id;
 const upcoming=[...carList.filter(b=>b.id!==shown).map(b=>({id:b.id,kind:'car' as const,start:b.start,end:b.end,title:b.purpose,lead:<LicensePlate plate={b.car.plate} size="sm"/>,badge:<StatusBadge kind="car" status={b.status}/>,href:'/cars/bookings/'+b.id,label:'รถ #'+b.car.number+' ทะเบียน '+b.car.plate+' · '+b.purpose})),...roomList.map(b=>({id:b.id,kind:'room' as const,start:b.start,end:b.end,title:b.title,lead:<span className="truncate text-sm font-medium text-indigo-700">{b.room.shortLabel}</span>,badge:<StatusBadge kind="room" status={b.status}/>,href:'/rooms/bookings/'+b.id,label:b.room.shortLabel+' · '+b.title}))].sort((a,b)=>a.start.localeCompare(b.start)).slice(0,5);
 const actions=[...(cars?[{href:'/cars',title:'จองรถ',text:'เลือกวันรับ-คืน แล้วเลือกรถที่ว่าง',icon:Car,tone:'from-blue-700 to-blue-600 text-blue-50'}]:[]),...(rooms?[{href:'/rooms',title:'จองห้องประชุม',text:'ดูห้องว่างแล้วแตะเพื่อจอง',icon:CalendarDays,tone:'from-indigo-600 to-violet-600 text-indigo-50'}]:[])];
 const showCar=cars&&!!(pass||nextCar),places=showCar?await loadCarPlaces(s):{},place=places[(pass??nextCar)?.car.stationId??''];
 return <div className="space-y-7 lg:space-y-8">
  <h1 className="sr-only">หน้าแรก</h1>

  {/* ปุ่มเริ่มจองอยู่บนสุดของหน้า ไม่มีหัวข้อและวันที่ */}
  <nav aria-label="จองใหม่" className={'grid gap-3 sm:gap-4 '+(actions.length>1?'grid-cols-2':'grid-cols-1')}>
   {actions.map(a=><Link key={a.href} href={a.href} className={'group relative isolate flex min-h-36 flex-col justify-between gap-4 overflow-hidden rounded-3xl bg-linear-to-br p-4 shadow-raised transition active:scale-[.98] sm:min-h-40 sm:p-6 '+a.tone}>
    <a.icon aria-hidden className="absolute -right-5 -bottom-6 -z-10 size-32 text-white/10 transition-transform group-hover:scale-110 sm:size-40"/>
    <span className="flex items-start justify-between gap-2"><span className="grid size-12 place-items-center rounded-2xl bg-white/20 text-white ring-1 ring-white/25"><a.icon aria-hidden className="size-6"/></span><ArrowUpRight aria-hidden className="size-6 text-white/80 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></span>
    <span className="min-w-0"><span className="block font-heading text-xl font-semibold leading-tight text-white sm:text-2xl">{a.title}</span><span className="mt-1 hidden text-sm leading-snug min-[360px]:block sm:text-base">{a.text}</span></span>
   </Link>)}
  </nav>

  {count>0&&<Link href="/rooms/approvals" className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-accent p-3 font-medium text-accent-foreground transition-colors hover:bg-accent/70 sm:p-4">
   <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm"><BellRing size={20} aria-hidden/></span>
   <span className="min-w-0 flex-1">มีคำขอจองห้องรออนุมัติ {count} รายการ</span><span className="shrink-0 text-primary underline underline-offset-4">ดูคำขอ</span>
  </Link>}

  <div className={'grid grid-cols-1 gap-7 lg:items-start lg:gap-6 '+(showCar?'lg:grid-cols-2':'')}>
   {showCar&&<section aria-labelledby="car-status-title" className="min-w-0">
    <SectionTitle id="car-status-title" icon={CarFront} title="สถานะการจองรถ" href="/my?tab=cars" link="ทั้งหมด"/>
    {pass?<CarPass booking={pass} compact place={place}/>
    :nextCar&&<div className="space-y-2"><MyCarBookingCard booking={nextCar} place={place}/><p className="px-1 text-sm text-muted-foreground">บัตรรับรถพร้อม QR จะขึ้นที่หน้านี้ก่อนเวลารับรถ {appConfig.car.pickupEarlyMinutes} นาที</p></div>}
   </section>}
   <section aria-labelledby="upcoming-title" className="min-w-0">
    <SectionTitle id="upcoming-title" icon={CalendarClock} title="การจองที่กำลังจะถึง" href="/my" link="ทั้งหมด"/>
    {upcoming.length?<ul className="surface divide-y overflow-hidden p-0">{upcoming.map(b=><li key={b.id}><Link href={b.href} aria-label={b.label} className="flex items-center gap-3 p-3 transition-colors hover:bg-accent/50 active:bg-accent sm:p-4">
     <span className={'grid size-10 shrink-0 place-items-center rounded-xl '+(b.kind==='car'?'bg-blue-50 text-primary':'bg-indigo-50 text-indigo-700')}>{b.kind==='car'?<Car size={20} aria-hidden/>:<DoorOpen size={20} aria-hidden/>}</span>
     <span className="min-w-0 flex-1"><span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">{b.lead}{b.badge}</span><span className="mt-1 block truncate font-medium">{b.title}</span><span className="block text-sm tabular-nums text-muted-foreground"><PeriodText start={b.start} end={b.end}/></span></span>
     <ChevronRight aria-hidden className="shrink-0 text-muted-foreground"/>
    </Link></li>)}</ul>:<EmptyState icon={CalendarClock} title="ยังไม่มีการจองที่กำลังจะถึง"/>}
   </section>
  </div>
 </div>;
}
