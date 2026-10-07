'use server';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {getServices} from '@/shared/data';
import {carCreateSchema,idSchema,mileageSchema} from '@/shared/data/input-schemas';
import {actionError,type ActionResult} from '@/shared/data/errors';
import type {CarBookingDetail} from '@/shared/data/types';
export async function createCar(input:unknown):Promise<ActionResult<CarBookingDetail>> {try{const v=carCreateSchema.parse(input),s=await getServices();const data=await s.carBookings.create(v);revalidatePath('/','layout');return {ok:true,data};}catch(e){return actionError(e);}}
export async function changeCar(action:'cancel'|'extend'|'return',id:string,input?:unknown):Promise<ActionResult<CarBookingDetail>> {try {idSchema.parse(id);z.enum(['cancel','extend','return']).parse(action);const s=await getServices();const data=action==='cancel'?await s.carBookings.cancel(id):action==='extend'?await s.carBookings.extend(id,z.iso.datetime().parse(input)):await s.carBookings.submitReturnInfo(id,mileageSchema.parse(input));revalidatePath('/','layout');return {ok:true,data};}catch(e){return actionError(e);}}

