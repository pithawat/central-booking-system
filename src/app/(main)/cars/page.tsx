import {z} from 'zod';
import {requireUser,requireFeature} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {now} from '@/shared/lib/clock';
import {ceilSlot,addMinutes} from '@/shared/lib/intervals';
import {todayInBangkok,formatTime,addDays} from '@/shared/lib/datetime';
import {appConfig} from '@/shared/config/app.config';
import {CarTypeSchema} from '@/shared/data/schemas';
import {Car} from 'lucide-react';
import {PageHeader} from '@/shared/ui/page-header';
import {CarSearch} from '@/features/cars/components/car-search';
import {bangkokDateTime} from '@/shared/lib/datetime';
export default async function CarsPage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}) {
 requireFeature('cars');await requireUser();const q=await searchParams,t=now(),next=ceilSlot(addMinutes(t,0.01),appConfig.car.slotMinutes);
 const after=formatTime(t)>='17:00',defaultDate=after?addDays(todayInBangkok(t),1):todayInBangkok(t);
 const date=z.iso.date().safeParse(q.date).success?q.date!:defaultDate;
 const validTime=(v:string|undefined)=>!!v&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
 const start=validTime(q.start)?q.start!:after?'08:00':formatTime(next),end=validTime(q.end)?q.end!:formatTime(addMinutes(bangkokDateTime(date,start),appConfig.car.defaultDurationMinutes));
 const endDate=z.iso.date().safeParse(q.endDate).success?q.endDate!:date,type=CarTypeSchema.safeParse(q.type);
 const query={date,start,end,endDate,type:type.success?type.data:''};
 const s=await getServices(),cars=await s.cars.availability({start:bangkokDateTime(date,start).toISOString(),end:bangkokDateTime(endDate,end).toISOString(),type:type.success?type.data:undefined});
 return <><PageHeader icon={Car} title="จองรถ" description="เลือกเวลา แล้วเลือกรถที่ว่าง"/><CarSearch query={query} cars={cars}/></>;
}

