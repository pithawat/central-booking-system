import type {RoomBooking} from '../../types';
import {rooms} from './rooms';
import {users} from './org';
import {overlaps,addMinutes} from '@/shared/lib/intervals';
import {addDays,todayInBangkok,bangkokDateTime,weekdayInBangkok} from '@/shared/lib/datetime';
export function mulberry32(seed:number) {return ()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export function fillBookings(t0:Date,existing:RoomBooking[]) {
 const random=mulberry32(20261007),result=[...existing];
 const choose=<T,>(values:readonly T[])=>values[Math.floor(random()*values.length)];
 const employees=users.filter(u=>Number(u.id.slice(1))>=2 && Number(u.id.slice(1))<=12);
 let count=0;
 for(let day=1;day<=14;day++) {
 const date=addDays(todayInBangkok(t0),day);
 if(['Sat','Sun'].includes(weekdayInBangkok(bangkokDateTime(date,'12:00'))))continue;
 for(const room of rooms) for(let n=Math.floor(random()*3);n>0;n--) {
 const start=bangkokDateTime(date,choose(['08:30','09:00','10:00','13:00','13:30','14:00','15:00'])).toISOString(),end=addMinutes(start,choose([60,90,120])).toISOString();
 const title=choose(['ประชุมทีมประจำสัปดาห์','อบรมพนักงานใหม่','ประชุมลูกค้า','ทบทวนแผนงาน','สัมภาษณ์งาน','ประชุมโครงการ','Weekly sync','Project review']);
 const user=choose(employees),status=random()<.9?'APPROVED':'PENDING';
 if(result.some(b=>b.roomId===room.id && ['PENDING','APPROVED'].includes(b.status) && overlaps(start,end,b.start,b.end)))continue;
 const createdAt=addMinutes(t0,-120).toISOString();
 result.push({id:'RB-F'+(++count).toString().padStart(3,'0'),roomId:room.id,title,start,end,bookedById:user.id,attendeeId:user.id,contactPhone:user.phone,status,approverId:user.supervisorId,decidedAt:status==='APPROVED'?createdAt:null,rejectReason:null,lastNudgedAt:null,createdAt,updatedAt:createdAt});
 }
 }
 return result;
}

