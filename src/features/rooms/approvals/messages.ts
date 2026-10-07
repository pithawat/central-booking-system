import type {RoomBookingDetail} from '@/shared/data/types';
import {formatDate,formatTime} from '@/shared/lib/datetime';
/** ข้อความเมื่อเปิดลิงก์อนุมัติที่ถูกตัดสินไปแล้ว เช่น "อนุมัติแล้วเมื่อ 10:05" */
export function decidedMessage(b:Pick<RoomBookingDetail,'status'|'decidedAt'|'updatedAt'>) {
 const at=(iso:string|null)=>{const v=iso??b.updatedAt;return formatTime(v)+' · '+formatDate(v);};
 return b.status==='APPROVED'?'อนุมัติแล้วเมื่อ '+at(b.decidedAt):b.status==='REJECTED'?'ไม่อนุมัติแล้วเมื่อ '+at(b.decidedAt):b.status==='CANCELLED'?'ผู้จองยกเลิกคำขอนี้แล้ว':b.status==='EXPIRED'?'คำขอนี้หมดอายุแล้ว เพราะถึงเวลาประชุมก่อนได้รับการอนุมัติ':'รออนุมัติ';
}
