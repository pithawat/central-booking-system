'use client';
import {useState,useTransition,useEffect,useRef} from 'react';
import {useRouter} from 'next/navigation';
import {QRCodeSVG} from 'qrcode.react';
import {toast} from 'sonner';
import {Maximize2,KeyRound,CalendarClock,TriangleAlert,MapPinned} from 'lucide-react';
import type {CarBookingDetail} from '@/shared/data/types';
import {appConfig} from '@/shared/config/app.config';
import {formatDate,formatDateShort,formatTime,formatMileage,formatRelative,bangkokDateTime,todayInBangkok,timeOptions,addDays} from '@/shared/lib/datetime';
import {useNow} from '@/shared/ui/clock-provider';
import {useAutoRefresh} from '@/shared/ui/use-auto-refresh';
import {ResponsivePanel} from '@/shared/ui/responsive-panel';
import {placeLabel,type CarPlace} from '../lib/places';
import {InlineConfirm} from '@/shared/ui/inline-confirm';
import {StatusBadge} from '@/shared/ui/status-badge';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Switch} from '@/components/ui/switch';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {changeCar} from '../actions';
import {ExtendForm} from './extend-form';
import {CarPhoto,LicensePlate} from './car-visual';

function When({label,icon:Icon,iso}:{label:string;icon:typeof KeyRound;iso:string}) {
 return <div className="min-w-0 rounded-2xl bg-muted/70 px-3 py-2"><p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Icon aria-hidden className="size-4"/>{label}</p><p className="truncate font-heading font-semibold"><span className="sm:hidden">{formatDateShort(iso)}</span><span className="hidden sm:inline">{formatDate(iso)}</span></p><p className="font-heading text-2xl font-semibold leading-tight tabular-nums">{formatTime(iso)}</p></div>;
}

