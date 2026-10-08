import {Car,CalendarDays,ShieldCheck,ChevronRight} from 'lucide-react';
import {getServices} from '@/shared/data';
import {env} from '@/shared/config/env';
import {signIn} from '@/shared/auth/actions';
import {UserAvatar} from '@/shared/ui/user-avatar';
import {LoginSso} from '@/shared/ui/login-sso';
import {BrandLogo} from '@/shared/ui/brand-logo';
const labels:Record<string,string>={U01:'พนักงาน',U03:'พนักงาน',U02:'หัวหน้างาน',U14:'ผู้บริหาร · อนุมัติอัตโนมัติ',U12:'ผู้ดูแลระบบ',U90:'แท็บเล็ตป้อม รปภ.'};
function Brand() {
 return <div className="relative hidden overflow-hidden bg-linear-to-br from-primary via-blue-700 to-indigo-800 p-10 text-white lg:flex lg:flex-col lg:justify-between">
  <div aria-hidden className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl"/>
  <div aria-hidden className="absolute -bottom-32 -left-16 size-96 rounded-full bg-sky-300/20 blur-3xl"/>
  <p className="relative font-heading text-xl font-semibold">{env.NEXT_PUBLIC_APP_NAME}</p>
  <div className="relative space-y-6">
   <h2 className="font-heading text-4xl font-semibold leading-tight">รถและห้องประชุม<br/>ทุกอย่างในที่เดียว</h2>
   <ul className="space-y-4 text-blue-50">
    <li className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white/15"><Car size={20} aria-hidden/></span>รับกุญแจที่ป้อมด้วย QR ในราว 10 วินาที</li>
    <li className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white/15"><CalendarDays size={20} aria-hidden/></span>เห็นห้องว่างทันที แตะช่องว่างเพื่อจอง</li>
    <li className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white/15"><ShieldCheck size={20} aria-hidden/></span>หัวหน้าอนุมัติจากอีเมลได้ในคลิกเดียว</li>
   </ul>
  </div>
  <p className="relative text-sm text-blue-100">ใช้งานได้ทั้งคอมพิวเตอร์ แท็บเล็ต และมือถือ</p>
 </div>;
}
export default async function LoginPage({searchParams}:{searchParams:Promise<{next?:string}>}) {
 const {next}=await searchParams;
 const body=env.AUTH_MODE==='sso'?<LoginSso/>:<PersonaGrid next={next}/>;
 return <main id="main-content" className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
  <Brand/>
  <div className="flex min-w-0 items-center justify-center px-4 py-8 sm:py-10 md:px-10">
   <div className="w-full min-w-0 max-w-2xl">
    <BrandLogo className="mb-6 w-40 sm:w-48"/>
    <p className="mb-4 font-heading font-semibold text-primary lg:hidden">รถและห้องประชุม · ทุกอย่างในที่เดียว</p>
    <h1 className="font-heading text-2xl font-semibold sm:text-3xl">{env.NEXT_PUBLIC_APP_NAME}</h1>
    <p className="mt-2 text-muted-foreground">{env.AUTH_MODE==='sso'?'เข้าสู่ระบบด้วยบัญชีองค์กรของคุณ':'โหมดทดสอบ: เลือกผู้ใช้ที่ต้องการเข้าใช้งาน'}</p>
    <div className="mt-6 sm:mt-8">{body}</div>
   </div>
  </div>
 </main>;
}
async function PersonaGrid({next}:{next?:string}) {
 const users=await (await getServices()).users.personas();
 return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{users.map(user=><form key={user.id} action={signIn}>
  <input type="hidden" name="userId" value={user.id}/><input type="hidden" name="next" value={next??'/'}/>
  <button className="surface surface-interactive group flex w-full min-h-24 items-center gap-3 p-3 text-left active:scale-[.99] focus-visible:ring-[3px] focus-visible:ring-ring sm:min-h-28 sm:gap-4 sm:p-4">
   <UserAvatar user={user} className="size-12"/>
   <span className="min-w-0 flex-1"><strong className="block truncate font-heading text-lg">{user.displayName}</strong><span className="mt-0.5 inline-block rounded-full bg-accent px-2.5 text-sm font-medium text-accent-foreground">{labels[user.id]}</span><span className="mt-1 block truncate text-sm text-muted-foreground">{user.departmentName}</span></span>
   <ChevronRight aria-hidden className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"/>
  </button>
 </form>)}</div>;
}
