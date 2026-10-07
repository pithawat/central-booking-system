'use server';
import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {getServices} from '@/shared/data';
import {roomCreateSchema,idSchema} from '@/shared/data/input-schemas';
import {actionError,type ActionResult} from '@/shared/data/errors';
import type {RoomBookingDetail,User} from '@/shared/data/types';
export async function createRoom(input:unknown):Promise<ActionResult<RoomBookingDetail>> {try{const data=await (await getServices()).roomBookings.create(roomCreateSchema.parse(input));revalidatePath('/','layout');return {ok:true,data};}catch(e){return actionError(e);}}
export async function changeRoom(action:'cancel'|'nudge',id:string):Promise<ActionResult<RoomBookingDetail|{nextAllowedAt:string}>> {try{z.enum(['cancel','nudge']).parse(action);const data=await (await getServices()).roomBookings[action](idSchema.parse(id));revalidatePath('/','layout');return {ok:true,data};}catch(e){return actionError(e);}}
export async function searchEmployees(q:string):Promise<ActionResult<User[]>> {try{return {ok:true,data:await (await getServices()).users.search(z.string().max(200).parse(q))};}catch(e){return actionError(e);}}

