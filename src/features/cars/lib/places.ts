import type {GuardStation,Site} from '@/shared/data/types';

/** จุดรับ-คืนรถ = ป้อมประจำรถ (รับและคืนที่ป้อมเดียวกัน) พร้อมฝั่งที่ป้อมนั้นอยู่ */
export type CarPlace={station:string;site:string};
export type CarPlaces=Record<string,CarPlace>;

export function toPlaces(stations:GuardStation[],sites:Site[]):CarPlaces {
 return Object.fromEntries(stations.map(st=>[st.id,{station:st.name,site:sites.find(x=>x.id===st.siteId)?.name??''}]));
}
/** เช่น "ฝั่ง Office · ป้อม รปภ. ประตู 1" ถ้าไม่รู้ข้อมูลป้อมแสดงแค่ "ป้อม รปภ." */
export const placeLabel=(p?:CarPlace)=>!p?'ป้อม รปภ.':p.site?p.site+' · '+p.station:p.station;
/** ชื่อฝั่งอย่างเดียว ใช้ในที่แคบ เช่น การ์ดรถ */
export const placeSite=(p?:CarPlace)=>p?.site||p?.station||'ป้อม รปภ.';
