'use client';
import {CircleCheck,KeyRound,Clock,TriangleAlert,SearchX,Phone,IdCard,ArrowRightLeft,Gauge,CarFront} from 'lucide-react';
import type {CarBookingDetail,HandoverMethod} from '@/shared/data/types';
import type {GuardLookupResult} from '@/shared/data/contracts';
import {appConfig} from '@/shared/config/app.config';
import {formatTime,formatRelative,formatMileage,formatRange} from '@/shared/lib/datetime';
import {UserAvatar} from '@/shared/ui/user-avatar';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Spinner} from '@/components/ui/spinner';

const invalidMessages={CANCELLED:'การจองนี้ถูกยกเลิกแล้ว',NO_SHOW:'การจองนี้ไม่มารับรถตามเวลา',RETURNED:'คืนรถไปแล้ว',WRONG_STATION:'การจองนี้ไม่ได้รับรถที่ป้อมนี้',TOKEN_INVALID:'QR นี้ใช้ไม่ได้'};
const tones={success:'bg-success text-white',info:'bg-primary text-primary-foreground',warning:'bg-warning-bg text-warning border-b border-warning-border',error:'bg-overdue-bg text-overdue border-b border-overdue-border'};
type Tone=keyof typeof tones;

function Frame({tone,icon:Icon,title,subtitle,children,actions}:{tone:Tone;icon:typeof KeyRound;title:string;subtitle?:string;children?:React.ReactNode;actions:React.ReactNode}) {
 return <div className="surface overflow-hidden">
  <header className={'flex items-center gap-4 px-6 py-5 '+tones[tone]}>
   <span className={'grid size-14 shrink-0 place-items-center rounded-2xl '+(tone==='success'||tone==='info'?'bg-white/20':'bg-white')}><Icon aria-hidden className="size-8"/></span>
   <div className="min-w-0"><h2 className="text-3xl leading-tight">{title}</h2>{subtitle&&<p className="mt-0.5 opacity-90">{subtitle}</p>}</div>
  </header>
  {children&&<div className="space-y-5 p-6">{children}</div>}
  <div className={'px-6 pb-6 '+(children?'':'pt-6')}>{actions}</div>
 </div>;
}
function Person({b,size='lg'}:{b:CarBookingDetail;size?:'lg'|'md'}) {
 return <div className="flex min-w-0 items-center gap-4"><UserAvatar user={b.user} className={size==='lg'?'size-24 [&_[data-slot=avatar-fallback]]:text-3xl':'size-16 [&_[data-slot=avatar-fallback]]:text-xl'}/><div className="min-w-0"><p className={'font-heading font-semibold leading-tight '+(size==='lg'?'text-[28px]':'text-2xl')}>{b.user.displayName}</p><p className="text-muted-foreground">{b.user.departmentName}</p></div></div>;
}
function Notice({icon:Icon,children}:{icon:typeof KeyRound;children:React.ReactNode}) {
 return <p className="flex items-start gap-3 rounded-2xl border border-warning-border bg-warning-bg p-4 font-medium text-warning"><Icon aria-hidden className="mt-1 size-6 shrink-0"/><span>{children}</span></p>;
}
function Actions({confirm,confirmLabel,onConfirm,onReset,resetLabel='ยกเลิก',pending}:{confirm?:boolean;confirmLabel?:string;onConfirm?:()=>void;onReset:()=>void;resetLabel?:string;pending:boolean}) {
 return <div>
  <div className={'grid gap-3 '+(confirm?'grid-cols-[2fr_1fr]':'')}>
   {confirm&&<Button id="guard-confirm" className="h-16 text-2xl" disabled={pending} onClick={onConfirm}>{pending&&<Spinner/>}{confirmLabel}</Button>}
   <Button variant={confirm?'outline':'default'} className="h-16 text-xl" onClick={onReset}>{resetLabel}</Button>
  </div>
  <p className="mt-3 hidden text-center text-base text-muted-foreground lg:block">{confirm?'แป้นพิมพ์: Enter = ยืนยัน · Esc = ยกเลิก':'แป้นพิมพ์: Esc = กลับหน้าสแกน'}</p>
 </div>;
}

