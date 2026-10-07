import 'server-only';
import {z} from 'zod';
import {env} from '@/shared/config/env';
import {getServices} from '@/shared/data';
import {ServiceError} from '@/shared/data/errors';
import {getSession,setSession,clearSession,type Session} from './session';
export interface AuthProvider {getSession():Promise<Session|null>;signIn(userId?:string):Promise<Session>;signOut():Promise<void>;}
export class MockAuthProvider implements AuthProvider {
 getSession=getSession;signOut=clearSession;
 async signIn(userId?:string) {
 if(env.AUTH_MODE!=='mock')throw new ServiceError('FORBIDDEN');
 const id=z.string().min(1).parse(userId);
 const personas=await (await getServices()).users.personas();const user=personas.find(u=>u.id===id);
 if(!user)throw new ServiceError('FORBIDDEN');
 const session={sub:user.id,roles:user.roles};await setSession(session);return session;
 }
}

