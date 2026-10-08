import {notFound} from 'next/navigation';
import {requireFeature,requireUser} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {CarPass} from '@/features/cars/components/car-pass';
import {loadCarPlaces} from '@/features/cars/lib/load-places';
import {placeLabel} from '@/features/cars/lib/places';
import {formatDate,formatTime} from '@/shared/lib/datetime';
import {ServiceError} from '@/shared/data/errors';
export default async function CarDetailPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{new?:string}>}) {
 requireFeature('cars');const me=await requireUser(),{id}=await params,q=await searchParams,s=await getServices();
 const places=await loadCarPlaces(s);
 let b;try{b=await s.carBookings.getById(id);}catch(e){if(e instanceof ServiceError&&(e.code==='NOT_FOUND'||e.code==='FORBIDDEN'))notFound();throw e;}
 return <>{q.new&&<p role="status" className="bg-success-bg text-success border border-success-border p-4 mb-5 rounded-2xl font-medium">จองรถเรียบร้อย ส่งรายละเอียดไปทางอีเมลแล้ว</p>}<CarPass booking={b} owner={b.userId===me.id} place={places[b.car.stationId]}/><dl className="surface grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 md:p-6"><div><dt className="text-muted-foreground">วัตถุประสงค์</dt><dd>{b.purpose}</dd></div><div><dt className="text-muted-foreground">ปลายทาง</dt><dd>{b.destination}</dd></div><div><dt className="text-muted-foreground">จุดรับ-คืนรถ</dt><dd>{placeLabel(places[b.car.stationId])}</dd></div><div><dt className="text-muted-foreground">ผู้ขับ</dt><dd>{b.driverName??b.user.displayName}</dd></div><div><dt className="text-muted-foreground">ประวัติสถานะ</dt><dd>จอง {formatDate(b.createdAt)} {formatTime(b.createdAt)}{b.pickedUpAt&&' → รับกุญแจ '+formatTime(b.pickedUpAt)}{b.returnedAt&&' → คืนกุญแจ '+formatTime(b.returnedAt)}</dd></div></dl></>;
}