type Props={result:GuardLookupResult;method:HandoverMethod;time:Date;pending:boolean;mileage:string;onMileage:(v:string)=>void;onConfirm:()=>void;onReset:()=>void;onSwap:(carId:string)=>void};
/** แผงผลลัพธ์หลังสแกนหรือพิมพ์รหัส (หัวข้อ 8.5) */
export function ResultPanel({result,method,time,pending,mileage,onMileage,onConfirm,onReset,onSwap}:Props) {
 if(result.kind==='PICKUP'){const b=result.booking;return <Frame tone="success" icon={CircleCheck} title="ตรงกับการจอง" subtitle="ตรวจหน้าผู้รับ แล้วมอบกุญแจ" actions={<Actions confirm confirmLabel="มอบกุญแจ" onConfirm={onConfirm} onReset={onReset} pending={pending}/>}>
  <div className="grid items-center gap-5 xl:grid-cols-[minmax(0,1fr)_auto]">
   <Person b={b}/>
   <div className="flex items-center gap-4 rounded-2xl bg-muted px-5 py-3"><p className="font-heading text-[72px] font-semibold leading-none tabular-nums">#{b.car.number}</p><div><p className="font-medium">{b.car.model}</p><p className="text-muted-foreground">{b.car.plate}</p></div></div>
  </div>
  <div className="grid gap-3 sm:grid-cols-2">
   <p className="flex items-center gap-3 rounded-2xl bg-accent px-5 py-4 font-heading text-[28px] font-semibold text-accent-foreground"><KeyRound aria-hidden className="size-8 shrink-0"/>กุญแจช่อง {b.car.keySlot}</p>
   <p className="flex items-center gap-3 rounded-2xl border px-5 py-4"><Clock aria-hidden className="size-7 shrink-0 text-muted-foreground"/><span className="font-heading text-2xl tabular-nums">{formatRange(b.start,b.end)}</span></p>
  </div>
  {b.driverName&&<Notice icon={IdCard}>ผู้ขับ: {b.driverName} ตรวจบัตรพนักงานผู้ขับ</Notice>}
  {method==='ID_CARD'&&<Notice icon={IdCard}>ตรวจบัตรพนักงานเทียบกับรูปก่อนมอบกุญแจ</Notice>}
 </Frame>;}

 if(result.kind==='RETURN'){const b=result.booking;return <Frame tone="info" icon={KeyRound} title={'คืนรถ #'+b.car.number} subtitle="ตรวจเลขไมล์ แล้วรับกุญแจคืน" actions={<Actions confirm confirmLabel="รับกุญแจคืน" onConfirm={onConfirm} onReset={onReset} pending={pending}/>}>
  <div className="flex flex-wrap items-center justify-between gap-4"><Person b={b} size="md"/>
   <div className="text-right"><p className="text-muted-foreground">คืนภายใน</p><p className="font-heading text-3xl font-semibold tabular-nums">{formatTime(b.end)}</p></div>
  </div>
  {b.isOverdue&&<p className="flex items-center gap-3 rounded-2xl border border-overdue-border bg-overdue-bg px-5 py-3 font-heading text-2xl font-semibold text-overdue"><TriangleAlert aria-hidden className="size-7"/>{formatRelative(b.end,time)}</p>}
  {b.endMileage!==null?<div className="flex items-center gap-4 rounded-2xl bg-muted px-5 py-4"><Gauge aria-hidden className="size-8 shrink-0 text-muted-foreground"/><div><p className="font-heading text-2xl font-semibold">เลขไมล์ {formatMileage(b.endMileage)}</p><p className="text-base text-muted-foreground">ผู้จองกรอกไว้แล้ว</p></div></div>
  :<div><label htmlFor="guard-mileage" className="mb-2 flex items-center gap-2 font-medium"><Gauge aria-hidden className="size-6 text-muted-foreground"/>เลขไมล์</label><Input id="guard-mileage" inputMode="numeric" autoFocus className="h-16 font-heading text-3xl tabular-nums" value={mileage} onChange={e=>onMileage(e.target.value.replace(/\D/g,''))}/><p className="mt-2 text-base text-muted-foreground">ผู้จองยังไม่ได้กรอก ดูจากหน้าปัดรถ · ล่าสุด {formatMileage(b.car.currentMileage)}</p></div>}
  {b.returnIssue&&<Notice icon={TriangleAlert}>ผู้จองแจ้งปัญหา: {b.returnIssue}</Notice>}
 </Frame>;}

 if(result.kind==='TOO_EARLY')return <Frame tone="warning" icon={Clock} title={'ยังไม่ถึงเวลารับรถ รับได้ตั้งแต่ '+formatTime(result.availableFrom)} subtitle={'รับได้ก่อนเวลาจอง '+appConfig.car.pickupEarlyMinutes+' นาที'} actions={<Actions onReset={onReset} resetLabel="ตกลง" pending={pending}/>}>
  <div className="flex flex-wrap items-center justify-between gap-4"><Person b={result.booking} size="md"/><p className="font-heading text-2xl tabular-nums">รถ #{result.booking.car.number} · {formatRange(result.booking.start,result.booking.end)}</p></div>
 </Frame>;

 if(result.kind==='KEY_NOT_RETURNED'){const h=result.holder;return <Frame tone="warning" icon={TriangleAlert} title={'กุญแจรถ #'+result.booking.car.number+' ยังไม่ถูกคืน'} subtitle={'การจองของ '+result.booking.user.displayName+' · '+formatRange(result.booking.start,result.booking.end)} actions={<Actions onReset={onReset} resetLabel="ปิด" pending={pending}/>}>
  <div className="rounded-2xl border p-4"><p className="mb-3 text-muted-foreground">ผู้ถือกุญแจตอนนี้</p>
   <div className="flex flex-wrap items-center justify-between gap-3"><Person b={h} size="md"/>
    <div className="flex flex-wrap items-center gap-2">{h.isOverdue&&<span className="rounded-full bg-overdue-bg px-3 py-1 font-medium text-overdue ring-1 ring-overdue-border">{formatRelative(h.end,time)}</span>}<a className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-4 font-medium text-primary" href={'tel:'+h.user.phone}><Phone aria-hidden className="size-5"/>{h.user.phone}</a></div>
   </div>
  </div>
  <div><p className="mb-3 flex items-center gap-2 font-medium"><ArrowRightLeft aria-hidden className="size-5 text-primary"/>เปลี่ยนเป็นรถคันอื่นที่ว่างในช่วงเวลาเดียวกัน</p>
   {result.alternatives.length?<div className="grid gap-3 sm:grid-cols-2">{result.alternatives.map(car=><button key={car.id} type="button" disabled={pending} onClick={()=>onSwap(car.id)} className="flex min-h-16 items-center gap-3 rounded-2xl bg-primary px-4 py-2 text-left text-primary-foreground shadow-card transition hover:bg-primary/90 disabled:opacity-60 focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2">
    <CarFront aria-hidden className="size-7 shrink-0"/><span className="min-w-0"><span className="block font-heading text-xl font-semibold">เปลี่ยนเป็นรถ #{car.number}</span><span className="block truncate text-base opacity-90">{car.model} · {car.seats} ที่นั่ง</span></span>
   </button>)}</div>:<p className="rounded-2xl border border-dashed p-4 text-muted-foreground">ไม่มีรถว่างในช่วงเวลานี้ ติดต่อผู้ถือกุญแจ</p>}
  </div>
 </Frame>;}

 return <Frame tone="error" icon={SearchX} title={result.kind==='NOT_FOUND'?'ไม่พบการจองนี้ ตรวจรหัสอีกครั้ง':invalidMessages[result.reason]} subtitle={result.kind==='NOT_FOUND'?'ให้ผู้จองเปิดบัตรรับรถในแอป แล้วอ่านรหัสอีกครั้ง':'ไม่ต้องมอบหรือรับกุญแจ'} actions={<Actions onReset={onReset} resetLabel="ลองอีกครั้ง" pending={pending}/>}/>;
}

/** แผงสีเขียวหลังมอบหรือรับกุญแจสำเร็จ กลับหน้าสแกนเองตาม resultAutoResetSeconds */
export function SuccessPanel({text}:{text:string}) {
 return <div role="status" className="flex min-h-[420px] flex-col items-center justify-center gap-5 overflow-hidden rounded-[1.25rem] border border-success-border bg-success-bg p-10 text-center text-success">
  <span className="grid size-28 place-items-center rounded-full bg-success text-white shadow-raised"><CircleCheck aria-hidden className="size-16"/></span>
  <p className="font-heading text-[40px] font-semibold leading-tight">{text}</p>
  <div aria-hidden className="h-2 w-64 overflow-hidden rounded-full bg-success/20"><div className="guard-countdown h-full rounded-full bg-success" style={{animationDuration:appConfig.guard.resultAutoResetSeconds+'s'}}/></div>
  <p className="text-base text-foreground/70">กลับหน้าสแกนอัตโนมัติ</p>
 </div>;
}
