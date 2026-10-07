'use client';
import {useState} from 'react';
import {ChevronLeft,ChevronRight,CalendarDays,SlidersHorizontal,Tv} from 'lucide-react';
import {th} from 'date-fns/locale';
import type {Site} from '@/shared/data/types';
import {addDays,bangkokDateTime,formatDate,formatDateLong,todayInBangkok} from '@/shared/lib/datetime';
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
 return <div className="flex flex-wrap items-center gap-2">
  <div className="flex items-center gap-1 rounded-2xl border bg-white p-1 shadow-card">
   <Button variant="ghost" size="icon" aria-label="วันก่อนหน้า" onClick={()=>onChange(addDays(date,-1))}><ChevronLeft aria-hidden/></Button>
   <DayPicker date={date} today={today} maxDate={maxDate} onChange={onChange}>
    <Button variant="ghost" className="min-w-0 px-3 font-heading text-lg font-semibold"><CalendarDays aria-hidden className="text-primary"/><span className="truncate">{compact?formatDate(d):formatDateLong(d)}</span><span className="sr-only"> เปิดปฏิทินเลือกวัน</span></Button>
   </DayPicker>
   <Button variant="ghost" size="icon" aria-label="วันถัดไป" disabled={date>=maxDate} onClick={()=>onChange(addDays(date,1))}><ChevronRight aria-hidden/></Button>
  </div>
  <Button variant={date===today?'secondary':'outline'} aria-pressed={date===today} onClick={()=>onChange(today)}>วันนี้</Button>
  <Button variant={date===tomorrow?'secondary':'outline'} aria-pressed={date===tomorrow} onClick={()=>onChange(tomorrow)}>พรุ่งนี้</Button>
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
  <div className="min-w-48"><Choice id="room-cap" label="จำนวนคน" value={String(query.cap)} onChange={v=>onChange({cap:Number(v)})} options={capacityOptions.map(o=>({...o}))}/></div>
  <label className="flex min-h-12 items-center gap-3 rounded-xl border bg-white px-4"><Switch checked={query.tv} onCheckedChange={tv=>onChange({tv})}/><Tv size={18} aria-hidden className="text-muted-foreground"/>มีจอทีวี</label>
 </>;
}

export function Legend() {
 const items=[['bg-status-mine border-status-mine',legend.mine],['bg-status-pending border-status-pending-border border-dashed border-2',legend.pending],['bg-status-other border-status-other-border',legend.other],['bg-white border-slate-300',legend.free]] as const;
 return <ul aria-label="คำอธิบายสี" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">{items.map(([cls,label])=><li key={label} className="flex items-center gap-2"><span aria-hidden className={'inline-block h-4 w-7 rounded border '+cls}/>{label}</li>)}</ul>;
}

export function RoomFilters({query,sites,today,maxDate,onChange}:Props) {
 const [open,setOpen]=useState(false);
 const count=(query.site!=='all'?1:0)+(query.cap?1:0)+(query.tv?1:0);
 return <div className="space-y-4">
  <div className="hidden md:block"><DateNav date={query.date} today={today} maxDate={maxDate} onChange={date=>onChange({date})}/></div>
  <div className="md:hidden"><DateNav compact date={query.date} today={today} maxDate={maxDate} onChange={date=>onChange({date})}/></div>
  <div className="hidden md:flex flex-wrap items-end gap-3"><FilterControls query={query} sites={sites} onChange={onChange}/></div>
  <div className="md:hidden">
   <Button variant="outline" className="w-full justify-center" onClick={()=>setOpen(true)}><SlidersHorizontal aria-hidden/>ตัวกรอง ({count})</Button>
   <Drawer open={open} onOpenChange={setOpen}><DrawerContent><DrawerHeader className="text-left"><DrawerTitle className="font-heading text-xl">ตัวกรอง</DrawerTitle><DrawerDescription>เลือกฝั่ง จำนวนคน และจอทีวี</DrawerDescription></DrawerHeader><div className="space-y-5 px-4"><FilterControls query={query} sites={sites} onChange={onChange}/></div><DrawerFooter className="flex-row"><Button variant="outline" className="flex-1" onClick={()=>onChange({site:'all',cap:0,tv:false})}>ล้างตัวกรอง</Button><Button className="flex-1" onClick={()=>setOpen(false)}>ดูผลลัพธ์</Button></DrawerFooter></DrawerContent></Drawer>
  </div>
 </div>;
}
