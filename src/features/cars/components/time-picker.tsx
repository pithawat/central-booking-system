'use client';
import {useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Popover,PopoverContent,PopoverTrigger} from '@/components/ui/popover';
import {Drawer,DrawerContent,DrawerHeader,DrawerTitle,DrawerDescription,DrawerFooter} from '@/components/ui/drawer';
import {useMobile} from '@/shared/ui/responsive-panel';

const pad=(n:number)=>String(n).padStart(2,'0');
/** ช่วงละ 6 ชั่วโมง = ครึ่งหน้าปัดพอดี (เช้า/ค่ำ อยู่ซีกซ้าย 6–11, บ่ายอยู่ซีกขวา 12–5) */
const periods=[{label:'เช้า',from:6},{label:'บ่าย',from:12},{label:'ค่ำ',from:18}];
const periodOf=(h:number)=>h>=18?2:h>=12?1:0;
const posOf=(h:number)=>h%12||12;
const hourAt=(period:number,pos:number)=>{const f=periods[period].from;for(let h=f;h<f+6;h++)if(posOf(h)===pos)return h;return null;};
// ตำแหน่งเลขบนหน้าปัด (% จากกึ่งกลาง) ปัดทศนิยมให้ค่าคงที่
const spot=(pos:number)=>{const a=pos*Math.PI/6;return {left:(50+39*Math.sin(a)).toFixed(3)+'%',top:(50-39*Math.cos(a)).toFixed(3)+'%'};};

type Rules={times:string[];isDisabled:(t:string)=>boolean};

/** หน้าปัดนาฬิกา 12 ชั่วโมง: เลือกช่วง เช้า / บ่าย / ค่ำ แตะเลขชั่วโมง แล้วเลือกนาที 00 / 30 · เข็มสั้น-ยาวชี้เวลาที่เลือกเหมือนนาฬิกาจริง · เวลาที่จองไม่ได้กดไม่ได้ */
function ClockPicker({value,times,isDisabled,onDone,onCancel,drawer}:Rules&{value:string;onDone:(t:string)=>void;onCancel:()=>void;drawer:boolean}) {
 const [h0,m0]=value.split(':').map(Number);
 const [period,setPeriod]=useState(periodOf(h0)),[hour,setHour]=useState<number|null>(h0),[minute,setMinute]=useState(m0>=30?'30':'00');
 const ok=(h:number,m:string)=>{const t=pad(h)+':'+m;return times.includes(t)&&!isDisabled(t);};
 const hourOk=(h:number)=>ok(h,'00')||ok(h,'30');
 const pickHour=(h:number)=>{setHour(h);const other=minute==='00'?'30':'00';if(!ok(h,minute)&&ok(h,other))setMinute(other);};
 // เปลี่ยนช่วงแล้วคงตำแหน่งบนหน้าปัดไว้ (เช่น 9 เช้า → 9 ค่ำ) ถ้าตำแหน่งนั้นไม่มีในช่วงใหม่ ให้เลือกชั่วโมงใหม่
 const pickPeriod=(p:number)=>{setPeriod(p);const h=hour==null?null:hourAt(p,posOf(hour));if(h!=null&&hourOk(h))pickHour(h);else setHour(null);};
 const valid=hour!=null&&ok(hour,minute);
 const span=(p:number)=>{const hs=[0,1,2,3,4,5].map(k=>periods[p].from+k).filter(h=>times.includes(pad(h)+':00')||times.includes(pad(h)+':30'));return hs.length?pad(hs[0])+'–'+pad(hs[hs.length-1]):'';};

 const body=<div className="space-y-3">
  {/* เวลาที่เลือก: ชั่วโมงแสดงอย่างเดียว · นาทีแตะเลือก 00 / 30 */}
  <div className="flex items-center justify-center gap-2">
   <span aria-hidden className="grid h-13 w-18 place-items-center rounded-2xl bg-accent font-heading text-4xl font-semibold tabular-nums text-primary">{hour==null?'--':pad(hour)}</span>
   <span aria-hidden className="font-heading text-4xl font-semibold text-muted-foreground">:</span>
   <div role="group" aria-label="นาที" className="flex gap-1.5">{['00','30'].map(m=>{const on=m===minute;
    return <button key={m} type="button" aria-pressed={on} aria-label={'นาที '+m} disabled={hour==null||!ok(hour,m)} onClick={()=>setMinute(m)} className={'grid size-13 place-items-center rounded-2xl border-2 font-heading text-3xl font-semibold tabular-nums transition active:scale-[.96] focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:border-dashed disabled:opacity-40 '+(on?'border-primary bg-primary text-primary-foreground shadow-card':'bg-white hover:border-primary/60')}>{m}</button>;})}</div>
  </div>
  <p className="sr-only" aria-live="polite">{hour==null?'เลือกชั่วโมงบนหน้าปัด':'เลือก '+pad(hour)+':'+minute}</p>

  <div role="group" aria-label="ช่วงเวลา" className="grid grid-cols-3 gap-1 rounded-2xl border bg-white p-1">{periods.map((p,i)=>{const on=i===period,has=[0,1,2,3,4,5].some(k=>hourOk(p.from+k));
   return <button key={p.label} type="button" aria-pressed={on} disabled={!has&&!on} onClick={()=>pickPeriod(i)} className={'flex min-h-12 flex-col items-center justify-center rounded-xl leading-tight transition focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 '+(on?'bg-primary text-primary-foreground shadow-sm':'hover:bg-muted')}>
    <span className="font-medium">{p.label}</span><span className={'text-sm tabular-nums '+(on?'text-primary-foreground/85':'text-muted-foreground')}>{span(i)}</span>
   </button>;})}</div>

  {/* หน้าปัดย่อตามความสูงจอ: เต็ม 16rem ถ้าพอ จอเตี้ยย่อลง ให้เห็นทั้งหน้าปัดและปุ่มตกลงโดยไม่ต้องเลื่อน */}
  <div className="relative mx-auto aspect-square w-full max-w-[min(16rem,max(12rem,calc(94dvh_-_20rem)))] rounded-full bg-muted ring-1 ring-inset ring-border">
   <svg viewBox="0 0 200 200" aria-hidden className="pointer-events-none absolute inset-0 size-full">
    {hour!=null&&<>
     <line x1="100" y1="100" x2="100" y2="44" strokeWidth="3.5" strokeLinecap="round" className="origin-center stroke-slate-500 transition-transform duration-300" style={{transform:'rotate('+(minute==='30'?180:0)+'deg)'}}/>
     <line x1="100" y1="100" x2="100" y2="60" strokeWidth="7" strokeLinecap="round" className="origin-center stroke-primary transition-transform duration-300" style={{transform:'rotate('+((hour%12)+(minute==='30'?.5:0))*30+'deg)'}}/>
    </>}
    <circle cx="100" cy="100" r="7" className="fill-primary"/>
   </svg>
   {Array.from({length:12},(_,i)=>i+1).map(pos=>{const h=hourAt(period,pos),on=h!=null&&h===hour,can=h!=null&&hourOk(h);
    return <button key={pos} type="button" aria-pressed={on} disabled={!can} aria-label={h==null?pos+' (อยู่ช่วงอื่น)':'ชั่วโมง '+pad(h)} onClick={()=>h!=null&&pickHour(h)} style={spot(pos)} className={'absolute grid size-[18.75%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-heading text-lg font-semibold tabular-nums transition focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed '+(on?(can?'bg-primary text-primary-foreground shadow-card':'bg-primary/40 text-white'):can?'text-foreground hover:bg-white active:bg-white':'text-muted-foreground/35')}>{pos}</button>;})}
  </div>
 </div>;

 const actions=<><Button type="button" variant="outline" onClick={onCancel}>ยกเลิก</Button><Button type="button" disabled={!valid} onClick={()=>hour!=null&&onDone(pad(hour)+':'+minute)}>ตกลง</Button></>;
 if(drawer)return <>
  <div className="overflow-y-auto overscroll-contain px-4 pb-2 scrollbar-thin">{body}</div>
  <DrawerFooter className="grid grid-cols-2 border-t bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{actions}</DrawerFooter>
 </>;
 return <>{body}<div className="mt-4 grid grid-cols-2 gap-2">{actions}</div></>;
}

