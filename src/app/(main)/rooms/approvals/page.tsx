import {redirect} from 'next/navigation';
import {CheckSquare} from 'lucide-react';
import {requireFeature,requireUser} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {PageHeader} from '@/shared/ui/page-header';
import {LinkTabs} from '@/shared/ui/link-tabs';
import {ApprovalList,ApprovalHistory} from '@/features/rooms/approvals/approval-list';
export default async function ApprovalsPage({searchParams}:{searchParams:Promise<{tab?:string}>}) {
 requireFeature('rooms');const me=await requireUser(),s=await getServices();
 if(!me.roles.includes('ADMIN')&&!await s.users.isSupervisor(me.id))redirect('/');
 const tab=(await searchParams).tab==='history'?'history':'pending';
 const [pending,history]=await Promise.all([s.approvals.pending(),tab==='history'?s.approvals.history(30):[]]);
 return <><PageHeader icon={CheckSquare} title="คำขอจองห้องรออนุมัติ" description="อนุมัติได้ทีละรายการ หรือเลือกหลายรายการแล้วอนุมัติพร้อมกัน"/>
  <LinkTabs label="ประเภทคำขอ" active={tab} items={[{key:'pending',label:'รออนุมัติ ('+pending.length+')',href:'/rooms/approvals'},{key:'history',label:'ประวัติ',href:'/rooms/approvals?tab=history'}]}/>
  {tab==='pending'?<ApprovalList items={pending}/>:<ApprovalHistory items={history}/>}
 </>;
}
