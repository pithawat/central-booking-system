import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
import {createMockServices} from '@/shared/data/mock';
import {resetDb,getDb} from '@/shared/data/mock/store';
import {runDueJobs} from '@/shared/data/mock/jobs';
import {approvalToken} from '@/shared/lib/tokens';
import {now} from '@/shared/lib/clock';
import {bangkokDateTime,addDays,todayInBangkok} from '@/shared/lib/datetime';
import {freeRanges,endOptions,startOptions,draftRange} from '@/features/rooms/lib/slots';
import type {Role} from '@/shared/data/types';
const base=new Date('2026-10-07T02:10:00Z'); // 09:10 เวลาไทย
const svc=(sub:string,roles:Role[]=['EMPLOYEE'])=>createMockServices({sub,roles});
const tomorrow=addDays(todayInBangkok(base),1);
const at=(day:string,time:string)=>bangkokDateTime(day,time).toISOString();
const mails=(type:string,id?:string)=>getDb().mail.filter(m=>m.type===type&&(!id||m.bookingId===id));
beforeEach(()=>{vi.spyOn(Date,'now').mockReturnValue(base.getTime());resetDb(base);});
afterEach(()=>vi.restoreAllMocks());

describe('scenario F–J ระบบห้องประชุม',()=>{
 it('F: สมชายจอง → อีเมลขออนุมัติ → เปิดลิงก์ไม่เปลี่ยนสถานะ → อนุมัติ → ลิงก์เดิมไม่ error',async()=>{
  const b=await svc('U01').roomBookings.create({roomId:'RM-B2-402',start:at(tomorrow,'10:00'),end:at(tomorrow,'11:00'),title:'ทดสอบจองห้อง'});
  expect(b).toMatchObject({status:'PENDING',approverId:'U02',isMine:true});
  const request=mails('ROOM_APPROVAL_REQUEST',b.id);expect(request).toHaveLength(1);expect(request[0].to).toEqual(['wichai.s@example.com']);
  expect(request[0].subject).toContain('ขออนุมัติจองห้อง 2/4 ห้อง 402');
  const token=/\/approve\/([^"?]+)\?d=approve/.exec(request[0].html)![1];
  const anon=createMockServices(null);
  expect((await anon.approvals.viewByToken(token)).booking.status).toBe('PENDING');
  expect(getDb().roomBookings.find(x=>x.id===b.id)!.status).toBe('PENDING');
  expect((await anon.approvals.decideByToken(token,'APPROVE')).status).toBe('APPROVED');
  const approved=mails('ROOM_APPROVED',b.id);expect(approved).toHaveLength(1);expect(approved[0].to).toEqual(['somchai.j@example.com']);
  expect(approved[0].attachments?.[0]).toMatchObject({filename:'invite.ics',contentType:'text/calendar'});
  expect(Buffer.from(approved[0].attachments![0].contentBase64,'base64').toString()).toContain('BEGIN:VEVENT');
  expect((await anon.approvals.decideByToken(token,'REJECT','ไม่ได้')).status).toBe('APPROVED');
  expect(mails('ROOM_REJECTED',b.id)).toHaveLength(0);
  expect((await anon.approvals.viewByToken(token)).booking.status).toBe('APPROVED');
 });
 it('G: วิชัยไม่อนุมัติ RB-028 พร้อมเหตุผล แล้วช่องนั้นกลับมาว่าง',async()=>{
  const r=await svc('U02').approvals.reject('RB-028','ขอเลื่อนเป็นช่วงบ่าย');
  expect(r).toMatchObject({status:'REJECTED',rejectReason:'ขอเลื่อนเป็นช่วงบ่าย'});
  const mail=mails('ROOM_REJECTED','RB-028');expect(mail).toHaveLength(1);expect(mail[0].to).toEqual(['somchai.j@example.com']);expect(mail[0].text).toContain('ขอเลื่อนเป็นช่วงบ่าย');
  const day=await svc('U03').roomBookings.daySchedule(tomorrow);expect(day.bookings.some(b=>b.id==='RB-028')).toBe(false);
  await expect(svc('U03').roomBookings.create({roomId:'RM-B2-403',start:at(tomorrow,'10:00'),end:at(tomorrow,'11:00'),title:'ใช้ต่อ'})).resolves.toMatchObject({status:'PENDING'});
 });
 it('H: คำขอที่ค้าง PENDING หมดอายุเมื่อถึงเวลาเริ่ม และส่งอีเมลครั้งเดียว',async()=>{
  const b=getDb().roomBookings.find(x=>x.id==='RB-020')!;
  getDb().clockOffsetMs=new Date(b.start).getTime()-1-base.getTime();await runDueJobs(now());expect(b.status).toBe('PENDING');
  getDb().clockOffsetMs=new Date(b.start).getTime()-base.getTime();await runDueJobs(now());await runDueJobs(now());
  expect(b.status).toBe('EXPIRED');
  const mail=mails('ROOM_EXPIRED','RB-020');expect(mail).toHaveLength(1);expect(mail[0].to).toEqual(['manee.m@example.com']);expect(mail[0].subject).toBe('คำขอจองห้องหมดอายุ หัวหน้ายังไม่ได้อนุมัติ');
  await expect(svc('U04').approvals.approve('RB-020')).rejects.toMatchObject({code:'INVALID_STATE'});
 });
 it('I: ดารณีไม่มีหัวหน้า จองแล้วอนุมัติทันทีพร้อม invite.ics',async()=>{
  const b=await svc('U14').roomBookings.create({roomId:'RM-B2-403',start:at(tomorrow,'14:00'),end:at(tomorrow,'15:00'),title:'ประชุมผู้บริหาร'});
  expect(b).toMatchObject({status:'APPROVED',approverId:null});
  expect(mails('ROOM_APPROVAL_REQUEST',b.id)).toHaveLength(0);
  expect(mails('ROOM_APPROVED',b.id)[0].attachments?.[0].filename).toBe('invite.ics');
 });
 it('J: จองช่องเดียวกันพร้อมกันได้คนเดียว อีกคนได้ CONFLICT',async()=>{
  const input={roomId:'RM-B2-402',start:at(tomorrow,'07:00'),end:at(tomorrow,'07:30'),title:'ชนกัน'};
  const results=await Promise.allSettled([svc('U01').roomBookings.create(input),svc('U03').roomBookings.create(input)]);
  expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
  expect(results.find(r=>r.status==='rejected')).toMatchObject({reason:{code:'CONFLICT'}});
  await expect(svc('U03').roomBookings.create({...input,start:at(tomorrow,'07:00'),end:at(tomorrow,'08:00')})).rejects.toMatchObject({code:'CONFLICT'});
  await expect(svc('U03').roomBookings.create({...input,start:at(tomorrow,'07:30'),end:at(tomorrow,'08:00')})).resolves.toMatchObject({roomId:'RM-B2-402'});
 });
});

describe('การอนุมัติและงานตามเวลา',()=>{
 it('คนที่ไม่ใช่ผู้อนุมัติได้ FORBIDDEN และ ADMIN อนุมัติได้',async()=>{
  await expect(svc('U04').approvals.approve('RB-028')).rejects.toMatchObject({code:'FORBIDDEN'});
  await expect(svc('U03').approvals.reject('RB-028')).rejects.toMatchObject({code:'FORBIDDEN'});
  await expect(svc('U01').approvals.pending()).rejects.toMatchObject({code:'FORBIDDEN'});
  expect((await svc('U12',['EMPLOYEE','ADMIN']).approvals.approve('RB-028')).status).toBe('APPROVED');
 });
 it('approveMany อนุมัติหลายรายการและนับคำขอค้างถูกต้อง',async()=>{
  const me=svc('U02');const before=await me.approvals.pendingCount();expect(before).toBeGreaterThanOrEqual(1);
  const ids=(await me.approvals.pending()).map(b=>b.id);
  expect((await me.approvals.approveMany(ids)).every(b=>b.status==='APPROVED')).toBe(true);
  expect(await me.approvals.pendingCount()).toBe(0);
  expect((await me.approvals.history()).map(b=>b.id)).toEqual(expect.arrayContaining(ids));
 });
 it('อีเมลเตือนหัวหน้าส่งครั้งเดียวแม้รันงานหลายรอบ',async()=>{
  await runDueJobs(now());await runDueJobs(now());await svc('U01').roomBookings.listMine('upcoming');
  const reminders=mails('ROOM_APPROVAL_REMINDER','RB-028');expect(reminders).toHaveLength(1);expect(reminders[0].subject.startsWith('เตือน:')).toBe(true);
  expect(mails('ROOM_APPROVAL_REMINDER','RB-020')).toHaveLength(0); // สร้างมาแค่ 1 ชม.
 });
 it('เตือนหัวหน้าได้ห่างกันตาม cooldown และยกเลิกได้เฉพาะคนกดจอง',async()=>{
  const me=svc('U01');const r=await me.roomBookings.nudge('RB-028');
  expect(new Date(r.nextAllowedAt).getTime()-now().getTime()).toBe(2*3600000);
  expect(mails('ROOM_APPROVAL_NUDGE','RB-028')[0].subject).toBe('สมชาย ใจดี ขอให้ช่วยพิจารณาคำขอจองห้อง');
  await expect(me.roomBookings.nudge('RB-028')).rejects.toMatchObject({code:'RATE_LIMITED'});
  await expect(svc('U03').roomBookings.cancel('RB-028')).rejects.toMatchObject({code:'FORBIDDEN'});
  expect((await me.roomBookings.cancel('RB-028')).status).toBe('CANCELLED');
  await expect(me.roomBookings.nudge('RB-028')).rejects.toMatchObject({code:'INVALID_STATE'});
 });
 it('ตรวจช่วงเวลาที่จองได้ฝั่ง service',async()=>{
  const me=svc('U01'),today=todayInBangkok(base),room='RM-B2-403';
  const bad=[[at(today,'08:30'),at(today,'09:30')],[at(tomorrow,'06:30'),at(tomorrow,'07:30')],[at(tomorrow,'18:30'),at(tomorrow,'19:30')],[at(tomorrow,'10:15'),at(tomorrow,'11:00')],[at(tomorrow,'23:00'),at(addDays(tomorrow,1),'08:00')]];
  for(const [start,end] of bad)await expect(me.roomBookings.create({roomId:room,start,end,title:'x'}),start).rejects.toMatchObject({code:'VALIDATION'});
  await expect(me.roomBookings.create({roomId:room,start:at(tomorrow,'12:00'),end:at(tomorrow,'13:00'),title:'  '})).rejects.toMatchObject({name:'ZodError'});
  // ช่องที่เพิ่งเริ่มไปไม่เกิน 10 นาทียังจองได้ (09:10 จอง 09:00)
  await expect(me.roomBookings.create({roomId:room,start:at(today,'09:00'),end:at(today,'09:30'),title:'ทันเวลา'})).resolves.toMatchObject({status:'PENDING'});
 });
 it('รายละเอียดการจองเปิดได้เฉพาะผู้เกี่ยวข้อง',async()=>{
  await expect(svc('U03').roomBookings.getById('RB-028')).rejects.toMatchObject({code:'NOT_FOUND'});
  expect((await svc('U02').roomBookings.getById('RB-028')).isMine).toBe(false);
  expect((await svc('U01').roomBookings.getById('RB-028')).isMine).toBe(true);
 });
 it('token ที่ผิดหรือหมดอายุใช้ไม่ได้',async()=>{
  const anon=createMockServices(null),b=getDb().roomBookings.find(x=>x.id==='RB-028')!;
  await expect(anon.approvals.viewByToken('abc')).rejects.toMatchObject({code:'TOKEN_INVALID'});
  await expect(anon.approvals.viewByToken(await approvalToken('RB-028','U04',b.start))).rejects.toMatchObject({code:'TOKEN_INVALID'});
  const token=await approvalToken('RB-028','U02',b.start);getDb().clockOffsetMs=new Date(b.start).getTime()-base.getTime()+1000;
  await expect(anon.approvals.viewByToken(token)).rejects.toMatchObject({code:'TOKEN_EXPIRED'});
 });
});

describe('ช่วงเวลาในแผงจอง',()=>{
 const day='2026-10-08',bookings=[{start:at(day,'09:00'),end:at(day,'10:00')},{start:at(day,'13:00'),end:at(day,'16:00')}],early=new Date(at(day,'06:00'));
 it('ช่วงว่างตัดรอบการจองและเวลาที่ผ่านไป',()=>{
  expect(freeRanges(day,bookings,early).map(r=>[r.start,r.end])).toEqual([[at(day,'07:00'),at(day,'09:00')],[at(day,'10:00'),at(day,'13:00')],[at(day,'16:00'),at(day,'19:00')]]);
  expect(freeRanges(day,bookings,new Date(at(day,'10:35')))[0].start).toBe(at(day,'10:30'));
  expect(freeRanges(day,bookings,new Date(at(day,'10:45')))[0].start).toBe(at(day,'11:00'));
 });
 it('เวลาเริ่มที่ชนเลือกไม่ได้ และเวลาสิ้นสุดไม่เกินการจองถัดไป',()=>{
  const starts=startOptions(day,bookings,early);
  expect(starts.find(o=>o.label==='09:30')?.disabled).toBe(true);expect(starts.find(o=>o.label==='10:00')?.disabled).toBe(false);
  expect(endOptions(day,at(day,'11:00'),bookings).map(o=>o.label)).toEqual(['11:30','12:00','12:30','13:00']);
  expect(draftRange(day,at(day,'12:30'),bookings)).toEqual({start:at(day,'12:30'),end:at(day,'13:00')});
  expect(draftRange(day,at(day,'10:00'),bookings)).toEqual({start:at(day,'10:00'),end:at(day,'11:00')});
 });
});
