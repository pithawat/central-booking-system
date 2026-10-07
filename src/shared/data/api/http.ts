import 'server-only';
import {z} from 'zod';
import {env} from '@/shared/config/env';
import type {Session} from '@/shared/auth/session';
import {ServiceError,errorMessages,type ErrorCode} from '../errors';
export function createHttp(session:Session|null) {
 return async function request<T>(method:'GET'|'POST',path:string,schema:z.ZodType<T>,body?:unknown):Promise<T> {
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),env.API_TIMEOUT_MS);
 try {
 const headers:Record<string,string>={'Content-Type':'application/json'};
 if(session && env.AUTH_MODE==='mock')headers['X-Mock-User-Id']=session.sub;
 if(session?.accessToken && env.AUTH_MODE==='sso')headers.Authorization='Bearer '+session.accessToken;
 const res=await fetch(env.API_BASE_URL.replace(/\/$/,'')+path,{method,headers,signal:controller.signal,cache:'no-store',body:body===undefined?undefined:JSON.stringify(body)});
 if(!res.ok) {const data=await res.json().catch(()=>null);const codes:Record<number,ErrorCode>={400:'VALIDATION',401:'FORBIDDEN',403:'FORBIDDEN',404:'NOT_FOUND',409:'CONFLICT',422:'INVALID_STATE',429:'RATE_LIMITED'};const code=data?.error?.code in errorMessages?data.error.code as ErrorCode:codes[res.status]??'UNKNOWN';throw new ServiceError(code,data?.error?.message || errorMessages[code]);}
 const raw=res.status===204?null:await res.json();
 const result=schema.safeParse(raw);if(!result.success){console.error('API response validation',path,result.error.issues);throw new ServiceError('UNKNOWN');}
 return result.data;
 } catch(e) {if(e instanceof ServiceError)throw e;throw new ServiceError('NETWORK');} finally {clearTimeout(timer);}
 };
}
export function query(values:object) {const p=new URLSearchParams();Object.entries(values).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')p.set(k,String(v));});return p.size?'?'+p.toString():'';}

