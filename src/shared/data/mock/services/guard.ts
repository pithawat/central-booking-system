import 'server-only';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import type {Context} from './context';
import type {GuardService,GuardLookupResult} from '../../contracts';
import {getDb} from '../store';
import {now} from '@/shared/lib/clock';
import {appConfig} from '@/shared/config/app.config';
import {millis} from '@/shared/lib/intervals';
import {todayInBangkok} from '@/shared/lib/datetime';
import {readCarToken} from '@/shared/lib/tokens';
import {ServiceError} from '../../errors';
import {shiftSchema,lookupSchema,handoverSchema,receiveSchema,swapSchema} from '../../input-schemas';
import {available} from './cars';
import {notifyCar} from '../notifications';
export function createGuardService(c:Context):GuardService {
 function station(id:string) {c.feature('cars');const me=c.allow(['STATION']);if(me.stationId!==id)throw new ServiceError('FORBIDDEN');return c.find(getDb().stations,id);}
 function active(stationId:string) {return getDb().shifts.find(s=>s.stationId===stationId&&!s.endedAt)??null;}
 function shift(id:string) {const s=c.find(getDb().shifts,id);station(s.stationId);if(s.endedAt||active(s.stationId)?.id!==id)throw new ServiceError('INVALID_STATE');return s;}
 function rate(key:string,failed=false) {
 const db=getDb(),time=now().getTime(),state=db.attempts[key]??={times:[],blockedUntil:0};
 if(state.blockedUntil>time)throw new ServiceError('RATE_LIMITED','พิมพ์รหัสผิดหลายครั้ง รอ '+appConfig.guard.wrongAttemptCooldownSeconds+' วินาทีแล้วลองใหม่');
 state.times=state.times.filter(t=>t>time-60000);
 if(failed){state.times.push(time);if(state.times.length>appConfig.guard.wrongAttemptLimit){state.blockedUntil=time+appConfig.guard.wrongAttemptCooldownSeconds*1000;throw new ServiceError('RATE_LIMITED');}}
 }
 function lookup(input:Parameters<GuardService['lookup']>[0]):GuardLookupResult {
 const v=lookupSchema.parse(input);station(v.stationId);if(!active(v.stationId))throw new ServiceError('FORBIDDEN');
 const key='code:'+v.stationId;rate(key);
 let id=v.bookingId;
 if(v.qrToken)try{id=readCarToken(v.qrToken);}catch{return {kind:'INVALID',reason:'TOKEN_INVALID'};}
 const db=getDb(),b=id?db.carBookings.find(b=>b.id===id):db.carBookings.find(b=>b.pickupCode===v.code&&['CONFIRMED','IN_USE'].includes(b.status)&&c.find(db.cars,b.carId).stationId===v.stationId);
 if(!b){if(v.code)rate(key,true);return {kind:'NOT_FOUND'};}
 if(b.status==='CANCELLED'||b.status==='NO_SHOW'||b.status==='RETURNED')return {kind:'INVALID',reason:b.status};
 const car=c.find(db.cars,b.carId);
 if(car.stationId!==v.stationId)return {kind:'INVALID',reason:'WRONG_STATION'};
 const booking=c.carDetail(b);
 if(b.status==='IN_USE')return {kind:'RETURN',booking};
 const from=millis(b.start)-appConfig.car.pickupEarlyMinutes*60000;
 if(now().getTime()<from)return {kind:'TOO_EARLY',booking,availableFrom:new Date(from).toISOString()};
 const holder=db.carBookings.find(x=>x.carId===b.carId&&x.id!==b.id&&x.status==='IN_USE');
 if(holder)return {kind:'KEY_NOT_RETURNED',booking,holder:c.carDetail(holder),alternatives:db.cars.filter(x=>x.stationId===v.stationId&&available(x,now().toISOString(),b.end,b.id))};
 return {kind:'PICKUP',booking};
 }
 return {
 // พนักงานอ่านรายชื่อป้อมได้ (ชื่อ + ฝั่ง) เพื่อแสดงจุดรับ-คืนรถ ส่วนแท็บเล็ตป้อมยังเห็นเฉพาะป้อมของตัวเอง
 stations:()=>c.run(()=>{c.feature('cars');const me=c.allow(['EMPLOYEE','STATION','ADMIN']);return getDb().stations.filter(s=>!me.roles.includes('STATION')||me.roles.includes('ADMIN')||s.id===me.stationId);}),
 guardsOf:id=>c.run(()=>{station(id);return getDb().users.filter(u=>u.stationId===id&&u.roles.includes('GUARD'));}),
 activeShift:id=>c.run(()=>{station(id);const s=active(id);return s?{...s,guard:c.find(getDb().users,s.guardId)}:null;}),
 startShift:input=>c.run(()=>{const v=shiftSchema.parse(input);station(v.stationId);const key='pin:'+v.stationId;rate(key);const guard=c.find(getDb().users,v.guardId);if(guard.stationId!==v.stationId||!guard.roles.includes('GUARD'))throw new ServiceError('FORBIDDEN');if(getDb().guardPins[v.guardId]!==v.pin){rate(key,true);throw new ServiceError('VALIDATION','PIN ไม่ถูกต้อง');}if(active(v.stationId))throw new ServiceError('CONFLICT');const s={id:randomUUID(),stationId:v.stationId,guardId:v.guardId,startedAt:now().toISOString(),endedAt:null};getDb().shifts.push(s);delete getDb().attempts[key];return s;}),
 endShift:id=>c.run(()=>{z.string().min(1).parse(id);shift(id).endedAt=now().toISOString();}),
 board:id=>c.run(()=>{station(id);const all=getDb().carBookings.filter(b=>c.find(getDb().cars,b.carId).stationId===id);return {waiting:all.filter(b=>b.status==='CONFIRMED'&&todayInBangkok(b.start)===todayInBangkok(now())).sort((a,b)=>a.start.localeCompare(b.start)).map(c.carDetail),out:all.filter(b=>b.status==='IN_USE').sort((a,b)=>a.end.localeCompare(b.end)).map(c.carDetail)};}),
 lookup:v=>c.run(()=>lookup(v)),
 handover:input=>c.run(async()=>{const v=handoverSchema.parse(input),s=shift(v.shiftId),result=lookup({stationId:s.stationId,bookingId:v.bookingId});if(result.kind!=='PICKUP')throw new ServiceError(result.kind==='KEY_NOT_RETURNED'?'CONFLICT':'OUTSIDE_WINDOW');const b=c.find(getDb().carBookings,v.bookingId),car=c.find(getDb().cars,b.carId);b.status='IN_USE';b.pickedUpAt=now().toISOString();b.updatedAt=b.pickedUpAt;b.startMileage=car.currentMileage;getDb().keyLog.push({id:randomUUID(),bookingId:b.id,carId:b.carId,stationId:s.stationId,type:'HANDOVER',at:b.pickedUpAt,userId:b.userId,guardId:s.guardId,method:v.method,mileage:b.startMileage,note:null});await notifyCar('CAR_HANDOVER_RECEIPT',b.id);return c.carDetail(b);}),
 receive:input=>c.run(async()=>{const v=receiveSchema.parse(input),s=shift(v.shiftId),b=c.find(getDb().carBookings,v.bookingId),car=c.find(getDb().cars,b.carId);if(car.stationId!==s.stationId)throw new ServiceError('FORBIDDEN');if(b.status!=='IN_USE')throw new ServiceError('INVALID_STATE');const mileage=v.mileage??b.endMileage;if(appConfig.car.requireMileageOnReturn&&mileage==null)throw new ServiceError('VALIDATION','กรุณากรอกเลขไมล์');if(mileage!=null&&mileage<car.currentMileage)throw new ServiceError('VALIDATION','เลขไมล์ต้องไม่น้อยกว่า '+car.currentMileage);b.status='RETURNED';b.returnedAt=now().toISOString();b.updatedAt=b.returnedAt;b.endMileage=mileage??car.currentMileage;car.currentMileage=b.endMileage;getDb().keyLog.push({id:randomUUID(),bookingId:b.id,carId:b.carId,stationId:s.stationId,type:'RECEIVE',at:b.returnedAt,userId:b.userId,guardId:s.guardId,method:v.method,mileage:b.endMileage,note:b.returnIssue});await notifyCar('CAR_RETURN_RECEIPT',b.id);return c.carDetail(b);}),
 swapCar:input=>c.run(async()=>{const v=swapSchema.parse(input),s=shift(v.shiftId),b=c.find(getDb().carBookings,v.bookingId),old=c.find(getDb().cars,b.carId),car=c.find(getDb().cars,v.newCarId);if(old.stationId!==s.stationId||car.stationId!==s.stationId)throw new ServiceError('FORBIDDEN');if(b.status!=='CONFIRMED'||!getDb().carBookings.some(x=>x.id!==b.id&&x.carId===b.carId&&x.status==='IN_USE'))throw new ServiceError('INVALID_STATE');if(!available(car,now().toISOString(),b.end,b.id))throw new ServiceError('CONFLICT');b.carId=car.id;b.updatedAt=now().toISOString();await notifyCar('CAR_SWAPPED',b.id);return c.carDetail(b);})
 };
}

