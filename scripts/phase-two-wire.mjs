import fs from 'node:fs';
let p='src/shared/data/mock/index.ts',s=fs.readFileSync(p,'utf8');s=s.replace("import {z} from 'zod';","import {z} from 'zod';\nimport {createRoomServices} from './services/rooms';");s=s.replace(/const later=[^\n]+\n/,'');s=s.slice(0,s.indexOf(' rooms:{'))+' ...createRoomServices(c),\n'+s.slice(s.indexOf(' reports:{'));fs.writeFileSync(p,s);
p='src/shared/data/mock/jobs.ts';s=fs.readFileSync(p,'utf8').replace("import {notifyCar}","import {notifyCar,notifyRoom}");s=s.replace(' return {executed};',` for(const b of db.roomBookings) {
 if(b.status!=='PENDING')continue;
 const type=appConfig.room.approval.expireAtStart&&time>=millis(b.start)?'ROOM_EXPIRED':time<millis(b.start)&&time>=millis(b.createdAt)+appConfig.room.approval.reminderAfterHours*3600000?'ROOM_APPROVAL_REMINDER':null;
 if(!type)continue;const key=type+':'+b.id;if(db.jobKeys.has(key))continue;
 if(type==='ROOM_EXPIRED'){b.status='EXPIRED';b.updatedAt=at.toISOString();}
 db.jobKeys.add(key);try{await notifyRoom(type,b.id);executed.push(key);}catch(e){db.jobKeys.delete(key);throw e;}
 }
 return {executed};`);fs.writeFileSync(p,s);
