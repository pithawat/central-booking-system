import 'server-only';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import type {RoomService,RoomBookingService,ApprovalService,RoomFilter} from '../../contracts';
import type {RoomBooking} from '../../types';
import type {Context} from './context';
import {getDb} from '../store';
import {now} from '@/shared/lib/clock';
import {appConfig} from '@/shared/config/app.config';
import {millis,overlaps} from '@/shared/lib/intervals';
import {todayInBangkok,formatTime,addDays} from '@/shared/lib/datetime';
import {roomCreateSchema,idSchema} from '../../input-schemas';
import {ServiceError} from '../../errors';
import {notifyRoom} from '../notifications';
import {readApprovalToken} from '@/shared/lib/tokens';
import {env} from '@/shared/config/env';
export function createRoomServices(c:Context):{rooms:RoomService;roomBookings:RoomBookingService;approvals:ApprovalService} {
 const access=()=>{c.feature('rooms');return c.employee();};
 const list=(f?:RoomFilter)=>getDb().rooms.filter(r=>r.active&&(!f?.siteId||r.siteId===f.siteId)&&(!f?.minCapacity||r.capacity>=f.minCapacity)&&(!f?.tvOnly||r.hasTv===true)).sort((a,b)=>a.sortOrder-b.sortOrder);
 const blocking=(b:RoomBooking)=>['PENDING','APPROVED'].includes(b.status);
 function canDecide(b:RoomBooking) {const me=access();if(b.approverId!==me.id&&!me.roles.includes('ADMIN'))throw new ServiceError('FORBIDDEN');if(b.status!=='PENDING')throw new ServiceError('INVALID_STATE');if(now().getTime()>=millis(b.start))throw new ServiceError('OUTSIDE_WINDOW');}
 function setDecision(b:RoomBooking,decision:'APPROVE'|'REJECT',reason?:string) {if(b.status!=='PENDING')return false;if(now().getTime()>=millis(b.start))throw new ServiceError('OUTSIDE_WINDOW');b.status=decision==='APPROVE'?'APPROVED':'REJECTED';b.decidedAt=now().toISOString();b.updatedAt=b.decidedAt;b.rejectReason=decision==='REJECT'?reason??null:null;return true;}
 async function tokenBooking(token:string) {c.feature('rooms');if(appConfig.room.approval.linkRequiresLogin)c.user();const payload=await readApprovalToken(z.string().min(1).max(4000).parse(token)),b=c.find(getDb().roomBookings,payload.bookingId);if(b.approverId!==payload.approverId)throw new ServiceError('TOKEN_INVALID');return {b,approver:c.find(getDb().users,payload.approverId)};}
 return {
 rooms:{sites:()=>c.run(()=>{access();return getDb().sites;}),buildings:()=>c.run(()=>{access();return getDb().buildings;}),list:f=>c.run(()=>{access();return list(f);}),getById:id=>c.run(()=>{access();return c.find(getDb().rooms,id);})},
 roomBookings:{
 daySchedule:(date,f)=>c.run(()=>{access();z.iso.date().parse(date);const rooms=list(f);return {date,sites:getDb().sites,buildings:getDb().buildings,rooms,bookings:getDb().roomBookings.filter(b=>rooms.some(r=>r.id===b.roomId)&&blocking(b)&&todayInBangkok(b.start)===date).map(c.roomDetail)};}),
 listByRoom:(roomId,from,to)=>c.run(()=>{access();idSchema.parse(roomId);z.iso.date().parse(from);z.iso.date().parse(to);return getDb().roomBookings.filter(b=>b.roomId===roomId&&blocking(b)&&todayInBangkok(b.start)>=from&&todayInBangkok(b.start)<=to).map(c.roomDetail);}),
 create:input=>c.run(async()=>{
 const me=access(),v=roomCreateSchema.parse(input),room=c.find(getDb().rooms,v.roomId),start=millis(v.start),end=millis(v.end),cfg=appConfig.room;
 const day=todayInBangkok(v.start);
 if(!room.active||start<now().getTime()-cfg.lateBookingGraceMinutes*60000||end<=start||todayInBangkok(v.end)!==day||formatTime(v.start)<cfg.dayStart||formatTime(v.end)>cfg.dayEnd||start%(cfg.slotMinutes*60000)||end%(cfg.slotMinutes*60000)||day>addDays(todayInBangkok(now()),cfg.maxAdvanceDays))throw new ServiceError('VALIDATION');
 if(getDb().roomBookings.some(b=>b.roomId===v.roomId&&blocking(b)&&overlaps(v.start,v.end,b.start,b.end)))throw new ServiceError('CONFLICT');
 const attendee=c.find(getDb().users,v.attendeeId??me.id);if(!attendee.roles.includes('EMPLOYEE'))throw new ServiceError('VALIDATION');
 const auto=!cfg.approval.enabled||!me.supervisorId&&cfg.approval.autoApproveWhenNoSupervisor;
 if(!auto&&!me.supervisorId)throw new ServiceError('VALIDATION','ไม่พบหัวหน้าผู้อนุมัติ ติดต่อฝ่ายธุรการ');
 const stamp=now().toISOString(),b:RoomBooking={id:'RB-'+randomUUID(),roomId:v.roomId,title:v.title,start:v.start,end:v.end,bookedById:me.id,attendeeId:attendee.id,contactPhone:v.contactPhone??me.phone,status:auto?'APPROVED':'PENDING',approverId:auto?null:me.supervisorId,decidedAt:auto?stamp:null,rejectReason:null,lastNudgedAt:null,createdAt:stamp,updatedAt:stamp};
 getDb().roomBookings.push(b);await notifyRoom(auto?'ROOM_APPROVED':'ROOM_APPROVAL_REQUEST',b.id);return c.roomDetail(b);
 }),
 listMine:scope=>c.run(()=>{const me=access();z.enum(['upcoming','history']).parse(scope);return getDb().roomBookings.filter(b=>(b.bookedById===me.id||b.attendeeId===me.id)&&(scope==='upcoming'?blocking(b)&&millis(b.end)>now().getTime():(!blocking(b)||millis(b.end)<=now().getTime())&&millis(b.updatedAt)>=now().getTime()-30*86400000)).sort((a,b)=>a.start.localeCompare(b.start)).map(c.roomDetail);}),
 getById:id=>c.run(()=>{const me=access(),b=c.find(getDb().roomBookings,id);if(![b.bookedById,b.attendeeId,b.approverId].includes(me.id)&&!me.roles.includes('ADMIN'))throw new ServiceError('NOT_FOUND');return c.roomDetail(b);}),
 cancel:id=>c.run(()=>{const me=access(),b=c.find(getDb().roomBookings,idSchema.parse(id));if(b.bookedById!==me.id&&!me.roles.includes('ADMIN'))throw new ServiceError('FORBIDDEN');if(!blocking(b))throw new ServiceError('INVALID_STATE');if(now().getTime()>=millis(b.end))throw new ServiceError('OUTSIDE_WINDOW');b.status='CANCELLED';b.updatedAt=now().toISOString();return c.roomDetail(b);}),
 nudge:id=>c.run(async()=>{const me=access(),b=c.find(getDb().roomBookings,idSchema.parse(id));if(b.bookedById!==me.id&&!me.roles.includes('ADMIN'))throw new ServiceError('FORBIDDEN');if(b.status!=='PENDING'||!b.approverId)throw new ServiceError('INVALID_STATE');if(b.lastNudgedAt&&now().getTime()<millis(b.lastNudgedAt)+appConfig.room.approval.nudgeCooldownHours*3600000)throw new ServiceError('RATE_LIMITED');b.lastNudgedAt=now().toISOString();b.updatedAt=b.lastNudgedAt;await notifyRoom('ROOM_APPROVAL_NUDGE',b.id);return {nextAllowedAt:new Date(millis(b.lastNudgedAt)+appConfig.room.approval.nudgeCooldownHours*3600000).toISOString()};})
 },
 approvals:{
 pending:()=>c.run(()=>{const me=access();if(!me.roles.includes('ADMIN')&&!getDb().users.some(u=>u.supervisorId===me.id))throw new ServiceError('FORBIDDEN');return getDb().roomBookings.filter(b=>b.status==='PENDING'&&(b.approverId===me.id||me.roles.includes('ADMIN'))).sort((a,b)=>a.start.localeCompare(b.start)).map(c.roomDetail);}),
 pendingCount:()=>c.run(()=>{const me=access();return getDb().roomBookings.filter(b=>b.status==='PENDING'&&(b.approverId===me.id||me.roles.includes('ADMIN'))).length;}),
 history:(days=30)=>c.run(()=>{const me=access();z.number().int().min(1).max(365).parse(days);if(!me.roles.includes('ADMIN')&&!getDb().users.some(u=>u.supervisorId===me.id))throw new ServiceError('FORBIDDEN');return getDb().roomBookings.filter(b=>b.status!=='PENDING'&&(b.approverId===me.id||me.roles.includes('ADMIN'))&&millis(b.updatedAt)>=now().getTime()-days*86400000).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).map(c.roomDetail);}),
 approve:id=>c.run(async()=>{const b=c.find(getDb().roomBookings,idSchema.parse(id));canDecide(b);setDecision(b,'APPROVE');await notifyRoom('ROOM_APPROVED',b.id);return c.roomDetail(b);}),
 reject:(id,reason)=>c.run(async()=>{const b=c.find(getDb().roomBookings,idSchema.parse(id));const value=z.string().trim().max(2000).optional().parse(reason);canDecide(b);setDecision(b,'REJECT',value);await notifyRoom('ROOM_REJECTED',b.id);return c.roomDetail(b);}),
 approveMany:ids=>c.run(async()=>{const bookings=[...new Set(idSchema.array().min(1).max(500).parse(ids))].map(id=>c.find(getDb().roomBookings,id));bookings.forEach(canDecide);bookings.forEach(b=>setDecision(b,'APPROVE'));for(const b of bookings)await notifyRoom('ROOM_APPROVED',b.id);return bookings.map(c.roomDetail);}),
 // A link scanner must never trigger mutations or scheduled jobs.
 viewByToken:async token=>{await new Promise(r=>setTimeout(r,env.MOCK_LATENCY_MS));const {b,approver}=await tokenBooking(token);return structuredClone({booking:c.roomDetail(b),approver});},
 decideByToken:(token,decision,reason)=>c.run(async()=>{const d=z.enum(['APPROVE','REJECT']).parse(decision),r=z.string().trim().max(2000).optional().parse(reason);const {b}=await tokenBooking(token);if(setDecision(b,d,r))await notifyRoom(d==='APPROVE'?'ROOM_APPROVED':'ROOM_REJECTED',b.id);return c.roomDetail(b);},true)
 }
 };
}

