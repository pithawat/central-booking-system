'use client';
import {useTransition} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {Car,QrCode,MapPin} from 'lucide-react';
import type {CarBookingDetail} from '@/shared/data/types';
import {formatDate,formatRange} from '@/shared/lib/datetime';
import {StatusBadge} from '@/shared/ui/status-badge';
import {InlineConfirm} from '@/shared/ui/inline-confirm';
import {Button} from '@/components/ui/button';
import {changeCar} from '../actions';
/** การ์ดการจองรถแบบย่อในหน้า "การจองของฉัน" (หัวข้อ 10.4) */
export function MyCarBookingCard({booking:b}:{booking:CarBookingDetail}) {
 const router=useRouter(),[pending,start]=useTransition();
 const cancel=()=>start(async()=>{const r=await changeCar('cancel',b.id);if(!r.ok){toast.error(r.error.message);return;}toast.success('ยกเลิกการจองแล้ว');router.refresh();});
 return <article className="surface flex flex-col gap-4 p-4 md:flex-row md:items-center md:p-5">
  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent font-heading text-xl font-semibold tabular-nums text-primary" aria-hidden>#{b.car.number}</span>
  <div className="min-w-0 flex-1">
   <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg">#{b.car.number} · {b.car.model}</h3><StatusBadge kind="car" status={b.status} isOverdue={b.isOverdue}/></div>
   <p className="mt-1 font-heading tabular-nums">{formatDate(b.start)} · {formatRange(b.start,b.end)}</p>
   <p className="mt-0.5 flex items-center gap-1.5 text-muted-foreground"><MapPin size={15} aria-hidden/>{b.purpose} · {b.destination}</p>
  </div>
  {b.status==='CONFIRMED'&&<div className="flex flex-wrap gap-2 md:justify-end"><Button variant="outline" asChild><Link href={'/cars/bookings/'+b.id}><QrCode aria-hidden/>ดู QR</Link></Button><InlineConfirm label="ยกเลิกการจอง" cancelLabel="ไม่ยกเลิก" question={'ยกเลิกการจองรถ #'+b.car.number+'?'} disabled={pending} onConfirm={cancel}/></div>}
  {b.status!=='CONFIRMED'&&b.status!=='IN_USE'&&<Link href={'/cars/bookings/'+b.id} className="inline-flex min-h-11 items-center gap-1.5 font-medium text-primary"><Car size={18} aria-hidden/>ดูรายละเอียด</Link>}
 </article>;
}
