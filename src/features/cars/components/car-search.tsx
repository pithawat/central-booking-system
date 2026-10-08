'use client';
import {useState,useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {toast} from 'sonner';
import {th} from 'date-fns/locale';
import {Users,CalendarDays,ArrowRight,KeyRound,CalendarClock,CarFront,TriangleAlert,MapPinned} from 'lucide-react';
import type {Car,CarType} from '@/shared/data/types';
import type {CarAvailability} from '@/shared/data/contracts';
import {appConfig} from '@/shared/config/app.config';
import {bangkokDateTime,formatDate,formatDateLong,formatDateShort,formatTime,formatDuration,timeOptions,addDays,todayInBangkok,dayParts} from '@/shared/lib/datetime';
import {millis} from '@/shared/lib/intervals';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Calendar} from '@/components/ui/calendar';
import {Popover,PopoverContent,PopoverTrigger} from '@/components/ui/popover';
import {RadioGroup,RadioGroupItem} from '@/components/ui/radio-group';
import {Spinner} from '@/components/ui/spinner';
import {ResponsivePanel} from '@/shared/ui/responsive-panel';
import {EmptyState} from '@/shared/ui/empty-state';
import {useNow} from '@/shared/ui/clock-provider';
import {carTypeLabels,carTypeShortLabels} from '../lib/labels';
import {createCar} from '../actions';
import {CarPhoto,LicensePlate} from './car-visual';
import {TimePicker} from './time-picker';
import {placeLabel,placeSite,type CarPlace,type CarPlaces} from '../lib/places';

const formSchema=z.object({purpose:z.string().trim().min(1,'กรุณากรอกวัตถุประสงค์').max(200),destination:z.string().trim().min(1,'กรุณากรอกปลายทาง').max(200),driverName:z.string().optional()});
export type CarQuery={date:string;start:string;end:string;endDate:string;type:string};
const cfg=appConfig.car,times=timeOptions(cfg.timeOptionsStart,cfg.timeOptionsEnd,cfg.slotMinutes);
/** ระยะเวลาแบบ "2 วัน 4 ชม." */
export function spanLabel(minutes:number) {const d=Math.floor(minutes/1440),rest=minutes%1440;return [d?d+' วัน':'',rest||!d?formatDuration(rest):''].filter(Boolean).join(' ');}
const dayDiff=(a:string,b:string)=>Math.round((millis(bangkokDateTime(b,'12:00'))-millis(bangkokDateTime(a,'12:00')))/86400000);

function DateTimeField({label,icon:Icon,date,time,onDate,onTime,min,max,id,context,timeOff}:{label:string;icon:typeof CalendarDays;date:string;time:string;onDate:(d:string)=>void;onTime:(t:string)=>void;min:string;max:string;id:string;context:string;timeOff:(t:string)=>boolean}) {
 const [open,setOpen]=useState(false),d=bangkokDateTime(date,'12:00');
 return <fieldset className="min-w-0 rounded-2xl border bg-white p-3">
  <legend className="sr-only">{label}</legend>
  <p className="mb-2 flex items-center gap-2 px-1 font-medium"><Icon aria-hidden className="size-5 text-primary"/>{label}</p>
  <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-2 sm:grid-cols-[minmax(0,1fr)_6.5rem]">
   <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button id={id+'-date'} variant="outline" className="min-w-0 justify-start overflow-hidden px-3 font-heading"><span className="sr-only">วัน{label} </span><span className="truncate"><span className="min-[400px]:hidden">{formatDateShort(d)}</span><span className="hidden min-[400px]:inline">{formatDate(d)}</span></span></Button></PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" locale={th} selected={d} defaultMonth={d} onSelect={v=>{if(v){onDate(todayInBangkok(v));setOpen(false);}}} disabled={{before:bangkokDateTime(min,'12:00'),after:bangkokDateTime(max,'12:00')}}/></PopoverContent></Popover>
   <TimePicker id={id+'-time'} label={label} context={context} value={time} times={times} isDisabled={timeOff} onChange={onTime}/>
  </div>
 </fieldset>;
}