/** ปุ่มเวลา + หน้าปัดนาฬิกา (มือถือเปิดจากด้านล่าง จอใหญ่เป็น Popover) เลือกเสร็จกด "ตกลง" */
export function TimePicker({id,label,context,value,times,isDisabled,onChange}:Rules&{id:string;label:string;context:string;value:string;onChange:(t:string)=>void}) {
 const mobile=useMobile(),[open,setOpen]=useState(false);
 const done=(t:string)=>{setOpen(false);if(t!==value)onChange(t);};
 const picker=<ClockPicker value={value} times={times} isDisabled={isDisabled} onDone={done} onCancel={()=>setOpen(false)} drawer={mobile}/>;
 const trigger=(extra:React.ComponentProps<typeof Button>={})=><Button id={id} variant="outline" aria-label={'เวลา'+label+' '+value} className="w-full justify-between gap-1 px-3 font-heading tabular-nums" {...extra}><span>{value}</span><ChevronDown aria-hidden className="text-muted-foreground"/></Button>;
 if(mobile)return <>
  {trigger({onClick:()=>setOpen(true),'aria-haspopup':'dialog','aria-expanded':open})}
  <Drawer open={open} onOpenChange={setOpen}><DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[94dvh]"><DrawerHeader className="px-4 pt-3 pb-1 text-left"><DrawerTitle className="font-heading text-xl font-semibold">เวลา{label}</DrawerTitle><DrawerDescription>{context}</DrawerDescription></DrawerHeader>{open&&picker}</DrawerContent></Drawer>
 </>;
 return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild>{trigger()}</PopoverTrigger>
  {/* เปิดด้านข้างช่องเวลา เลื่อนขึ้น-ลงให้พอดีจอได้ (เปิดด้านล่างจะล้นจอโน้ตบุ๊ก) */}
  <PopoverContent side="left" align="center" collisionPadding={12} aria-label={'เลือกเวลา'+label} className="max-h-(--radix-popover-content-available-height) w-80 max-w-[calc(100vw-2rem)] gap-0 overflow-y-auto p-4 text-base"><p className="font-heading text-lg font-semibold">เวลา{label}</p><p className="mb-4 text-sm text-muted-foreground">{context}</p>{open&&picker}</PopoverContent>
 </Popover>;
}
