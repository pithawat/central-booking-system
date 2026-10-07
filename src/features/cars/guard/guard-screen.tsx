'use client';
import dynamic from 'next/dynamic';
import {useState,useTransition,useEffect,useRef} from 'react';
import {useRouter} from 'next/navigation';
import {ShieldCheck,QrCode,Keyboard} from 'lucide-react';
import type {User,GuardStation,GuardShift,CarBookingDetail,HandoverMethod} from '@/shared/data/types';
import type {GuardLookupResult} from '@/shared/data/contracts';
import {appConfig} from '@/shared/config/app.config';
import {formatTime,formatDate} from '@/shared/lib/datetime';
import {useNow} from '@/shared/ui/clock-provider';
import {useAutoRefresh} from '@/shared/ui/use-auto-refresh';
import {UserAvatar} from '@/shared/ui/user-avatar';
import {InlineConfirm} from '@/shared/ui/inline-confirm';
import {Spinner} from '@/components/ui/spinner';
import {CodePad} from './code-pad';
import {StationPicker} from './station-picker';
import {ShiftLogin} from './shift-login';
import {ResultPanel,SuccessPanel} from './result-panel';
import {BoardLists} from './board-lists';
import {chooseStation,shiftAction,lookupGuard,performGuard} from './actions';
const ScannerPanel=dynamic(()=>import('./scanner-panel'),{ssr:false,loading:()=><div className="grid h-72 @min-[440px]:h-[360px] place-items-center rounded-2xl bg-slate-900 text-white">กำลังเปิดกล้อง…</div>});
type Props={stations:GuardStation[];stationId:string|null;guards:User[];shift:(GuardShift&{guard:User})|null;board:{waiting:CarBookingDetail[];out:CarBookingDetail[]}};

function beep() {try{const audio=new AudioContext(),osc=audio.createOscillator(),gain=audio.createGain();gain.gain.value=.08;osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.1);osc.onended=()=>void audio.close();}catch{/* เสียงเป็นส่วนเสริม */}}

