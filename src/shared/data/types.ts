export type ISODateTime = string; // '2026-10-07T02:30:00.000Z' (UTC)
export type ISODate = string;     // '2026-10-07' (วันตามเวลาไทย)

export type Role = 'EMPLOYEE' | 'GUARD' | 'STATION' | 'ADMIN';

export interface User {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  displayName: string;          // 'สมชาย ใจดี'
  shortName: string;            // 'สมชาย ใ.'
  email: string;
  phone: string;
  departmentName: string;
  position: string;
  supervisorId: string | null;
  roles: Role[];
  photoUrl: string | null;      // mock = null → แสดงอักษรย่อแทน
  defaultSiteId: string;
  stationId: string | null;     // ใช้กับ GUARD และ STATION
}

// ---------- รถ ----------
export type CarType = 'SEDAN' | 'PICKUP' | 'VAN' | 'SUV';

export interface GuardStation { id: string; name: string; siteId: string }

export interface Car {
  id: string;
  number: string;               // '12' แสดงผลเป็น #12
  plate: string;
  model: string;
  type: CarType;
  seats: number;
  keySlot: string;              // ช่องแขวนกุญแจที่ป้อม
  stationId: string;
  currentMileage: number;
  active: boolean;
  photoUrl?: string | null;     // รูปรถจริง (URL หรือ path ใน /public) ไม่มีรูปจะแสดงภาพวาดตามประเภทรถ
}

export type CarBookingStatus = 'CONFIRMED' | 'IN_USE' | 'RETURNED' | 'CANCELLED' | 'NO_SHOW';

export interface CarBooking {
  id: string;
  carId: string;
  userId: string;               // ผู้จอง
  driverName: string | null;    // null = ผู้จองขับเอง
  start: ISODateTime;
  end: ISODateTime;
  purpose: string;
  destination: string;
  status: CarBookingStatus;
  pickupCode: string;           // 4 หลัก ไม่ซ้ำกับการจองที่ CONFIRMED/IN_USE ของป้อมเดียวกัน
  pickedUpAt: ISODateTime | null;
  returnedAt: ISODateTime | null;
  startMileage: number | null;
  endMileage: number | null;    // ผู้ใช้กรอกตอนคืน หรือ รปภ. กรอกให้
  returnIssue: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface CarBookingDetail extends CarBooking {
  nextBookingStart?: ISODateTime | null; // Read-only boundary for extension options.
  car: Car;
  user: User;
  isOverdue: boolean;           // IN_USE และ now > end
  qrToken: string | null;       // ส่งให้เฉพาะเจ้าของการจอง คนอื่นได้ null
}

export type HandoverMethod = 'QR' | 'CODE' | 'ID_CARD' | 'TAP_LIST';

export interface KeyLogEntry {
  id: string;
  bookingId: string;
  carId: string;
  stationId: string;
  type: 'HANDOVER' | 'RECEIVE';
  at: ISODateTime;
  userId: string;               // ผู้รับหรือผู้คืน
  guardId: string;
  method: HandoverMethod;
  mileage: number | null;
  note: string | null;
}

export interface GuardShift {
  id: string;
  stationId: string;
  guardId: string;
  startedAt: ISODateTime;
  endedAt: ISODateTime | null;
}

// ---------- ห้อง ----------
export interface Site { id: string; name: string }
export interface Building { id: string; siteId: string; name: string; sortOrder: number }

export interface Room {
  id: string;
  buildingId: string;
  siteId: string;
  floor: number | null;
  name: string;                 // 'ห้อง 402'
  shortLabel: string;           // '2/4 ห้อง 402' (อาคาร/ชั้น ห้อง)
  capacity: number;
  hasTv: boolean | null;        // null = ข้อมูลเดิมไม่ระบุ
  hasCost: boolean;
  note: string | null;          // เช่น 'ไม่มีผนังกั้น'
  legacyLabel: string;          // ชื่อเต็มแบบระบบเดิม ใช้ค้นหา
  sortOrder: number;
  active: boolean;
}

export type RoomBookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';

export interface RoomBooking {
  id: string;
  roomId: string;
  title: string;
  start: ISODateTime;
  end: ISODateTime;
  bookedById: string;           // คนกดจอง (ผู้บันทึก)
  attendeeId: string;           // ผู้ใช้งานห้อง ค่าเริ่มต้นเป็นคนกดจอง
  contactPhone: string;
  status: RoomBookingStatus;
  approverId: string | null;    // null = อนุมัติอัตโนมัติ
  decidedAt: ISODateTime | null;
  rejectReason: string | null;
  lastNudgedAt: ISODateTime | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface RoomBookingDetail extends RoomBooking {
  room: Room;
  bookedBy: User;
  attendee: User;
  approver: User | null;
  isMine: boolean;              // bookedById หรือ attendeeId เป็นผู้ใช้ปัจจุบัน
}

export interface RoomDaySchedule {
  date: ISODate;
  sites: Site[];
  buildings: Building[];
  rooms: Room[];                // กรองแล้ว เรียงตาม sortOrder
  bookings: RoomBookingDetail[];// เฉพาะ PENDING และ APPROVED ของวันนั้น
}

// ---------- อีเมล (mock) ----------
export interface MailMessage {
  id: string;
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
  text: string;
  attachments?: { filename: string; contentType: string; contentBase64: string }[];
  type: string;                 // เช่น 'ROOM_APPROVAL_REQUEST'
  bookingId?: string;
  createdAt: ISODateTime;
}

export const CAR_BLOCKING_STATUSES: CarBookingStatus[] = ['CONFIRMED', 'IN_USE'];
export const ROOM_BLOCKING_STATUSES: RoomBookingStatus[] = ['PENDING', 'APPROVED'];
