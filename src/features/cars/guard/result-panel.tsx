'use client';
import {useEffect,useState} from 'react';
import {CircleCheck,KeyRound,Clock,TriangleAlert,SearchX,Phone,IdCard,ArrowRightLeft,Gauge,CarFront,Delete} from 'lucide-react';
import type {CarBookingDetail,HandoverMethod} from '@/shared/data/types';
import type {GuardLookupResult} from '@/shared/data/contracts';
import {appConfig} from '@/shared/config/app.config';
import {formatTime,formatRelative,formatMileage,formatRange,formatPeriod} from '@/shared/lib/datetime';
import {UserAvatar} from '@/shared/ui/user-avatar';
import {Button} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {LicensePlate,CarPhoto} from '../components/car-visual';

const invalidMessages={CANCELLED:'การจองนี้ถูกยกเลิกแล้ว',NO_SHOW:'การจองนี้ไม่มารับรถตามเวลา',RETURNED:'คืนรถไปแล้ว',WRONG_STATION:'การจองนี้ไม่ได้รับรถที่ป้อมนี้',TOKEN_INVALID:'QR นี้ใช้ไม่ได้'};
const tones={success:'bg-success text-white',info:'bg-primary text-primary-foreground',warning:'bg-warning-bg text-warning border-b border-warning-border',error:'bg-overdue-bg text-overdue border-b border-overdue-border'};
type Tone=keyof typeof tones;
/** หน่วงปุ่มยืนยันสั้น ๆ หลังผลลัพธ์ขึ้น กันนิ้วที่แตะค้างจากหน้าก่อนกดโดยไม่ตั้งใจ */
const ARM_MS=800;
function useArmed(){const [armed,setArmed]=useState(false);useEffect(()=>{const t=setTimeout(()=>setArmed(true),ARM_MS);return ()=>clearTimeout(t);},[]);return armed;}

function Frame({tone,icon:Icon,title,subtitle,children,actions}:{tone:Tone;icon:typeof KeyRound;title:string;subtitle?:string;children?:React.ReactNode;actions:React.ReactNode}) {
 return <div className="surface overflow-hidden">
  <header className={'flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6 '+tones[tone]}>
   <span className={'grid size-12 shrink-0 place-items-center rounded-2xl sm:size-14 '+(tone==='success'||tone==='info'?'bg-white/20':'bg-white')}><Icon aria-hidden className="size-8"/></span>
   <div className="min-w-0"><h2 className="text-2xl leading-tight sm:text-3xl">{title}</h2>{subtitle&&<p className="mt-0.5 opacity-90">{subtitle}</p>}</div>
  </header>
  {children&&<div className="space-y-4 p-4 sm:p-6">{children}</div>}
  <div className={'border-t bg-muted/30 px-4 py-4 sm:px-6 '+(children?'':'')}>{actions}</div>
 </div>;
}
function Person({b,size='lg'}:{b:CarBookingDetail;size?:'lg'|'md'}) {
 return <div className="flex min-w-0 items-center gap-4"><UserAvatar user={b.user} className={size==='lg'?'size-20 sm:size-24 [&_[data-slot=avatar-fallback]]:text-2xl':'size-16 [&_[data-slot=avatar-fallback]]:text-xl'}/><div className="min-w-0"><p className={'font-heading font-semibold leading-tight '+(size==='lg'?'text-[28px]':'text-2xl')}>{b.user.displayName}</p><p className="text-muted-foreground">{b.user.departmentName}</p></div></div>;
}
function CarBlock({b}:{b:CarBookingDetail}) {
 return <div className="flex items-center gap-3 rounded-2xl border bg-white p-3"><CarPhoto car={b.car} className="aspect-[4/3] w-24 shrink-0 rounded-xl"/><div className="min-w-0 space-y-1"><LicensePlate plate={b.car.plate} size="xl"/><p className="truncate text-muted-foreground">#{b.car.number} · {b.car.model}</p></div></div>;
}
function Notice({icon:Icon,children}:{icon:typeof KeyRound;children:React.ReactNode}) {
 return <p className="flex items-start gap-3 rounded-2xl border border-warning-border bg-warning-bg p-4 font-medium text-warning"><Icon aria-hidden className="mt-1 size-6 shrink-0"/><span>{children}</span></p>;
}
/** ปุ่มยกเลิกอยู่ซ้าย (เล็ก) ปุ่มหลักอยู่ขวา (ใหญ่) แยกกันชัดเจน */
function Actions({confirmLabel,onConfirm,onReset,resetLabel='ยกเลิก',pending,blocked=false}:{confirmLabel?:string;onConfirm?:()=>void;onReset:()=>void;resetLabel?:string;pending:boolean;blocked?:boolean}) {
 const armed=useArmed();
 if(!confirmLabel)return <Button className="h-16 w-full text-xl" onClick={onReset}>{resetLabel}</Button>;
 return <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] gap-4">
  <Button variant="outline" className="h-16 text-xl" onClick={onReset}>{resetLabel}</Button>
  <Button id="guard-confirm" className="relative h-[72px] overflow-hidden text-2xl" disabled={pending||blocked||!armed} onClick={onConfirm}>
   {!armed&&<span aria-hidden className="guard-arm absolute inset-y-0 left-0 bg-white/25" style={{animationDuration:ARM_MS+'ms'}}/>}
   <span className="relative flex items-center gap-2">{pending&&<Spinner/>}{confirmLabel}</span>
  </Button>
 </div>;
}

