import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireUser} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {PageHeader} from '@/shared/ui/page-header';
import {formatDate,formatTime} from '@/shared/lib/datetime';
import {MailboxControls} from '@/shared/ui/mailbox-controls';
const types:Record<string,string>={ROOM_APPROVAL_REQUEST:'ขออนุมัติ',ROOM_APPROVAL_REMINDER:'เตือนอนุมัติ',ROOM_APPROVAL_NUDGE:'ผู้จองเตือน',ROOM_APPROVED:'อนุมัติแล้ว',ROOM_REJECTED:'ไม่อนุมัติ',ROOM_EXPIRED:'คำขอหมดอายุ',CAR_BOOKING_CONFIRMED:'ยืนยันจองรถ',CAR_PICKUP_REMINDER:'เตือนรับรถ',CAR_HANDOVER_RECEIPT:'รับกุญแจแล้ว',CAR_RETURN_REMINDER:'เตือนคืนรถ',CAR_OVERDUE:'เกินเวลาคืน',CAR_RETURN_RECEIPT:'คืนรถแล้ว',CAR_NO_SHOW:'ไม่มารับรถ',CAR_SWAPPED:'เปลี่ยนรถ'};
export default async function MailboxPage({searchParams}:{searchParams:Promise<{id?:string;to?:string}>}) {
 await requireUser(['EMPLOYEE','ADMIN','STATION','GUARD']);const s=await getServices();if(!s.dev)notFound();
 const q=await searchParams,messages=await s.dev.mail({to:q.to}),users=await s.users.personas(),selected=messages.find(m=>m.id===q.id)??messages[0];
 return <main id="main-content" className="max-w-7xl mx-auto p-4 md:p-8"><Link href="/" className="text-primary underline">กลับหน้าแรก</Link><PageHeader title="กล่องจดหมายทดสอบ" description="อีเมลที่ส่งจากระบบจอง"/><MailboxControls users={users} to={q.to??''}/><div className="mailbox-grid mt-6"><aside className={(q.id?'hidden md:block ':'')+'space-y-2'}>{messages.map(m=><Link href={'/dev/mailbox?'+new URLSearchParams({id:m.id,...(q.to?{to:q.to}:{})})} key={m.id} className={'block border rounded-xl p-4 '+(m.id===selected?.id?'bg-accent border-primary':'')}><p className="text-sm text-muted-foreground break-all">{m.to.join(', ')}</p><h2 className="text-base font-medium my-2">{m.subject}</h2><p className="text-sm">{formatDate(m.createdAt)} {formatTime(m.createdAt)} · {types[m.type]??'อีเมล'}</p></Link>)}{!messages.length&&<p>ไม่มีอีเมลในกล่องจดหมาย</p>}</aside><section className={!q.id?'hidden md:block':''}>{q.id&&<Link className="md:hidden block mb-4 text-primary underline" href={'/dev/mailbox?'+new URLSearchParams(q.to?{to:q.to}:{})}>กลับรายการอีเมล</Link>}{selected&&<><iframe title={selected.subject} srcDoc={selected.html} sandbox="allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation" className="w-full min-h-[650px] border rounded-xl"/>{selected.attachments?.map(a=><a key={a.filename} className="block py-4 text-primary underline" download={a.filename} href={'data:'+a.contentType+';base64,'+a.contentBase64}>ดาวน์โหลด {a.filename}</a>)}</>}</section></div></main>;
}

