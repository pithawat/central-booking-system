import 'server-only';
import type {User,Site,Building,Room,Car,CarBooking,RoomBooking,GuardStation,GuardShift,KeyLogEntry,MailMessage} from '../types';
import {users,sites,buildings,stations,guardPins} from './seed/org';
import {rooms} from './seed/rooms';
import {cars} from './seed/cars';
import {carBookings} from './seed/car-bookings';
import {roomBookings} from './seed/room-bookings';
import {fillBookings} from './seed/filler';
export interface MockDb {
 users:User[];sites:Site[];buildings:Building[];rooms:Room[];cars:Car[];stations:GuardStation[];
 carBookings:CarBooking[];roomBookings:RoomBooking[];shifts:GuardShift[];keyLog:KeyLogEntry[];mail:MailMessage[];
 guardPins:Record<string,string>;clockOffsetMs:number;jobKeys:Set<string>;seededMail:boolean;
 attempts:Record<string,{times:number[];blockedUntil:number}>;
}
declare global {var __bookingMockDb:MockDb|undefined;}
export function createSeed(t0=new Date()):MockDb {
 const cb=carBookings(t0);
 return {users:structuredClone(users),sites:structuredClone(sites),buildings:structuredClone(buildings),rooms:structuredClone(rooms),cars:structuredClone(cars),stations:structuredClone(stations),
 carBookings:cb.bookings,roomBookings:fillBookings(t0,roomBookings(t0)),shifts:[],keyLog:cb.logs,mail:[],guardPins:{...guardPins},clockOffsetMs:0,jobKeys:new Set(),seededMail:false,attempts:{}};
}
export function getDb() {return globalThis.__bookingMockDb ??= createSeed();}
export function resetDb(t0=new Date()) {globalThis.__bookingMockDb=createSeed(t0);return globalThis.__bookingMockDb;}