/** แป้นกรอกเลขไมล์บนจอ (รปภ. ไม่ต้องใช้คีย์บอร์ดของเครื่อง) */
function MileagePad({value,onChange,min}:{value:string;onChange:(v:string)=>void;min:number}) {
 const n=Number(value),low=!!value&&n<min,jump=!!value&&n-min>appConfig.car.maxMileageJumpKm;
 const press=(k:string)=>onChange(k==='clear'?'':k==='back'?value.slice(0,-1):(value+k).replace(/^0+/,'').slice(0,7));
 const key='h-14 rounded-2xl border bg-white font-heading shadow-card transition active:scale-95 active:bg-accent';
 return <div className="space-y-3">
  <label htmlFor="guard-mileage" className="flex items-center gap-2 font-medium"><Gauge aria-hidden className="size-6 text-muted-foreground"/>เลขไมล์</label>
  <output id="guard-mileage" aria-live="polite" className={'flex h-16 items-center justify-end rounded-2xl border-2 bg-white px-4 font-heading text-4xl tabular-nums '+(low?'border-overdue':'border-input')}>{value?new Intl.NumberFormat('en-US').format(n):<span className="text-2xl text-muted-foreground">แตะตัวเลขด้านล่าง</span>}</output>
  <p className={'text-base '+(low?'font-medium text-overdue':jump?'font-medium text-warning':'text-muted-foreground')}>{low?'เลขไมล์ต้องไม่น้อยกว่า '+new Intl.NumberFormat('en-US').format(min):jump?'เพิ่มเกิน '+new Intl.NumberFormat('en-US').format(appConfig.car.maxMileageJumpKm)+' กม. ตรวจหน้าปัดอีกครั้ง':'ผู้จองยังไม่ได้กรอก ดูจากหน้าปัดรถ · ล่าสุด '+formatMileage(min)}</p>
  <div className="grid grid-cols-3 gap-2">
   {['1','2','3','4','5','6','7','8','9'].map(k=><button key={k} type="button" className={key+' text-3xl'} onClick={()=>press(k)}>{k}</button>)}
   <button type="button" className={key+' text-lg text-muted-foreground'} disabled={!value} onClick={()=>press('clear')}>ล้าง</button>
   <button type="button" className={key+' text-3xl'} onClick={()=>press('0')}>0</button>
   <button type="button" className={key+' flex items-center justify-center gap-1.5 text-lg text-muted-foreground'} disabled={!value} onClick={()=>press('back')}><Delete aria-hidden className="size-5"/>ลบ</button>
  </div>
 </div>;
}

