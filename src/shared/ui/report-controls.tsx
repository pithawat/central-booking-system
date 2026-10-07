'use client';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {DatePicker,Choice} from './fields';
import type {GuardStation} from '@/shared/data/types';
export function ReportControls({date,stationId,stations}:{date:string;stationId:string;stations:GuardStation[]}){const router=useRouter();const go=(q:object)=>router.push('/admin/key-log?'+new URLSearchParams({date,stationId,...q}));return <div className="no-print flex flex-wrap gap-4 items-end mb-6"><DatePicker value={date} onChange={date=>go({date})}/><Choice id="station" label="ป้อม" value={stationId||'ALL'} onChange={v=>go({stationId:v==='ALL'?'':v})} options={[{value:'ALL',label:'ทุกป้อม'},...stations.map(s=>({value:s.id,label:s.name}))]}/><Button variant="outline" onClick={()=>window.print()}>พิมพ์</Button><Button asChild><a href={'/admin/key-log/export?'+new URLSearchParams({date,stationId})}>ดาวน์โหลด CSV</a></Button></div>;}

