import 'server-only';
import {z} from 'zod';
import {randomInt,randomUUID} from 'node:crypto';
import type {Context} from './context';
import type {CarService,CarBookingService} from '../../contracts';
import type {Car,CarBooking} from '../../types';
import {getDb} from '../store';
import {now} from '@/shared/lib/clock';
import {appConfig} from '@/shared/config/app.config';
import {overlaps,millis} from '@/shared/lib/intervals';
import {ServiceError} from '../../errors';
import {carCreateSchema,mileageSchema} from '../../input-schemas';
import {notifyCar} from '../notifications';
export function available(car:Car,start:string,end:string,exclude?:string) {
 return car.active&&!getDb().carBookings.some(b=>b.carId===car.id&&b.id!==exclude&&(b.status==='IN_USE'||b.status==='CONFIRMED'&&overlaps(start,end,b.start,b.end)));
}
export function createCarServices(c:Context):{cars:CarService;carBookings:CarBookingService} {
 const access=()=>{c.feature('cars');return c.employee();};
 const owned=(id:string,admin=false)=>{const me=access(),b=c.find(getDb().carBookings,id);if(b.userId!==me.id&&!(admin&&me.roles.includes('ADMIN')))throw new ServiceError('FORBIDDEN');return b;};
 return {
 cars:{
 list:filter=>c.run(()=>{access();return getDb().cars.filter(x=>(!filter?.stationId||x.stationId===filter.stationId)&&(!filter?.type||x.type===filter.type));}),
 availability:q=>c.run(()=>{access();z.object({start:z.iso.datetime(),end:z.iso.datetime()}).parse(q);return getDb().cars.filter(car=>car.active&&(!q.type||car.type===q.type)&&(!q.minSeats||car.seats>=q.minSeats)).map(car=>{const busy=getDb().carBookings.filter(b=>b.carId===car.id&&['CONFIRMED','IN_USE'].includes(b.status)&&overlaps(q.start,q.end,b.start,b.end));return {car,available:available(car,q.start,q.end),busyUntil:getDb().carBookings.some(b=>b.carId===car.id&&b.status==='IN_USE')?null:busy.map(b=>b.end).sort().at(-1)??null};}).sort((a,b)=>Number(b.available)-Number(a.available)||a.car.number.localeCompare(b.car.number));})
 },
 carBookings:{
 create:input=>c.run(async()=>{
 const me=access(),v=carCreateSchema.parse(input),car=c.find(getDb().cars,v.carId),duration=millis(v.end)-millis(v.start),slot=appConfig.car.slotMinutes*60000;
 if(millis(v.start)<now().getTime()||millis(v.start)%slot||millis(v.end)%slot||duration<appConfig.car.minBookingMinutes*60000||duration>appConfig.car.maxBookingDays*86400000)throw new ServiceError('VALIDATION');
 if(!available(car,v.start,v.end))throw new ServiceError('CONFLICT');
 const codes=new Set(getDb().carBookings.filter(b=>['CONFIRMED','IN_USE'].includes(b.status)&&c.find(getDb().cars,b.carId).stationId===car.stationId).map(b=>b.pickupCode));
 const limit=10**appConfig.car.pickupCodeLength;if(codes.size>=limit)throw new ServiceError('CONFLICT');
 let code;do{code=randomInt(limit).toString().padStart(appConfig.car.pickupCodeLength,'0');}while(codes.has(code));
 const stamp=now().toISOString(),b:CarBooking={...v,id:'CB-'+randomUUID(),userId:me.id,driverName:v.driverName??null,status:'CONFIRMED',pickupCode:code,pickedUpAt:null,returnedAt:null,startMileage:null,endMileage:null,returnIssue:null,createdAt:stamp,updatedAt:stamp};
 getDb().carBookings.push(b);await notifyCar('CAR_BOOKING_CONFIRMED',b.id);return c.carDetail(b);
 }),
 listMine:scope=>c.run(()=>{const me=access();z.enum(['upcoming','active','history']).parse(scope);return getDb().carBookings.filter(b=>b.userId===me.id&&(scope==='active'?b.status==='IN_USE':scope==='upcoming'?b.status==='CONFIRMED':!['CONFIRMED','IN_USE'].includes(b.status)&&millis(b.updatedAt)>=now().getTime()-30*86400000)).sort((a,b)=>a.start.localeCompare(b.start)).map(c.carDetail);}),
 getById:id=>c.run(()=>{const me=access(),b=c.find(getDb().carBookings,id);if(b.userId!==me.id&&!me.roles.includes('ADMIN'))throw new ServiceError('NOT_FOUND');return c.carDetail(b);}),
 activePass:()=>c.run(()=>{const me=access();const b=getDb().carBookings.filter(b=>b.userId===me.id&&(b.status==='IN_USE'||b.status==='CONFIRMED'&&now().getTime()>=millis(b.start)-appConfig.car.pickupEarlyMinutes*60000&&now().getTime()<millis(b.start)+appConfig.car.noShowCancelMinutes*60000)).sort((a,b)=>a.start.localeCompare(b.start))[0];return b?c.carDetail(b):null;}),
 cancel:id=>c.run(()=>{const b=owned(z.string().min(1).parse(id),true);if(b.status!=='CONFIRMED')throw new ServiceError('INVALID_STATE');b.status='CANCELLED';b.updatedAt=now().toISOString();return c.carDetail(b);}),
 extend:(id,newEnd)=>c.run(()=>{const b=owned(id),end=z.iso.datetime().parse(newEnd);if(!['CONFIRMED','IN_USE'].includes(b.status))throw new ServiceError('INVALID_STATE');if(millis(end)<=millis(b.end)||millis(end)<=now().getTime()||millis(end)-millis(b.start)>appConfig.car.maxBookingDays*86400000||millis(end)%(appConfig.car.slotMinutes*60000))throw new ServiceError('VALIDATION');if(getDb().carBookings.some(x=>x.id!==b.id&&x.carId===b.carId&&['CONFIRMED','IN_USE'].includes(x.status)&&overlaps(b.start,end,x.start,x.end)))throw new ServiceError('CONFLICT','ขยายไม่ได้ มีคนจองรถคันนี้ต่อ');b.end=end;b.updatedAt=now().toISOString();return c.carDetail(b);}),
 submitReturnInfo:(id,input)=>c.run(()=>{const b=owned(id),v=mileageSchema.parse(input),car=c.find(getDb().cars,b.carId);if(b.status!=='IN_USE')throw new ServiceError('INVALID_STATE');if(v.mileage<car.currentMileage)throw new ServiceError('VALIDATION','เลขไมล์ต้องไม่น้อยกว่า '+new Intl.NumberFormat('en-US').format(car.currentMileage));b.endMileage=v.mileage;b.returnIssue=v.issue??null;b.updatedAt=now().toISOString();return c.carDetail(b);})
 }
 };
}

