'use server';
import {redirect} from 'next/navigation';
import {z} from 'zod';
import {env} from '@/shared/config/env';
import {MockAuthProvider} from './mock-provider';
import {SsoAuthProvider} from './sso-provider';
import {clearSession} from './session';
import {actionError,type ActionResult} from '@/shared/data/errors';
export async function signIn(form:FormData):Promise<void> {
 const userId=z.string().parse(form.get('userId'));
 const session=await new MockAuthProvider().signIn(userId);
 const raw=form.get('next');
 const next=typeof raw==='string'&&raw.startsWith('/')&&!raw.startsWith('//')&&!raw.includes('\\')&&!raw.startsWith('/login')?raw:'/';
 redirect(session.roles.includes('STATION')?'/guard':next);
}
export async function signOut() {await clearSession();redirect('/login');}
export async function signInSso():Promise<ActionResult<never>> {try {if(env.AUTH_MODE!=='sso')throw new Error('ยังไม่ได้เชื่อมระบบล็อกอินองค์กร');await new SsoAuthProvider().signIn();}catch{return {ok:false,error:{code:'UNKNOWN',message:'ยังไม่ได้เชื่อมระบบล็อกอินองค์กร'}};}return actionError(null);}

