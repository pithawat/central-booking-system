import type {CarBooking,KeyLogEntry} from '../../types';
import {addMinutes,ceilSlot,floorSlot} from '@/shared/lib/intervals';
import {addDays,bangkokDateTime,todayInBangkok} from '@/shared/lib/datetime';
export function carBookings(t0:Date):{bookings:CarBooking[];logs:KeyLogEntry[]} {
 const next=ceilSlot(t0),floor=floorSlot(t0);
 const D=(n:number,time:string)=>bangkokDateTime(addDays(todayInBangkok(t0),n),time);
 const defs=[
 ['CB-001','U01','CAR-12',next,addMinutes(next,180),'CONFIRMED','4827','พบลูกค้าโครงการ','สำนักงานลูกค้า ย่านบางนา'],
 ['CB-002','U10','CAR-05',addMinutes(next,120),addMinutes(next,360),'CONFIRMED','3091','ตรวจความปลอดภัยหน้างาน','ไซต์งานลาดกระบัง'],
 ['CB-003','U11','CAR-08',addMinutes(next,210),addMinutes(next,390),'CONFIRMED','5512','รับอะไหล่เครื่องจักร','นิคมอุตสาหกรรมบางปู'],
 ['CB-004','U09','CAR-03',addMinutes(floor,-180),addMinutes(t0,-17),'IN_USE','7734','ตรวจรับสินค้า','คลังสินค้าบางนา'],
 ['CB-005','U08','CAR-07',addMinutes(floor,-60),addMinutes(floor,240),'IN_USE','2648','สัมภาษณ์งานนอกสถานที่','มหาวิทยาลัยย่านพญาไท'],
 ['CB-006','U03','CAR-01',D(-1,'09:00'),D(-1,'15:00'),'RETURNED','1188','พบลูกค้า','นนทบุรี'],
 ['CB-007','U01','CAR-02',D(1,'09:00'),D(1,'12:00'),'CONFIRMED','1905','ประชุมกับพาร์ทเนอร์','ย่านสีลม'],
 ['CB-008','U05','CAR-04',D(2,'08:00'),D(2,'17:00'),'CONFIRMED','6620','พาทีมดูงาน','จังหวัดสระบุรี'],
 ['CB-009','U07','CAR-06',D(-1,'13:00'),D(-1,'16:00'),'NO_SHOW','4410','ส่งเอกสาร','สำนักงานเขต'],
 ['CB-010','U03','CAR-03',addMinutes(next,30),addMinutes(next,150),'CONFIRMED','3356','ส่งตัวอย่างสินค้า','ย่านรังสิต'],
 ] as const;
 const bookings:CarBooking[]=defs.map(([id,userId,carId,start,end,status,pickupCode,purpose,destination])=>({
 id,userId,carId,start:start.toISOString(),end:end.toISOString(),status,pickupCode,purpose,destination,driverName:id==='CB-008'?'ไพโรจน์ ขับดี':null,
 pickedUpAt:id==='CB-004'?addMinutes(start,5).toISOString():id==='CB-005'?addMinutes(start,3).toISOString():id==='CB-006'?D(-1,'09:04').toISOString():null,
 returnedAt:id==='CB-006'?D(-1,'15:10').toISOString():null,startMileage:id==='CB-004'?72350:id==='CB-005'?80540:id==='CB-006'?45120:null,endMileage:id==='CB-006'?45188:null,returnIssue:null,createdAt:addMinutes(start,-60).toISOString(),updatedAt:t0.toISOString()}));
 const logs:KeyLogEntry[]=[];
 for(const b of bookings) if(b.pickedUpAt) {
 logs.push({id:'KL-'+b.id+'-H',bookingId:b.id,carId:b.carId,stationId:'ST-GATE1',type:'HANDOVER',at:b.pickedUpAt,userId:b.userId,guardId:b.id==='CB-005'?'U15':'U13',method:b.id==='CB-005'?'CODE':'QR',mileage:b.startMileage,note:null});
 if(b.returnedAt) logs.push({id:'KL-'+b.id+'-R',bookingId:b.id,carId:b.carId,stationId:'ST-GATE1',type:'RECEIVE',at:b.returnedAt,userId:b.userId,guardId:'U15',method:'TAP_LIST',mileage:b.endMileage,note:null});
 }
 return {bookings,logs};
}

