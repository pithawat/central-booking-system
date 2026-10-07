import type { ISODateTime, ISODate, User, CarType, GuardStation, Car, CarBookingDetail, HandoverMethod, KeyLogEntry, GuardShift, Site, Building, Room, RoomBookingDetail, RoomDaySchedule, MailMessage } from './types';
export interface Services {
  users: UserService;
  cars: CarService;
  carBookings: CarBookingService;
  guard: GuardService;
  rooms: RoomService;
  roomBookings: RoomBookingService;
  approvals: ApprovalService;
  reports: ReportService;
  dev: DevService | null;       // null เมื่อ DATA_SOURCE=api
}

export interface UserService {
  me(): Promise<User>;
  getById(id: string): Promise<User>;
  search(q: string): Promise<User[]>;             // ใช้ในช่อง "จองให้คนอื่น"
  supervisorOf(userId: string): Promise<User | null>;
  isSupervisor(userId: string): Promise<boolean>;
  personas(): Promise<User[]>;                     // ผู้ใช้ทดสอบในหน้า login (AUTH_MODE=mock)
}

export interface CarAvailability {
  car: Car;
  available: boolean;
  busyUntil: ISODateTime | null;                   // ไม่ว่างถึงเมื่อไหร่ (null ถ้ากุญแจยังไม่คืน)
}

export interface CarService {
  list(filter?: { stationId?: string; type?: CarType }): Promise<Car[]>;
  availability(q: { start: ISODateTime; end: ISODateTime; type?: CarType; minSeats?: number }): Promise<CarAvailability[]>;
}

export interface CarBookingService {
  create(input: { carId: string; start: ISODateTime; end: ISODateTime; purpose: string; destination: string; driverName?: string | null }): Promise<CarBookingDetail>;
  listMine(scope: 'upcoming' | 'active' | 'history'): Promise<CarBookingDetail[]>;
  getById(id: string): Promise<CarBookingDetail>;
  activePass(): Promise<CarBookingDetail | null>;  // การจองที่อยู่ในช่วงรับรถ หรือกำลังใช้งาน (สำหรับหน้าแรก)
  cancel(id: string): Promise<CarBookingDetail>;
  extend(id: string, newEnd: ISODateTime): Promise<CarBookingDetail>;
  submitReturnInfo(id: string, input: { mileage: number; issue?: string | null }): Promise<CarBookingDetail>;
}

export type GuardLookupResult =
  | { kind: 'PICKUP'; booking: CarBookingDetail }
  | { kind: 'RETURN'; booking: CarBookingDetail }
  | { kind: 'TOO_EARLY'; booking: CarBookingDetail; availableFrom: ISODateTime }
  | { kind: 'KEY_NOT_RETURNED'; booking: CarBookingDetail; holder: CarBookingDetail; alternatives: Car[] }
  | { kind: 'NOT_FOUND' }
  | { kind: 'INVALID'; reason: 'CANCELLED' | 'NO_SHOW' | 'RETURNED' | 'WRONG_STATION' | 'TOKEN_INVALID' };

export interface GuardService {
  stations(): Promise<GuardStation[]>;
  guardsOf(stationId: string): Promise<User[]>;
  activeShift(stationId: string): Promise<(GuardShift & { guard: User }) | null>;
  startShift(input: { stationId: string; guardId: string; pin: string }): Promise<GuardShift>;
  endShift(shiftId: string): Promise<void>;
  board(stationId: string): Promise<{ waiting: CarBookingDetail[]; out: CarBookingDetail[] }>;
  lookup(input: { stationId: string; qrToken?: string; code?: string; bookingId?: string }): Promise<GuardLookupResult>;
  handover(input: { bookingId: string; shiftId: string; method: HandoverMethod }): Promise<CarBookingDetail>;
  receive(input: { bookingId: string; shiftId: string; method: HandoverMethod; mileage?: number }): Promise<CarBookingDetail>;
  swapCar(input: { bookingId: string; newCarId: string; shiftId: string }): Promise<CarBookingDetail>;
}

export interface RoomFilter { siteId?: string; minCapacity?: number; tvOnly?: boolean }

export interface RoomService {
  sites(): Promise<Site[]>;
  buildings(): Promise<Building[]>;
  list(filter?: RoomFilter): Promise<Room[]>;
  getById(id: string): Promise<Room>;
}

export interface RoomBookingService {
  daySchedule(date: ISODate, filter?: RoomFilter): Promise<RoomDaySchedule>;
  listByRoom(roomId: string, from: ISODate, to: ISODate): Promise<RoomBookingDetail[]>; // PENDING + APPROVED
  create(input: { roomId: string; start: ISODateTime; end: ISODateTime; title: string; attendeeId?: string; contactPhone?: string }): Promise<RoomBookingDetail>;
  listMine(scope: 'upcoming' | 'history'): Promise<RoomBookingDetail[]>;
  getById(id: string): Promise<RoomBookingDetail>;
  cancel(id: string): Promise<RoomBookingDetail>;
  nudge(id: string): Promise<{ nextAllowedAt: ISODateTime }>;
}

export interface ApprovalService {
  pending(): Promise<RoomBookingDetail[]>;                    // คำขอที่รอผู้ใช้ปัจจุบันอนุมัติ
  pendingCount(): Promise<number>;
  history(days?: number): Promise<RoomBookingDetail[]>;       // ค่าเริ่มต้น 30 วัน
  approve(bookingId: string): Promise<RoomBookingDetail>;
  reject(bookingId: string, reason?: string): Promise<RoomBookingDetail>;
  approveMany(bookingIds: string[]): Promise<RoomBookingDetail[]>;
  viewByToken(token: string): Promise<{ booking: RoomBookingDetail; approver: User }>;
  decideByToken(token: string, decision: 'APPROVE' | 'REJECT', reason?: string): Promise<RoomBookingDetail>;
}

export interface KeyLogRow extends KeyLogEntry { car: Car; user: User; guard: User }

export interface ReportService {
  keyLog(q: { date: ISODate; stationId?: string }): Promise<KeyLogRow[]>;
}

export interface DevService {
  clock(): Promise<{ now: ISODateTime; offsetMinutes: number }>;
  shiftClock(minutes: number): Promise<void>;
  resetClock(): Promise<void>;
  resetData(): Promise<void>;
  runJobs(): Promise<{ executed: string[] }>;
  mail(filter?: { to?: string }): Promise<MailMessage[]>;
  clearMail(): Promise<void>;
}
