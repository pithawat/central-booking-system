'use client';
import {useState,useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {toast} from 'sonner';
import {th} from 'date-fns/locale';
import {Users,CalendarDays,ArrowRight,KeyRound,CalendarClock,CarFront,TriangleAlert} from 'lucide-react';
import type {Car,CarType} from '@/shared/data/types';
import type {CarAvailability} from '@/shared/data/contracts';
import {appConfig} from '@/shared/config/app.config';
import {bangkokDateTime,formatDate,formatDateShort,formatTime,formatDuration,timeOptions,addDays,todayInBangkok} from '@/shared/lib/datetime';
import {millis} from '@/shared/lib/intervals';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Calendar} from '@/components/ui/calendar';
import {Popover,PopoverContent,PopoverTrigger} from '@/components/ui/popover';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {RadioGroup,RadioGroupItem} from '@/components/ui/radio-group';
import {Spinner} from '@/components/ui/spinner';
import {ResponsivePanel} from '@/shared/ui/responsive-panel';
import {EmptyState} from '@/shared/ui/empty-state';
import {carTypeLabels} from '../lib/labels';
import {createCar} from '../actions';
import {CarPhoto,LicensePlate} from './car-visual';

const formSchema=z.object({purpose:z.string().trim().min(1,'กรุณากรอกวัตถุประสงค์').max(200),destination:z.string().trim().min(1,'กรุณากรอกปลายทาง').max(200),driverName:z.string().optional()});
export type CarQuery={date:string;start:string;end:string;endDate:string;type:string};
const cfg=appConfig.car,times=timeOptions(cfg.timeOptionsStart,cfg.timeOptionsEnd,cfg.slotMinutes);
/** ระยะเวลาแบบ "2 วัน 4 ชม." */
export function spanLabel(minutes:number) {const d=Math.floor(minutes/1440),rest=minutes%1440;return [d?d+' วัน':'',rest||!d?formatDuration(rest):''].filter(Boolean).join(' ');}
const dayDiff=(a:string,b:string)=>Math.round((millis(bangkokDateTime(b,'12:00'))-millis(bangkokDateTime(a,'12:00')))/86400000);

