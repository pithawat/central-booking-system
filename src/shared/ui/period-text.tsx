import {periodParts} from '@/shared/lib/datetime';
/** ช่วงเวลาที่ตัดบรรทัดได้เฉพาะระหว่างวันที่กับเวลา (จอแคบไม่ตัดกลางวันที่หรือซ่อนเวลา) */
export function PeriodText({start,end}:{start:string;end:string}) {
 const [a,b]=periodParts(start,end);
 return <><span className="whitespace-nowrap">{a}</span> <span className="whitespace-nowrap">{b}</span></>;
}
