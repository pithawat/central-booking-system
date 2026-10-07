import Link from 'next/link';
import {ClipboardList,Car,CalendarDays} from 'lucide-react';
import {requireUser} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {env} from '@/shared/config/env';
import {PageHeader} from '@/shared/ui/page-header';
import {EmptyState} from '@/shared/ui/empty-state';
import {LinkTabs} from '@/shared/ui/link-tabs';
import {Button} from '@/components/ui/button';
import {CarPass} from '@/features/cars/components/car-pass';
import {MyCarBookingCard} from '@/features/cars/components/my-car-bookings';
import {MyRoomBookingCard} from '@/features/rooms/components/my-room-bookings';
function Section({title,count,children}:{title:string;count:number;children:React.ReactNode}) {return <section className="mb-10"><h2 className="mb-4 flex items-center gap-2 text-xl">{title}<span className="rounded-full bg-muted px-2.5 text-base font-medium tabular-nums text-muted-foreground">{count}</span></h2>{children}</section>;}
export default async function MyPage({searchParams}:{searchParams:Promise<{tab?:string}>}) {
 const me=await requireUser(),s=await getServices(),q=await searchParams;
 const cars=env.NEXT_PUBLIC_ENABLE_CARS,rooms=env.NEXT_PUBLIC_ENABLE_ROOMS;
 const tab=(q.tab==='rooms'&&rooms)||!cars?'rooms':'cars',isAdmin=me.roles.includes('ADMIN');
 const tabs=[...(cars?[{key:'cars',label:'รถ',href:'/my?tab=cars'}]:[]),...(rooms?[{key:'rooms',label:'ห้องประชุม',href:'/my?tab=rooms'}]:[])];
 const header=<><PageHeader icon={ClipboardList} title="การจองของฉัน" description="รายการจองรถและห้องประชุมของคุณ"/>{tabs.length>1&&<LinkTabs label="ประเภทการจอง" active={tab} items={tabs}/>}</>;
 if(tab==='cars'){
  const [active,upcoming,history]=await Promise.all([s.carBookings.listMine('active'),s.carBookings.listMine('upcoming'),s.carBookings.listMine('history')]);
  return <>{header}
   <Section title="กำลังใช้งาน" count={active.length}>{active.length?active.map(b=><CarPass key={b.id} booking={b}/>):<EmptyState icon={Car} title="ไม่มีรถที่กำลังใช้งาน"/>}</Section>
   <Section title="กำลังจะถึง" count={upcoming.length}>{upcoming.length?<div className="space-y-3">{upcoming.map(b=><MyCarBookingCard key={b.id} booking={b}/>)}</div>:<EmptyState icon={Car} title="ยังไม่มีรายการจอง"><Button asChild><Link href="/cars">จองรถ</Link></Button></EmptyState>}</Section>
   <Section title="ประวัติ 30 วัน" count={history.length}>{history.length?<div className="space-y-3">{[...history].reverse().map(b=><MyCarBookingCard key={b.id} booking={b}/>)}</div>:<EmptyState title="ยังไม่มีประวัติการจอง"/>}</Section>
  </>;
 }
 const [upcoming,history]=await Promise.all([s.roomBookings.listMine('upcoming'),s.roomBookings.listMine('history')]);
 return <>{header}
  <Section title="กำลังจะถึง" count={upcoming.length}>{upcoming.length?<div className="space-y-3">{upcoming.map(b=><MyRoomBookingCard key={b.id} booking={b} meId={me.id} isAdmin={isAdmin}/>)}</div>:<EmptyState icon={CalendarDays} title="ยังไม่มีการจองห้องที่กำลังจะถึง"><Button asChild><Link href="/rooms">จองห้องประชุม</Link></Button></EmptyState>}</Section>
  <Section title="ประวัติ 30 วัน" count={history.length}>{history.length?<div className="space-y-3">{[...history].reverse().map(b=><MyRoomBookingCard key={b.id} booking={b} meId={me.id} isAdmin={isAdmin}/>)}</div>:<EmptyState title="ยังไม่มีประวัติการจองห้อง"/>}</Section>
 </>;
}
