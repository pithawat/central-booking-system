import 'server-only';
import type {Services} from '@/shared/data/contracts';
import {ServiceError} from '@/shared/data/errors';
import {toPlaces,type CarPlaces} from './places';

/** อ่านไม่ได้เพราะสิทธิ์หรือ backend ยังไม่เปิดให้ → ค่าว่าง (error อื่น เช่น redirect หรือบั๊ก ส่งต่อตามปกติ) */
const orEmpty=async<T>(read:()=>Promise<T[]>):Promise<T[]>=>{try{return await read();}catch(e){if(e instanceof ServiceError)return [];throw e;}};
/** โหลดจุดรับ-คืนรถของทุกป้อม (ชื่อป้อม + ฝั่ง) ใช้แสดงผลอย่างเดียว ถ้าอ่านไม่ได้จะแสดง "ป้อม รปภ." แทน */
export async function loadCarPlaces(s:Services):Promise<CarPlaces> {
 const [stations,sites]=await Promise.all([orEmpty(()=>s.guard.stations()),orEmpty(()=>s.rooms.sites())]);
 return toPlaces(stations,sites);
}
