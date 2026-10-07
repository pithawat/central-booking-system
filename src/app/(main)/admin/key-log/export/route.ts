import {type NextRequest} from 'next/server';
import {z} from 'zod';
import {requireUser,requireFeature} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {todayInBangkok,formatTime} from '@/shared/lib/datetime';
import {now} from '@/shared/lib/clock';
import {methodLabels} from '@/features/cars/lib/labels';
export async function GET(request:NextRequest) {
 requireFeature('cars');await requireUser(['ADMIN']);const date=z.iso.date().parse(request.nextUrl.searchParams.get('date')??todayInBangkok(now())),stationId=request.nextUrl.searchParams.get('stationId')||undefined;
 const rows=await (await getServices()).reports.keyLog({date,stationId});
 const escape=(v:unknown)=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
 const csv=[['เวลา','รายการ','รถ','ผู้รับหรือผู้คืน','รปภ.','วิธียืนยัน','เลขไมล์','หมายเหตุ'],...rows.map(r=>[formatTime(r.at),r.type==='HANDOVER'?'มอบ':'รับคืน','#'+r.car.number,r.user.displayName,r.guard.displayName,methodLabels[r.method],r.mileage,r.note])].map(r=>r.map(escape).join(',')).join('\r\n');
 return new Response('\uFEFF'+csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="key-log-'+date+'.csv"','Cache-Control':'no-store'}});
}

