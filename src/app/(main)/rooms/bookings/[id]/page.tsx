import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ChevronLeft,CalendarClock} from 'lucide-react';
import {requireFeature,requireUser} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {ServiceError} from '@/shared/data/errors';
import {formatDate,formatRange,todayInBangkok} from '@/shared/lib/datetime';
import {PageHeader} from '@/shared/ui/page-header';
import {StatusBadge} from '@/shared/ui/status-badge';
import {BookingInfo,StatusTimeline} from '@/features/rooms/components/booking-detail';
import {RoomBookingActions} from '@/features/rooms/components/booking-actions';
export default async function RoomBookingPage({params}:{params:Promise<{id:string}>}) {
 requireFeature('rooms');const me=await requireUser(),{id}=await params,s=await getServices();
 let b;try{b=await s.roomBookings.getById(id);}catch(e){if(e instanceof ServiceError&&(e.code==='NOT_FOUND'||e.code==='FORBIDDEN'))notFound();throw e;}
 return <>
  <Link href={'/rooms?'+new URLSearchParams({date:todayInBangkok(b.start)})} className="mb-4 inline-flex min-h-11 items-center gap-1 font-medium text-primary"><ChevronLeft size={18} aria-hidden/>ตารางห้องประชุม</Link>
  <PageHeader icon={CalendarClock} eyebrow={b.room.shortLabel} title={b.title} description={formatDate(b.start)+' · '+formatRange(b.start,b.end)}><StatusBadge kind="room" status={b.status}/></PageHeader>
  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
   <div className="space-y-6"><BookingInfo booking={b}/><RoomBookingActions booking={b} meId={me.id} isAdmin={me.roles.includes('ADMIN')} canDecide/></div>
   <section className="surface h-fit p-5"><h2 className="mb-4 text-xl">สถานะ</h2><StatusTimeline booking={b}/></section>
  </div>
 </>;
}
