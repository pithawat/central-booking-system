'use client';
import Link from 'next/link';
import {useState,useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {FlaskConical} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription,SheetTrigger} from '@/components/ui/sheet';
import {InlineConfirm} from './inline-confirm';
import {devAction} from './dev-actions';
import {formatDate,formatTime} from '@/shared/lib/datetime';
import {useNow} from './clock-provider';
export function DevTools({offsetMinutes}:{offsetMinutes:number}) {
 const [open,setOpen]=useState(false),[pending,start]=useTransition(),router=useRouter(),now=useNow();
 const run=(action:string,minutes?:number)=>start(async()=>{const result=await devAction(action,minutes);if(!result.ok)toast.error(result.error.message);else {toast.success(action==='runJobs'?'รันงานแล้ว '+(result.data.executed?.length??0)+' งาน':'ปรับข้อมูลทดสอบแล้ว');router.refresh();}});
 return <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="outline" aria-label="เครื่องมือทดสอบ" className="dev-button fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-4 left-3 z-30 h-10 rounded-full px-3 text-sm opacity-90 shadow-md md:h-12 md:rounded-lg md:px-5 md:text-base md:opacity-100"><FlaskConical aria-hidden/><span className="md:hidden">ทดสอบ</span><span className="hidden md:inline">เครื่องมือทดสอบ</span></Button></SheetTrigger><SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>เครื่องมือทดสอบ</SheetTitle><SheetDescription>การเปลี่ยนเวลามีผลกับทุกเครื่อง</SheetDescription></SheetHeader><div className="p-5 space-y-5"><p>เวลาจำลอง: {formatDate(now)} {formatTime(now)} ({offsetMinutes>=0?'+':''}{offsetMinutes} นาที)</p><div className="flex flex-wrap gap-2">{[[15,'+15 นาที'],[60,'+1 ชั่วโมง'],[1440,'+1 วัน']].map(([v,label])=><Button key={v} variant="outline" disabled={pending} onClick={()=>run('shift',Number(v))}>{label}</Button>)}</div><Button variant="outline" disabled={pending} onClick={()=>run('resetClock')}>กลับเป็นเวลาจริง</Button><Button disabled={pending} onClick={()=>run('runJobs')}>รันงานตามเวลาตอนนี้</Button><p><Link href="/dev/mailbox" onClick={()=>setOpen(false)} className="text-primary underline">เปิดกล่องจดหมายทดสอบ</Link></p><p><Link href="/login" className="text-primary underline">สลับผู้ใช้ทดสอบ</Link></p><InlineConfirm label="รีเซ็ตข้อมูลทดสอบทั้งหมด" question="รีเซ็ตข้อมูลและเวลาทดสอบทั้งหมด?" onConfirm={()=>run('resetData')} disabled={pending}/></div></SheetContent></Sheet>;
}

