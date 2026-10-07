import 'server-only';
import {z} from 'zod';
import {createRoomServices} from './services/rooms';
import {createCarServices} from './services/cars';
import {createGuardService} from './services/guard';
import type {Session} from '@/shared/auth/session';
import type {Services} from '../contracts';
import {context} from './services/context';
import {getDb,resetDb} from './store';
import {personaIds} from './seed/org';
import {env} from '@/shared/config/env';
import {now} from '@/shared/lib/clock';
import {todayInBangkok} from '@/shared/lib/datetime';
import {ServiceError} from '../errors';
import {runDueJobs} from './jobs';
import {ensureSeedMail} from './notifications';
export function createMockServices(session:Session|null):Services {
 const c=context(session),db=getDb;
 return {
 users:{
 me:()=>c.run(()=>c.user()),
 getById:id=>c.run(()=>c.find(db().users,id)),
 search:q=>c.run(()=>{c.employee();return db().users.filter(u=>u.roles.includes('EMPLOYEE') && (u.displayName+' '+u.employeeCode+' '+u.departmentName).includes(q));}),
 supervisorOf:id=>c.run(()=>db().users.find(u=>u.id===c.find(db().users,id).supervisorId)??null),
 isSupervisor:id=>c.run(()=>db().users.some(u=>u.supervisorId===id)),
 personas:()=>c.run(()=>{if(env.AUTH_MODE!=='mock')throw new ServiceError('FORBIDDEN');return personaIds.map(id=>c.find(db().users,id));},true)
 },
 ...createRoomServices(c),
 reports:{keyLog:q=>c.run(()=>{c.feature('cars');c.allow(['ADMIN']);return db().keyLog.filter(l=>todayInBangkok(l.at)===q.date&&(!q.stationId||l.stationId===q.stationId)).map(l=>({...l,car:c.find(db().cars,l.carId),user:c.find(db().users,l.userId),guard:c.find(db().users,l.guardId)}));})},
 ...createCarServices(c),
 guard:createGuardService(c),
 dev:{
 clock:()=>c.run(()=>({now:now().toISOString(),offsetMinutes:db().clockOffsetMs/60000})),
 shiftClock:minutes=>c.run(()=>{c.user();db().clockOffsetMs+=z.number().int().min(-525600).max(525600).parse(minutes)*60000;}),
 resetClock:()=>c.run(()=>{c.user();db().clockOffsetMs=0;}),
 resetData:()=>c.run(async()=>{c.user();resetDb();await ensureSeedMail();}),
 runJobs:async()=>{c.user();return runDueJobs(now());},
 mail:filter=>c.run(()=>db().mail.filter(m=>!filter?.to||m.to.includes(filter.to)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))),
 clearMail:()=>c.run(()=>{c.user();db().mail=[];})
 }
 };
}


