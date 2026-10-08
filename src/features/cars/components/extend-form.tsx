'use client';
import {useState} from 'react';
import {Minus,Plus,Clock,Info} from 'lucide-react';
import type {CarBookingDetail} from '@/shared/data/types';
import {formatDate,formatTime,formatDuration,todayInBangkok} from '@/shared/lib/datetime';
import {millis} from '@/shared/lib/intervals';
import {Button} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';

const quick=[30,60,120,240];
const quickLabel=(m:number)=>'+'+formatDuration(m);

/** ขยายเวลา: ปุ่มลัด +30 นาที / +1 ชม. / +2 ชม. / +4 ชม. และปุ่ม − / + ทีละ 30 นาที แทน dropdown */
export function ExtendForm({booking:b,ends,pending,onConfirm}:{booking:CarBookingDetail;ends:string[];pending:boolean;onConfirm:(end:string)=>void}) {
 const [value,setValue]=useState(()=>ends.find(e=>millis(e)-millis(b.end)===3600000)??ends[0]);
 if(!ends.length)return <p className="flex items-start gap-3 rounded-2xl border border-warning-border bg-warning-bg p-4 font-medium text-warning"><Info aria-hidden className="mt-0.5 shrink-0"/>ขยายไม่ได้ มีคนจองรถคันนี้ต่อ</p>;
 const index=Math.max(0,ends.indexOf(value)),current=ends[index],added=Math.round((millis(current)-millis(b.end))/60000);
 const last=ends[ends.length-1],otherDay=(iso:string)=>todayInBangkok(iso)!==todayInBangkok(b.end);
 const stamp=(iso:string)=>(otherDay(iso)?formatDate(iso)+' ':'')+formatTime(iso);
 const limitedByNext=!!b.nextBookingStart&&millis(last)>=millis(b.nextBookingStart);
 return <div className="space-y-5">
  <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3"><span className="flex items-center gap-2 text-muted-foreground"><Clock aria-hidden className="size-5"/>เวลาคืนเดิม</span><span className="font-heading text-xl font-semibold tabular-nums">{formatTime(b.end)}</span></div>

  <div>
   <p id="extend-quick" className="mb-2 font-medium">ขยายเพิ่ม</p>
   <div role="group" aria-labelledby="extend-quick" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
    {quick.map(m=>{const target=new Date(millis(b.end)+m*60000).toISOString(),ok=ends.includes(target),on=current===target;return <button key={m} type="button" disabled={!ok||pending} aria-pressed={on} onClick={()=>setValue(target)} className={'min-h-14 rounded-2xl border-2 px-1 font-heading text-lg font-semibold whitespace-nowrap transition disabled:border-dashed disabled:opacity-40 focus-visible:ring-[3px] focus-visible:ring-ring '+(on?'border-primary bg-primary text-primary-foreground':'border-border bg-white hover:border-primary/60')}>{quickLabel(m)}</button>;})}
   </div>
  </div>

  <div className="rounded-2xl border-2 border-primary/30 bg-accent/50 p-4">
   <p className="mb-3 text-center text-muted-foreground">คืนรถภายใน</p>
   <div className="flex items-center justify-between gap-2 min-[360px]:gap-3">
    <Button type="button" variant="outline" size="icon" className="h-auto min-h-16 w-14 shrink-0 flex-col gap-0.5 rounded-2xl bg-white px-0 py-2 min-[360px]:w-[4.5rem]" disabled={index<=0||pending} onClick={()=>setValue(ends[index-1])} aria-label="ลดลง 30 นาที"><Minus aria-hidden className="size-6"/><span className="text-sm">30 นาที</span></Button>
    <div className="min-w-0 text-center" aria-live="polite">
     {otherDay(current)&&<p className="font-medium text-primary">{formatDate(current)}</p>}
     <p className="whitespace-nowrap font-heading text-[2rem] font-semibold leading-tight tabular-nums min-[360px]:text-4xl sm:text-5xl">{formatTime(current)}</p>
     <p className="text-muted-foreground">เพิ่ม {formatDuration(added)}</p>
    </div>
    <Button type="button" variant="outline" size="icon" className="h-auto min-h-16 w-14 shrink-0 flex-col gap-0.5 rounded-2xl bg-white px-0 py-2 min-[360px]:w-[4.5rem]" disabled={index>=ends.length-1||pending} onClick={()=>setValue(ends[index+1])} aria-label="เพิ่มอีก 30 นาที"><Plus aria-hidden className="size-6"/><span className="text-sm">30 นาที</span></Button>
   </div>
  </div>

  <p className="flex items-start gap-2 text-muted-foreground"><Info aria-hidden className="mt-1 size-5 shrink-0"/>{limitedByNext?'ขยายได้ถึง '+stamp(last)+' เพราะมีคนจองรถคันนี้ต่อ':'ขยายได้สูงสุดถึง '+stamp(last)}</p>
  <Button size="lg" className="h-14 w-full text-lg" disabled={pending} onClick={()=>onConfirm(current)}>{pending&&<Spinner/>}ขยายเวลาถึง {stamp(current)}</Button>
 </div>;
}
