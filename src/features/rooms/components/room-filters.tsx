'use client';
import {useState} from 'react';
import {ChevronLeft,ChevronRight,CalendarDays,SlidersHorizontal,Tv} from 'lucide-react';
import {th} from 'date-fns/locale';
import type {Building,Site} from '@/shared/data/types';
import {addDays,bangkokDateTime,formatDate,formatDateLong,formatDateShort,dayParts,todayInBangkok} from '@/shared/lib/datetime';
import {Button} from '@/components/ui/button';
import {Switch} from '@/components/ui/switch';
import {Calendar} from '@/components/ui/calendar';
import {Popover,PopoverContent,PopoverTrigger} from '@/components/ui/popover';
import {ToggleGroup,ToggleGroupItem} from '@/components/ui/toggle-group';
import {Drawer,DrawerContent,DrawerHeader,DrawerTitle,DrawerDescription,DrawerFooter} from '@/components/ui/drawer';
import {Choice} from '@/shared/ui/fields';
import {capacityOptions,legend} from '../lib/labels';

export type RoomQuery={date:string;site:string;building:string;cap:number;tv:boolean};
type Props={query:RoomQuery;sites:Site[];buildings:Building[];today:string;maxDate:string;onChange:(patch:Partial<RoomQuery>)=>void};
/** อาคารของฝั่งที่เลือก (ตัวกรองอาคารแสดงเมื่อเลือกฝั่งที่มีมากกว่า 1 อาคาร เช่น ฝั่ง Office) */
const buildingsOf=(site:string,buildings:Building[])=>site==='all'?[]:buildings.filter(b=>b.siteId===site).sort((a,b)=>a.sortOrder-b.sortOrder);

function DayPicker({date,today,maxDate,onChange,children}:{date:string;today:string;maxDate:string;onChange:(d:string)=>void;children:React.ReactNode}) {
 const [open,setOpen]=useState(false);
 return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild>{children}</PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" locale={th} selected={bangkokDateTime(date,'12:00')} defaultMonth={bangkokDateTime(date,'12:00')} onSelect={v=>{if(v){onChange(todayInBangkok(v));setOpen(false);}}} disabled={{after:bangkokDateTime(maxDate,'23:59')}} startMonth={bangkokDateTime(today,'12:00')}/></PopoverContent></Popover>;
}

export function DateNav({date,today,maxDate,onChange,compact=false}:{date:string;today:string;maxDate:string;onChange:(d:string)=>void;compact?:boolean}) {
 const d=bangkokDateTime(date,'12:00'),tomorrow=addDays(today,1);
 const stepper=<div className={'flex min-w-0 items-center gap-1 rounded-2xl border bg-white p-1 shadow-card '+(compact?'flex-1':'')}>
  <Button variant="ghost" size="icon" className="shrink-0" aria-label="วันก่อนหน้า" onClick={()=>onChange(addDays(date,-1))}><ChevronLeft aria-hidden/></Button>
  <DayPicker date={date} today={today} maxDate={maxDate} onChange={onChange}>
   {compact?<Button variant="ghost" className="h-auto min-h-12 min-w-0 flex-1 flex-col gap-0 px-2 py-1 leading-tight">
    <span className="flex max-w-full items-center gap-1.5 font-heading text-lg font-semibold"><CalendarDays aria-hidden className="size-5 shrink-0 text-primary"/><span className="truncate"><span className="min-[360px]:hidden">{formatDateShort(d)}</span><span className="hidden min-[360px]:inline">{formatDate(d)}</span></span></span>
    <span className="text-sm font-normal text-muted-foreground">{relativeDay(today,date)}</span><span className="sr-only"> เปิดปฏิทินเลือกวัน</span>
   </Button>
   :<Button variant="ghost" className="min-w-0 px-2 font-heading text-lg font-semibold sm:px-3"><CalendarDays aria-hidden className="shrink-0 text-primary"/><span className="truncate">{formatDateLong(d)}</span><span className="sr-only"> เปิดปฏิทินเลือกวัน</span></Button>}
  </DayPicker>
  <Button variant="ghost" size="icon" className="shrink-0" aria-label="วันถัดไป" disabled={date>=maxDate} onClick={()=>onChange(addDays(date,1))}><ChevronRight aria-hidden/></Button>
 </div>;
 if(compact)return stepper;
 return <div className="flex flex-wrap items-center gap-2">
  {stepper}
  <Button variant={date===today?'secondary':'outline'} aria-pressed={date===today} onClick={()=>onChange(today)}>วันนี้</Button>
  <Button variant={date===tomorrow?'secondary':'outline'} aria-pressed={date===tomorrow} onClick={()=>onChange(tomorrow)}>พรุ่งนี้</Button>
 </div>;
}

