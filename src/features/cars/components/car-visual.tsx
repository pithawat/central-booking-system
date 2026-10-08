'use client';
import {useState} from 'react';
import Image from 'next/image';
import type {Car,CarType} from '@/shared/data/types';

/** ภาพวาดด้านข้างของรถแต่ละประเภท ใช้แทนเมื่อยังไม่มีรูปรถจริง */
const shapes:Record<CarType,{body:string;windows:string[]}>={
 SEDAN:{body:'M10 64 L14 48 Q16 43 26 42 L58 39 L80 25 Q86 21 96 21 L132 21 Q142 21 150 29 L164 40 L184 44 Q192 46 192 54 L192 64 Z',windows:['M84 39 L95 27 L113 27 L113 39 Z','M119 27 L131 27 Q138 27 144 33 L150 39 L119 39 Z']},
 SUV:{body:'M10 64 L12 42 Q14 35 24 34 L60 33 L72 17 Q76 12 86 12 L150 12 Q158 12 164 20 L174 32 L186 36 Q192 38 192 46 L192 64 Z',windows:['M76 32 L86 18 L112 18 L112 32 Z','M118 18 L148 18 Q154 18 158 24 L164 32 L118 32 Z']},
 PICKUP:{body:'M10 64 L10 42 L94 42 L94 38 L104 17 Q106 12 116 12 L144 12 Q152 12 158 20 L170 34 L186 38 Q192 40 192 48 L192 64 Z',windows:['M110 34 L116 18 L142 18 Q148 18 152 24 L160 34 Z']},
 VAN:{body:'M10 64 L10 22 Q10 11 22 11 L150 11 Q160 11 168 21 L184 40 Q192 44 192 52 L192 64 Z',windows:['M20 20 L58 20 L58 36 L20 36 Z','M64 20 L102 20 L102 36 L64 36 Z','M108 20 L146 20 L146 36 L108 36 Z','M152 20 L158 20 Q162 20 165 24 L174 36 L152 36 Z']},
};
function CarDrawing({type}:{type:CarType}) {
 const s=shapes[type];
 return <svg viewBox="0 0 200 84" className="h-full w-full" aria-hidden>
  <ellipse cx="100" cy="74" rx="92" ry="5" fill="#0f172a" opacity=".08"/>
  <path d={s.body} fill="#dbe4f0" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round"/>
  {s.windows.map(w=><path key={w} d={w} fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5"/>)}
  {[50,152].map(x=><g key={x}><circle cx={x} cy="64" r="12" fill="#334155"/><circle cx={x} cy="64" r="5" fill="#cbd5e1"/></g>)}
 </svg>;
}

/** รูปรถ: ใช้รูปจริงจาก photoUrl ถ้าโหลดไม่ได้หรือไม่มีจะแสดงภาพวาดตามประเภท */
export function CarPhoto({car,className='',sizes='(max-width:640px) 40vw, 360px'}:{car:Pick<Car,'photoUrl'|'type'|'model'|'plate'>;className?:string;sizes?:string}) {
 const [failed,setFailed]=useState(false);
 const real=car.photoUrl&&!failed;
 return <div className={'relative overflow-hidden bg-linear-to-br from-slate-50 to-slate-100 '+className}>
  {/* รูปตัดพื้นหลัง (.png) แสดงทั้งคัน ส่วนภาพถ่าย (.jpg) ครอบให้เต็มกรอบ */}
  {real?<Image src={car.photoUrl!} alt={'รูปรถ '+car.model+' ทะเบียน '+car.plate} fill unoptimized sizes={sizes} className={/\.png($|\?)/i.test(car.photoUrl!)?'object-contain p-2':'object-cover'} onError={()=>setFailed(true)}/>
  :<div className="absolute inset-0 flex items-center justify-center p-3" role="img" aria-label={'ภาพประกอบ '+car.model}><CarDrawing type={car.type}/></div>}
 </div>;
}

const plateSizes={sm:'px-2 py-0.5 text-base border-[1.5px]',md:'px-3 py-1 text-xl border-2',lg:'px-4 py-1.5 text-2xl border-2',xl:'px-5 py-2 text-4xl border-[3px]'};
/** ป้ายทะเบียนแบบป้ายรถไทย ใช้เป็นข้อมูลหลักของรถ */
export function LicensePlate({plate,size='md',className=''}:{plate:string;size?:keyof typeof plateSizes;className?:string}) {
 return <span aria-label={'ทะเบียน '+plate} className={'inline-flex items-center whitespace-nowrap rounded-lg border-slate-800 bg-white font-heading font-bold leading-none tracking-wide text-slate-900 shadow-[inset_0_0_0_2px_#fff,0_1px_2px_rgb(15_23_42/.15)] '+plateSizes[size]+' '+className}>{plate}</span>;
}
