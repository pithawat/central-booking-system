'use server';
import {cookies} from 'next/headers';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {getServices} from '@/shared/data';
import {actionError,type ActionResult} from '@/shared/data/errors';
import {shiftSchema,lookupSchema,handoverSchema,receiveSchema,swapSchema,idSchema} from '@/shared/data/input-schemas';
import type {GuardLookupResult} from '@/shared/data/contracts';
import type {CarBookingDetail,GuardShift} from '@/shared/data/types';
export async function chooseStation(id:string):Promise<ActionResult<void>> {try {idSchema.parse(id);const s=await getServices(),me=await s.users.me();if(!me.roles.includes('STATION')||me.stationId!==id)throw new Error('ไม่มีสิทธิ์เลือกป้อมนี้');(await cookies()).set('station_id',id,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:365*86400});revalidatePath('/guard');return {ok:true,data:undefined};}catch(e){return actionError(e);}}
export async function shiftAction(action:'start'|'end',input:unknown):Promise<ActionResult<GuardShift|void>> {try{z.enum(['start','end']).parse(action);const s=await getServices();const data=action==='start'?await s.guard.startShift(shiftSchema.parse(input)):await s.guard.endShift(idSchema.parse(input));revalidatePath('/guard');return {ok:true,data};}catch(e){return actionError(e);}}
export async function lookupGuard(input:unknown):Promise<ActionResult<GuardLookupResult>> {try{return {ok:true,data:await (await getServices()).guard.lookup(lookupSchema.parse(input))};}catch(e){return actionError(e);}}
export async function performGuard(action:'handover'|'receive'|'swap',input:unknown):Promise<ActionResult<CarBookingDetail>> {try{z.enum(['handover','receive','swap']).parse(action);const s=await getServices();const data=action==='handover'?await s.guard.handover(handoverSchema.parse(input)):action==='receive'?await s.guard.receive(receiveSchema.parse(input)):await s.guard.swapCar(swapSchema.parse(input));revalidatePath('/','layout');return {ok:true,data};}catch(e){return actionError(e);}}