/** จำนวนวันจาก a ถึง b ตามปฏิทินไทย */
const dayDiff=(a:string,b:string)=>Math.round((bangkokDateTime(b,'12:00').getTime()-bangkokDateTime(a,'12:00').getTime())/86400000);
/** คำบอกวันแบบสั้นใต้วันที่ เช่น วันนี้ / พรุ่งนี้ / อีก 5 วัน */
function relativeDay(today:string,date:string) {const n=dayDiff(today,date);return n===0?'วันนี้':n===1?'พรุ่งนี้':n>1?'อีก '+n+' วัน':(-n)+' วันที่แล้ว';}

/** แถบเลือกวันบนมือถือ: 7 วันพอดีจอ (ไม่ต้องเลื่อนแนวนอน) ชุดแรกเริ่มที่วันนี้ เปลี่ยนวันด้วย ‹ › แล้วแถบเปลี่ยนเป็นชุด 7 วันถัดไปเอง */
export function DayStrip({date,today,maxDate,onChange}:{date:string;today:string;maxDate:string;onChange:(d:string)=>void}) {
 const first=addDays(today,Math.floor(dayDiff(today,date)/7)*7);
 return <div role="group" aria-label="เลือกวัน" className="grid grid-cols-7 gap-1">{Array.from({length:7},(_,i)=>addDays(first,i)).map(d=>{const p=dayParts(bangkokDateTime(d,'12:00')),on=d===date,rel=relativeDay(today,d);
  return <button key={d} type="button" aria-pressed={on} disabled={d>maxDate} aria-label={(rel==='วันนี้'||rel==='พรุ่งนี้'?rel+' ':'')+formatDateLong(bangkokDateTime(d,'12:00'))} onClick={()=>onChange(d)} className={'flex min-h-16 min-w-0 flex-col items-center justify-center rounded-2xl border transition active:scale-[.96] focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-40 '+(on?'border-primary bg-primary text-primary-foreground shadow-card':d===today?'border-primary/40 bg-accent':'bg-white')}>
   <span className={'text-sm '+(on?'text-primary-foreground/90':'text-muted-foreground')}>{p.weekday}</span>
   <span className={'font-heading text-lg font-semibold leading-tight tabular-nums '+(d<today&&!on?'text-muted-foreground':'')}>{p.day}</span>
  </button>;})}</div>;
}

function FilterControls({query,sites,buildings,onChange}:Pick<Props,'query'|'sites'|'buildings'|'onChange'>) {
 const own=buildingsOf(query.site,buildings);
 return <>
  <div>
   <p id="site-label" className="mb-2 text-sm font-medium text-muted-foreground md:sr-only">ฝั่ง</p>
   <ToggleGroup type="single" variant="outline" aria-labelledby="site-label" value={query.site} onValueChange={v=>{if(v)onChange({site:v,building:''});}} className="flex-wrap justify-start bg-white">
    <ToggleGroupItem value="all" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">ทั้งหมด</ToggleGroupItem>
    {sites.map(s=><ToggleGroupItem key={s.id} value={s.id} className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{s.name}</ToggleGroupItem>)}
   </ToggleGroup>
  </div>
  {own.length>1&&<div>
   <p id="building-label" className="mb-2 text-sm font-medium text-muted-foreground md:sr-only">อาคาร</p>
   <ToggleGroup type="single" variant="outline" aria-labelledby="building-label" value={query.building||'all'} onValueChange={v=>{if(v)onChange({building:v==='all'?'':v});}} className="flex-wrap justify-start bg-white">
    <ToggleGroupItem value="all" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">ทุกอาคาร</ToggleGroupItem>
    {own.map(b=><ToggleGroupItem key={b.id} value={b.id} className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{b.name}</ToggleGroupItem>)}
   </ToggleGroup>
  </div>}
  <div className="min-w-0 md:min-w-48"><Choice id="room-cap" label="จำนวนคน" value={String(query.cap)} onChange={v=>onChange({cap:Number(v)})} options={capacityOptions.map(o=>({...o}))}/></div>
  <label className="flex min-h-12 items-center gap-3 rounded-xl border bg-white px-4"><Switch checked={query.tv} onCheckedChange={tv=>onChange({tv})}/><Tv size={18} aria-hidden className="text-muted-foreground"/>มีจอทีวี</label>
 </>;
}

