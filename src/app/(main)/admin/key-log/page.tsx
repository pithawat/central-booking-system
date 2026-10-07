import {z} from 'zod';
import {requireUser,requireFeature} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {now} from '@/shared/lib/clock';
import {todayInBangkok,bangkokDateTime,formatDateLong,formatTime,formatMileage} from '@/shared/lib/datetime';
import {KeyRound} from 'lucide-react';
import {PageHeader} from '@/shared/ui/page-header';
import {ReportControls} from '@/shared/ui/report-controls';
import {methodLabels} from '@/features/cars/lib/labels';
export default async function KeyLogPage({searchParams}:{searchParams:Promise<{date?:string;stationId?:string}>}) {
 requireFeature('cars');await requireUser(['ADMIN']);const s=await getServices(),q=await searchParams,date=z.iso.date().safeParse(q.date).success?q.date!:todayInBangkok(now()),stations=await s.guard.stations(),rows=await s.reports.keyLog({date,stationId:q.stationId});
 const title='บันทึกการรับ-คืนกุญแจรถ · '+(stations.find(x=>x.id===q.stationId)?.name??'ทุกป้อม')+' · '+formatDateLong(bangkokDateTime(date,'12:00'));
 return <><PageHeader icon={KeyRound} title="รายงานรับ-คืนกุญแจ" description="บันทึกการมอบและรับคืนกุญแจรถรายวัน"/><ReportControls date={date} stationId={q.stationId??''} stations={stations}/><h2 className="text-xl mb-4">{title}</h2><div className="surface overflow-x-auto p-0"><table className="key-log w-full border-collapse text-base"><thead><tr>{['เวลา','รายการ','รถ','ผู้รับหรือผู้คืน','รปภ.','วิธียืนยัน','เลขไมล์','หมายเหตุ'].map(h=><th className="border p-3 text-left" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id}><td className="border p-3">{formatTime(r.at)}</td><td className="border p-3">{r.type==='HANDOVER'?'มอบ':'รับคืน'}</td><td className="border p-3">#{r.car.number}</td><td className="border p-3">{r.user.displayName}</td><td className="border p-3">{r.guard.displayName}</td><td className="border p-3">{methodLabels[r.method]}</td><td className="border p-3">{r.mileage===null?'–':formatMileage(r.mileage)}</td><td className="border p-3">{r.note??'–'}</td></tr>)}</tbody></table></div>{!rows.length&&<p className="mt-4 text-muted-foreground">ไม่มีรายการรับ-คืนกุญแจในวันนี้</p>}</>;
}

