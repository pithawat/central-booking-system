import {z} from 'zod';
import {CalendarDays} from 'lucide-react';
import {requireUser,requireFeature} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {now} from '@/shared/lib/clock';
import {todayInBangkok,addDays} from '@/shared/lib/datetime';
import {appConfig} from '@/shared/config/app.config';
import {PageHeader} from '@/shared/ui/page-header';
import {RoomsBoard} from '@/features/rooms/components/rooms-board';
import {capacityValues} from '@/features/rooms/lib/labels';
export default async function RoomsPage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}) {
 requireFeature('rooms');const me=await requireUser(),q=await searchParams,s=await getServices();
 const today=todayInBangkok(now()),maxDate=addDays(today,appConfig.room.maxAdvanceDays);
 const date=z.iso.date().safeParse(q.date).success&&q.date!<=maxDate?q.date!:today;
 const sites=await s.rooms.sites();
 const site=q.site==='all'?'all':sites.some(x=>x.id===q.site)?q.site!:sites.some(x=>x.id===me.defaultSiteId)?me.defaultSiteId:'all';
 const cap=capacityValues.includes(Number(q.cap))?Number(q.cap):0,tv=q.tv==='1';
 const [schedule,supervisor]=await Promise.all([s.roomBookings.daySchedule(date,{siteId:site==='all'?undefined:site,minCapacity:cap||undefined,tvOnly:tv||undefined}),appConfig.room.approval.enabled?s.users.supervisorOf(me.id):null]);
 return <><PageHeader icon={CalendarDays} title="จองห้องประชุม" description="แตะช่องว่างในตารางเพื่อจอง ระบบส่งขออนุมัติให้หัวหน้าเอง"/><RoomsBoard schedule={schedule} query={{date,site,cap,tv}} today={today} maxDate={maxDate} me={me} supervisor={supervisor}/></>;
}
