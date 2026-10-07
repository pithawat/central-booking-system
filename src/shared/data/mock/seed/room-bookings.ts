import type {RoomBooking} from '../../types';
import {users} from './org';
import {addDays,bangkokDateTime,todayInBangkok} from '@/shared/lib/datetime';
const data=[
  {
    "id": "RB-001",
    "roomId": "RM-60Y",
    "day": 0,
    "time": "08:00–16:30",
    "title": "ประชุม RMCx",
    "userId": "U05",
    "status": "APPROVED"
  },
  {
    "id": "RB-002",
    "roomId": "RM-B1-201",
    "day": 0,
    "time": "11:30–13:30",
    "title": "Channel management",
    "userId": "U03",
    "status": "APPROVED"
  },
  {
    "id": "RB-003",
    "roomId": "RM-B1-401",
    "day": 0,
    "time": "08:30–12:00",
    "title": "ประชุมคณะบริหาร RMC Network Management",
    "userId": "U06",
    "status": "APPROVED"
  },
  {
    "id": "RB-004",
    "roomId": "RM-B1-401",
    "day": 0,
    "time": "13:00–17:00",
    "title": "ประชุมฝ่าย",
    "userId": "U04",
    "status": "APPROVED"
  },
  {
    "id": "RB-005",
    "roomId": "RM-B1-402",
    "day": 0,
    "time": "09:30–12:00",
    "title": "RMCx DevTeam CPAC Partner Connect",
    "userId": "U01",
    "status": "APPROVED"
  },
  {
    "id": "RB-006",
    "roomId": "RM-B1-CPAC72",
    "day": 0,
    "time": "08:00–12:00",
    "title": "คณะจัดการ KAM",
    "userId": "U04",
    "status": "APPROVED"
  },
  {
    "id": "RB-007",
    "roomId": "RM-B1-CPAC72",
    "day": 0,
    "time": "13:00–15:00",
    "title": "RMC Demand & Supply Optimization",
    "userId": "U05",
    "status": "APPROVED"
  },
  {
    "id": "RB-008",
    "roomId": "RM-B1-CPAC72",
    "day": 0,
    "time": "15:00–17:30",
    "title": "ใช้ต่อ",
    "userId": "U05",
    "status": "APPROVED"
  },
  {
    "id": "RB-009",
    "roomId": "RM-CCTC-201",
    "day": 0,
    "time": "08:00–16:30",
    "title": "ประชุมหน่วยงาน CCT",
    "userId": "U11",
    "status": "APPROVED"
  },
  {
    "id": "RB-010",
    "roomId": "RM-CCTC-203",
    "day": 0,
    "time": "13:00–17:00",
    "title": "ประชุมหน่วยงานโรงงาน",
    "userId": "U11",
    "status": "APPROVED"
  },
  {
    "id": "RB-011",
    "roomId": "RM-B2-COWORK",
    "day": 0,
    "time": "08:00–09:30",
    "title": "S&OP RMC นัด Metro",
    "userId": "U06",
    "status": "APPROVED"
  },
  {
    "id": "RB-012",
    "roomId": "RM-B2-301",
    "day": 0,
    "time": "08:00–16:30",
    "title": "Bu meeting",
    "userId": "U02",
    "status": "APPROVED"
  },
  {
    "id": "RB-013",
    "roomId": "RM-B2-302",
    "day": 0,
    "time": "08:30–09:30",
    "title": "Rayong Project Update",
    "userId": "U09",
    "status": "APPROVED"
  },
  {
    "id": "RB-014",
    "roomId": "RM-B2-302",
    "day": 0,
    "time": "13:00–16:00",
    "title": "Meeting",
    "userId": "U10",
    "status": "APPROVED"
  },
  {
    "id": "RB-015",
    "roomId": "RM-B2-401",
    "day": 0,
    "time": "08:00–16:30",
    "title": "Bu meeting",
    "userId": "U02",
    "status": "APPROVED"
  },
  {
    "id": "RB-016",
    "roomId": "RM-B4-101",
    "day": 0,
    "time": "08:00–12:00",
    "title": "PM",
    "userId": "U12",
    "status": "APPROVED"
  },
  {
    "id": "RB-017",
    "roomId": "RM-B4-201",
    "day": 0,
    "time": "08:30–12:00",
    "title": "Weekly Meeting CPAC SB&M",
    "userId": "U04",
    "status": "APPROVED"
  },
  {
    "id": "RB-018",
    "roomId": "RM-B4-201",
    "day": 0,
    "time": "13:00–16:00",
    "title": "HR จัดสัมภาษณ์",
    "userId": "U07",
    "status": "APPROVED"
  },
  {
    "id": "RB-019",
    "roomId": "RM-B4-202",
    "day": 0,
    "time": "09:00–10:30",
    "title": "ประชุมทีมวางแผน",
    "userId": "U06",
    "status": "APPROVED"
  },
  {
    "id": "RB-020",
    "roomId": "RM-B2-402",
    "day": 0,
    "time": "14:00–15:30",
    "title": "ประชุมทีมขายประจำสัปดาห์",
    "userId": "U03",
    "status": "PENDING"
  },
  {
    "id": "RB-021",
    "roomId": "RM-B1-402",
    "day": -6,
    "time": "10:00–12:00",
    "title": "RMCxDevTeam - Synergy Oil Analytics 1",
    "userId": "U01",
    "status": "APPROVED"
  },
  {
    "id": "RB-022",
    "roomId": "RM-B1-402",
    "day": -5,
    "time": "08:00–12:00",
    "title": "เปิดซองประกวดราคาหิน-ทราย RMC West",
    "userId": "U09",
    "status": "APPROVED"
  },
  {
    "id": "RB-023",
    "roomId": "RM-B1-402",
    "day": -5,
    "time": "13:00–17:00",
    "title": "QC /TA",
    "userId": "U11",
    "status": "APPROVED"
  },
  {
    "id": "RB-024",
    "roomId": "RM-B1-402",
    "day": -2,
    "time": "08:00–10:00",
    "title": "Env.&Safety",
    "userId": "U10",
    "status": "APPROVED"
  },
  {
    "id": "RB-025",
    "roomId": "RM-B1-402",
    "day": -1,
    "time": "10:00–12:00",
    "title": "CPAC ประชุมร่วมกับดอยคำ",
    "userId": "U03",
    "status": "APPROVED"
  },
  {
    "id": "RB-026",
    "roomId": "RM-B1-402",
    "day": -1,
    "time": "13:00–17:00",
    "title": "ประชุม sale s&op",
    "userId": "U04",
    "status": "APPROVED"
  },
  {
    "id": "RB-027",
    "roomId": "RM-B1-402",
    "day": 1,
    "time": "13:00–15:00",
    "title": "RMCxDevTeam - BAM Web",
    "userId": "U01",
    "status": "APPROVED"
  },
  {
    "id": "RB-028",
    "roomId": "RM-B2-403",
    "day": 1,
    "time": "10:00–11:00",
    "title": "RMCx DevTeam - Sprint Review",
    "userId": "U01",
    "status": "PENDING"
  },
  {
    "id": "RB-029",
    "roomId": "RM-B2-301",
    "day": 2,
    "time": "13:00–14:00",
    "title": "สัมภาษณ์ผู้สมัครตำแหน่งวิศวกร",
    "userId": "U07",
    "status": "REJECTED"
  },
  {
    "id": "RB-030",
    "roomId": "RM-B1-CPAC72",
    "day": 3,
    "time": "09:00–12:00",
    "title": "ประชุมผู้บริหารประจำเดือน",
    "userId": "U14",
    "status": "APPROVED"
  }
] as const;
export function roomBookings(t0:Date):RoomBooking[] {
 return data.map(r=>{
 const [from,to]=r.time.split('–');const start=bangkokDateTime(addDays(todayInBangkok(t0),r.day),from).toISOString();const end=bangkokDateTime(addDays(todayInBangkok(t0),r.day),to).toISOString();
 const user=users.find(u=>u.id===r.userId)!;
 const createdAt=new Date(r.id==='RB-020'?t0.getTime()-3600000:r.id==='RB-028'?t0.getTime()-5*3600000:new Date(start).getTime()-3*86400000).toISOString();
 return {id:r.id,roomId:r.roomId,title:r.title,start,end,bookedById:user.id,attendeeId:user.id,contactPhone:user.phone,status:r.status,approverId:user.supervisorId,decidedAt:r.status==='APPROVED'||r.status==='REJECTED'?new Date(new Date(createdAt).getTime()+2*3600000).toISOString():null,rejectReason:r.status==='REJECTED'?'ห้องนี้ใช้ประชุมฝ่าย ขอให้ใช้ 4/2 ห้อง 202 แทน':null,lastNudgedAt:null,createdAt,updatedAt:createdAt};
 });
}
