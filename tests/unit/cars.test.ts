import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
import {createMockServices} from '@/shared/data/mock';
import {resetDb,getDb} from '@/shared/data/mock/store';
import {runDueJobs} from '@/shared/data/mock/jobs';
import {carToken} from '@/shared/lib/tokens';
import {now} from '@/shared/lib/clock';
import type {Role} from '@/shared/data/types';
const base=new Date('2026-10-07T02:10:00Z');
const svc=(sub:string,roles:Role[]=['EMPLOYEE'])=>createMockServices({sub,roles});
beforeEach(()=>{vi.spyOn(Date,'now').mockReturnValue(base.getTime());resetDb(base);});
afterEach(()=>vi.restoreAllMocks());
async function guard(){const s=svc('U90',['STATION']);const shift=await s.guard.startShift({stationId:'ST-GATE1',guardId:'U13',pin:'1234'});return {s,shift};}
describe('scenario A–E และกฎรถ',()=>{
 it('A/B: QR รับรถ → ส่งเลขไมล์ → รับคืน พร้อม log และอีเมล',async()=>{
 const me=svc('U01'),{s,shift}=await guard(),pass=await me.carBookings.activePass();expect(pass?.pickupCode).toBe('4827');
 expect((await s.guard.lookup({stationId:'ST-GATE1',qrToken:pass!.qrToken!})).kind).toBe('PICKUP');
 await s.guard.handover({bookingId:'CB-001',shiftId:shift.id,method:'QR'});
 await expect(me.carBookings.submitReturnInfo('CB-001',{mileage:40000})).rejects.toMatchObject({code:'VALIDATION'});
 await me.carBookings.submitReturnInfo('CB-001',{mileage:45260});
 expect((await me.carBookings.getById('CB-001')).status).toBe('IN_USE');
 await s.guard.receive({bookingId:'CB-001',shiftId:shift.id,method:'TAP_LIST'});
 expect(getDb().cars.find(c=>c.id==='CAR-12')?.currentMileage).toBe(45260);
 expect((await me.carBookings.getById('CB-001')).status).toBe('RETURNED');
 expect(getDb().keyLog.filter(l=>l.bookingId==='CB-001').map(l=>[l.type,l.method])).toEqual([['HANDOVER','QR'],['RECEIVE','TAP_LIST']]);
 expect(getDb().mail.filter(m=>m.bookingId==='CB-001').map(m=>m.type)).toEqual(expect.arrayContaining(['CAR_HANDOVER_RECEIPT','CAR_RETURN_RECEIPT']));
 await expect(s.guard.receive({bookingId:'CB-001',shiftId:shift.id,method:'TAP_LIST'})).rejects.toMatchObject({code:'INVALID_STATE'});
 });
 it('C: รถเกินเวลายังไม่ว่างแม้ค้นหาวันถัดไป และอีเมลส่งครั้งเดียว',async()=>{
 const me=svc('U01');const list=await me.cars.availability({start:'2026-10-08T02:00:00.000Z',end:'2026-10-08T04:00:00.000Z'});
 expect(list.find(c=>c.car.id==='CAR-03')).toMatchObject({available:false,busyUntil:null});
 await runDueJobs(now());await runDueJobs(now());
 expect(getDb().mail.filter(m=>m.type==='CAR_OVERDUE'&&m.bookingId==='CB-004')).toHaveLength(1);
 });
 it('D: กุญแจยังไม่คืน → สลับรถ → มอบกุญแจ',async()=>{
 const {s,shift}=await guard();await svc('U01').dev!.shiftClock(30);
 const result=await s.guard.lookup({stationId:'ST-GATE1',code:'3356'});expect(result.kind).toBe('KEY_NOT_RETURNED');if(result.kind!=='KEY_NOT_RETURNED')throw new Error('lookup');
 await s.guard.swapCar({bookingId:'CB-010',newCarId:result.alternatives[0].id,shiftId:shift.id});
 await s.guard.handover({bookingId:'CB-010',shiftId:shift.id,method:'CODE'});
 expect(getDb().mail.some(m=>m.type==='CAR_SWAPPED'&&m.bookingId==='CB-010')).toBe(true);
 });
 it('E: ยังไม่ถึงเวลารับ และ no-show ที่ขอบ start + 30 นาที',async()=>{
 const {s}=await guard();expect((await s.guard.lookup({stationId:'ST-GATE1',code:'3091'})).kind).toBe('TOO_EARLY');
 const b=getDb().carBookings.find(b=>b.id==='CB-002')!;getDb().clockOffsetMs=new Date(b.start).getTime()+30*60000-base.getTime();await runDueJobs(now());
 expect(b.status).toBe('NO_SHOW');expect(getDb().mail.some(m=>m.type==='CAR_NO_SHOW'&&m.bookingId===b.id)).toBe(true);
 });
 it('lookup ทุกกรณี รวม QR signature ที่เปลี่ยน',async()=>{
 const {s}=await guard();
 for(const [id,kind] of [['CB-001','PICKUP'],['CB-002','TOO_EARLY'],['CB-004','RETURN'],['CB-006','INVALID'],['CB-009','INVALID']])expect((await s.guard.lookup({stationId:'ST-GATE1',qrToken:carToken(id)})).kind).toBe(kind);
 expect((await s.guard.lookup({stationId:'ST-GATE1',code:'9999'})).kind).toBe('NOT_FOUND');
 expect(await s.guard.lookup({stationId:'ST-GATE1',qrToken:carToken('CB-001').slice(0,-1)+'!'})).toEqual({kind:'INVALID',reason:'TOKEN_INVALID'});
 });
 it('จองพร้อมกันได้หนึ่งรายการและรหัส active ไม่ซ้ำ',async()=>{
 const input={carId:'CAR-06',start:'2026-10-08T02:00:00.000Z',end:'2026-10-08T03:00:00.000Z',purpose:'ทดสอบ',destination:'บางนา'};
 const results=await Promise.allSettled([svc('U01').carBookings.create(input),svc('U03').carBookings.create(input)]);
 expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(results.find(r=>r.status==='rejected')).toMatchObject({reason:{code:'CONFLICT'}});
 const codes=getDb().carBookings.filter(b=>['IN_USE','CONFIRMED'].includes(b.status)).map(b=>b.pickupCode);expect(new Set(codes).size).toBe(codes.length);
 });
 it('ผู้ใช้ทั่วไปทำรายการป้อมไม่ได้และอ่าน QR คนอื่นไม่ได้',async()=>{
 await expect(svc('U01').guard.startShift({stationId:'ST-GATE1',guardId:'U13',pin:'1234'})).rejects.toMatchObject({code:'FORBIDDEN'});
 expect((await svc('U12',['EMPLOYEE','ADMIN']).carBookings.getById('CB-001')).qrToken).toBeNull();
 await expect(svc('U03').carBookings.getById('CB-001')).rejects.toMatchObject({code:'NOT_FOUND'});
 });
});

