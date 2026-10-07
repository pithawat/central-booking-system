'use client';
import {useState} from 'react';
import {CircleCheck,CircleX} from 'lucide-react';
import type {RoomBookingDetail} from '@/shared/data/types';
import {DecisionButtons} from '../components/booking-actions';
import {decidedMessage} from './messages';
export function ApproveTokenForm({token,initialReject}:{token:string;initialReject:boolean}) {
 const [done,setDone]=useState<{approved:boolean;text:string}|null>(null);
 if(done)return <div role="status" className={'flex items-start gap-3 rounded-2xl border p-5 text-lg font-medium '+(done.approved?'border-success-border bg-success-bg text-success':'border-status-other-border bg-status-other text-status-other-foreground')}>{done.approved?<CircleCheck aria-hidden className="mt-1 shrink-0"/>:<CircleX aria-hidden className="mt-1 shrink-0"/>}{done.text}</div>;
 const decided=(b:RoomBookingDetail,decision:'APPROVE'|'REJECT')=>setDone({approved:b.status==='APPROVED',text:(decision==='APPROVE'&&b.status==='APPROVED')||(decision==='REJECT'&&b.status==='REJECTED')?(b.status==='APPROVED'?'อนุมัติแล้ว':'ไม่อนุมัติแล้ว')+' ระบบแจ้งผู้จองทางอีเมลแล้ว':decidedMessage(b)});
 return <DecisionButtons id={token} token size="lg" initialReject={initialReject} onDecided={decided}/>;
}
