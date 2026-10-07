import 'server-only';
import {getDb} from './store';
import {notifyCar,notifyRoom} from './notifications';
import {appConfig} from '@/shared/config/app.config';
import {millis} from '@/shared/lib/intervals';
let running:Promise<{executed:string[]}>|null=null;
export async function runDueJobs(at:Date):Promise<{executed:string[]}> {
 if(running){await running;return {executed:[]};}
 running=execute(at).finally(()=>{running=null;});return running;
}
async function execute(at:Date) {
 const db=getDb(),executed:string[]=[],time=at.getTime();
 const send=async(type:string,id:string)=>{const key=type+':'+id;if(db.jobKeys.has(key))return;db.jobKeys.add(key);try{await notifyCar(type,id);executed.push(key);}catch(e){db.jobKeys.delete(key);throw e;}};
 for(const shift of db.shifts)if(!shift.endedAt&&time>=millis(shift.startedAt)+appConfig.guard.shiftMaxHours*3600000){shift.endedAt=at.toISOString();executed.push('SHIFT_END:'+shift.id);}
 for(const b of db.carBookings) {
 if(b.status==='CONFIRMED') {
 if(time>=millis(b.start)+appConfig.car.noShowCancelMinutes*60000){b.status='NO_SHOW';b.updatedAt=at.toISOString();await send('CAR_NO_SHOW',b.id);}
 else if(time>=millis(b.start)-appConfig.car.reminderBeforePickupMinutes*60000)await send('CAR_PICKUP_REMINDER',b.id);
 }else if(b.status==='IN_USE') {
 if(time>=millis(b.end)+appConfig.car.overdueNoticeMinutes*60000)await send('CAR_OVERDUE',b.id);
 else if(time>=millis(b.end)-appConfig.car.reminderBeforeReturnMinutes*60000)await send('CAR_RETURN_REMINDER',b.id);
 }
 }
 for(const b of db.roomBookings) {
 if(b.status!=='PENDING')continue;
 const type=appConfig.room.approval.expireAtStart&&time>=millis(b.start)?'ROOM_EXPIRED':time<millis(b.start)&&time>=millis(b.createdAt)+appConfig.room.approval.reminderAfterHours*3600000?'ROOM_APPROVAL_REMINDER':null;
 if(!type)continue;const key=type+':'+b.id;if(db.jobKeys.has(key))continue;
 if(type==='ROOM_EXPIRED'){b.status='EXPIRED';b.updatedAt=at.toISOString();}
 db.jobKeys.add(key);try{await notifyRoom(type,b.id);executed.push(key);}catch(e){db.jobKeys.delete(key);throw e;}
 }
 return {executed};
}

