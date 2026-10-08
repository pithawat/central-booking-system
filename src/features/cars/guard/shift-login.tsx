'use client';
import {useState} from 'react';
import {CircleCheck,LogIn} from 'lucide-react';
import type {GuardStation,User} from '@/shared/data/types';
import {appConfig} from '@/shared/config/app.config';
import {UserAvatar} from '@/shared/ui/user-avatar';
import {BrandLogo} from '@/shared/ui/brand-logo';
import {Button} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {CodePad} from './code-pad';
function Step({n,title,active,children}:{n:number;title:string;active:boolean;children:React.ReactNode}) {
 return <section className={'transition-opacity '+(active?'':'opacity-50')}>
  <h3 className="mb-4 flex items-center gap-3 text-2xl"><span className={'grid size-10 shrink-0 place-items-center rounded-full font-heading text-xl '+(active?'bg-primary text-primary-foreground':'bg-muted text-muted-foreground')}>{n}</span>{title}</h3>
  {children}
 </section>;
}
/** ขั้นที่ 2: เข้าเวร (เลือกชื่อ แล้วใส่ PIN) */
export function ShiftLogin({station,guards,onStart,pending,error}:{station?:GuardStation;guards:User[];onStart:(guardId:string,pin:string)=>Promise<boolean>;pending:boolean;error:string}) {
 const [guardId,setGuardId]=useState(''),[pin,setPin]=useState('');
 const ready=!!guardId&&pin.length===appConfig.guard.pinLength;
 const submit=async()=>{if(!ready)return;if(!await onStart(guardId,pin))setPin('');};
 return <div className="mx-auto mt-4 max-w-5xl">
  <div className="surface overflow-hidden">
   <header className="flex items-center gap-4 border-b bg-accent/50 px-4 py-4 sm:px-6 sm:py-5 md:px-8">
    <BrandLogo className="w-24 shrink-0 sm:w-32"/>
    <div><p className="text-muted-foreground">{station?.name}</p><h2 className="text-3xl">เข้าเวร</h2></div>
   </header>
   <div className="grid grid-cols-1 gap-8 p-4 sm:p-6 md:grid-cols-2 md:p-8">
    <Step n={1} title="แตะชื่อของคุณ" active>
     <div className="grid grid-cols-1 gap-3">{guards.map(g=>{const on=guardId===g.id;return <button key={g.id} type="button" aria-pressed={on} onClick={()=>{setGuardId(g.id);setPin('');}} className={'flex min-h-20 items-center gap-4 rounded-2xl border-2 px-4 text-left transition focus-visible:ring-[3px] focus-visible:ring-ring '+(on?'border-primary bg-accent':'border-border bg-white hover:border-primary/50')}>
      <UserAvatar user={g} className="size-14"/><span className="flex-1 font-heading text-2xl font-semibold">{g.displayName}</span>{on&&<CircleCheck aria-hidden className="size-8 text-primary"/>}
     </button>;})}</div>
    </Step>
    <Step n={2} title="ใส่ PIN 4 หลัก" active={!!guardId}>
     {guardId?<div className="flex flex-col items-center gap-4">
      <CodePad label="PIN 4 หลัก" hideLabel value={pin} onChange={setPin} disabled={pending}/>
      {error&&<p role="alert" className="w-full max-w-[19rem] rounded-xl bg-overdue-bg p-3 text-center text-overdue">{error}</p>}
      <Button className="h-16 w-full max-w-[19rem] text-xl" disabled={pending||!ready} onClick={submit}>{pending?<Spinner/>:<LogIn aria-hidden/>}เข้าเวร</Button>
     </div>:<p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">เลือกชื่อของคุณก่อน</p>}
    </Step>
   </div>
  </div>
 </div>;
}
