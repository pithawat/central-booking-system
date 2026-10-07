import 'server-only';
import { z } from 'zod';
const bool = z.enum(['true','false']).transform(v=>v==='true');
const schema = z.object({
 DATA_SOURCE:z.enum(['mock','api']).default('mock'), API_BASE_URL:z.url().default('http://localhost:4000/api/v1'),
 API_TIMEOUT_MS:z.coerce.number().int().positive().default(10000), MOCK_LATENCY_MS:z.coerce.number().int().nonnegative().default(250),
 AUTH_MODE:z.enum(['mock','sso']).default('mock'), SESSION_SECRET:z.string().min(32),
 MAIL_MODE:z.enum(['mock','smtp']).default('mock'), SMTP_HOST:z.string().default(''), SMTP_PORT:z.coerce.number().int().positive().default(587),
 SMTP_USER:z.string().default(''), SMTP_PASS:z.string().default(''), MAIL_FROM:z.string().default('ระบบจององค์กร <no-reply@example.com>'),
 QR_TOKEN_SECRET:z.string().min(32).optional(), APPROVAL_TOKEN_SECRET:z.string().min(32).optional(),
 APP_BASE_URL:z.url().default('http://localhost:3000'), NEXT_PUBLIC_APP_NAME:z.string().default('ระบบจององค์กร'),
 NEXT_PUBLIC_ENABLE_CARS:bool.default(true), NEXT_PUBLIC_ENABLE_ROOMS:bool.default(true),
}).superRefine((v,c)=>{
 if(v.DATA_SOURCE==='mock') for(const k of ['QR_TOKEN_SECRET','APPROVAL_TOKEN_SECRET'] as const) if(!v[k]) c.addIssue({code:'custom',path:[k],message:'จำเป็นในโหมด mock'});
 if(v.DATA_SOURCE==='mock' && v.MAIL_MODE==='smtp' && !v.SMTP_HOST) c.addIssue({code:'custom',path:['SMTP_HOST'],message:'จำเป็นในโหมด smtp'});
});
const result=schema.safeParse(process.env);
if(!result.success) throw new Error('Environment ไม่ถูกต้อง: '+result.error.issues.map(i=>i.path.join('.')+': '+i.message).join('; '));
export const env=result.data;

