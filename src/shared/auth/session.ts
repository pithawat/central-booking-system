import 'server-only';
import {cookies} from 'next/headers';
import {SignJWT,jwtVerify} from 'jose';
import {z} from 'zod';
import {env} from '@/shared/config/env';
import {RoleSchema} from '@/shared/data/schemas';
const schema=z.object({sub:z.string().min(1),roles:RoleSchema.array(),accessToken:z.string().optional()});
export type Session=z.infer<typeof schema>;
const secret=new TextEncoder().encode(env.SESSION_SECRET);
export async function getSession():Promise<Session|null> {
 const token=(await cookies()).get('session')?.value;if(!token)return null;
 try {const {payload}=await jwtVerify(token,secret,{algorithms:['HS256']});return schema.parse(payload);}catch{return null;}
}
export async function setSession(session:Session) {
 const valid=schema.parse(session);
 const token=await new SignJWT(valid).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('1d').sign(secret);
 (await cookies()).set('session',token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:86400});
}
export async function clearSession() {(await cookies()).delete('session');}

