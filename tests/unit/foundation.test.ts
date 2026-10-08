import {describe,it,expect} from 'vitest';
import {formatDate,formatTime,formatPeriod,periodParts,bangkokDateTime,todayInBangkok} from '@/shared/lib/datetime';
import {overlaps} from '@/shared/lib/intervals';
import {createSeed} from '@/shared/data/mock/store';
import {UserSchema,RoomSchema,CarSchema,CarBookingSchema,RoomBookingSchema} from '@/shared/data/schemas';
describe('เวลาไทย',()=>{
 it('แสดง ค.ศ. และ พ.ศ. พร้อมเวลาไทย',()=>{const d=new Date('2026-10-07T02:30:00Z');expect(formatDate(d)).toBe('พ. 7 ต.ค. 2026');expect(formatDate(d,'BE')).toContain('2569');expect(formatTime(d)).toBe('09:30');expect(bangkokDateTime(todayInBangkok(d),formatTime(d)).toISOString()).toBe(d.toISOString());});
 it('ช่วงวันเวลาแยก 2 ท่อนให้ตัดบรรทัดได้ แต่ข้อความรวมเหมือนเดิม',()=>{const a=bangkokDateTime('2026-10-08','09:00'),b=bangkokDateTime('2026-10-08','10:30'),c=bangkokDateTime('2026-10-09','17:00');expect(periodParts(a,b)).toEqual(['พฤ. 8 ต.ค. 2026 ·','09:00–10:30']);expect(formatPeriod(a,b)).toBe('พฤ. 8 ต.ค. 2026 · 09:00–10:30');expect(periodParts(a,c)).toEqual(['พฤ. 8 ต.ค. 09:00 –','ศ. 9 ต.ค. 17:00']);expect(formatPeriod(a,c)).toBe('พฤ. 8 ต.ค. 09:00 – ศ. 9 ต.ค. 17:00');});
 it('ใช้ช่วงแบบ half-open',()=>{expect(overlaps(0,10,10,20)).toBe(false);expect(overlaps(0,10,5,15)).toBe(true);expect(overlaps(0,10,2,8)).toBe(true);});
});
describe('ข้อมูลตั้งต้น',()=>{
 const db=createSeed(new Date('2026-10-07T02:30:00Z'));
 it('จำนวนและสคีมาตรงตามสเปก',()=>{expect(db.rooms).toHaveLength(17);expect(db.rooms.filter(r=>r.siteId==='SITE-OFFICE')).toHaveLength(14);expect(db.cars).toHaveLength(12);expect(db.users).toHaveLength(16);UserSchema.array().parse(db.users);RoomSchema.array().parse(db.rooms);CarSchema.array().parse(db.cars);CarBookingSchema.array().parse(db.carBookings);RoomBookingSchema.array().parse(db.roomBookings);});
 it('ไม่มีรายการ block ซ้อนกัน',()=>{for(const all of [db.carBookings.filter(b=>['CONFIRMED','IN_USE'].includes(b.status)).map(b=>({...b,resource:b.carId})),db.roomBookings.filter(b=>['PENDING','APPROVED'].includes(b.status)).map(b=>({...b,resource:b.roomId}))])for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)if(all[i].resource===all[j].resource)expect(overlaps(all[i].start,all[i].end,all[j].start,all[j].end),all[i].id+' '+all[j].id).toBe(false);});
 it('ทุกคำขอใช้หัวหน้าผู้จอง',()=>{for(const b of db.roomBookings.filter(b=>b.status==='PENDING'))expect(b.approverId).toBe(db.users.find(u=>u.id===b.bookedById)?.supervisorId);});
 it('filler ทำซ้ำได้',()=>{expect(createSeed(new Date('2026-10-07T02:30:00Z')).roomBookings).toEqual(db.roomBookings);});
});