/** บัตรรับรถ (§8.3) · compact = ใช้บนหน้าแรก: QR เป็นภาพย่อ แตะเพื่อขยายเต็มจอ */
export function CarPass({booking:b,owner=true,compact=false,place}:{booking:CarBookingDetail;owner?:boolean;compact?:boolean;place?:CarPlace}) {
 const now=useNow(),router=useRouter(),[panel,setPanel]=useState<'return'|'extend'|'full'|null>(null),[mileage,setMileage]=useState(b.endMileage?.toString()??''),[issue,setIssue]=useState(''),[hasIssue,setHasIssue]=useState(false),[error,setError]=useState(''),[confirmJump,setConfirmJump]=useState(false),[pending,start]=useTransition();
 const previous=useRef(b.status),active=['CONFIRMED','IN_USE'].includes(b.status),inUse=b.status==='IN_USE',overdue=inUse&&now>new Date(b.end);
 const availableFrom=new Date(new Date(b.start).getTime()-appConfig.car.pickupEarlyMinutes*60000),early=now<availableFrom;
 useAutoRefresh(inUse||b.status==='CONFIRMED'&&!early);
 useEffect(()=>{if(previous.current!==b.status){if(b.status==='IN_USE')toast.success('รับกุญแจแล้ว');if(b.status==='RETURNED')toast.success('คืนรถเรียบร้อย');previous.current=b.status;}},[b.status]);
 const mutate=(action:'cancel'|'extend'|'return',input?:unknown)=>start(async()=>{setError('');const r=await changeCar(action,b.id,input);if(!r.ok){setError(r.error.message);return;}toast.success(action==='cancel'?'ยกเลิกการจองแล้ว':action==='return'?'บันทึกเลขไมล์แล้ว นำกุญแจไปคืนที่ป้อม':'ขยายเวลาถึง '+formatTime(r.data.end)+' แล้ว');setPanel(null);router.refresh();});
 function saveReturn(){const n=Number(mileage);if(!mileage||!Number.isInteger(n)||n<b.car.currentMileage){setError('เลขไมล์ต้องไม่น้อยกว่า '+new Intl.NumberFormat('en-US').format(b.car.currentMileage));return;}if(n-b.car.currentMileage>appConfig.car.maxMileageJumpKm&&!confirmJump){setConfirmJump(true);return;}mutate('return',{mileage:n,issue:hasIssue?issue:null});}
 const ends=Array.from({length:appConfig.car.maxBookingDays+1},(_,day)=>timeOptions(appConfig.car.timeOptionsStart,appConfig.car.timeOptionsEnd).map(t=>bangkokDateTime(addDays(todayInBangkok(b.end),day),t).toISOString())).flat().filter(t=>t>b.end&&new Date(t)>now&&new Date(t).getTime()-new Date(b.start).getTime()<=appConfig.car.maxBookingDays*86400000&&(!b.nextBookingStart||t<=b.nextBookingStart));
 const qr=b.qrToken&&appConfig.car.showQr,showCode=active&&owner;
 const title=inUse?'กำลังใช้รถ #'+b.car.number+' · คืนภายใน '+formatTime(b.end):'บัตรรับรถ #'+b.car.number;
 const hint=inUse?'ใช้ QR นี้ตอนคืนรถได้':'ยื่น QR หรือบอกรหัสนี้กับ รปภ. ที่ '+(place?.station??'ป้อม รปภ.');
 return <section className={'surface overflow-hidden border-primary/25 '+(compact?'':'mb-6')}>
  {overdue&&<p className="flex items-center gap-2 bg-overdue-bg px-4 py-3 font-medium text-overdue"><TriangleAlert aria-hidden className="size-5"/>เกินเวลาคืน {formatRelative(b.end,now).replace('เกิน ','')}</p>}
  <div className="space-y-4 p-4 sm:p-5">
   <div className="flex items-start gap-3">
    <CarPhoto car={b.car} className="aspect-[4/3] w-24 shrink-0 rounded-xl sm:w-32"/>
    <div className="min-w-0 flex-1 space-y-1.5">
     <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold text-muted-foreground">{title}</h2><StatusBadge kind="car" status={b.status} isOverdue={overdue}/></div>
     <LicensePlate plate={b.car.plate} size="lg"/>
     <p className="truncate text-muted-foreground">{b.car.model}</p>
    </div>
   </div>
   <div className="grid grid-cols-2 gap-2"><When label="รับรถ" icon={KeyRound} iso={b.start}/><When label="คืนรถ" icon={CalendarClock} iso={b.end}/></div>
   <p className="flex items-start gap-2 rounded-2xl border border-primary/15 bg-accent/50 px-3 py-2.5"><MapPinned aria-hidden className="mt-0.5 size-5 shrink-0 text-primary"/><span className="min-w-0"><span className="text-muted-foreground">รับ-คืนรถที่ </span><span className="font-medium">{placeLabel(place)}</span></span></p>

   {showCode&&(compact?
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border bg-white p-3 min-[360px]:gap-4">
     {qr&&<button type="button" onClick={()=>setPanel('full')} aria-label="แสดงเต็มจอ" className={'relative shrink-0 rounded-xl bg-white p-1.5 ring-1 ring-border focus-visible:ring-[3px] focus-visible:ring-ring '+(early&&!inUse?'opacity-40':'')}><QRCodeSVG value={b.qrToken!} size={92} level="M" marginSize={2} className="size-20 min-[360px]:size-[92px]"/><span className="absolute -right-1.5 -bottom-1.5 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow"><Maximize2 aria-hidden className="size-4"/></span></button>}
     <div className="min-w-0"><p className="text-sm text-muted-foreground">รหัสรับรถ</p><p className="font-heading text-3xl font-semibold tracking-[.14em] tabular-nums min-[360px]:text-4xl min-[360px]:tracking-[.18em]">{b.pickupCode}</p>{early&&!inUse?<p className="text-sm text-warning">รับรถได้ตั้งแต่ {formatTime(availableFrom)}</p>:<p className="text-sm text-muted-foreground">{qr?'แตะ QR เพื่อขยาย · ':''}{inUse?'ใช้ตอนคืนรถได้':'ยื่นให้ รปภ. ที่ป้อม'}</p>}</div>
    </div>
   :<div className="flex flex-col items-center rounded-2xl border bg-white p-4 text-center">
     {qr&&<div className={(early&&!inUse?'opacity-40 ':'')+'rounded-2xl bg-white p-2 ring-1 ring-border'}><QRCodeSVG value={b.qrToken!} size={inUse?160:240} level="M" marginSize={4} className="h-auto max-w-full"/></div>}
     <p className="mt-3 font-heading text-5xl tracking-[.22em] tabular-nums">{b.pickupCode}</p>
     {early&&!inUse&&<p className="mt-2 text-warning">รับรถได้ตั้งแต่ {formatTime(availableFrom)}</p>}
     <p className="mt-2 text-muted-foreground">{hint}</p>
     {qr&&<Button className="mt-3" variant="outline" onClick={()=>setPanel('full')}><Maximize2 aria-hidden/>แสดงเต็มจอ</Button>}
    </div>)}

   {owner&&(inUse||b.status==='CONFIRMED')&&<div className="grid grid-cols-2 gap-2 has-[[aria-live]]:grid-cols-1">
    {inUse&&<><Button onClick={()=>{setError('');setPanel('return');}}>คืนรถ</Button><Button variant="outline" onClick={()=>{setError('');setPanel('extend');}}>ขยายเวลา</Button></>}
    {b.status==='CONFIRMED'&&<><Button variant="outline" onClick={()=>{setError('');setPanel('extend');}}>ขยายเวลา</Button><InlineConfirm label="ยกเลิกการจอง" question={'ยกเลิกการจองรถ #'+b.car.number+'?'} cancelLabel="ไม่ยกเลิก" onConfirm={()=>mutate('cancel')} disabled={pending}/></>}
   </div>}
   {error&&!panel&&<p role="alert" className="text-destructive">{error}</p>}
  </div>

  <Dialog open={panel==='full'} onOpenChange={v=>{if(!v)setPanel(null);}}>
   <DialogContent className="flex flex-col items-center bg-white sm:max-w-[95vw]"><DialogTitle>รถ #{b.car.number} · รหัส {b.pickupCode}</DialogTitle><DialogDescription>เพิ่มความสว่างหน้าจอถ้าสแกนไม่ติด</DialogDescription>
    {qr&&<QRCodeSVG value={b.qrToken!} size={700} level="M" marginSize={4} style={{width:'80vmin',height:'80vmin',maxHeight:'65vh'}}/>}
    <p className="font-heading text-5xl tracking-[.18em] tabular-nums">{b.pickupCode}</p><LicensePlate plate={b.car.plate} size="lg"/>
   </DialogContent>
  </Dialog>
  <ResponsivePanel open={panel==='return'||panel==='extend'} onOpenChange={v=>{if(!v)setPanel(null);}} title={panel==='return'?'คืนรถ #'+b.car.number:'ขยายเวลาใช้รถ #'+b.car.number} description={b.car.model+' · ทะเบียน '+b.car.plate}>
   {panel==='return'?<div className="space-y-5">
    <div><label htmlFor="mileage" className="mb-1.5 block font-medium">เลขไมล์</label><Input id="mileage" inputMode="numeric" className="h-14 font-heading text-2xl tabular-nums" value={mileage} onChange={e=>{setMileage(e.target.value.replace(/\D/g,''));setConfirmJump(false);}}/><p className="mt-1.5 text-muted-foreground">เลขไมล์ล่าสุด {formatMileage(b.car.currentMileage)}</p></div>
    <label className="flex min-h-12 items-center gap-3"><Switch id="has-issue" checked={hasIssue} onCheckedChange={setHasIssue}/>มีปัญหากับรถ</label>
    {hasIssue&&<div><label htmlFor="issue" className="mb-1.5 block">อธิบายปัญหา (ไม่บังคับ)</label><Textarea id="issue" value={issue} onChange={e=>setIssue(e.target.value)}/></div>}
    {confirmJump?<div className="space-y-3 rounded-xl border border-warning-border bg-warning-bg p-4"><p>เลขไมล์เพิ่มเกิน {appConfig.car.maxMileageJumpKm} กม. ตรวจสอบแล้วใช่หรือไม่?</p><div className="flex flex-wrap gap-2"><Button disabled={pending} onClick={saveReturn}>ยืนยันเลขไมล์ แล้วบันทึก</Button><Button variant="outline" onClick={()=>setConfirmJump(false)}>กลับไปแก้ไข</Button></div></div>
    :<Button size="lg" className="h-auto min-h-14 w-full whitespace-normal py-3" disabled={pending} onClick={saveReturn}>บันทึก แล้วนำกุญแจไปคืนที่ป้อม</Button>}
   </div>:<ExtendForm booking={b} ends={ends} pending={pending} onConfirm={e=>mutate('extend',e)}/>}
   {error&&<p className="mt-4 text-destructive" role="alert">{error}</p>}
  </ResponsivePanel>
 </section>;
}
