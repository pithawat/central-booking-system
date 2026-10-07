import 'server-only';
import { createHmac,timingSafeEqual } from 'node:crypto';
import { SignJWT,jwtVerify,errors } from 'jose';
import { env } from '@/shared/config/env';
import { ServiceError } from '@/shared/data/errors';
import { now } from './clock';
const key=(secret:string|undefined)=>new TextEncoder().encode(secret);
export function carToken(id:string) {const body='CB1.'+id;return body+'.'+createHmac('sha256',env.QR_TOKEN_SECRET!).update(body).digest('base64url').slice(0,22);}
export function readCarToken(token:string) {const m=/^CB1\.([A-Za-z0-9-]+)\.([A-Za-z0-9_-]{22})$/.exec(token);if(!m) throw new ServiceError('TOKEN_INVALID');const expected=Buffer.from(carToken(m[1]));const actual=Buffer.from(token);if(actual.length!==expected.length || !timingSafeEqual(expected,actual)) throw new ServiceError('TOKEN_INVALID');return m[1];}
export async function approvalToken(bookingId:string,approverId:string,start:string) {return new SignJWT({typ:'room-approval'}).setProtectedHeader({alg:'HS256'}).setSubject(bookingId).setAudience(approverId).setExpirationTime(Math.floor(new Date(start).getTime()/1000)).sign(key(env.APPROVAL_TOKEN_SECRET));}
export async function readApprovalToken(token:string) {
 try {const {payload}=await jwtVerify(token,key(env.APPROVAL_TOKEN_SECRET),{algorithms:['HS256'],currentDate:now()});if(payload.typ!=='room-approval'||!payload.sub||typeof payload.aud!=='string') throw new ServiceError('TOKEN_INVALID');return {bookingId:payload.sub,approverId:payload.aud};}
 catch(e) {if(e instanceof errors.JWTExpired) throw new ServiceError('TOKEN_EXPIRED');throw new ServiceError('TOKEN_INVALID');}
}

