import Link from 'next/link';
import {redirect} from 'next/navigation';
import {LinkIcon,CircleCheck,CircleX} from 'lucide-react';
import {requireFeature} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {ServiceError} from '@/shared/data/errors';
import {appConfig} from '@/shared/config/app.config';
import {formatDate,formatRange,formatTime} from '@/shared/lib/datetime';
import {UserAvatar} from '@/shared/ui/user-avatar';
import {StatusBadge} from '@/shared/ui/status-badge';
import {ApproveTokenForm} from '@/features/rooms/approvals/approve-token-form';
import {decidedMessage} from '@/features/rooms/approvals/messages';
export const metadata={title:'พิจารณาคำขอจองห้อง',robots:{index:false}};
export default async function ApprovePage({params,searchParams}:{params:Promise<{token:string}>;searchParams:Promise<{d?:string}>}) {
 requireFeature('rooms');const {token}=await params,{d}=await searchParams,s=await getServices();
 // GET เปิดดูอย่างเดียว ห้ามเปลี่ยนสถานะ (กฎเหล็กข้อ 6)
 const view=await s.approvals.viewByToken(token).catch((e:unknown)=>{
  if(e instanceof ServiceError&&e.code==='FORBIDDEN'&&appConfig.room.approval.linkRequiresLogin)redirect('/login?'+new URLSearchParams({next:'/approve/'+token}));
  if(e instanceof ServiceError&&['TOKEN_INVALID','TOKEN_EXPIRED','NOT_FOUND','FORBIDDEN','VALIDATION'].includes(e.code))return null;
  throw e;
 });
 if(!view)return <section className="surface p-8 text-center"><span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><LinkIcon aria-hidden/></span><h1 className="text-2xl">ลิงก์นี้หมดอายุหรือไม่ถูกต้อง</h1><p className="mt-2 text-muted-foreground">ลิงก์อนุมัติใช้ได้จนถึงเวลาเริ่มประชุม ดูคำขอทั้งหมดได้ในระบบ</p><Link href="/rooms/approvals" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 font-medium text-primary-foreground">ดูคำขอทั้งหมด</Link></section>;
 const {booking:b,approver}=view;
 const rows:[string,string][]=[['ผู้ขอ',b.bookedBy.displayName],['แผนก',b.bookedBy.departmentName],['ห้อง',b.room.shortLabel],['วัน',formatDate(b.start)],['เวลา',formatRange(b.start,b.end)],['หัวข้อ',b.title]];
 if(b.attendeeId!==b.bookedById)rows.push(['ผู้ใช้งานห้อง',b.attendee.displayName]);
 return <div className="space-y-6">
  <div><p className="text-muted-foreground">เรียน คุณ{approver.firstName}</p><h1 className="mt-1 text-3xl">พิจารณาคำขอจองห้อง</h1></div>
  <section className="surface overflow-hidden">
   <div className="flex items-center gap-3 border-b bg-accent/50 p-4 sm:p-5"><UserAvatar user={b.bookedBy}/><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><p className="font-heading text-lg font-semibold">{b.bookedBy.displayName}</p><StatusBadge kind="room" status={b.status}/></div><p className="text-muted-foreground">ขอเมื่อ <span className="whitespace-nowrap">{formatTime(b.createdAt)} · {formatDate(b.createdAt)}</span></p></div></div>
   <dl className="divide-y">{rows.map(([k,v])=><div key={k} className="grid grid-cols-1 gap-0.5 px-4 py-3 min-[400px]:grid-cols-[7rem_minmax(0,1fr)] min-[400px]:gap-3 sm:px-5"><dt className="text-sm text-muted-foreground min-[400px]:text-base">{k}</dt><dd className="wrap-break-word font-medium">{v}</dd></div>)}</dl>
  </section>
  {b.status==='PENDING'?<ApproveTokenForm token={token} initialReject={d==='reject'}/>:<div role="status" className={'flex items-start gap-3 rounded-2xl border p-5 text-lg font-medium '+(b.status==='APPROVED'?'border-success-border bg-success-bg text-success':'border-status-other-border bg-status-other text-status-other-foreground')}>{b.status==='APPROVED'?<CircleCheck aria-hidden className="mt-1 shrink-0"/>:<CircleX aria-hidden className="mt-1 shrink-0"/>}{decidedMessage(b)}</div>}
  <p className="text-center"><Link href="/rooms/approvals" className="text-primary underline underline-offset-4">ดูคำขอทั้งหมด</Link></p>
 </div>;
}
