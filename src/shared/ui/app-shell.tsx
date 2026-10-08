'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Home,Car,CalendarDays,ClipboardList,CheckSquare,KeyRound,LogOut,Users,ChevronDown} from 'lucide-react';
import type {User} from '@/shared/data/types';
import {UserAvatar} from './user-avatar';
import {BrandLogo} from './brand-logo';
import {Button} from '@/components/ui/button';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator} from '@/components/ui/dropdown-menu';
import {signOut} from '@/shared/auth/actions';

type Props={user:User;name:string;cars:boolean;rooms:boolean;supervisor:boolean;pending:number;mock:boolean;children:React.ReactNode};

export function AppShell({user,name,cars,rooms,supervisor,pending,mock,children}:Props) {
 const pathname=usePathname();
 const menu=[
  {href:'/',label:'หน้าแรก',short:'หน้าแรก',icon:Home},
  ...(cars?[{href:'/cars',label:'จองรถ',short:'จองรถ',icon:Car}]:[]),
  ...(rooms?[{href:'/rooms',label:'จองห้องประชุม',short:'จองห้อง',icon:CalendarDays}]:[]),
  {href:'/my',label:'การจองของฉัน',short:'ของฉัน',icon:ClipboardList},
  ...(rooms&&supervisor?[{href:'/rooms/approvals',label:'รออนุมัติ',short:'รออนุมัติ',icon:CheckSquare}]:[]),
  ...(cars&&user.roles.includes('ADMIN')?[{href:'/admin/key-log',label:'รายงานกุญแจ',short:'รายงาน',icon:KeyRound}]:[]),
 ];
 const active=(href:string)=>href==='/'?pathname==='/':href==='/rooms'?pathname.startsWith('/rooms')&&!pathname.startsWith('/rooms/approvals'):pathname.startsWith(href);
 const wide=pathname==='/rooms';
 const badge=(href:string,className='')=>href==='/rooms/approvals'&&pending>0?<span className={'inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground tabular-nums '+className}>{pending}<span className="sr-only"> รายการ</span></span>:null;
 return <>
  <header className="app-top sticky top-0 z-30 border-b bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-white/85">
   <div className={(wide?'max-w-[1440px]':'max-w-6xl')+' mx-auto flex h-16 items-center justify-between gap-3 px-4'}>
    <Link href="/" className="flex min-h-12 shrink-0 items-center rounded-sm">
     <BrandLogo className="md:w-20 lg:w-28" sizes="(min-width: 1024px) 120px, (min-width: 768px) 86px, 120px"/>
     <span className="sr-only"> {name} · หน้าแรก</span>
    </Link>
    <nav aria-label="เมนูหลัก" className="desktop-nav hidden h-full md:flex items-stretch gap-0.5">
     {menu.map(m=><Link key={m.href} href={m.href} aria-current={active(m.href)?'page':undefined} className={'group relative items-center gap-1.5 whitespace-nowrap px-3 text-sm font-medium transition-colors '+(m.href==='/admin/key-log'?'hidden lg:flex ':'flex ')+(active(m.href)?'text-primary':'text-muted-foreground hover:text-foreground')}>
      <span className={'flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors '+(active(m.href)?'bg-accent':'group-hover:bg-muted')}>
       <m.icon size={18} aria-hidden/>
       <span className="xl:hidden">{m.short}</span><span className="hidden xl:inline">{m.label}</span>
       {badge(m.href)}
      </span>
      {active(m.href)&&<span aria-hidden className="absolute inset-x-2 -bottom-px h-[3px] rounded-t-full bg-primary"/>}
     </Link>)}
    </nav>
    <DropdownMenu>
     <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-12 gap-2 rounded-full px-1.5 lg:pr-3">
       <UserAvatar user={user} variant="brand" className="size-9"/>
       <span className="hidden lg:inline font-medium">{user.firstName}</span>
       <ChevronDown aria-hidden className="hidden lg:block text-muted-foreground"/>
       <span className="sr-only">เมนูผู้ใช้</span>
      </Button>
     </DropdownMenuTrigger>
     <DropdownMenuContent align="end" className="w-64 p-1.5">
      <DropdownMenuLabel className="flex items-center gap-3 p-2">
       <UserAvatar user={user} variant="brand" className="size-10"/>
       <span className="min-w-0"><span className="block truncate font-heading text-base font-semibold text-foreground">{user.displayName}</span><span className="block truncate text-sm font-normal text-muted-foreground">{user.departmentName}</span></span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator/>
      {/* จอต่ำกว่า 1024px แถบเมนูไม่มีที่ให้รายงานกุญแจ (มือถือ = แถบล่าง, แท็บเล็ต = โลโก้ + 5 เมนู) จึงให้ ADMIN เข้าจากเมนูผู้ใช้ */}
      {cars&&user.roles.includes('ADMIN')&&<DropdownMenuItem asChild className="lg:hidden"><Link className="min-h-12 gap-2 text-base" href="/admin/key-log"><KeyRound aria-hidden/>รายงานกุญแจ</Link></DropdownMenuItem>}
      {mock&&<DropdownMenuItem asChild><Link className="min-h-12 gap-2 text-base" href="/login"><Users aria-hidden/>สลับผู้ใช้ทดสอบ</Link></DropdownMenuItem>}
      <DropdownMenuItem asChild><form action={signOut}><button className="flex w-full min-h-12 items-center gap-2 text-base"><LogOut aria-hidden/>ออกจากระบบ</button></form></DropdownMenuItem>
     </DropdownMenuContent>
    </DropdownMenu>
   </div>
  </header>
  <main id="main-content" className={(wide?'max-w-[1440px]':'max-w-6xl')+' mx-auto min-w-0 px-4 pt-4 sm:pt-6 md:py-8 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-24'}>{children}</main>
  <nav aria-label="เมนูมือถือ" className="bottom-nav md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] flex shadow-[0_-4px_16px_-8px_rgb(15_23_42/.12)]">
   {menu.filter(m=>m.href!=='/admin/key-log').map(m=><Link key={m.href} href={m.href} aria-current={active(m.href)?'page':undefined} className={'relative flex h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 text-sm transition-colors active:bg-muted/60 '+(active(m.href)?'text-primary font-semibold':'text-muted-foreground')}>
    <span className={'relative flex h-8 w-14 items-center justify-center rounded-full transition-colors '+(active(m.href)?'bg-accent':'')}><m.icon size={22} aria-hidden/>{badge(m.href,'absolute -top-1.5 right-0.5 min-w-5 h-5')}</span>
    <span className={'max-w-full truncate px-0.5 leading-none '+(active(m.href)?'underline decoration-2 underline-offset-4':'')}>{m.short}</span>
   </Link>)}
  </nav>
 </>;
}
