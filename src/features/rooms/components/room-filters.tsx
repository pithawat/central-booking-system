'use client';
import {useState} from 'react';
import {ChevronLeft,ChevronRight,ChevronDown,CalendarDays,SlidersHorizontal,Tv} from 'lucide-react';
import {th} from 'date-fns/locale';
import type {Site} from '@/shared/data/types';
import {addDays,bangkokDateTime,formatDate,formatDateLong,formatDateShort,dayParts,todayInBangkok} from '@/shared/lib/datetime';
import {Button} from '@/components/ui/button';
import {Switch} from '@/components/ui/switch';
import {Calendar} from '@/components/ui/calendar';
import {Popover,PopoverContent,PopoverTrigger} from '@/components/ui/popover';
import {ToggleGroup,ToggleGroupItem} from '@/components/ui/toggle-group';
import {Drawer,DrawerContent,DrawerHeader,DrawerTitle,DrawerDescription,DrawerFooter} from '@/components/ui/drawer';
import {Choice} from '@/shared/ui/fields';
import {capacityOptions,legend} from '../lib/labels';

export type RoomQuery={date:string;site:string;cap:number;tv:boolean};
type Props={query:RoomQuery;sites:Site[];today:string;maxDate:string;onChange:(patch:Partial<RoomQuery>)=>void};

function DayPicker({date,today,maxDate,onChange,children}:{date:string;today:string;maxDate:string;onChange:(d:string)=>void;children:React.ReactNode}) {
 const [open,setOpen]=useState(false);
 return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild>{children}</PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" locale={th} selected={bangkokDateTime(date,'12:00')} defaultMonth={bangkokDateTime(date,'12:00')} onSelect={v=>{if(v){onChange(todayInBangkok(v));setOpen(false);}}} disabled={{after:bangkokDateTime(maxDate,'23:59')}} startMonth={bangkokDateTime(today,'12:00')}/></PopoverContent></Popover>;
}

