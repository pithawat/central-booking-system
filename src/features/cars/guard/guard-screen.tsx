'use client';
import dynamic from 'next/dynamic';
import {useState,useTransition,useEffect,useRef,useCallback} from 'react';
import {useRouter} from 'next/navigation';
import {ScanQrCode} from 'lucide-react';
import type {User,GuardStation,GuardShift,CarBookingDetail,HandoverMethod} from '@/shared/data/types';
import type {GuardLookupResult} from '@/shared/data/contracts';
import {appConfig} from '@/shared/config/app.config';
import {formatTime,formatDate} from '@/shared/lib/datetime';
import {useNow} from '@/shared/ui/clock-provider';
import {useAutoRefresh} from '@/shared/ui/use-auto-refresh';
import {UserAvatar} from '@/shared/ui/user-avatar';
import {BrandLogo} from '@/shared/ui/brand-logo';
import {InlineConfirm} from '@/shared/ui/inline-confirm';
import {Spinner} from '@/components/ui/spinner';
import {CodePad} from './code-pad';
import {StationPicker} from './station-picker';
import {ShiftLogin} from './shift-login';
import {ResultPanel,SuccessPanel} from './result-panel';
import {BoardLists} from './board-lists';
import {chooseStation,shiftAction,lookupGuard,performGuard} from './actions';
const ScannerOverlay=dynamic(()=>import('./scanner-panel'),{ssr:false});
type Props={stations:GuardStation[];stationId:string|null;guards:User[];shift:(GuardShift&{guard:User})|null;board:{waiting:CarBookingDetail[];out:CarBookingDetail[]}};

function beep() {try{const audio=new AudioContext(),osc=audio.createOscillator(),gain=audio.createGain();gain.gain.value=.08;osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.1);osc.onended=()=>void audio.close();}catch{/* เสียงเป็นส่วนเสริม */}}