/** การ์ดรถ: รูปเต็มความกว้าง ป้ายสถานะและเลขรถวางบนรูป ทะเบียนเป็นข้อมูลหลัก มือถือเรียง 2 คอลัมน์ */
function CarCard({item:{car,available,busyUntil},onPick,start,place}:{item:CarAvailability;onPick:(c:Car)=>void;start:string;place?:CarPlace}) {
 const until=busyUntil?'ว่างหลัง '+(todayInBangkok(busyUntil)===todayInBangkok(start)?'':formatDateShort(busyUntil)+' ')+formatTime(busyUntil):'ยังไม่ถูกคืน',type=car.type as CarType;
 return <button type="button" disabled={!available} onClick={()=>onPick(car)} aria-label={(available?'จองรถ ':'')+'ทะเบียน '+car.plate+' · '+car.model+' · '+carTypeLabels[type]+' '+car.seats+' ที่นั่ง · รับ-คืนที่ '+placeLabel(place)+' · '+(available?'ว่าง':'ไม่ว่าง · '+until)}
  className={'group flex min-w-0 flex-col overflow-hidden rounded-2xl border text-left transition focus-visible:ring-[3px] focus-visible:ring-ring sm:rounded-[1.25rem] '+(available?'bg-white shadow-card surface-interactive active:scale-[.98]':'cursor-not-allowed bg-slate-50')}>
  <div className="relative">
   <CarPhoto car={car} className={'aspect-[4/3] w-full sm:aspect-[16/9] '+(available?'':'opacity-50 grayscale')}/>
   <span className={'absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold shadow-sm ring-1 '+(available?'bg-success-bg text-success ring-success-border':'bg-white text-status-other-foreground ring-status-other-border')}>{available&&<span aria-hidden className="size-2 rounded-full bg-success"/>}{available?'ว่าง':'ไม่ว่าง'}</span>
   <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-sm font-semibold tabular-nums text-slate-700 shadow-sm ring-1 ring-slate-900/5">#{car.number}</span>
  </div>
  <div className="@container flex min-w-0 flex-1 flex-col gap-1 p-2.5 sm:gap-1.5 sm:p-4">
   <LicensePlate plate={car.plate} size="card" className={'self-start '+(available?'':'opacity-70')}/>
   <p className="line-clamp-2 font-medium leading-snug">{car.model}</p>
   <p className="flex items-center gap-1 text-sm text-muted-foreground"><Users size={15} aria-hidden className="shrink-0"/><span className="min-w-0">{car.seats} ที่นั่ง · <span className="sm:hidden">{carTypeShortLabels[type]}</span><span className="hidden sm:inline">{carTypeLabels[type]}</span></span></p>
   <p className="flex items-start gap-1 text-sm text-muted-foreground"><MapPinned size={15} aria-hidden className="mt-0.5 shrink-0 text-primary"/><span className="min-w-0"><span className="hidden sm:inline">รับ-คืนที่ </span>{placeSite(place)}</span></p>
   {!available&&<p className="mt-auto pt-0.5 text-sm font-medium text-status-other-foreground">{until}</p>}
  </div>
 </button>;
}

