'use client';
import {Scanner} from '@yudiel/react-qr-scanner';
import {useState} from 'react';
import {CameraOff,SwitchCamera,QrCode} from 'lucide-react';
import {Button} from '@/components/ui/button';
export default function ScannerPanel({onScan,paused}:{onScan:(token:string)=>void;paused:boolean}) {
 const [facing,setFacing]=useState<'user'|'environment'>(()=>typeof window!=='undefined'&&localStorage.getItem('guard-camera')==='user'?'user':'environment'),[error,setError]=useState(false);
 return <div className="space-y-3">
  <div className="relative h-72 overflow-hidden rounded-2xl bg-slate-900 @min-[440px]:h-[360px]">
   {error?<div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-base text-white"><CameraOff aria-hidden className="size-10 opacity-80"/><p>อนุญาตให้เว็บนี้ใช้กล้องในการตั้งค่าเบราว์เซอร์</p><p className="text-sm text-slate-300">ระหว่างนี้ใช้การพิมพ์รหัส 4 หลักได้ตามปกติ</p></div>:<>
    <Scanner formats={['qr_code']} paused={paused} constraints={{facingMode:facing}} onScan={codes=>{if(codes[0])onScan(codes[0].rawValue);}} onError={()=>setError(true)} components={{finder:false}} styles={{container:{height:'100%'},video:{objectFit:'cover'}}}/>
    {/* กรอบเล็ง */}
    <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
     <div className="relative aspect-square w-4/5 max-w-56">
      {['left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl','right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl','left-0 bottom-0 border-l-4 border-b-4 rounded-bl-2xl','right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl'].map(c=><span key={c} className={'absolute size-12 border-white '+c}/>)}
     </div>
    </div>
    <p className="pointer-events-none absolute inset-x-2 bottom-4 mx-auto flex w-fit items-center gap-2 rounded-full bg-black/60 px-4 py-1.5 text-center text-white"><QrCode aria-hidden className="size-5"/>ยื่น QR ให้กล้อง</p>
   </>}
  </div>
  <Button variant="outline" className="h-auto min-h-12 w-full whitespace-normal py-2" onClick={()=>{const next=facing==='user'?'environment':'user';setFacing(next);localStorage.setItem('guard-camera',next);setError(false);}}><SwitchCamera aria-hidden/>สลับกล้องหน้า/หลัง</Button>
 </div>;
}
