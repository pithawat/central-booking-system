import Link from 'next/link';
import {Car,CalendarDays,ArrowRight,DoorOpen,BellRing,CalendarClock} from 'lucide-react';
import {CarPass} from '@/features/cars/components/car-pass';
import {requireUser} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {env} from '@/shared/config/env';
import {now} from '@/shared/lib/clock';
import {formatDateLong,formatDate,formatRange} from '@/shared/lib/datetime';
import {StatusBadge} from '@/shared/ui/status-badge';
import {EmptyState} from '@/shared/ui/empty-state';
import {Button} from '@/components/ui/button';
export default async function HomePage() {
 const user=await requireUser(),s=await getServices(),cars=env.NEXT_PUBLIC_ENABLE_CARS,rooms=env.NEXT_PUBLIC_ENABLE_ROOMS;
 const supervisor=rooms&&(user.roles.includes('ADMIN')||await s.users.isSupervisor(user.id));
 const [carList,roomList,pass,count]=await Promise.all([cars?s.carBookings.listMine('upcoming'):[],rooms?s.roomBookings.listMine('upcoming'):[],cars?s.carBookings.activePass():null,supervisor?s.approvals.pendingCount():0]);
 const upcoming=[...carList.map(b=>({id:b.id,kind:'car' as const,start:b.start,end:b.end,title:'รถ #'+b.car.number+' · '+b.purpose,badge:<StatusBadge kind="car" status={b.status}/>,href:'/cars/bookings/'+b.id})),...roomList.map(b=>({id:b.id,kind:'room' as const,start:b.start,end:b.end,title:b.room.shortLabel+' · '+b.title,badge:<StatusBadge kind="room" status={b.status}/>,href:'/rooms/bookings/'+b.id}))].sort((a,b)=>a.start.localeCompare(b.start)).slice(0,5);
 const actions=[...(cars?[{href:'/cars',title:'จองรถ',text:'เลือกรถว่างตามเวลาที่ต้องใช้',icon:Car,tint:'from-blue-50 to-sky-50 text-primary'}]:[]),...(rooms?[{href:'/rooms',title:'จองห้องประชุม',text:'ดูห้องว่างและจองได้ทันที',icon:CalendarDays,tint:'from-indigo-50 to-violet-50 text-indigo-700'}]:[])];
 return <div className="space-y-8">
  <header className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-blue-700 to-indigo-700 px-6 py-7 text-white shadow-raised md:px-8 md:py-9">
   <div aria-hidden className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl"/>
   <div aria-hidden className="absolute -bottom-24 right-24 size-56 rounded-full bg-sky-300/20 blur-3xl"/>
   <p className="relative text-blue-100">{formatDateLong(now())}</p>
   <h1 className="relative mt-1 font-heading text-3xl font-semibold md:text-4xl">สวัสดี คุณ{user.firstName}</h1>
   <p className="relative mt-2 max-w-xl text-blue-50">{upcoming.length?'คุณมีการจองที่กำลังจะถึง '+upcoming.length+' รายการ':'วันนี้ต้องการจองอะไร เลือกได้ด้านล่าง'}</p>
  </header>
  {pass&&<CarPass booking={pass}/>}
  {count>0&&<div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-accent p-4 md:p-5">
   <p className="flex items-center gap-3 font-medium text-accent-foreground"><span className="grid size-10 place-items-center rounded-xl bg-white text-primary shadow-sm"><BellRing size={20} aria-hidden/></span>มีคำขอจองห้องรออนุมัติ {count} รายการ</p>
   <Button asChild><Link href="/rooms/approvals">ดูคำขอ</Link></Button>
  </div>}
  {actions.length>0&&<div className="grid gap-4 md:grid-cols-2">{actions.map(a=><Link key={a.href} href={a.href} className="surface surface-interactive group flex min-h-28 items-center gap-5 p-5 md:p-6">
   <span className={'grid size-16 shrink-0 place-items-center rounded-2xl bg-linear-to-br ring-1 ring-black/5 '+a.tint}><a.icon size={30} aria-hidden/></span>
   <span className="min-w-0 flex-1"><span className="block font-heading text-2xl font-semibold">{a.title}</span><span className="mt-1 block text-muted-foreground">{a.text}</span></span>
   <ArrowRight aria-hidden className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"/>
  </Link>)}</div>}
  <section>
   <div className="mb-4 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-2xl"><CalendarClock aria-hidden className="text-primary"/>การจองที่กำลังจะถึง</h2><Link href="/my" className="font-medium text-primary underline-offset-4 hover:underline">ดูทั้งหมด</Link></div>
   {upcoming.length?<ul className="surface divide-y overflow-hidden p-0">{upcoming.map(b=><li key={b.id}><Link href={b.href} className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-accent/50 md:p-5">
    <span className={'grid size-12 shrink-0 place-items-center rounded-xl '+(b.kind==='car'?'bg-blue-50 text-primary':'bg-indigo-50 text-indigo-700')}>{b.kind==='car'?<Car size={22} aria-label="รถ"/>:<DoorOpen size={22} aria-label="ห้องประชุม"/>}</span>
    <span className="min-w-0 flex-1"><span className="block truncate font-heading text-lg font-semibold">{b.title}</span><span className="mt-0.5 block font-heading tabular-nums text-muted-foreground">{formatDate(b.start)} · {formatRange(b.start,b.end)}</span></span>
    {b.badge}
   </Link></li>)}</ul>:<EmptyState icon={CalendarClock} title="ยังไม่มีการจองที่กำลังจะถึง"/>}
  </section>
 </div>;
}
