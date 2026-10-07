import 'server-only';
import {z} from 'zod';
import type {Session} from '@/shared/auth/session';
import type {Services} from '../contracts';
import * as s from '../schemas';
import * as input from '../input-schemas';
import {ServiceError} from '../errors';
import {createHttp,query} from './http';
export function createApiServices(session:Session|null):Services {
 const http=createHttp(session),id=(v:string)=>encodeURIComponent(input.idSchema.parse(v));
 const get=<T,>(path:string,schema:z.ZodType<T>)=>http('GET',path,schema);
 const post=<T,>(path:string,schema:z.ZodType<T>,body?:unknown,publicToken=false)=>{if(!session&&!publicToken)throw new ServiceError('FORBIDDEN');return http('POST',path,schema,body);};
 return {
 users:{me:()=>get('/me',s.UserSchema),getById:v=>get('/users/'+id(v),s.UserSchema),search:q=>get('/users'+query({q}),s.UserSchema.array()),supervisorOf:v=>get('/users/'+id(v)+'/supervisor',s.UserSchema.nullable()),isSupervisor:async v=>(await get('/users?q=',s.UserSchema.array())).some(u=>u.supervisorId===v),personas:()=>get('/users?persona=1',s.UserSchema.array())},
 cars:{list:f=>get('/cars'+query(f??{}),s.CarSchema.array()),availability:q=>get('/cars/availability'+query(q),s.CarAvailabilitySchema.array())},
 carBookings:{
 create:v=>post('/car-bookings',s.CarBookingDetailSchema,input.carCreateSchema.parse(v)),
 listMine:scope=>get('/car-bookings/mine'+query({scope}),s.CarBookingDetailSchema.array()),
 getById:v=>get('/car-bookings/'+id(v),s.CarBookingDetailSchema),
 activePass:()=>get('/car-bookings/active-pass',s.CarBookingDetailSchema.nullable()),
 cancel:v=>post('/car-bookings/'+id(v)+'/cancel',s.CarBookingDetailSchema),
 extend:(v,end)=>post('/car-bookings/'+id(v)+'/extend',s.CarBookingDetailSchema,{end:z.iso.datetime().parse(end)}),
 submitReturnInfo:(v,data)=>post('/car-bookings/'+id(v)+'/return-info',s.CarBookingDetailSchema,input.mileageSchema.parse(data))
 },
 guard:{
 stations:()=>get('/guard/stations',s.GuardStationSchema.array()),
 guardsOf:v=>get('/guard/stations/'+id(v)+'/guards',s.UserSchema.array()),
 activeShift:v=>get('/guard/stations/'+id(v)+'/shift',s.GuardShiftSchema.extend({guard:s.UserSchema}).nullable()),
 startShift:v=>post('/guard/shifts',s.GuardShiftSchema,input.shiftSchema.parse(v)),
 endShift:async v=>{await post('/guard/shifts/'+id(v)+'/end',z.null());},
 board:v=>get('/guard/stations/'+id(v)+'/board',z.object({waiting:s.CarBookingDetailSchema.array(),out:s.CarBookingDetailSchema.array()})),
 lookup:v=>post('/guard/lookup',s.GuardLookupResultSchema,input.lookupSchema.parse(v)),
 handover:v=>post('/guard/handover',s.CarBookingDetailSchema,input.handoverSchema.parse(v)),
 receive:v=>post('/guard/receive',s.CarBookingDetailSchema,input.receiveSchema.parse(v)),
 swapCar:v=>post('/guard/swap-car',s.CarBookingDetailSchema,input.swapSchema.parse(v))
 },
 rooms:{sites:()=>get('/sites',s.SiteSchema.array()),buildings:()=>get('/buildings',s.BuildingSchema.array()),list:f=>get('/rooms'+query(f??{}),s.RoomSchema.array()),getById:v=>get('/rooms/'+id(v),s.RoomSchema)},
 roomBookings:{
 daySchedule:(date,f)=>get('/room-bookings/day'+query({date,...f}),s.RoomDayScheduleSchema),
 listByRoom:(roomId,from,to)=>get('/room-bookings'+query({roomId,from,to}),s.RoomBookingDetailSchema.array()),
 create:v=>post('/room-bookings',s.RoomBookingDetailSchema,input.roomCreateSchema.parse(v)),
 listMine:scope=>get('/room-bookings/mine'+query({scope}),s.RoomBookingDetailSchema.array()),
 getById:v=>get('/room-bookings/'+id(v),s.RoomBookingDetailSchema),
 cancel:v=>post('/room-bookings/'+id(v)+'/cancel',s.RoomBookingDetailSchema),
 nudge:v=>post('/room-bookings/'+id(v)+'/nudge',z.object({nextAllowedAt:s.ISODateTimeSchema}))
 },
 approvals:{
 pending:()=>get('/approvals/pending',s.RoomBookingDetailSchema.array()),
 pendingCount:async()=>(await get('/approvals/pending/count',z.object({count:z.number().int().nonnegative()}))).count,
 history:(days=30)=>get('/approvals/history'+query({days}),s.RoomBookingDetailSchema.array()),
 approve:v=>post('/approvals/'+id(v)+'/approve',s.RoomBookingDetailSchema),
 reject:(v,reason)=>post('/approvals/'+id(v)+'/reject',s.RoomBookingDetailSchema,{reason:z.string().max(2000).optional().parse(reason)}),
 approveMany:bookingIds=>post('/approvals/bulk-approve',s.RoomBookingDetailSchema.array(),{bookingIds:input.idSchema.array().min(1).parse(bookingIds)}),
 viewByToken:token=>get('/approvals/by-token/'+id(token),z.object({booking:s.RoomBookingDetailSchema,approver:s.UserSchema})),
 decideByToken:(token,decision,reason)=>post('/approvals/by-token/'+id(token),s.RoomBookingDetailSchema,{decision:z.enum(['APPROVE','REJECT']).parse(decision),reason:z.string().max(2000).optional().parse(reason)},true)
 },
 reports:{keyLog:q=>get('/reports/key-log'+query(q),s.KeyLogRowSchema.array())},dev:null
 };
}

