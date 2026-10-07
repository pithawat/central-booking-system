'use client';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {Popover,PopoverContent,PopoverTrigger} from '@/components/ui/popover';
import {Calendar} from '@/components/ui/calendar';
import {Button} from '@/components/ui/button';
import {CalendarDays} from 'lucide-react';
import {th} from 'date-fns/locale';
import {formatDate,bangkokDateTime,todayInBangkok} from '@/shared/lib/datetime';
export function Choice({id,value,onChange,options,label}:{id:string;value:string;onChange:(v:string)=>void;options:{value:string;label:string;disabled?:boolean}[];label:string}) {return <div><label className="block mb-2" htmlFor={id}>{label}</label><Select value={value} onValueChange={onChange}><SelectTrigger id={id} className="w-full h-12"><SelectValue/></SelectTrigger><SelectContent>{options.map(o=><SelectItem key={o.value} value={o.value} disabled={o.disabled}>{o.label}</SelectItem>)}</SelectContent></Select></div>;}
export function DatePicker({value,onChange,label='วันที่',id='date',max}:{value:string;onChange:(v:string)=>void;label?:string;id?:string;max?:string}) {
 const d=bangkokDateTime(value,'12:00');
 return <div><label className="block mb-2" htmlFor={id}>{label}</label><Popover><PopoverTrigger asChild><Button id={id} variant="outline"><CalendarDays aria-hidden/>{formatDate(d)}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" locale={th} selected={d} onSelect={v=>{if(v)onChange(todayInBangkok(v));}} disabled={max?{after:bangkokDateTime(max,'23:59')}:undefined}/></PopoverContent></Popover></div>;
}

