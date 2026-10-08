export const appConfig = {
  timeZone: 'Asia/Bangkok',
  yearSystem: 'CE' as 'CE' | 'BE',     // CE = 2026 ตามระบบเดิม, BE = 2569
  pollIntervalSeconds: 10,             // หน้าที่ต้องอัปเดตสด: การ์ด QR, หน้า รปภ.

  car: {
    slotMinutes: 30,
    timeOptionsStart: '06:00',         // ตัวเลือกเวลาในฟอร์มจองรถ
    timeOptionsEnd: '22:00',
    defaultDurationMinutes: 120,
    defaultReturn: { daysAfter: 1, time: '17:00' }, // ค่าเริ่มต้นของฟอร์มจอง: คืนรถวันถัดไป 17:00 (จองหลายวันเป็นหลัก)
    minBookingMinutes: 30,
    maxBookingDays: 7,
    pickupEarlyMinutes: 30,            // มารับก่อนเวลาจองได้
    noShowCancelMinutes: 30,           // เลยเวลาเริ่มไปเท่านี้แล้วยังไม่มารับ → ยกเลิกอัตโนมัติ
    reminderBeforePickupMinutes: 30,
    reminderDayBeforeHours: 24,        // อีเมลเตือนล่วงหน้าก่อนวันรับรถ (ส่งเฉพาะการจองที่จองไว้ก่อนหน้านั้น)
    reminderBeforeReturnMinutes: 30,
    overdueNoticeMinutes: 15,          // เลยเวลาคืนไปเท่านี้ → ส่งอีเมลเตือน
    requireMileageOnReturn: true,
    maxMileageJumpKm: 2000,            // กรอกเลขไมล์เพิ่มเกินค่านี้ → ถามยืนยันอีกครั้ง
    pickupCodeLength: 4,
    showQr: true,                      // false = แสดงเฉพาะรหัส 4 หลัก
    presets: [
      { label: 'ครึ่งเช้า', start: '08:00', end: '12:00' },
      { label: 'ครึ่งบ่าย', start: '13:00', end: '17:00' },
      { label: 'ทั้งวัน', start: '08:00', end: '17:00' },
    ],
    dayPresets: [2, 3, 7],             // ปุ่มลัดจองหลายวัน: วันรับรถถึงวันที่ n เวลา 17:00
  },

  guard: {
    pinLength: 4,
    resultAutoResetSeconds: 3,         // ทำรายการสำเร็จแล้วกลับหน้าสแกนเอง
    wrongAttemptLimit: 5,              // พิมพ์รหัสหรือ PIN ผิดเกินนี้ภายใน 1 นาที → พักก่อน
    wrongAttemptCooldownSeconds: 30,
    shiftMaxHours: 12,
    beepOnScan: true,
  },

  room: {
    dayStart: '07:00',
    dayEnd: '19:00',
    slotMinutes: 30,
    lateBookingGraceMinutes: 10,       // จองช่องที่เพิ่งเริ่มไปไม่เกิน 10 นาทีได้
    defaultDurationMinutes: 60,
    durationPresetsMinutes: [30, 60, 120],
    maxAdvanceDays: 365,
    titleMaxLength: 120,
    costRoomBehavior: 'warn' as 'warn' | 'confirm', // warn = แสดงป้ายเตือนอย่างเดียว
    approval: {
      enabled: true,
      approverIs: 'BOOKER_SUPERVISOR', // หัวหน้าของคนกดจอง แม้จะจองแทนคนอื่น
      reminderAfterHours: 4,
      nudgeCooldownHours: 2,
      expireAtStart: true,             // ถึงเวลาประชุมแล้วยังไม่อนุมัติ → หมดอายุ
      autoApproveWhenNoSupervisor: true,
      linkRequiresLogin: false,
    },
  },
} as const;
