'use client';
import {MapPin,ChevronRight} from 'lucide-react';
import type {GuardStation} from '@/shared/data/types';
/** ขั้นที่ 1: เลือกป้อม (ครั้งแรกบนเครื่องนั้น) */
export function StationPicker({stations,onChoose,pending,error}:{stations:GuardStation[];onChoose:(id:string)=>void;pending:boolean;error:string}) {
 return <div className="mx-auto mt-10 max-w-xl">
  <div className="surface p-8">
   <span className="mb-4 grid size-16 place-items-center rounded-2xl bg-accent text-primary"><MapPin aria-hidden className="size-8"/></span>
   <h1>เลือกป้อม</h1>
   <p className="mt-1 mb-6 text-muted-foreground">แตะชื่อป้อมที่แท็บเล็ตนี้ตั้งอยู่ เลือกครั้งเดียว เครื่องจะจำไว้</p>
   <div className="space-y-3">{stations.map(s=><button key={s.id} type="button" disabled={pending} onClick={()=>onChoose(s.id)} className="flex min-h-20 w-full items-center gap-4 rounded-2xl bg-primary px-6 text-left font-heading text-2xl font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90 disabled:opacity-60 focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2">
    <span className="flex-1">{s.name}</span><ChevronRight aria-hidden className="size-7"/>
   </button>)}</div>
   {error&&<p role="alert" className="mt-4 rounded-xl bg-overdue-bg p-4 text-overdue">{error}</p>}
  </div>
 </div>;
}
