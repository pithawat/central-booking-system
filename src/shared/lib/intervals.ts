export type Instant=Date|string|number;
export const millis=(value:Instant)=>new Date(value).getTime();
export function overlaps(aStart:Instant,aEnd:Instant,bStart:Instant,bEnd:Instant) {return millis(aStart)<millis(bEnd) && millis(bStart)<millis(aEnd);}
export function addMinutes(value:Instant,minutes:number) {return new Date(millis(value)+minutes*60000);}
export function floorSlot(value:Instant,minutes=30) {return new Date(Math.floor(millis(value)/(minutes*60000))*minutes*60000);}
export function ceilSlot(value:Instant,minutes=30) {return new Date(Math.ceil(millis(value)/(minutes*60000))*minutes*60000);}

