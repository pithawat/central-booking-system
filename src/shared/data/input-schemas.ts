import {z} from 'zod';
import {appConfig} from '@/shared/config/app.config';
export const idSchema=z.string().trim().min(1).max(200);
export const intervalSchema=z.object({start:z.iso.datetime(),end:z.iso.datetime()}).refine(v=>v.end>v.start,{message:'เวลาสิ้นสุดต้องหลังเวลาเริ่ม',path:['end']});
export const carCreateSchema=z.object({carId:idSchema,start:z.iso.datetime(),end:z.iso.datetime(),purpose:z.string().trim().min(1,'กรุณากรอกวัตถุประสงค์').max(200),destination:z.string().trim().min(1,'กรุณากรอกปลายทาง').max(200),driverName:z.string().trim().min(1,'กรุณากรอกชื่อผู้ขับ').max(200).nullish()}).refine(v=>v.end>v.start,{message:'เวลาสิ้นสุดต้องหลังเวลาเริ่ม',path:['end']});
export const roomCreateSchema=z.object({roomId:idSchema,start:z.iso.datetime(),end:z.iso.datetime(),title:z.string().trim().min(1,'กรุณากรอกเรื่องที่ประชุม').max(appConfig.room.titleMaxLength),attendeeId:idSchema.optional(),contactPhone:z.string().max(50).optional()}).refine(v=>v.end>v.start,{message:'เวลาสิ้นสุดต้องหลังเวลาเริ่ม',path:['end']});
export const mileageSchema=z.object({mileage:z.number().int().nonnegative(),issue:z.string().max(2000).nullish()});
export const shiftSchema=z.object({stationId:idSchema,guardId:idSchema,pin:z.string().regex(new RegExp('^\\d{'+appConfig.guard.pinLength+'}$'),'PIN ไม่ถูกต้อง')});
export const methodSchema=z.enum(['QR','CODE','ID_CARD','TAP_LIST']);
export const handoverSchema=z.object({bookingId:idSchema,shiftId:idSchema,method:methodSchema});
export const receiveSchema=handoverSchema.extend({mileage:z.number().int().nonnegative().optional()});
export const swapSchema=z.object({bookingId:idSchema,newCarId:idSchema,shiftId:idSchema});
export const lookupSchema=z.object({stationId:idSchema,qrToken:z.string().max(500).optional(),code:z.string().regex(new RegExp('^\\d{'+appConfig.car.pickupCodeLength+'}$')).optional(),bookingId:idSchema.optional()}).refine(v=>[v.qrToken,v.code,v.bookingId].filter(Boolean).length===1);

