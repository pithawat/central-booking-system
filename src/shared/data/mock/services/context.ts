import 'server-only';
import {z} from 'zod';
import type {Session} from '@/shared/auth/session';
import {getDb} from '../store';
import {env} from '@/shared/config/env';
import {now} from '@/shared/lib/clock';
import {runDueJobs} from '../jobs';
import {ensureSeedMail} from '../notifications';
import {ServiceError} from '../../errors';
import type {Role,CarBooking,RoomBooking,CarBookingDetail,RoomBookingDetail} from '../../types';
import {carToken} from '@/shared/lib/tokens';
export function context(session:Session|null) {
 const user=()=>{const me=getDb().users.find(u=>u.id===session?.sub);if(!me)throw new ServiceError('FORBIDDEN');return me;};
 const allow=(roles:Role[])=>{const me=user();if(!me.roles.some(r=>roles.includes(r)))throw new ServiceError('FORBIDDEN');return me;};
 const employee=()=>allow(['EMPLOYEE','ADMIN']);
 const feature=(kind:'cars'|'rooms')=>{if(kind==='cars'?!env.NEXT_PUBLIC_ENABLE_CARS:!env.NEXT_PUBLIC_ENABLE_ROOMS)throw new ServiceError('NOT_FOUND');};
 async function run<T>(fn:()=>T|Promise<T>,publicRead=false) {
 await new Promise(r=>setTimeout(r,env.MOCK_LATENCY_MS));if(!publicRead)user();await ensureSeedMail();await runDueJobs(now());return structuredClone(await fn());
 }
 function carDetail(b:CarBooking):CarBookingDetail {const db=getDb();return {...b,nextBookingStart:db.carBookings.filter(x=>x.id!==b.id&&x.carId===b.carId&&['CONFIRMED','IN_USE'].includes(x.status)&&x.start>=b.end).map(x=>x.start).sort()[0]??null,car:db.cars.find(c=>c.id===b.carId)!,user:db.users.find(u=>u.id===b.userId)!,isOverdue:b.status==='IN_USE'&&now().getTime()>new Date(b.end).getTime(),qrToken:session?.sub===b.userId?carToken(b.id):null};}
 function roomDetail(b:RoomBooking):RoomBookingDetail {const db=getDb();return {...b,room:db.rooms.find(r=>r.id===b.roomId)!,bookedBy:db.users.find(u=>u.id===b.bookedById)!,attendee:db.users.find(u=>u.id===b.attendeeId)!,approver:db.users.find(u=>u.id===b.approverId)??null,isMine:b.bookedById===session?.sub||b.attendeeId===session?.sub};}
 const find=<T extends {id:string}>(items:T[],id:string)=>{z.string().min(1).parse(id);const item=items.find(x=>x.id===id);if(!item)throw new ServiceError('NOT_FOUND');return item;};
 return {session,user,allow,employee,feature,run,carDetail,roomDetail,find};
}
export type Context=ReturnType<typeof context>;