type Props={result:GuardLookupResult;method:HandoverMethod;time:Date;pending:boolean;mileage:string;onMileage:(v:string)=>void;onConfirm:()=>void;onReset:()=>void;onSwap:(carId:string)=>void};
/** แผงผลลัพธ์หลังสแกนหรือพิมพ์รหัส (§8.5) */
export function ResultPanel({result,method,time,pending,mileage,onMileage,onConfirm,onReset,onSwap}:Props) {
 if(result.kind==='PICKUP'){const b=result.booking;return <Frame tone="success" icon={CircleCheck} title="ตรงกับการจอง" subtitle="ดูหน้าผู้รับให้ตรงกับรูป แล้วมอบกุญแจ" actions={<Actions confirmLabel="มอบกุญแจ" onConfirm={onConfirm} onReset={onReset} pending={pending}/>}>
  <div className="@container"><div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @xl:items-center"><Person b={b}/><CarBlock b={b}/></div></div>
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_minmax(0,1fr)]">
   <p className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-accent px-5 py-3 font-heading text-[32px] font-semibold text-accent-foreground"><KeyRound aria-hidden className="size-9 shrink-0"/>กุญแจช่อง {b.car.keySlot}</p>
   <p className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3"><Clock aria-hidden className="size-6 shrink-0 text-muted-foreground"/><span className="font-heading text-xl tabular-nums">{formatPeriod(b.start,b.end)}</span></p>
  </div>
  {b.driverName&&<Notice icon={IdCard}>ผู้ขับ: {b.driverName} ตรวจบัตรพนักงานผู้ขับ</Notice>}
  {method==='ID_CARD'&&<Notice icon={IdCard}>ตรวจบัตรพนักงานเทียบกับรูปก่อนมอบกุญแจ</Notice>}
 </Frame>;}

 if(result.kind==='RETURN'){const b=result.booking,needMileage=b.endMileage===null,min=b.car.currentMileage;
  const blocked=needMileage&&appConfig.car.requireMileageOnReturn&&(!mileage||Number(mileage)<min);
  return <Frame tone="info" icon={KeyRound} title={'คืนรถ #'+b.car.number} subtitle={needMileage?'กรอกเลขไมล์ แล้วรับกุญแจคืน':'ตรวจเลขไมล์ แล้วรับกุญแจคืน'} actions={<Actions confirmLabel="รับกุญแจคืน" onConfirm={onConfirm} onReset={onReset} pending={pending} blocked={blocked}/>}>
  <div className="@container"><div className="grid grid-cols-1 gap-5 @2xl:grid-cols-[minmax(0,1fr)_17rem]">
   <div className="space-y-4">
    <CarBlock b={b}/>
    <div className="flex flex-wrap items-center justify-between gap-4"><Person b={b} size="md"/><div className="text-right"><p className="text-muted-foreground">คืนภายใน</p><p className="font-heading text-3xl font-semibold tabular-nums">{formatTime(b.end)}</p></div></div>
    {b.isOverdue&&<p className="flex items-center gap-3 rounded-2xl border border-overdue-border bg-overdue-bg px-5 py-3 font-heading text-2xl font-semibold text-overdue"><TriangleAlert aria-hidden className="size-7"/>{formatRelative(b.end,time)}</p>}
    {!needMileage&&<div className="flex items-center gap-4 rounded-2xl bg-muted px-5 py-4"><Gauge aria-hidden className="size-8 shrink-0 text-muted-foreground"/><div><p className="font-heading text-2xl font-semibold">เลขไมล์ {formatMileage(b.endMileage!)}</p><p className="text-base text-muted-foreground">ผู้จองกรอกไว้แล้ว</p></div></div>}
    {b.returnIssue&&<Notice icon={TriangleAlert}>ผู้จองแจ้งปัญหา: {b.returnIssue}</Notice>}
   </div>
   {needMileage&&<MileagePad value={mileage} onChange={onMileage} min={min}/>}
  </div></div>
 </Frame>;}

 if(result.kind==='TOO_EARLY')return <Frame tone="warning" icon={Clock} title={'ยังไม่ถึงเวลารับรถ รับได้ตั้งแต่ '+formatTime(result.availableFrom)} subtitle={'รับได้ก่อนเวลาจอง '+appConfig.car.pickupEarlyMinutes+' นาที ยังไม่ต้องมอบกุญแจ'} actions={<Actions onReset={onReset} resetLabel="ตกลง" pending={pending}/>}>
  <div className="grid grid-cols-1 gap-4 @container"><Person b={result.booking} size="md"/><CarBlock b={result.booking}/><p className="font-heading text-xl tabular-nums">{formatPeriod(result.booking.start,result.booking.end)}</p></div>
 </Frame>;

 if(result.kind==='KEY_NOT_RETURNED'){const h=result.holder;return <Frame tone="warning" icon={TriangleAlert} title={'กุญแจรถ #'+result.booking.car.number+' ยังไม่ถูกคืน'} subtitle={'การจองของ '+result.booking.user.displayName+' · '+formatRange(result.booking.start,result.booking.end)} actions={<Actions onReset={onReset} resetLabel="ปิด" pending={pending}/>}>
  <div className="rounded-2xl border p-4"><p className="mb-3 text-muted-foreground">ผู้ถือกุญแจตอนนี้</p>
   <div className="flex flex-wrap items-center justify-between gap-3"><Person b={h} size="md"/>
    <div className="flex flex-wrap items-center gap-2">{h.isOverdue&&<span className="rounded-full bg-overdue-bg px-3 py-1 font-medium text-overdue ring-1 ring-overdue-border">{formatRelative(h.end,time)}</span>}<a className="inline-flex min-h-12 items-center gap-2 rounded-xl border px-4 font-medium text-primary" href={'tel:'+h.user.phone}><Phone aria-hidden className="size-5"/>{h.user.phone}</a></div>
   </div>
  </div>
  <div><p className="mb-3 flex items-center gap-2 font-medium"><ArrowRightLeft aria-hidden className="size-5 text-primary"/>เปลี่ยนเป็นรถคันอื่นที่ว่างในช่วงเวลาเดียวกัน</p>
   {result.alternatives.length?<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{result.alternatives.map(car=><button key={car.id} type="button" disabled={pending} onClick={()=>onSwap(car.id)} className="flex min-h-16 items-center gap-3 rounded-2xl border-2 border-primary/30 bg-white px-3 py-2 text-left shadow-card transition hover:border-primary disabled:opacity-60 focus-visible:ring-[3px] focus-visible:ring-ring">
    <CarFront aria-hidden className="size-7 shrink-0 text-primary"/><span className="min-w-0"><span className="block font-heading text-xl font-semibold text-primary">เปลี่ยนเป็นรถ #{car.number}</span><span className="mt-0.5 flex flex-wrap items-center gap-2"><LicensePlate plate={car.plate} size="sm"/><span className="truncate text-base text-muted-foreground">{car.model}</span></span></span>
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
