import {template} from './base';
import type {RoomBooking,Room,User} from '@/shared/data/types';
import {formatDate,formatRange} from '@/shared/lib/datetime';
export function roomTemplate(type:string,b:RoomBooking,room:Room,booker:User,attendee:User,url:string,approvalUrl?:string) {
 const request='ขออนุมัติจองห้อง '+room.shortLabel+' · '+formatDate(b.start)+' '+formatRange(b.start,b.end)+' · '+booker.displayName;
 const subject=type==='ROOM_APPROVAL_REMINDER'?'เตือน: '+request:type==='ROOM_APPROVAL_NUDGE'?booker.displayName+' ขอให้ช่วยพิจารณาคำขอจองห้อง':type==='ROOM_APPROVED'?'อนุมัติจองห้อง '+room.shortLabel+' แล้ว':type==='ROOM_REJECTED'?'ไม่อนุมัติจองห้อง '+room.shortLabel:type==='ROOM_EXPIRED'?'คำขอจองห้องหมดอายุ หัวหน้ายังไม่ได้อนุมัติ':request;
 const rows:[string,string][]=[['ผู้ขอ',booker.displayName],['แผนก',booker.departmentName],['ห้อง',room.shortLabel],['วัน',formatDate(b.start)],['เวลา',formatRange(b.start,b.end)],['หัวข้อ',b.title]];
 if(attendee.id!==booker.id)rows.push(['ผู้ใช้งานห้อง',attendee.displayName]);
 if(b.rejectReason)rows.push(['เหตุผล',b.rejectReason]);
 const links=approvalUrl?[{label:'อนุมัติ',url:approvalUrl+'?d=approve'},{label:'ไม่อนุมัติ',url:approvalUrl+'?d=reject'},{label:'ดูคำขอทั้งหมด',url:url.split('/rooms/')[0]+'/rooms/approvals'}]:[{label:'ดูในระบบ',url}];
 return template(subject,rows,links);
}

