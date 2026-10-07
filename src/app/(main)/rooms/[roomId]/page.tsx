import Link from 'next/link';
import {notFound} from 'next/navigation';
import {z} from 'zod';
import {ChevronLeft,DoorOpen} from 'lucide-react';
import {requireUser,requireFeature} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {ServiceError} from '@/shared/data/errors';
import {now} from '@/shared/lib/clock';
import {todayInBangkok,addDays} from '@/shared/lib/datetime';
import {appConfig} from '@/shared/config/app.config';
import {PageHeader} from '@/shared/ui/page-header';
import {RoomWeekView} from '@/features/rooms/components/room-week-view';
import {RoomFacts} from '@/features/rooms/components/booking-sheet';
import {weekStart} from '@/features/rooms/lib/slots';
export default async function RoomPage({params,searchParams}:{params:Promise<{roomId:string}>;searchParams:Promise<Record<string,string|undefined>>}) {
 requireFeature('rooms');const me=await requireUser(),{roomId}=await params,q=await searchParams,s=await getServices();
 let room;try{room=await s.rooms.getById(roomId);}catch(e){if(e instanceof ServiceError&&e.code==='NOT_FOUND')notFound();throw e;}
 const today=todayInBangkok(now()),maxDate=addDays(today,appConfig.room.maxAdvanceDays);
 const date=z.iso.date().safeParse(q.date).success&&q.date!<=maxDate?q.date!:today,view=q.view==='week'||q.view==='day'?q.view:null,monday=weekStart(date);
 const [buildings,sites,bookings,supervisor]=await Promise.all([s.rooms.buildings(),s.rooms.sites(),s.roomBookings.listByRoom(room.id,monday,addDays(monday,6)),appConfig.room.approval.enabled?s.users.supervisorOf(me.id):null]);
 const building=buildings.find(b=>b.id===room.buildingId),site=sites.find(x=>x.id===room.siteId);
 return <>
  <Link href={'/rooms?'+new URLSearchParams({date})} className="mb-4 inline-flex min-h-11 items-center gap-1 font-medium text-primary"><ChevronLeft size={18} aria-hidden/>กลับไปตารางห้องทั้งหมด</Link>
  <PageHeader icon={DoorOpen} title={room.shortLabel}/>
  <div className="-mt-4 mb-6"><RoomFacts room={room} building={building} siteName={site?.name??''}/></div>
  <RoomWeekView room={room} building={building} site={site} date={date} view={view} bookings={bookings} today={today} maxDate={maxDate} me={me} supervisor={supervisor}/>
 </>;
}
