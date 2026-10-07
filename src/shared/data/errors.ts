import { ZodError } from 'zod';
export const errorMessages = {
 CONFLICT:'ช่วงเวลานี้มีคนจองแล้ว เลือกเวลาอื่น', OUTSIDE_WINDOW:'ยังไม่ถึงเวลาหรือเลยเวลาที่ทำรายการได้',
 INVALID_STATE:'สถานะการจองเปลี่ยนไปแล้ว โหลดหน้าใหม่แล้วลองอีกครั้ง', TOKEN_INVALID:'QR หรือลิงก์นี้ใช้ไม่ได้',
 TOKEN_EXPIRED:'QR หรือลิงก์นี้หมดอายุแล้ว', NOT_FOUND:'ไม่พบข้อมูลนี้', FORBIDDEN:'คุณไม่มีสิทธิ์ทำรายการนี้',
 RATE_LIMITED:'ทำรายการผิดหลายครั้ง รอสักครู่แล้วลองใหม่', VALIDATION:'ข้อมูลไม่ครบหรือไม่ถูกต้อง',
 NETWORK:'เชื่อมต่อระบบไม่ได้ ลองใหม่อีกครั้ง', UNKNOWN:'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง',
} as const;
export type ErrorCode=keyof typeof errorMessages;
export class ServiceError extends Error { constructor(public code:ErrorCode, message:string=errorMessages[code]) {super(message);this.name='ServiceError';} }
export type ActionResult<T>={ok:true;data:T}|{ok:false;error:{code:ErrorCode;message:string;fields?:Record<string,string>}};
export function actionError(error:unknown):ActionResult<never> {
 if(error instanceof ZodError) return {ok:false,error:{code:'VALIDATION',message:error.issues[0]?.message || errorMessages.VALIDATION,fields:Object.fromEntries(error.issues.map(i=>[i.path.join('.'),i.message]))}};
 if(error instanceof ServiceError) return {ok:false,error:{code:error.code,message:error.message}};
 console.error(error); return {ok:false,error:{code:'UNKNOWN',message:errorMessages.UNKNOWN}};
}

