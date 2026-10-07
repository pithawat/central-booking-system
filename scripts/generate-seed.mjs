import fs from 'node:fs';
const spec=fs.readFileSync('docs/SPEC.md','utf8');
const section=(a,b)=>spec.slice(spec.indexOf(a),spec.indexOf(b));
const rows=(s)=>s.split('\n').filter(l=>l.startsWith('|')).map(l=>l.split('|').slice(1,-1).map(v=>v.trim().replaceAll('`','')));
const write=(p,v)=>fs.writeFileSync('src/shared/data/mock/seed/'+p,v);
fs.mkdirSync('src/shared/data/mock/seed',{recursive:true});
const orgRows=rows(section('### 12.3','### 12.4')).filter(r=>/^U\d/.test(r[0]));
const users=orgRows.map(([id,displayName,departmentName,position,roles,supervisorId,,email])=>{const [firstName,...last]=displayName.split(' ');const lastName=last.join(' ');return {id,employeeCode:id==='U90'?'DEVICE-01':'1001'+id.slice(1),firstName,lastName,displayName,shortName:firstName+' '+lastName.replace(/^[เแโใไ]+/,'').slice(0,1)+'.',email,phone:'080-000-01'+id.slice(1),departmentName,position,supervisorId:supervisorId==='–'?null:supervisorId,roles:roles.split(', '),photoUrl:null,defaultSiteId:id==='U11'?'SITE-BANGSON':'SITE-OFFICE',stationId:['U13','U15','U90'].includes(id)?'ST-GATE1':null};});
const sites=[{id:'SITE-OFFICE',name:'ฝั่ง Office'},{id:'SITE-BANGSON',name:'ฝั่งโรงงานบางซ่อน'}];
const buildings=rows(section('### 12.2','### 12.3')).filter(r=>r[0].startsWith('BLD-')).map(([id,siteId,name,sortOrder])=>({id,siteId,name,sortOrder:+sortOrder}));
write('org.ts',"import type {User,Site,Building,GuardStation} from '../../types';\nexport const users:User[]="+JSON.stringify(users,null,2)+";\nexport const sites:Site[]="+JSON.stringify(sites)+";\nexport const buildings:Building[]="+JSON.stringify(buildings)+";\nexport const stations:GuardStation[]=[{id:'ST-GATE1',name:'ป้อม รปภ. ประตู 1',siteId:'SITE-OFFICE'}];\nexport const personaIds=['U01','U03','U02','U14','U12','U90'];\nexport const guardPins:Record<string,string>={U13:'1234',U15:'5678'};\n");
const rooms=rows(section('### 12.2','### 12.3')).filter(r=>/^\d+$/.test(r[0])).map(([sort,id,buildingId,floor,name,shortLabel,cap,tv,cost,note,legacyLabel])=>({id,buildingId,siteId:buildings.find(b=>b.id===buildingId).siteId,floor:floor==='null'?null:+floor,name,shortLabel,capacity:+cap,hasTv:tv==='null'?null:tv==='true',hasCost:cost==='true',note:note||null,legacyLabel,sortOrder:+sort,active:true}));
write('rooms.ts',"import type {Room} from '../../types';\nexport const rooms:Room[]="+JSON.stringify(rooms,null,2)+";\n");
const cars=rows(section('### 12.4','### 12.5')).filter(r=>r[0].startsWith('CAR-')).map(([id,number,plate,model,type,seats,mileage])=>({id,number,plate,model,type,seats:+seats,keySlot:number,stationId:'ST-GATE1',currentMileage:+mileage.replaceAll(',',''),active:true}));
write('cars.ts',"import type {Car} from '../../types';\nexport const cars:Car[]="+JSON.stringify(cars,null,2)+";\n");
const raw=rows(section('### 12.6','### 12.7')).filter(r=>/^RB-/.test(r[0]));
const data=raw.map(r=>{let id=r[0],roomId,day=0,time,title,userId,status;if(+id.slice(3)<=20){[,roomId,time,title,userId,status]=r;}else if(+id.slice(3)<=27){roomId='RM-B1-402';day=+r[1].match(/-?\d+/)[0];[, ,time,title,userId,status]=r;}else{roomId=r[1];day=+r[2].match(/-?\d+/)[0];[,,,time,title,userId,status]=r;}return {id,roomId,day,time,title,userId,status:status.split(' ')[0]};});
write('room-bookings.ts',`import type {RoomBooking} from '../../types';
import {users} from './org';
import {addDays,bangkokDateTime,todayInBangkok} from '@/shared/lib/datetime';
const data=${JSON.stringify(data,null,2)} as const;
export function roomBookings(t0:Date):RoomBooking[] {
 return data.map(r=>{
 const [from,to]=r.time.split('–');const start=bangkokDateTime(addDays(todayInBangkok(t0),r.day),from).toISOString();const end=bangkokDateTime(addDays(todayInBangkok(t0),r.day),to).toISOString();
 const user=users.find(u=>u.id===r.userId)!;
 const createdAt=new Date(r.id==='RB-020'?t0.getTime()-3600000:r.id==='RB-028'?t0.getTime()-5*3600000:new Date(start).getTime()-3*86400000).toISOString();
 return {id:r.id,roomId:r.roomId,title:r.title,start,end,bookedById:user.id,attendeeId:user.id,contactPhone:user.phone,status:r.status,approverId:user.supervisorId,decidedAt:r.status==='APPROVED'||r.status==='REJECTED'?new Date(new Date(createdAt).getTime()+2*3600000).toISOString():null,rejectReason:r.status==='REJECTED'?'ห้องนี้ใช้ประชุมฝ่าย ขอให้ใช้ 4/2 ห้อง 202 แทน':null,lastNudgedAt:null,createdAt,updatedAt:createdAt};
 });
}
`);