export function GuardScreen({stations,stationId,guards,shift,board}:Props) {
 const router=useRouter(),time=useNow(true),[code,setCode]=useState(''),[result,setResult]=useState<GuardLookupResult|null>(null),[method,setMethod]=useState<HandoverMethod>('CODE'),[mileage,setMileage]=useState(''),[error,setError]=useState(''),[success,setSuccess]=useState(''),[pending,start]=useTransition(),busy=useRef(false);
 useAutoRefresh();
 const station=stations.find(s=>s.id===stationId);
 const reset=()=>{setCode('');setResult(null);setError('');setMileage('');setSuccess('');busy.current=false;};
 useEffect(()=>{if(!success)return;const timer=setTimeout(()=>{setSuccess('');setResult(null);setCode('');busy.current=false;},appConfig.guard.resultAutoResetSeconds*1000);return ()=>clearTimeout(timer);},[success]);
 useEffect(()=>{let lock:WakeLockSentinel|undefined;const wake=async()=>{if(!document.hidden&&'wakeLock' in navigator)try{lock=await navigator.wakeLock.request('screen');}catch{/* Screen wake lock is optional. */}};void wake();document.addEventListener('visibilitychange',wake);return ()=>{document.removeEventListener('visibilitychange',wake);void lock?.release();};},[]);
 const lookup=(input:{qrToken?:string;code?:string;bookingId?:string},via:HandoverMethod)=>{
  if(!stationId||busy.current)return;busy.current=true;setMethod(via);setError('');
  start(async()=>{const r=await lookupGuard({stationId,...input});if(!r.ok){setError(r.error.message);busy.current=false;setCode('');return;}setResult(r.data);setMileage(r.data.kind==='RETURN'?r.data.booking.endMileage?.toString()??'':'');if(via==='QR'&&appConfig.guard.beepOnScan)beep();busy.current=false;});
 };
 const submit=()=>{if(!result||!shift||!(result.kind==='PICKUP'||result.kind==='RETURN'))return;start(async()=>{setError('');const action=result.kind==='PICKUP'?'handover':'receive';const r=await performGuard(action,{bookingId:result.booking.id,shiftId:shift.id,method,...(action==='receive'&&mileage?{mileage:Number(mileage)}:{})});if(!r.ok){setError(r.error.message);return;}setSuccess((action==='handover'?'มอบกุญแจแล้ว ':'รับกุญแจคืนแล้ว ')+formatTime(action==='handover'?r.data.pickedUpAt!:r.data.returnedAt!));router.refresh();});};
 const swap=(carId:string)=>{if(!result||!shift)return;start(async()=>{const r=await performGuard('swap',{bookingId:result.kind==='KEY_NOT_RETURNED'?result.booking.id:'',newCarId:carId,shiftId:shift.id});if(!r.ok)setError(r.error.message);else{setResult({kind:'PICKUP',booking:r.data});router.refresh();}});};
 const onCode=(v:string)=>{setCode(v);if(v.length===appConfig.car.pickupCodeLength&&shift)lookup({code:v},'CODE');};
 // คีย์บอร์ดบน PC: Enter = ยืนยัน, Esc = ยกเลิก, พิมพ์ตัวเลข = ลงช่องรหัส
 useEffect(()=>{const key=(e:KeyboardEvent)=>{
  const typing=e.target instanceof HTMLElement&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA');
  if(e.key==='Escape'){reset();return;}
  if(e.key==='Enter'&&result&&(result.kind==='PICKUP'||result.kind==='RETURN')&&!pending){e.preventDefault();document.getElementById('guard-confirm')?.click();return;}
  if(!shift||result||success||typing||pending)return;
  if(/^\d$/.test(e.key)){e.preventDefault();onCode((code+e.key).slice(0,appConfig.car.pickupCodeLength));}
  else if(e.key==='Backspace'){e.preventDefault();setCode(code.slice(0,-1));}
 };document.addEventListener('keydown',key);return ()=>document.removeEventListener('keydown',key);});

 if(!stationId)return <StationPicker stations={stations} pending={pending} error={error} onChoose={id=>start(async()=>{const r=await chooseStation(id);if(!r.ok)setError(r.error.message);else router.refresh();})}/>;
 if(!shift)return <ShiftLogin station={station} guards={guards} pending={pending} error={error} onStart={(guardId,pin)=>new Promise<boolean>(resolve=>start(async()=>{const r=await shiftAction('start',{stationId,guardId,pin});if(!r.ok){setError(r.error.message);resolve(false);}else{setError('');router.refresh();resolve(true);}}))}/>;

 return <>
  <header className="surface mb-5 flex flex-wrap items-center justify-between gap-4 px-5 py-3">
   <div className="flex items-center gap-4">
    <span className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><ShieldCheck aria-hidden className="size-7"/></span>
    <div><h1 className="text-[26px] leading-tight">{station?.name}</h1><p className="flex items-center gap-2 text-muted-foreground"><UserAvatar user={shift.guard} className="size-7 text-sm"/>เวร: {shift.guard.displayName}</p></div>
   </div>
   <div className="text-center"><p className="font-heading text-5xl font-semibold leading-none tabular-nums">{formatTime(time)}</p><p className="mt-1 text-base text-muted-foreground">{formatDate(time)}</p></div>
   <InlineConfirm label="เปลี่ยนเวร" question="จบเวรปัจจุบันและเปลี่ยนเวร?" destructive={false} className="max-w-sm" onConfirm={()=>start(async()=>{const r=await shiftAction('end',shift.id);if(!r.ok)setError(r.error.message);else {reset();router.refresh();}})}/>
  </header>
  <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
   <section aria-live="polite" aria-label="สแกนและผลลัพธ์" className="min-w-0">
    {success?<SuccessPanel text={success}/>
    :result?<ResultPanel result={result} method={method} time={time} pending={pending} mileage={mileage} onMileage={setMileage} onConfirm={submit} onReset={reset} onSwap={swap}/>
    :<div className="surface relative overflow-hidden">
     <header className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
      <div><h2 className="text-2xl">รับ-คืนกุญแจ</h2><p className="text-base text-muted-foreground">สแกน QR ของผู้จอง หรือพิมพ์รหัส 4 หลักที่ผู้จองบอก</p></div>
      <p className="flex items-center gap-2 rounded-full bg-success-bg px-3 py-1 text-base font-medium text-success ring-1 ring-success-border"><span aria-hidden className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60"/><span className="relative inline-flex size-2.5 rounded-full bg-success"/></span>{pending?'กำลังค้นหา…':'พร้อมใช้งาน'}</p>
     </header>
     <div className="@container p-6"><div className="grid gap-5 @min-[440px]:grid-cols-[minmax(0,1fr)_auto] @2xl:grid-cols-[minmax(0,1fr)_auto_auto]">
      <div className="min-w-0"><p className="mb-3 flex items-center gap-2 font-medium"><QrCode aria-hidden className="size-6 text-primary"/>สแกน QR</p><ScannerPanel paused={pending} onScan={token=>lookup({qrToken:token},'QR')}/></div>
      <div aria-hidden className="flex items-center gap-3 @min-[440px]:hidden @2xl:flex @2xl:flex-col"><span className="h-px flex-1 bg-border @2xl:h-auto @2xl:w-px"/><span className="rounded-full border bg-white px-3 py-1 text-base text-muted-foreground">หรือ</span><span className="h-px flex-1 bg-border @2xl:h-auto @2xl:w-px"/></div>
      <div className="flex flex-col items-center"><p aria-hidden className="mb-3 flex items-center gap-2 self-start font-medium"><Keyboard className="size-6 text-primary"/>พิมพ์รหัส</p><CodePad value={code} onChange={onCode} label="หรือพิมพ์รหัส 4 หลัก" hideLabel disabled={pending}/><p className="mt-3 max-w-[19rem] text-center text-base text-muted-foreground">ครบ 4 หลักแล้วค้นหาเอง ไม่ต้องกดปุ่ม</p></div>
     </div></div>
     {pending&&<div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-[1px]"><p className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 font-heading text-2xl shadow-raised"><Spinner className="size-6"/>กำลังค้นหา…</p></div>}
    </div>}
    {error&&<p className="mt-4 rounded-2xl border border-overdue-border bg-overdue-bg p-4 font-medium text-overdue" role="alert">{error}</p>}
   </section>
   <BoardLists board={board} time={time} onPick={(b,list)=>lookup({bookingId:b.id},list==='waiting'?'ID_CARD':'TAP_LIST')}/>
  </div>
 </>;
}
