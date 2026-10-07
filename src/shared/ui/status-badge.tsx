import {Badge} from '@/components/ui/badge';
import type {CarBookingStatus,RoomBookingStatus} from '@/shared/data/types';
export const carStatusLabels={CONFIRMED:'รอรับรถ',IN_USE:'กำลังใช้งาน',RETURNED:'คืนแล้ว',CANCELLED:'ยกเลิกแล้ว',NO_SHOW:'ไม่มารับรถ'} as const;
export const roomStatusLabels={PENDING:'รออนุมัติ',APPROVED:'อนุมัติแล้ว',REJECTED:'ไม่อนุมัติ',CANCELLED:'ยกเลิกแล้ว',EXPIRED:'หมดอายุ'} as const;
export function StatusBadge(props:{kind:'car';status:CarBookingStatus;isOverdue?:boolean}|{kind:'room';status:RoomBookingStatus;isOverdue?:boolean}) {
 const label=props.isOverdue?'เกินเวลาคืน':props.kind==='car'?carStatusLabels[props.status]:roomStatusLabels[props.status];
 const style=props.isOverdue?'bg-overdue-bg text-overdue border-overdue-border':props.status==='IN_USE'?'bg-primary text-white border-primary':props.status==='CONFIRMED'?'border-primary text-primary bg-white':props.status==='PENDING'?'bg-status-pending text-status-pending-foreground border-status-pending-border':props.status==='APPROVED'?'bg-success-bg text-success border-success-border':'bg-status-other text-status-other-foreground border-status-other-border';
 return <Badge variant="outline" className={'gap-1.5 rounded-full px-3 py-0.5 text-sm font-medium '+style}><span aria-hidden className="size-1.5 rounded-full bg-current opacity-80"/>{label}</Badge>;
}