export function CarSearch({query,cars,today,places}:{query:CarQuery;cars:CarAvailability[];today:string;places:CarPlaces}) {
 const router=useRouter(),[selected,setSelected]=useState<Car|null>(null),[other,setOther]=useState(false),[pending,startTransition]=useTransition(),[loading,startLoading]=useTransition(),[error,setError]=useState('');
 const form=useForm<z.infer<typeof formSchema>>({resolver:zodResolver(formSchema),defaultValues:{purpose:'',destination:'',driverName:''}});
 const update=(patch:Partial<CarQuery>)=>startLoading(()=>router.replace('/cars?'+new URLSearchParams({...query,...patch}),{scroll:false}));
 const start=bangkokDateTime(query.date,query.start).toISOString(),end=bangkokDateTime(query.endDate,query.end).toISOString(),minutes=Math.round((millis(end)-millis(start))/60000);
 // ช่องเวลาที่จองไม่ได้ (กฎเดียวกับฝั่งเซิร์ฟเวอร์): รับรถย้อนหลังไม่ได้ · คืนรถต้องห่างจากรับรถ 30 นาที ถึง 7 วัน
 const nowMs=useNow().getTime(),startMs=millis(start);
 const pickupOff=(t:string)=>millis(bangkokDateTime(query.date,t))<nowMs;
 const returnOff=(t:string)=>{const span=millis(bangkokDateTime(query.endDate,t))-startMs;return span<cfg.minBookingMinutes*60000||span>cfg.maxBookingDays*86400000;};
 const problem=minutes<=0?'เวลาคืนรถต้องหลังเวลารับรถ':minutes>cfg.maxBookingDays*1440?'จองได้ไม่เกิน '+cfg.maxBookingDays+' วัน':minutes<cfg.minBookingMinutes?'จองได้อย่างน้อย '+cfg.minBookingMinutes+' นาที':null;
 const changeDate=(date:string)=>{const shift=dayDiff(query.date,date);update({date,endDate:addDays(query.endDate,shift)});};
 // ปุ่มลัด: แถวแรกหลายวัน (ใช้บ่อยสุด) แถวสองภายในวันเดียว · short = ข้อความย่อให้พอดีช่องบนจอแคบกว่า 400px
 const hh=(t:string)=>t.endsWith(':00')?t.slice(0,2):t;
 const presets=[...cfg.dayPresets.map(n=>{const last=bangkokDateTime(addDays(query.date,n-1),'12:00'),d=dayParts(last);return {label:n===7?'1 สัปดาห์':n+' วัน',detail:'ถึง '+formatDateShort(last),short:'ถึง '+d.weekday+' '+d.day,patch:{endDate:addDays(query.date,n-1),end:cfg.defaultReturn.time}};}),...cfg.presets.map(p=>({label:p.label,detail:p.start+'–'+p.end,short:hh(p.start)+'–'+hh(p.end)+' น.',patch:{start:p.start,end:p.end,endDate:query.date}}))];
 const isOn=(p:Partial<CarQuery>)=>Object.entries(p).every(([k,v])=>query[k as keyof CarQuery]===v);
 const free=cars.filter(c=>c.available).length;
 const submit=form.handleSubmit(values=>{if(other&&!values.driverName?.trim()){form.setError('driverName',{message:'กรุณากรอกชื่อผู้ขับ'});return;}startTransition(async()=>{if(!selected)return;setError('');const result=await createCar({carId:selected.id,start,end,...values,driverName:other?values.driverName:null});if(!result.ok){if(result.error.code==='CONFLICT'){setSelected(null);toast.error('รถคันนี้เพิ่งถูกจองไป เลือกคันอื่น');router.refresh();}else setError(result.error.message);}else router.push('/cars/bookings/'+result.data.id+'?new=1');});});
 return <>
  <section aria-labelledby="when-title" className="surface mb-6 p-3 min-[360px]:p-4 sm:p-6">
   <h2 id="when-title" className="mb-3 text-xl">ช่วงเวลาที่ใช้รถ</h2>
   <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
    <DateTimeField id="pickup" label="รับรถ" icon={KeyRound} date={query.date} time={query.start} min={today} max={addDays(today,365)} onDate={changeDate} onTime={start=>update({start})} context={formatDateLong(bangkokDateTime(query.date,'12:00'))} timeOff={pickupOff}/>
    <ArrowRight aria-hidden className="mx-auto hidden text-muted-foreground md:block"/>
    <DateTimeField id="return" label="คืนรถ" icon={CalendarClock} date={query.endDate} time={query.end} min={query.date} max={addDays(query.date,cfg.maxBookingDays)} onDate={endDate=>update({endDate})} onTime={end=>update({end})} context={formatDateShort(bangkokDateTime(query.endDate,'12:00'))+' · รับรถ '+formatDateShort(start)+' '+formatTime(start)} timeOff={returnOff}/>
   </div>
   <p aria-live="polite" className={'mt-3 flex items-center gap-2 font-medium '+(problem?'text-overdue':'text-foreground')}>{problem?<><TriangleAlert aria-hidden className="size-5"/>{problem}</>:<><CalendarDays aria-hidden className="size-5 text-primary"/>รวม {spanLabel(minutes)}</>}</p>
   {/* ปุ่มลัดเป็นตาราง 3 ช่องพอดีจอ ไม่ต้องเลื่อนแนวนอน · จอใหญ่เรียงแถวเดียว 6 ช่อง */}
   <div role="group" aria-label="เลือกช่วงเวลาแบบเร็ว" className="mt-3 grid grid-cols-3 gap-1.5 min-[360px]:gap-2 lg:grid-cols-6">{presets.map(p=>{const on=isOn(p.patch);return <button key={p.label} type="button" aria-pressed={on} onClick={()=>update(p.patch)} className={'flex min-h-14 min-w-0 flex-col items-center justify-center rounded-xl border px-1 py-1.5 text-center min-[360px]:px-1.5 leading-tight transition active:scale-[.97] focus-visible:ring-[3px] focus-visible:ring-ring '+(on?'border-primary bg-primary text-primary-foreground shadow-card':'bg-white hover:border-primary/60')}>
    <span className="max-w-full truncate font-medium">{p.label}</span>
    <span className={'max-w-full truncate text-sm tabular-nums '+(on?'text-primary-foreground/85':'text-muted-foreground')}><span className="min-[400px]:hidden">{p.short}</span><span className="hidden min-[400px]:inline">{p.detail}</span></span>
   </button>;})}</div>
  </section>

  <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
   <h2 className="text-xl">เลือกรถ</h2>
   {!problem&&<p className="text-muted-foreground" aria-live="polite">{loading?'กำลังค้นหา…':'ว่าง '+free+' จาก '+cars.length+' คัน'}</p>}
  </div>
  {/* ตัวกรองประเภทแบบแบ่งช่อง 5 ช่องพอดีจอ (มือถือใช้ชื่อสั้น) ช่องกว้างเท่ากันแต่ไม่แคบกว่าข้อความ */}
  <div role="group" aria-label="ประเภทรถ" className="mb-4 flex w-full gap-1 rounded-2xl border bg-white p-1 shadow-card sm:inline-flex sm:w-auto">
   {[['','ทั้งหมด','ทั้งหมด'],...(Object.keys(carTypeLabels) as CarType[]).map(k=>[k,carTypeShortLabels[k],carTypeLabels[k]])].map(([value,short,label])=>{const on=query.type===value;return <button key={value} type="button" aria-pressed={on} onClick={()=>update({type:value})} className={'min-h-11 min-w-fit flex-1 whitespace-nowrap rounded-xl px-1.5 font-medium transition focus-visible:ring-[3px] focus-visible:ring-ring sm:px-4 '+(on?'bg-primary text-primary-foreground shadow-sm':'hover:bg-muted')}><span className="sm:hidden">{short}</span><span className="hidden sm:inline">{label}</span></button>;})}
  </div>
  <div className={loading?'opacity-60 transition-opacity':'transition-opacity'}>
   {problem?<EmptyState icon={TriangleAlert} title={problem} description="ปรับวันเวลารับหรือคืนรถด้านบน"/>
   :cars.length?<div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">{cars.map(item=><CarCard key={item.car.id} item={item} start={start} place={places[item.car.stationId]} onPick={c=>{setSelected(c);setError('');}}/>)}</div>
   :<EmptyState icon={CarFront} title="ไม่มีรถประเภทนี้"/>}
  </div>

  <ResponsivePanel open={!!selected} onOpenChange={v=>{if(!v)setSelected(null);}} title={'จองรถ #'+(selected?.number??'')} description={selected?selected.model+' · ทะเบียน '+selected.plate:undefined}>
   {selected&&<form onSubmit={submit} className="space-y-5">
    <div className="flex items-center gap-3 rounded-2xl border bg-muted/40 p-3">
     <CarPhoto car={selected} className="aspect-[4/3] w-24 shrink-0 rounded-xl min-[360px]:w-28"/>
     <div className="min-w-0 space-y-1"><LicensePlate plate={selected.plate} size="lg"/><p className="truncate text-muted-foreground">{selected.model}</p></div>
    </div>
    {/* จุดรับ-คืนรถอยู่ใต้ข้อมูลรถ เห็นทันทีก่อนกรอกฟอร์ม */}
    <p className="-mt-2 flex items-start gap-2 rounded-2xl border border-primary/15 bg-accent/50 px-3 py-2.5"><MapPinned aria-hidden className="mt-0.5 size-5 shrink-0 text-primary"/><span className="min-w-0"><span className="block text-sm text-muted-foreground">รับและคืนรถที่</span><span className="font-medium">{placeLabel(places[selected.stationId])}</span></span></p>
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
