import { appConfig } from '@/shared/config/app.config';
type DateInput=Date|string|number;
const date=(d:DateInput)=>new Date(d);
export function bangkokDateTime(day:string,time:string) {return new Date(day+'T'+time+':00+07:00');}
export function todayInBangkok(d:DateInput=new Date()) {return new Intl.DateTimeFormat('en-CA',{timeZone:appConfig.timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(date(d));}
export function addDays(day:string,n:number) {return todayInBangkok(new Date(bangkokDateTime(day,'12:00').getTime()+n*86400000));}
// ชื่อวันและเดือนเขียนเองแทน Intl เพราะ ICU ของ Node กับเบราว์เซอร์ย่อชื่อวันไม่เหมือนกัน (เช่น "พฤ." กับ "พฤหัส") ทำให้ hydrate ไม่ตรง
const weekdayShort=['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'],weekdayLong=['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
const monthShort=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],monthLong=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
function parts(d:DateInput,system:'CE'|'BE'=appConfig.yearSystem) {const [y,m,day]=todayInBangkok(d).split('-').map(Number);return {year:y+(system==='BE'?543:0),month:m-1,day,weekday:new Date(Date.UTC(y,m-1,day)).getUTCDay()};}
export function formatDate(d:DateInput,system:'CE'|'BE'=appConfig.yearSystem) {const p=parts(d,system);return weekdayShort[p.weekday]+' '+p.day+' '+monthShort[p.month]+' '+p.year;}
export function formatDateLong(d:DateInput) {const p=parts(d);return 'วัน'+weekdayLong[p.weekday]+'ที่ '+p.day+' '+monthLong[p.month]+' '+p.year;}
const dayMonth=(d:DateInput)=>{const p=parts(d);return p.day+' '+monthShort[p.month];};
/** วันแบบสั้นไม่มีปี เช่น "พฤ. 8 ต.ค." ใช้ในที่แคบบนมือถือ */
export function formatDateShort(d:DateInput) {return weekdayShort[parts(d).weekday]+' '+dayMonth(d);}
/** ชื่อวันย่อและเลขวัน แยกกัน ใช้ในแถบเลือกวัน */
export function dayParts(d:DateInput) {const p=parts(d);return {weekday:weekdayShort[p.weekday],day:p.day};}
export function formatTime(d:DateInput) {return new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:appConfig.timeZone}).format(date(d));}
export function formatRange(a:DateInput,b:DateInput) {return todayInBangkok(a)===todayInBangkok(b)?formatTime(a)+'–'+formatTime(b):dayMonth(a)+' '+formatTime(a)+' – '+dayMonth(b)+' '+formatTime(b);}
/** ช่วงการจอง: วันเดียว = "พ. 7 ต.ค. 2026 · 09:30–12:00", หลายวัน = "พ. 7 ต.ค. 09:00 – ศ. 9 ต.ค. 17:00" */
/** ช่วงเวลาแยก 2 ท่อน ให้จอแคบตัดบรรทัดระหว่างท่อนได้ เช่น ['พฤ. 8 ต.ค. 2026 ·','09:00–10:00'] หรือ ['พฤ. 8 ต.ค. 09:00 –','ศ. 9 ต.ค. 17:00'] */
export function periodParts(a:DateInput,b:DateInput):[string,string] {return todayInBangkok(a)===todayInBangkok(b)?[formatDate(a)+' ·',formatRange(a,b)]:[formatDateShort(a)+' '+formatTime(a)+' –',formatDateShort(b)+' '+formatTime(b)];}
export function formatPeriod(a:DateInput,b:DateInput) {return periodParts(a,b).join(' ');}
export function formatDuration(min:number) {const h=Math.floor(min/60),m=min%60;return [h?h+' ชม.':'',m?m+' นาที':''].filter(Boolean).join(' ') || '0 นาที';}
export function formatRelative(d:DateInput,reference:DateInput=new Date()) {const diff=Math.ceil((date(d).getTime()-date(reference).getTime())/60000);return diff>=0?'อีก '+diff+' นาที':'เกิน '+Math.abs(diff)+' นาที';}
export function formatMileage(n:number) {return new Intl.NumberFormat('en-US').format(n)+' กม.';}
export function minutesOfDay(d:DateInput) {const [h,m]=formatTime(d).split(':').map(Number);return h*60+m;}
export function timeOptions(start:string,end:string,slot=30) {const parse=(v:string)=>{const [h,m]=v.split(':').map(Number);return h*60+m;};const result:string[]=[];for(let m=parse(start);m<=parse(end);m+=slot) result.push(String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'));return result;}
export function weekdayInBangkok(d:DateInput) {return new Intl.DateTimeFormat('en-US',{weekday:'short',timeZone:appConfig.timeZone}).format(date(d));}

