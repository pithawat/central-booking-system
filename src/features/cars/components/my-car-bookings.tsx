'use client';
import {useTransition} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {QrCode,MapPin,ChevronRight,CalendarClock} from 'lucide-react';
import type {CarBookingDetail} from '@/shared/data/types';
import {PeriodText} from '@/shared/ui/period-text';
import {StatusBadge} from '@/shared/ui/status-badge';
import {InlineConfirm} from '@/shared/ui/inline-confirm';
import {Button} from '@/components/ui/button';
import {changeCar} from '../actions';
import {CarPhoto,LicensePlate} from './car-visual';
/** การ์ดการจองรถแบบย่อในหน้า "การจองของฉัน" (§10.4) */
export function MyCarBookingCard({booking:b}:{booking:CarBookingDetail}) {
 const router=useRouter(),[pending,start]=useTransition();
 const cancel=()=>start(async()=>{const r=await changeCar('cancel',b.id);if(!r.ok){toast.error(r.error.message);return;}toast.success('ยกเลิกการจองแล้ว');router.refresh();});
 return <article className="surface overflow-hidden">
  <Link href={'/cars/bookings/'+b.id} aria-label={'รถ #'+b.car.number+' · '+b.car.model+' · ทะเบียน '+b.car.plate} className="block p-3 transition-colors hover:bg-accent/40 active:bg-accent/60 sm:p-4">
   <div className="flex items-start gap-3">
    <CarPhoto car={b.car} className="aspect-[4/3] w-24 shrink-0 rounded-xl sm:w-28"/>
    <div className="min-w-0 flex-1 space-y-1.5">
     <div className="flex flex-wrap items-center gap-2"><LicensePlate plate={b.car.plate} size="md"/><StatusBadge kind="car" status={b.status} isOverdue={b.isOverdue}/></div>
     <p className="truncate text-sm text-muted-foreground">#{b.car.number} · {b.car.model}</p>
    </div>
    <ChevronRight aria-hidden className="mt-1 shrink-0 text-muted-foreground"/>
   </div>
   {/* วันเวลาและปลายทางเต็มความกว้างการ์ด จอแคบจะได้ไม่ถูกบีบข้างรูปรถ */}
   <div className="mt-3 space-y-1">
    <p className="flex items-start gap-2 font-heading font-medium tabular-nums"><CalendarClock size={18} aria-hidden className="mt-0.5 shrink-0 text-muted-foreground"/><span className="min-w-0"><PeriodText start={b.start} end={b.end}/></span></p>
    <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin size={16} aria-hidden className="shrink-0"/><span className="truncate">{b.purpose} · {b.destination}</span></p>
   </div>
  </Link>
  {b.status==='CONFIRMED'&&<div className="grid grid-cols-2 gap-2 border-t p-3 has-[[aria-live]]:grid-cols-1 sm:px-4"><Button variant="outline" asChild><Link href={'/cars/bookings/'+b.id}><QrCode aria-hidden/>ดู QR</Link></Button><InlineConfirm label="ยกเลิกการจอง" cancelLabel="ไม่ยกเลิก" question={'ยกเลิกการจองรถ #'+b.car.number+'?'} disabled={pending} onConfirm={cancel}/></div>}
 </article>;
}
