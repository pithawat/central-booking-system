'use client';
import {Delete} from 'lucide-react';
import {InputOTP,InputOTPGroup,InputOTPSlot} from '@/components/ui/input-otp';
/** ช่องรหัส 4 หลัก + แป้นตัวเลขบนจอ (3×4: 1–9, ล้าง, 0, ลบ) */
export function CodePad({value,onChange,label,disabled=false,hideLabel=false}:{value:string;onChange:(v:string)=>void;label:string;disabled?:boolean;hideLabel?:boolean}) {
 const press=(key:string)=>onChange(key==='clear'?'':key==='back'?value.slice(0,-1):(value+key).slice(0,4));
 const keyClass='h-14 rounded-2xl border bg-white font-heading shadow-card transition active:scale-95 active:bg-accent disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-ring';
 return <div className="w-full max-w-[19rem] space-y-4">
  <label className={hideLabel?'sr-only':'block font-medium'} htmlFor="guard-code">{label}</label>
  <InputOTP id="guard-code" maxLength={4} value={value} onChange={onChange} inputMode="numeric" pattern="^[0-9]*$" disabled={disabled} containerClassName="justify-center">
   <InputOTPGroup className="gap-2">{[0,1,2,3].map(i=><InputOTPSlot key={i} index={i} className="size-14 rounded-2xl! border! bg-white font-heading text-3xl shadow-card"/>)}</InputOTPGroup>
  </InputOTP>
  <div className="grid grid-cols-3 gap-2">
   {['1','2','3','4','5','6','7','8','9'].map(k=><button key={k} type="button" className={keyClass+' text-3xl'} disabled={disabled} onClick={()=>press(k)}>{k}</button>)}
   <button type="button" className={keyClass+' text-lg text-muted-foreground'} disabled={disabled||!value} onClick={()=>press('clear')}>ล้าง</button>
   <button type="button" className={keyClass+' text-3xl'} disabled={disabled} onClick={()=>press('0')}>0</button>
   <button type="button" className={keyClass+' flex items-center justify-center gap-1.5 text-lg text-muted-foreground'} disabled={disabled||!value} onClick={()=>press('back')}><Delete aria-hidden className="size-5"/>ลบ</button>
  </div>
 </div>;
}
