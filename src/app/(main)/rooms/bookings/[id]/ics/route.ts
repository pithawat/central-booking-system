import {getServices} from '@/shared/data';
import {requireUser,requireFeature} from '@/shared/auth/require';
import {bookingIcs} from '@/shared/mail/ics';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
 requireFeature('rooms');await requireUser();const {id}=await params,s=await getServices();
 const b=await s.roomBookings.getById(id).catch(()=>null);
 if(!b||b.status!=='APPROVED')return new Response('ไม่พบข้อมูลนี้',{status:404,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 const building=(await s.rooms.buildings()).find(x=>x.id===b.room.buildingId);
 const ics=bookingIcs(b,b.room,building??{id:'',siteId:b.room.siteId,name:'',sortOrder:0});
 return new Response(ics,{headers:{'Content-Type':'text/calendar; charset=utf-8','Content-Disposition':'attachment; filename="invite.ics"','Cache-Control':'no-store'}});
}