export function DateNav({date,today,maxDate,onChange,compact=false}:{date:string;today:string;maxDate:string;onChange:(d:string)=>void;compact?:boolean}) {
 const d=bangkokDateTime(date,'12:00'),tomorrow=addDays(today,1);
 const stepper=<div className={'flex min-w-0 items-center gap-1 rounded-2xl border bg-white p-1 shadow-card '+(compact?'flex-1':'')}>
  <Button variant="ghost" size="icon" className="shrink-0" aria-label="วันก่อนหน้า" onClick={()=>onChange(addDays(date,-1))}><ChevronLeft aria-hidden/></Button>
  <DayPicker date={date} today={today} maxDate={maxDate} onChange={onChange}>
   <Button variant="ghost" className={'min-w-0 px-2 font-heading text-lg font-semibold sm:px-3 '+(compact?'flex-1':'')}><CalendarDays aria-hidden className="shrink-0 text-primary"/><span className="truncate">{compact?formatDateShort(d):formatDateLong(d)}</span><span className="sr-only"> เปิดปฏิทินเลือกวัน</span></Button>
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

/** แถบเลือกวันแบบแอปบนมือถือ: เลื่อนแนวนอน 14 วัน แตะครั้งเดียวเปลี่ยนวัน */
export function DayStrip({date,today,maxDate,onChange}:{date:string;today:string;maxDate:string;onChange:(d:string)=>void}) {
 const first=date<today||date>addDays(today,13)?date:today;
 const days=Array.from({length:14},(_,i)=>addDays(first,i)).filter(d=>d<=maxDate);
 return <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-thin" role="group" aria-label="เลือกวัน">
  <div className="flex w-max gap-2">{days.map(d=>{const p=dayParts(bangkokDateTime(d,'12:00')),on=d===date,label=d===today?'วันนี้':d===addDays(today,1)?'พรุ่งนี้':p.weekday;
   return <button key={d} type="button" aria-pressed={on} aria-label={formatDateLong(bangkokDateTime(d,'12:00'))} onClick={()=>onChange(d)} className={'flex min-h-16 w-16 flex-col items-center justify-center rounded-2xl border transition focus-visible:ring-[3px] focus-visible:ring-ring '+(on?'border-primary bg-primary text-primary-foreground shadow-card':'bg-white')}>
    <span className={'text-sm '+(on?'text-primary-foreground/90':'text-muted-foreground')}>{label}</span><span className="font-heading text-xl font-semibold leading-tight tabular-nums">{p.day}</span>
   </button>;})}</div>
 </div>;
}

function FilterControls({query,sites,onChange}:Pick<Props,'query'|'sites'|'onChange'>) {
 return <>
  <div>
   <p id="site-label" className="mb-2 text-sm font-medium text-muted-foreground md:sr-only">ฝั่ง</p>
   <ToggleGroup type="single" variant="outline" aria-labelledby="site-label" value={query.site} onValueChange={v=>{if(v)onChange({site:v});}} className="flex-wrap justify-start bg-white">
    <ToggleGroupItem value="all" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">ทั้งหมด</ToggleGroupItem>
    {sites.map(s=><ToggleGroupItem key={s.id} value={s.id} className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{s.name}</ToggleGroupItem>)}
   </ToggleGroup>
  </div>
  <div className="min-w-0 md:min-w-48"><Choice id="room-cap" label="จำนวนคน" value={String(query.cap)} onChange={v=>onChange({cap:Number(v)})} options={capacityOptions.map(o=>({...o}))}/></div>
  <label className="flex min-h-12 items-center gap-3 rounded-xl border bg-white px-4"><Switch checked={query.tv} onCheckedChange={tv=>onChange({tv})}/><Tv size={18} aria-hidden className="text-muted-foreground"/>มีจอทีวี</label>
 </>;
}

export function Legend() {
 const items=[['bg-status-mine border-status-mine',legend.mine],['bg-status-pending border-status-pending-border border-dashed border-2',legend.pending],['bg-status-other border-status-other-border',legend.other],['bg-white border-slate-300',legend.free]] as const;
 return <ul aria-label="คำอธิบายสี" className="-mx-4 flex gap-x-4 gap-y-2 overflow-x-auto px-4 text-sm text-muted-foreground scrollbar-thin md:mx-0 md:flex-wrap md:gap-x-5 md:overflow-visible md:px-0">{items.map(([cls,label])=><li key={label} className="flex shrink-0 items-center gap-2 whitespace-nowrap"><span aria-hidden className={'inline-block h-4 w-7 rounded border '+cls}/>{label}</li>)}</ul>;
}

export function RoomFilters({query,sites,today,maxDate,onChange}:Props) {
 const [open,setOpen]=useState(false);
 const count=(query.site!=='all'?1:0)+(query.cap?1:0)+(query.tv?1:0);
 return <div className="space-y-4">
  <div className="hidden md:block"><DateNav date={query.date} today={today} maxDate={maxDate} onChange={date=>onChange({date})}/></div>
  <div className="hidden md:flex flex-wrap items-end gap-3"><FilterControls query={query} sites={sites} onChange={onChange}/></div>
  <div className="space-y-3 md:hidden">
   {/* มือถือ: ปุ่มวันที่เต็มแถว (เปิดปฏิทิน) → แถบเลือกวัน → สรุปตัวกรองที่ใช้ + ปุ่มตัวกรอง */}
   <DayPicker date={query.date} today={today} maxDate={maxDate} onChange={date=>onChange({date})}>
    <Button variant="outline" className="h-12 w-full justify-start rounded-2xl bg-white px-3 font-heading text-lg font-semibold shadow-card"><CalendarDays aria-hidden className="shrink-0 text-primary"/><span className="truncate"><span className="min-[400px]:hidden">{formatDate(bangkokDateTime(query.date,'12:00'))}</span><span className="hidden min-[400px]:inline">{formatDateLong(bangkokDateTime(query.date,'12:00'))}</span></span><ChevronDown aria-hidden className="ml-auto shrink-0 text-muted-foreground"/><span className="sr-only"> เปิดปฏิทินเลือกวัน</span></Button>
   </DayPicker>
   <DayStrip date={query.date} today={today} maxDate={maxDate} onChange={date=>onChange({date})}/>
   <div className="flex items-center justify-between gap-2">
    <p className="min-w-0 truncate text-sm text-muted-foreground">{[query.site==='all'?'ทุกฝั่ง':sites.find(x=>x.id===query.site)?.name,query.cap?capacityOptions.find(o=>o.value===String(query.cap))?.label:'',query.tv?'มีจอทีวี':''].filter(Boolean).join(' · ')}</p>
    <Button variant="outline" className="h-12 shrink-0 gap-1.5 rounded-full bg-white px-4 shadow-card" onClick={()=>setOpen(true)}><SlidersHorizontal aria-hidden className="size-5"/>ตัวกรอง{count>0&&<span aria-hidden className="grid min-w-6 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground tabular-nums">{count}</span>}<span className="sr-only"> ({count})</span></Button>
   </div>
   <Drawer open={open} onOpenChange={setOpen}><DrawerContent><DrawerHeader className="text-left"><DrawerTitle className="font-heading text-xl">ตัวกรอง</DrawerTitle><DrawerDescription>เลือกฝั่ง จำนวนคน และจอทีวี</DrawerDescription></DrawerHeader><div className="space-y-5 px-4"><FilterControls query={query} sites={sites} onChange={onChange}/></div><DrawerFooter className="flex-row pb-[max(1rem,env(safe-area-inset-bottom))]"><Button variant="outline" className="flex-1" onClick={()=>onChange({site:'all',cap:0,tv:false})}>ล้างตัวกรอง</Button><Button className="flex-1" onClick={()=>setOpen(false)}>ดูผลลัพธ์</Button></DrawerFooter></DrawerContent></Drawer>
  </div>
 </div>;
}
