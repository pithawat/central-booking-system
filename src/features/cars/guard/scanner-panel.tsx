'use client';
import {Scanner} from '@yudiel/react-qr-scanner';
import {useEffect,useState} from 'react';
import {CameraOff,SwitchCamera,QrCode,X} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
const read=(key:string)=>{try{return localStorage.getItem(key);}catch{return null;}};
const write=(key:string,value:string)=>{try{localStorage.setItem(key,value);}catch{/* จำค่าไม่ได้ก็ใช้งานต่อได้ */}};
/** ปิดกล้องเองถ้าเปิดค้างไว้โดยไม่มีการสแกน เพื่อประหยัดแบตเตอรี่และกันสแกนโดยไม่ตั้งใจ */
const IDLE_CLOSE_MS=60000;

/** กล้องสแกน QR แบบเต็มจอ เปิดเมื่อ รปภ. แตะปุ่ม สแกน QR เท่านั้น (โหลดเฉพาะฝั่ง client) */
export default function ScannerOverlay({open,onClose,onScan}:{open:boolean;onClose:()=>void;onScan:(token:string)=>void}) {
 const [facing,setFacing]=useState<'user'|'environment'>(()=>read('guard-camera')==='user'?'user':'environment'),[error,setError]=useState(false),[left,setLeft]=useState(IDLE_CLOSE_MS/1000);
 useEffect(()=>{
  if(!open)return;
  const started=Date.now(),tick=setInterval(()=>{const rest=Math.ceil((IDLE_CLOSE_MS-(Date.now()-started))/1000);setLeft(rest);if(rest<=0)onClose();},1000);
  return ()=>{clearInterval(tick);setLeft(IDLE_CLOSE_MS/1000);setError(false);};
 },[open,onClose,facing]);
 const pill='flex min-h-14 items-center gap-2 rounded-full bg-white/15 px-5 text-lg font-medium text-white backdrop-blur transition hover:bg-white/25 focus-visible:ring-[3px] focus-visible:ring-white';
 return <Dialog open={open} onOpenChange={v=>{if(!v)onClose();}}>
  <DialogContent showCloseButton={false} className="inset-0! top-0! left-0! flex! h-dvh w-screen max-w-none! translate-x-0! translate-y-0! flex-col gap-0! rounded-none! bg-black! p-0! text-white ring-0!">
   <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
    <div><DialogTitle className="font-heading text-2xl font-semibold text-white">สแกน QR</DialogTitle><DialogDescription className="text-base text-white/70">ให้ผู้จองยื่น QR ในกรอบ ระบบค้นหาเองทันที</DialogDescription></div>
    <button type="button" onClick={onClose} className={pill}><X aria-hidden className="size-6"/>ปิดกล้อง</button>
   </header>
   <div className="relative min-h-0 flex-1 overflow-hidden">
    {error?<div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center"><CameraOff aria-hidden className="size-14 opacity-80"/><p className="text-xl">อนุญาตให้เว็บนี้ใช้กล้องในการตั้งค่าเบราว์เซอร์</p><p className="text-white/70">ปิดกล้องแล้วพิมพ์รหัส 4 หลักแทนได้</p></div>:<>
     <Scanner key={facing} formats={['qr_code']} constraints={{facingMode:facing}} onScan={codes=>{if(codes[0])onScan(codes[0].rawValue);}} onError={()=>setError(true)} components={{finder:false}} styles={{container:{height:'100%',width:'100%'},video:{objectFit:'cover'}}}/>
     <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="relative aspect-square w-[min(60vmin,26rem)] rounded-3xl shadow-[0_0_0_100vmax_rgb(0_0_0/.45)]">
       {['left-0 top-0 border-l-[6px] border-t-[6px] rounded-tl-3xl','right-0 top-0 border-r-[6px] border-t-[6px] rounded-tr-3xl','left-0 bottom-0 border-l-[6px] border-b-[6px] rounded-bl-3xl','right-0 bottom-0 border-r-[6px] border-b-[6px] rounded-br-3xl'].map(c=><span key={c} className={'absolute size-16 border-white '+c}/>)}
      </div>
     </div>
    </>}
   </div>
   <footer className="flex flex-wrap items-center justify-between gap-3 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
    <p className="flex items-center gap-2 text-lg"><QrCode aria-hidden className="size-6"/>ยื่น QR ให้กล้อง · ปิดเองใน {left} วินาที</p>
    <button type="button" className={pill} onClick={()=>{const next=facing==='user'?'environment':'user';setFacing(next);write('guard-camera',next);setError(false);}}><SwitchCamera aria-hidden className="size-6"/>สลับกล้องหน้า/หลัง</button>
   </footer>
  </DialogContent>
 </Dialog>;
}
