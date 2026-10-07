'use server';
import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {getServices} from '@/shared/data';
import {ServiceError,actionError,type ActionResult} from '@/shared/data/errors';
export async function devAction(action:string,minutes?:number):Promise<ActionResult<{executed?:string[]}>> {
 try {const key=z.enum(['shift','resetClock','resetData','runJobs','clearMail']).parse(action);const svc=await getServices();await svc.users.me();if(!svc.dev)throw new ServiceError('FORBIDDEN');
 let data={};if(key==='shift')await svc.dev.shiftClock(z.number().int().parse(minutes));else if(key==='runJobs')data=await svc.dev.runJobs();else await svc.dev[key]();
 revalidatePath('/','layout');return {ok:true,data};
 }catch(e){return actionError(e);}
}