export function Legend() {
 const desktop=[['bg-status-mine border-status-mine',legend.mine],['bg-status-pending border-status-pending-border border-dashed border-2',legend.pending],['bg-status-other border-status-other-border',legend.other],['bg-white border-slate-300',legend.free]] as const;
 // มือถือ: สีเดียวกับแถบเวลาย่อในการ์ดห้อง เรียง 2×2 ไม่ล้นจอ
 const mobile=[['bg-status-mine',legend.mine],['bg-status-pending-border',legend.pending],['bg-slate-400',legend.other],['bg-success-bg ring-1 ring-inset ring-success-border','ว่าง']] as const;
 return <>
  <ul aria-label="คำอธิบายสี" className="grid w-full grid-cols-2 gap-x-3 gap-y-1.5 text-sm text-muted-foreground md:hidden">{mobile.map(([cls,label])=><li key={label} className="flex min-w-0 items-center gap-2"><span aria-hidden className={'h-3 w-6 shrink-0 rounded-full '+cls}/>{label}</li>)}</ul>
  <ul aria-label="คำอธิบายสี" className="hidden flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground md:flex">{desktop.map(([cls,label])=><li key={label} className="flex shrink-0 items-center gap-2 whitespace-nowrap"><span aria-hidden className={'inline-block h-4 w-7 rounded border '+cls}/>{label}</li>)}</ul>
 </>;
}

export function RoomFilters({query,sites,buildings,today,maxDate,onChange}:Props) {
 const [open,setOpen]=useState(false);
 const count=(query.site!=='all'?1:0)+(query.building?1:0)+(query.cap?1:0)+(query.tv?1:0);
 return <div className="space-y-4">
  <div className="hidden md:block"><DateNav date={query.date} today={today} maxDate={maxDate} onChange={date=>onChange({date})}/></div>
  <div className="hidden md:flex flex-wrap items-end gap-3"><FilterControls query={query} sites={sites} buildings={buildings} onChange={onChange}/></div>
  <div className="space-y-3 md:hidden">
   {/* มือถือ: ‹ วันที่ (แตะเปิดปฏิทิน) › → แถบ 7 วันพอดีจอ → สรุปตัวกรองที่ใช้ + ปุ่มตัวกรอง */}
   <DateNav compact date={query.date} today={today} maxDate={maxDate} onChange={date=>onChange({date})}/>
   <DayStrip date={query.date} today={today} maxDate={maxDate} onChange={date=>onChange({date})}/>
   <div className="flex items-center justify-between gap-2">
    <p className="min-w-0 truncate text-sm text-muted-foreground">{[query.site==='all'?'ทุกฝั่ง':sites.find(x=>x.id===query.site)?.name,buildings.find(b=>b.id===query.building)?.name,query.cap?capacityOptions.find(o=>o.value===String(query.cap))?.label:'',query.tv?'มีจอทีวี':''].filter(Boolean).join(' · ')}</p>
    <Button variant="outline" className="h-12 shrink-0 gap-1.5 rounded-full bg-white px-4 shadow-card" onClick={()=>setOpen(true)}><SlidersHorizontal aria-hidden className="size-5"/>ตัวกรอง{count>0&&<span aria-hidden className="grid min-w-6 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground tabular-nums">{count}</span>}<span className="sr-only"> ({count})</span></Button>
   </div>
   <Drawer open={open} onOpenChange={setOpen}><DrawerContent><DrawerHeader className="text-left"><DrawerTitle className="font-heading text-xl">ตัวกรอง</DrawerTitle><DrawerDescription>เลือกฝั่ง อาคาร จำนวนคน และจอทีวี</DrawerDescription></DrawerHeader><div className="space-y-5 overflow-y-auto overscroll-contain px-4 scrollbar-thin"><FilterControls query={query} sites={sites} buildings={buildings} onChange={onChange}/></div><DrawerFooter className="flex-row pb-[max(1rem,env(safe-area-inset-bottom))]"><Button variant="outline" className="flex-1" onClick={()=>onChange({site:'all',building:'',cap:0,tv:false})}>ล้างตัวกรอง</Button><Button className="flex-1" onClick={()=>setOpen(false)}>ดูผลลัพธ์</Button></DrawerFooter></DrawerContent></Drawer>
  </div>
 </div>;
}
