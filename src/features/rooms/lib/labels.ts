import type {Room,RoomBookingDetail,User} from '@/shared/data/types';
export const capacityOptions=[{value:'0',label:'ทุกขนาด'},{value:'2',label:'2 คนขึ้นไป'},{value:'5',label:'5 คนขึ้นไป'},{value:'10',label:'10 คนขึ้นไป'},{value:'20',label:'20 คนขึ้นไป'},{value:'50',label:'50 คนขึ้นไป'}] as const;
export const capacityValues=[2,5,10,20,50];
export const durationOptions=[{minutes:30,label:'30 นาที'},{minutes:60,label:'1 ชม.'},{minutes:120,label:'2 ชม.'}] as const;
export const legend={mine:'ของคุณ',pending:'รออนุมัติ',other:'คนอื่นจองแล้ว',free:'ว่าง (แตะเพื่อจอง)'} as const;
export const seatsLabel=(room:Pick<Room,'capacity'>)=>room.capacity+' ที่นั่ง';
/** บรรทัดผู้อนุมัติในการ์ด เช่น "รอ วิชัย ส. อนุมัติ" */
export function approverLine(b:Pick<RoomBookingDetail,'status'|'approver'>) {
 if(!b.approver)return b.status==='APPROVED'||b.status==='CANCELLED'?'อนุมัติอัตโนมัติ':null;
 const name=b.approver.shortName;
 return b.status==='PENDING'?'รอ '+name+' อนุมัติ':b.status==='APPROVED'?'อนุมัติโดย '+name:b.status==='REJECTED'?'ไม่อนุมัติโดย '+name:b.status==='EXPIRED'?name+' ยังไม่ได้อนุมัติ':'ผู้อนุมัติ '+name;
}
export const requestToast=(supervisor:Pick<User,'shortName'>|null)=>supervisor?'ส่งคำขออนุมัติแล้ว รอ '+supervisor.shortName+' อนุมัติ':'จองห้องเรียบร้อย';
