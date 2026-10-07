import 'server-only';
import {createEvent,type DateArray} from 'ics';
import type {RoomBooking,Room,Building} from '@/shared/data/types';
export function bookingIcs(booking:RoomBooking,room:Room,building:Building) {
 const parts=(value:string):DateArray=>{const d=new Date(value);return [d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate(),d.getUTCHours(),d.getUTCMinutes()];};
 const {error,value}=createEvent({uid:booking.id+'@bookings.example.com',start:parts(booking.start),end:parts(booking.end),startInputType:'utc',startOutputType:'utc',endInputType:'utc',endOutputType:'utc',title:booking.title,location:room.shortLabel+' · '+building.name,status:'CONFIRMED'});
 if(error||!value)throw error ?? new Error('สร้างไฟล์ปฏิทินไม่ได้');return value;
}

