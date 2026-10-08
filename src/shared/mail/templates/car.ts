import {template} from './base';
import type {CarBooking,Car} from '@/shared/data/types';
import {formatDate,formatTime,formatRange,formatMileage} from '@/shared/lib/datetime';
import {appConfig} from '@/shared/config/app.config';
/** place = จุดรับ-คืนรถ (ป้อมประจำรถและฝั่ง) */
export function carTemplate(type:string,b:CarBooking,car:Car,url:string,qrSrc:string,place?:{station:string;site:string}) {
 const station=place?.station??'ป้อม รปภ.',at=place?.site?place.site+' · '+station:station;
 const titles:Record<string,string>={
 CAR_BOOKING_CONFIRMED:'ยืนยันการจองรถ #'+car.number+' · '+formatDate(b.start)+' '+formatRange(b.start,b.end),
 CAR_DAY_BEFORE_REMINDER:'เตือนล่วงหน้า: จองรถ #'+car.number+' ทะเบียน '+car.plate+' · รับรถ '+formatDate(b.start)+' '+formatTime(b.start),
 CAR_PICKUP_REMINDER:'ถึงเวลารับรถ #'+car.number+' แล้ว · รหัส '+b.pickupCode,
 CAR_HANDOVER_RECEIPT:'รับกุญแจรถ #'+car.number+' แล้ว '+formatTime(b.pickedUpAt ?? b.start),
 CAR_RETURN_REMINDER:'อีก '+appConfig.car.reminderBeforeReturnMinutes+' นาทีถึงเวลาคืนรถ #'+car.number,
 CAR_OVERDUE:'เกินเวลาคืนรถ #'+car.number,
 CAR_RETURN_RECEIPT:'คืนรถ #'+car.number+' เรียบร้อย '+formatTime(b.returnedAt ?? b.end)+' · เลขไมล์ '+formatMileage(b.endMileage ?? car.currentMileage),
 CAR_NO_SHOW:'การจองรถ #'+car.number+' ถูกยกเลิกอัตโนมัติ',CAR_SWAPPED:'เปลี่ยนรถเป็น #'+car.number,
 };
 const rows:[string,string][]=[['รถ',car.model+' · '+car.plate],['วัน',formatDate(b.start)],['เวลา',formatRange(b.start,b.end)],['วัตถุประสงค์',b.purpose],['ปลายทาง',b.destination],['รหัสรับรถ',b.pickupCode],['จุดรับ-คืนรถ',at],['วิธีรับรถ','ยื่น QR หรือบอกรหัสนี้กับ รปภ. ที่ '+station]];
 if(type==='CAR_HANDOVER_RECEIPT')rows.push(['หมายเหตุ','ถ้าไม่ใช่คุณ แจ้งฝ่ายธุรการทันที']);
 if(type==='CAR_NO_SHOW')rows.push(['เหตุผล','ไม่มารับรถภายใน '+appConfig.car.noShowCancelMinutes+' นาที']);
 return template(titles[type] ?? type,rows,[{label:'ดูในระบบ',url}],'<img width="240" height="240" alt="QR รับรถ" src="'+qrSrc+'"><p style="font-size:32px">'+b.pickupCode+'</p>');
}

