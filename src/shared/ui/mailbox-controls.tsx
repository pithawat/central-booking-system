'use client';
import {useRouter} from 'next/navigation';
import {useTransition} from 'react';
import {toast} from 'sonner';
import type {User} from '@/shared/data/types';
import {InlineConfirm} from './inline-confirm';
import {devAction} from './dev-actions';
export function MailboxControls({users,to}:{users:User[];to:string}) {
 const router=useRouter(),[pending,start]=useTransition();
 return <div className="flex flex-wrap gap-4 items-end"><div><label htmlFor="mail-to" className="block mb-2">ผู้รับ</label><select id="mail-to" value={to} onChange={e=>router.push('/dev/mailbox?'+new URLSearchParams({to:e.target.value}))}><option value="">ทุกคน</option>{users.map(u=><option key={u.id} value={u.email}>{u.displayName}</option>)}</select></div><InlineConfirm label="ล้างกล่องจดหมาย" question="ล้างอีเมลทดสอบทั้งหมด?" disabled={pending} onConfirm={()=>start(async()=>{const r=await devAction('clearMail');if(!r.ok)toast.error(r.error.message);else router.refresh();})}/></div>;
}

