import 'server-only';
import {getDb} from './store';
import {MailService} from '@/shared/mail';
import {carTemplate} from '@/shared/mail/templates/car';
import {roomTemplate} from '@/shared/mail/templates/room';
import {bookingIcs} from '@/shared/mail/ics';
import {qrImage} from '@/shared/mail/qr-image';
import {carToken,approvalToken} from '@/shared/lib/tokens';
import {env} from '@/shared/config/env';
export async function notifyCar(type:string,id:string) {
 const db=getDb(),b=db.carBookings.find(b=>b.id===id)!,car=db.cars.find(c=>c.id===b.carId)!,user=db.users.find(u=>u.id===b.userId)!;
 const qr=await qrImage(carToken(id));
 await MailService.send({to:[user.email],type,bookingId:id,...carTemplate(type,b,car,env.APP_BASE_URL+'/cars/bookings/'+id,env.MAIL_MODE==='smtp'?'cid:qr':qr),attachments:env.MAIL_MODE==='smtp'?[{filename:'qr.png',contentType:'image/png',contentBase64:qr.split(',')[1],cid:'qr'}]:undefined});
}
export async function notifyRoom(type:string,id:string) {
 const db=getDb(),b=db.roomBookings.find(b=>b.id===id)!,room=db.rooms.find(r=>r.id===b.roomId)!,booker=db.users.find(u=>u.id===b.bookedById)!,attendee=db.users.find(u=>u.id===b.attendeeId)!;
 const request=['ROOM_APPROVAL_REQUEST','ROOM_APPROVAL_REMINDER','ROOM_APPROVAL_NUDGE'].includes(type);
 const approvalUrl=request&&b.approverId?env.APP_BASE_URL+'/approve/'+await approvalToken(id,b.approverId,b.start):undefined;
 const to=request?[db.users.find(u=>u.id===b.approverId)!.email]:type==='ROOM_APPROVED'?[...new Set([booker.email,attendee.email])]:[booker.email];
 await MailService.send({to,type,bookingId:id,...roomTemplate(type,b,room,booker,attendee,env.APP_BASE_URL+'/rooms/bookings/'+id,approvalUrl),attachments:type==='ROOM_APPROVED'?[{filename:'invite.ics',contentType:'text/calendar',contentBase64:Buffer.from(bookingIcs(b,room,db.buildings.find(x=>x.id===room.buildingId)!)).toString('base64')}]:undefined});
}
let initialization:Promise<void>|null=null;
export async function ensureSeedMail() {
 const db=getDb();if(db.seededMail)return;
 if(initialization)return initialization;
 initialization=(async()=>{for(const b of db.roomBookings.filter(b=>b.status==='PENDING'))await notifyRoom('ROOM_APPROVAL_REQUEST',b.id);for(const id of ['CB-001','CB-007','CB-010'])await notifyCar('CAR_BOOKING_CONFIRMED',id);db.seededMail=true;})().finally(()=>{initialization=null;});
 return initialization;
}

