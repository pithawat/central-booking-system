'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
export function InlineConfirm({label,question,onConfirm,destructive=true,cancelLabel='ไม่',disabled=false,triggerVariant='outline',className=''}:{label:string;question:string;onConfirm:()=>void|Promise<void>;destructive?:boolean;cancelLabel?:string;disabled?:boolean;triggerVariant?:'outline'|'ghost'|'secondary';className?:string}) {
 const [open,setOpen]=useState(false);
 if(!open)return <Button variant={triggerVariant} disabled={disabled} className={(destructive?'text-destructive hover:text-destructive ':'')+className} onClick={()=>setOpen(true)}>{label}</Button>;
 return <div className={'w-full rounded-xl border border-warning-border bg-warning-bg p-4 space-y-3 '+className} aria-live="polite">
  <p className="font-medium text-foreground">{question}</p>
  <div className="flex flex-wrap gap-2">
   <Button disabled={disabled} variant={destructive?'destructive':'default'} className={destructive?'bg-destructive text-white hover:bg-destructive/90':''} onClick={async()=>{await onConfirm();setOpen(false);}}>{label}</Button>
   <Button variant="outline" onClick={()=>setOpen(false)}>{cancelLabel}</Button>
  </div>
 </div>;
}
