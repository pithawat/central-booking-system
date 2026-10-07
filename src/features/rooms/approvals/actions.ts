'use server';
import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {getServices} from '@/shared/data';
import {idSchema} from '@/shared/data/input-schemas';
import {actionError,type ActionResult} from '@/shared/data/errors';
import type {RoomBookingDetail} from '@/shared/data/types';
export async function decideRoom(id:string,decision:'APPROVE'|'REJECT',reason?:string,token=false):Promise<ActionResult<RoomBookingDetail>> {try{z.string().min(1).max(4000).parse(id);z.enum(['APPROVE','REJECT']).parse(decision);z.string().max(2000).optional().parse(reason);const s=await getServices();const data=token?await s.approvals.decideByToken(id,decision,reason):decision==='APPROVE'?await s.approvals.approve(id):await s.approvals.reject(id,reason);
 // หน้าลิงก์อีเมลแสดงผลในที่เดิม ถ้า revalidate หน้าจะเปลี่ยนเป็นสถานะ "อนุมัติแล้วเมื่อ" ทันที
 if(!token)revalidatePath('/','layout');return {ok:true,data};}catch(e){return actionError(e);}}
export async function approveMany(ids:string[]):Promise<ActionResult<RoomBookingDetail[]>>{try{const data=await (await getServices()).approvals.approveMany(idSchema.array().min(1).parse(ids));revalidatePath('/','layout');return {ok:true,data};}catch(e){return actionError(e);}}

