import {appConfig} from '@/shared/config/app.config';
import {bangkokDateTime,timeOptions,formatTime} from '@/shared/lib/datetime';
import {overlaps,millis,ceilSlot} from '@/shared/lib/intervals';
import type {RoomBookingDetail} from '@/shared/data/types';
type Span=Pick<RoomBookingDetail,'start'|'end'>;
const cfg=appConfig.room,slotMs=cfg.slotMinutes*60000;
export function daySlots(date:string) {return timeOptions(cfg.dayStart,cfg.dayEnd,cfg.slotMinutes).slice(0,-1).map(time=>bangkokDateTime(date,time).toISOString());}
export function dayBounds(date:string) {return {start:millis(bangkokDateTime(date,cfg.dayStart)),end:millis(bangkokDateTime(date,cfg.dayEnd))};}
export function roomFree(start:string,end:string,bookings:Span[]) {return !bookings.some(b=>overlaps(start,end,b.start,b.end));}
/** ช่องที่เริ่มก่อน now − lateBookingGrace ถือว่าผ่านไปแล้ว */
export function isPastSlot(slotStart:string|number,now:Date) {return millis(slotStart)<now.getTime()-cfg.lateBookingGraceMinutes*60000;}
export function slotEnd(slotStart:string) {return new Date(millis(slotStart)+slotMs).toISOString();}
/** ตำแหน่งเป็นเปอร์เซ็นต์ของวัน ใช้วางบล็อกที่เวลาไม่ตรงช่องได้ */
export function percentOfDay(date:string,value:string|number) {const {start,end}=dayBounds(date);return Math.min(100,Math.max(0,(millis(value)-start)/(end-start)*100));}
export function conflictOf<T extends Span>(start:string,end:string,bookings:T[]) {return bookings.find(b=>overlaps(start,end,b.start,b.end));}
export function startOptions(date:string,bookings:Span[],now:Date) {return daySlots(date).map(value=>({value,label:formatTime(value),disabled:isPastSlot(value,now)||!roomFree(value,slotEnd(value),bookings)}));}
/** เวลาสิ้นสุดที่เลือกได้: หลังเวลาเริ่มไปจนถึงต้นการจองถัดไปหรือ dayEnd */
export function maxEndFor(date:string,start:string,bookings:Span[]) {const next=bookings.map(b=>millis(b.start)).filter(t=>t>=millis(start)).sort((a,b)=>a-b)[0];return Math.min(next??Infinity,dayBounds(date).end);}
export function endOptions(date:string,start:string,bookings:Span[]) {const max=maxEndFor(date,start,bookings),result:{value:string;label:string}[]=[];for(let t=millis(start)+slotMs;t<=max;t+=slotMs)result.push({value:new Date(t).toISOString(),label:formatTime(t)});return result;}
export function freeRanges(date:string,bookings:Span[],now:Date) {
 const min=Math.max(millis(bangkokDateTime(date,cfg.dayStart)),ceilSlot(new Date(now.getTime()-cfg.lateBookingGraceMinutes*60000),cfg.slotMinutes).getTime()),max=millis(bangkokDateTime(date,cfg.dayEnd)),ranges:{start:string;end:string}[]=[];
 let cursor=min;
 for(const b of [...bookings].sort((a,b)=>a.start.localeCompare(b.start))) {const begin=Math.max(min,millis(b.start)),end=Math.min(max,millis(b.end));if(end<=cursor||begin>=max)continue;if(begin-cursor>=slotMs)ranges.push({start:new Date(cursor).toISOString(),end:new Date(begin).toISOString()});cursor=Math.max(cursor,end);}
 if(max-cursor>=slotMs)ranges.push({start:new Date(cursor).toISOString(),end:new Date(max).toISOString()});
 return ranges;
}
/** ช่วงเริ่มต้นของแผงจองเมื่อแตะช่องหรือชิป: ค่าเริ่มต้น 1 ชม. แต่ไม่เกินการจองถัดไป */
export function draftRange(date:string,start:string,bookings:Span[],limit?:string) {const max=Math.min(maxEndFor(date,start,bookings),limit?millis(limit):Infinity);return {start,end:new Date(Math.min(millis(start)+cfg.defaultDurationMinutes*60000,max)).toISOString()};}
/** จันทร์ของสัปดาห์ (ตามเวลาไทย) */
export function weekStart(date:string) {const d=bangkokDateTime(date,'12:00'),day=(d.getUTCDay()+6)%7;return new Date(d.getTime()-day*86400000).toISOString().slice(0,10);}