function DateTimeField({label,icon:Icon,date,time,onDate,onTime,min,max,id}:{label:string;icon:typeof CalendarDays;date:string;time:string;onDate:(d:string)=>void;onTime:(t:string)=>void;min:string;max:string;id:string}) {
 const [open,setOpen]=useState(false),d=bangkokDateTime(date,'12:00');
 return <fieldset className="min-w-0 rounded-2xl border bg-white p-3">
  <legend className="sr-only">{label}</legend>
  <p className="mb-2 flex items-center gap-2 px-1 font-medium"><Icon aria-hidden className="size-5 text-primary"/>{label}</p>
  <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-2 sm:grid-cols-[minmax(0,1fr)_6.5rem]">
   <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button id={id+'-date'} variant="outline" className="min-w-0 justify-start overflow-hidden px-3 font-heading"><span className="sr-only">วัน{label} </span><span className="truncate"><span className="min-[400px]:hidden">{formatDateShort(d)}</span><span className="hidden min-[400px]:inline">{formatDate(d)}</span></span></Button></PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" locale={th} selected={d} defaultMonth={d} onSelect={v=>{if(v){onDate(todayInBangkok(v));setOpen(false);}}} disabled={{before:bangkokDateTime(min,'12:00'),after:bangkokDateTime(max,'12:00')}}/></PopoverContent></Popover>
   <Select value={time} onValueChange={onTime}><SelectTrigger id={id+'-time'} aria-label={'เวลา'+label} className="w-full font-heading tabular-nums"><SelectValue/></SelectTrigger><SelectContent>{times.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
  </div>
 </fieldset>;
}

function CarCard({item:{car,available,busyUntil},onPick,start}:{item:CarAvailability;onPick:(c:Car)=>void;start:string}) {
 const busy=busyUntil?'ไม่ว่าง · ว่างหลัง '+(todayInBangkok(busyUntil)===todayInBangkok(start)?'':formatDate(busyUntil)+' ')+formatTime(busyUntil):'ไม่ว่าง · ยังไม่ถูกคืน';
 return <button type="button" disabled={!available} onClick={()=>onPick(car)} aria-label={(available?'จองรถ ':'')+'ทะเบียน '+car.plate+' · '+car.model+' · '+(available?'ว่าง':busy)}
  className={'group flex w-full overflow-hidden rounded-[1.25rem] border text-left transition sm:flex-col '+(available?'bg-white shadow-card surface-interactive':'cursor-not-allowed bg-slate-50')}>
  <CarPhoto car={car} className={'aspect-[4/3] w-[38%] shrink-0 sm:aspect-[16/9] sm:w-full '+(available?'':'opacity-50 grayscale')}/>
  <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:p-4">
   <div className="flex items-start justify-between gap-2"><LicensePlate plate={car.plate} size="lg" className={available?'':'opacity-70'}/><span className="hidden whitespace-nowrap text-sm text-muted-foreground sm:inline">รถ #{car.number}</span></div>
   <p className="flex min-w-0 items-baseline gap-1.5"><span className="truncate font-medium">{car.model}</span><span className="shrink-0 text-sm text-muted-foreground sm:hidden">#{car.number}</span></p>
   <p className="text-sm text-muted-foreground"><Users size={15} aria-hidden className="mr-1 inline align-[-2px]"/>{carTypeLabels[car.type as CarType]} · {car.seats} ที่นั่ง</p>
   <p className={'mt-auto w-fit rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 '+(available?'bg-success-bg text-success ring-success-border':'bg-status-other text-status-other-foreground ring-status-other-border')}>{available?'ว่าง':busy}</p>
  </div>
 </button>;
}

export function CarSearch({query,cars,today}:{query:CarQuery;cars:CarAvailability[];today:string}) {
 const router=useRouter(),[selected,setSelected]=useState<Car|null>(null),[other,setOther]=useState(false),[pending,startTransition]=useTransition(),[loading,startLoading]=useTransition(),[error,setError]=useState('');
 const form=useForm<z.infer<typeof formSchema>>({resolver:zodResolver(formSchema),defaultValues:{purpose:'',destination:'',driverName:''}});
 const update=(patch:Partial<CarQuery>)=>startLoading(()=>router.replace('/cars?'+new URLSearchParams({...query,...patch}),{scroll:false}));
 const start=bangkokDateTime(query.date,query.start).toISOString(),end=bangkokDateTime(query.endDate,query.end).toISOString(),minutes=Math.round((millis(end)-millis(start))/60000);
 const problem=minutes<=0?'เวลาคืนรถต้องหลังเวลารับรถ':minutes>cfg.maxBookingDays*1440?'จองได้ไม่เกิน '+cfg.maxBookingDays+' วัน':minutes<cfg.minBookingMinutes?'จองได้อย่างน้อย '+cfg.minBookingMinutes+' นาที':null;
 const changeDate=(date:string)=>{const shift=dayDiff(query.date,date);update({date,endDate:addDays(query.endDate,shift)});};
 const presets=[...cfg.presets.map(p=>({label:p.label,detail:p.start+'–'+p.end,patch:{start:p.start,end:p.end,endDate:query.date}})),...cfg.dayPresets.map(n=>({label:n===7?'1 สัปดาห์':n+' วัน',detail:'ถึง '+formatDate(bangkokDateTime(addDays(query.date,n-1),'12:00')).split(' ').slice(0,3).join(' '),patch:{endDate:addDays(query.date,n-1),end:cfg.defaultReturn.time}}))];
 const isOn=(p:Partial<CarQuery>)=>Object.entries(p).every(([k,v])=>query[k as keyof CarQuery]===v);
 const free=cars.filter(c=>c.available).length;
 const submit=form.handleSubmit(values=>{if(other&&!values.driverName?.trim()){form.setError('driverName',{message:'กรุณากรอกชื่อผู้ขับ'});return;}startTransition(async()=>{if(!selected)return;setError('');const result=await createCar({carId:selected.id,start,end,...values,driverName:other?values.driverName:null});if(!result.ok){if(result.error.code==='CONFLICT'){setSelected(null);toast.error('รถคันนี้เพิ่งถูกจองไป เลือกคันอื่น');router.refresh();}else setError(result.error.message);}else router.push('/cars/bookings/'+result.data.id+'?new=1');});});
 return <>
  <section aria-labelledby="when-title" className="surface mb-6 p-4 sm:p-6">
   <h2 id="when-title" className="mb-3 text-xl">ช่วงเวลาที่ใช้รถ</h2>
   <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
    <DateTimeField id="pickup" label="รับรถ" icon={KeyRound} date={query.date} time={query.start} min={today} max={addDays(today,365)} onDate={changeDate} onTime={start=>update({start})}/>
    <ArrowRight aria-hidden className="mx-auto hidden text-muted-foreground md:block"/>
    <DateTimeField id="return" label="คืนรถ" icon={CalendarClock} date={query.endDate} time={query.end} min={query.date} max={addDays(query.date,cfg.maxBookingDays)} onDate={endDate=>update({endDate})} onTime={end=>update({end})}/>
   </div>
   <p aria-live="polite" className={'mt-3 flex items-center gap-2 font-medium '+(problem?'text-overdue':'text-foreground')}>{problem?<><TriangleAlert aria-hidden className="size-5"/>{problem}</>:<><CalendarDays aria-hidden className="size-5 text-primary"/>รวม {spanLabel(minutes)}</>}</p>
   <div className="-mx-4 mt-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
    <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">{presets.map(p=><button key={p.label} type="button" aria-pressed={isOn(p.patch)} onClick={()=>update(p.patch)} className={'min-h-12 rounded-full border px-4 text-left leading-tight transition focus-visible:ring-[3px] focus-visible:ring-ring '+(isOn(p.patch)?'border-primary bg-primary text-primary-foreground':'bg-white hover:border-primary/60')}><span className="block font-medium">{p.label}</span><span className={'block text-sm '+(isOn(p.patch)?'text-primary-foreground/85':'text-muted-foreground')}>{p.detail}</span></button>)}</div>
   </div>
  </section>

  <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
   <h2 className="text-xl">เลือกรถ</h2>
   {!problem&&<p className="text-muted-foreground" aria-live="polite">{loading?'กำลังค้นหา…':'ว่าง '+free+' จาก '+cars.length+' คัน'}</p>}
  </div>
  <div role="group" aria-label="ประเภทรถ" className="-mx-4 mb-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
   <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">{[['','ทั้งหมด'],...Object.entries(carTypeLabels)].map(([value,label])=><button key={value} type="button" aria-pressed={query.type===value} onClick={()=>update({type:value})} className={'min-h-11 whitespace-nowrap rounded-full border px-4 font-medium transition focus-visible:ring-[3px] focus-visible:ring-ring '+(query.type===value?'border-primary bg-primary text-primary-foreground':'bg-white hover:border-primary/60')}>{label}</button>)}</div>
  </div>
  <div className={loading?'opacity-60 transition-opacity':'transition-opacity'}>
   {problem?<EmptyState icon={TriangleAlert} title={problem} description="ปรับวันเวลารับหรือคืนรถด้านบน"/>
   :cars.length?<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">{cars.map(item=><CarCard key={item.car.id} item={item} start={start} onPick={c=>{setSelected(c);setError('');}}/>)}</div>
   :<EmptyState icon={CarFront} title="ไม่มีรถประเภทนี้"/>}
  </div>

  <ResponsivePanel open={!!selected} onOpenChange={v=>{if(!v)setSelected(null);}} title={'จองรถ #'+(selected?.number??'')} description={selected?selected.model+' · ทะเบียน '+selected.plate:undefined}>
   {selected&&<form onSubmit={submit} className="space-y-5">
    <div className="flex items-center gap-3 rounded-2xl border bg-muted/40 p-3">
     <CarPhoto car={selected} className="aspect-[4/3] w-24 shrink-0 rounded-xl min-[360px]:w-28"/>
     <div className="min-w-0 space-y-1"><LicensePlate plate={selected.plate} size="lg"/><p className="truncate text-muted-foreground">{selected.model}</p></div>
    </div>
    <dl className="grid grid-cols-2 gap-2">
     <div className="rounded-2xl bg-accent/60 p-3"><dt className="text-sm text-muted-foreground">รับรถ</dt><dd className="font-heading font-semibold">{formatDate(start)}<span className="block text-xl tabular-nums">{formatTime(start)}</span></dd></div>
     <div className="rounded-2xl bg-accent/60 p-3"><dt className="text-sm text-muted-foreground">คืนรถ</dt><dd className="font-heading font-semibold">{formatDate(end)}<span className="block text-xl tabular-nums">{formatTime(end)}</span></dd></div>
    </dl>
    <p className="-mt-2 text-sm text-muted-foreground">รวม {spanLabel(minutes)}</p>
    <div><label htmlFor="purpose" className="mb-1.5 block font-medium">วัตถุประสงค์</label><Input id="purpose" placeholder="พบลูกค้า, ส่งเอกสาร" maxLength={200} {...form.register('purpose')}/><p className="mt-1 text-sm text-destructive">{form.formState.errors.purpose?.message}</p></div>
    <div><label htmlFor="destination" className="mb-1.5 block font-medium">ปลายทาง</label><Input id="destination" placeholder="บริษัทลูกค้า ย่านบางนา" maxLength={200} {...form.register('destination')}/><p className="mt-1 text-sm text-destructive">{form.formState.errors.destination?.message}</p></div>
    <fieldset><legend className="mb-2 font-medium">ผู้ขับ</legend><RadioGroup value={other?'other':'me'} onValueChange={v=>setOther(v==='other')} className="grid grid-cols-2 gap-2">
     {[['me','ฉันขับเอง'],['other','คนอื่นขับ']].map(([v,l])=><label key={v} className={'flex min-h-12 items-center gap-3 rounded-xl border px-3 '+((v==='other')===other?'border-primary bg-accent':'bg-white')}><RadioGroupItem value={v}/>{l}</label>)}
    </RadioGroup></fieldset>
    {other&&<div><label htmlFor="driver" className="mb-1.5 block font-medium">ชื่อผู้ขับ</label><Input id="driver" {...form.register('driverName')}/><p className="mt-1 text-sm text-destructive">{form.formState.errors.driverName?.message}</p></div>}
    {error&&<p role="alert" className="rounded-xl border border-overdue-border bg-overdue-bg p-3 text-overdue">{error}</p>}
    <div className="sticky bottom-0 -mx-4 border-t bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0"><Button type="submit" size="lg" className="w-full" disabled={pending}>{pending?<><Spinner/>กำลังจอง…</>:'ยืนยันการจอง'}</Button></div>
   </form>}
  </ResponsivePanel>
 </>;
}