export function GuardScreen({stations,stationId,guards,shift,board}:Props) {
 const router=useRouter(),time=useNow(true),[code,setCode]=useState(''),[result,setResult]=useState<GuardLookupResult|null>(null),[method,setMethod]=useState<HandoverMethod>('CODE'),[mileage,setMileage]=useState(''),[error,setError]=useState(''),[success,setSuccess]=useState(''),[pending,start]=useTransition(),[scanning,setScanning]=useState(false),busy=useRef(false);
 useAutoRefresh();
 const closeScanner=useCallback(()=>setScanning(false),[]);
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
  if(result?.kind==='RETURN'&&result.booking.endMileage===null&&!success&&!typing){if(/^\d$/.test(e.key)){e.preventDefault();setMileage((mileage+e.key).replace(/^0+/,'').slice(0,7));}else if(e.key==='Backspace'){e.preventDefault();setMileage(mileage.slice(0,-1));}return;}
  if(!shift||result||success||typing||pending||scanning)return;
  if(/^\d$/.test(e.key)){e.preventDefault();onCode((code+e.key).slice(0,appConfig.car.pickupCodeLength));}
  else if(e.key==='Backspace'){e.preventDefault();setCode(code.slice(0,-1));}
 };document.addEventListener('keydown',key);return ()=>document.removeEventListener('keydown',key);});

 if(!stationId)return <StationPicker stations={stations} pending={pending} error={error} onChoose={id=>start(async()=>{const r=await chooseStation(id);if(!r.ok)setError(r.error.message);else router.refresh();})}/>;
 if(!shift)return <ShiftLogin station={station} guards={guards} pending={pending} error={error} onStart={(guardId,pin)=>new Promise<boolean>(resolve=>start(async()=>{const r=await shiftAction('start',{stationId,guardId,pin});if(!r.ok){setError(r.error.message);resolve(false);}else{setError('');router.refresh();resolve(true);}}))}/>;

 return <>
  <header className="surface mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-5">
   <div className="flex min-w-0 items-center gap-3 sm:gap-4">
    <BrandLogo className="w-24 shrink-0 sm:w-28"/>
    <div className="min-w-0"><h1 className="text-xl leading-tight sm:text-[26px]">{station?.name}</h1><p className="flex items-center gap-2 text-muted-foreground"><UserAvatar user={shift.guard} className="size-7 text-sm"/>เวร: {shift.guard.displayName}</p></div>
   </div>
   <div className="text-center"><p className="font-heading text-4xl font-semibold leading-none tabular-nums sm:text-5xl">{formatTime(time)}</p><p className="mt-1 hidden text-base text-muted-foreground sm:block">{formatDate(time)}</p></div>
   <InlineConfirm label="เปลี่ยนเวร" question="จบเวรปัจจุบันและเปลี่ยนเวร?" destructive={false} triggerVariant="ghost" className="max-w-sm text-muted-foreground" onConfirm={()=>start(async()=>{const r=await shiftAction('end',shift.id);if(!r.ok)setError(r.error.message);else {reset();router.refresh();}})}/>
  </header>
  <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[3fr_2fr]">
   <section aria-live="polite" aria-label="สแกนและผลลัพธ์" className="min-w-0">
    {success?<SuccessPanel text={success}/>
    :result?<ResultPanel result={result} method={method} time={time} pending={pending} mileage={mileage} onMileage={setMileage} onConfirm={submit} onReset={reset} onSwap={swap}/>
    :<div className="surface relative overflow-hidden">
     <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-5 sm:py-6">
      <button type="button" disabled={pending} onClick={()=>setScanning(true)} className="flex w-full flex-col items-center gap-3 rounded-[2rem] bg-primary px-6 py-9 text-primary-foreground shadow-raised transition hover:bg-primary/90 active:scale-[.98] disabled:opacity-60 focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 [@media(max-height:860px)]:py-4">
       <span className="grid size-24 place-items-center rounded-3xl bg-white/15 [@media(max-height:860px)]:size-14"><ScanQrCode aria-hidden className="size-14 [@media(max-height:860px)]:size-9"/></span>
       <span className="font-heading text-4xl font-semibold">สแกน QR</span>
       <span className="text-lg text-primary-foreground/85">แตะเพื่อเปิดกล้อง แล้วให้ผู้จองยื่น QR</span>
      </button>
      <div aria-hidden className="flex w-full items-center gap-3 text-muted-foreground"><span className="h-px flex-1 bg-border"/>หรือพิมพ์รหัส 4 หลักที่ผู้จองบอก<span className="h-px flex-1 bg-border"/></div>
      <CodePad value={code} onChange={onCode} label="หรือพิมพ์รหัส 4 หลัก" hideLabel disabled={pending}/>
      <p className="text-center text-base text-muted-foreground [@media(max-height:860px)]:hidden">ครบ 4 หลักแล้วค้นหาเอง ไม่ต้องกดปุ่ม</p>
     </div>
     {pending&&<div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-[1px]"><p className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 font-heading text-2xl shadow-raised"><Spinner className="size-6"/>กำลังค้นหา…</p></div>}
    </div>}
    <ScannerOverlay open={scanning} onClose={closeScanner} onScan={token=>{setScanning(false);lookup({qrToken:token},'QR');}}/>
    {error&&<p className="mt-4 rounded-2xl border border-overdue-border bg-overdue-bg p-4 font-medium text-overdue" role="alert">{error}</p>}
   </section>
   {/* ระหว่างแสดงผลลัพธ์ ล็อกรายการฝั่งขวาไว้ กันแตะการจองอื่นซ้อนกลางรายการ */}
   <div className="relative min-w-0">
    <div inert={!!(result||success)} className={result||success?'pointer-events-none opacity-40 transition-opacity':'transition-opacity'}><BoardLists board={board} time={time} onPick={(b,list)=>lookup({bookingId:b.id},list==='waiting'?'ID_CARD':'TAP_LIST')}/></div>
    {result&&!success&&<p className="absolute inset-x-4 top-6 rounded-2xl bg-white/95 p-4 text-center font-medium shadow-raised">ทำรายการที่แสดงอยู่ให้เสร็จ หรือกด ยกเลิก ก่อนเลือกคนถัดไป</p>}
   </div>
  </div>
 </>;
}
