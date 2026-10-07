import type {User,Site,Building,GuardStation} from '../../types';
export const users:User[]=[
  {
    "id": "U01",
    "employeeCode": "100101",
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "displayName": "สมชาย ใจดี",
    "shortName": "สมชาย จ.",
    "email": "somchai.j@example.com",
    "phone": "080-000-0101",
    "departmentName": "ฝ่ายเทคโนโลยีสารสนเทศ",
    "position": "นักพัฒนาระบบ (RMCx DevTeam)",
    "supervisorId": "U02",
    "roles": [
      "EMPLOYEE"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": null
  },
  {
    "id": "U02",
    "employeeCode": "100102",
    "firstName": "วิชัย",
    "lastName": "สุขสันต์",
    "displayName": "วิชัย สุขสันต์",
    "shortName": "วิชัย ส.",
    "email": "wichai.s@example.com",
    "phone": "080-000-0102",
    "departmentName": "ฝ่ายเทคโนโลยีสารสนเทศ",
    "position": "ผู้จัดการฝ่าย",
    "supervisorId": "U14",
    "roles": [
      "EMPLOYEE"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": null
  },
  {
    "id": "U03",
    "employeeCode": "100103",
    "firstName": "มานี",
    "lastName": "มีสุข",
    "displayName": "มานี มีสุข",
    "shortName": "มานี ม.",
    "email": "manee.m@example.com",
    "phone": "080-000-0103",
    "departmentName": "ฝ่ายขาย",
    "position": "เจ้าหน้าที่ขาย",
    "supervisorId": "U04",
    "roles": [
      "EMPLOYEE"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": null
  },
  {
    "id": "U04",
    "employeeCode": "100104",
    "firstName": "ปิติ",
    "lastName": "ยินดี",
    "displayName": "ปิติ ยินดี",
    "shortName": "ปิติ ย.",
    "email": "piti.y@example.com",
    "phone": "080-000-0104",
    "departmentName": "ฝ่ายขาย",
    "position": "ผู้จัดการฝ่ายขาย",
    "supervisorId": "U14",
    "roles": [
      "EMPLOYEE"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": null
  },
  {
    "id": "U05",
    "employeeCode": "100105",
    "firstName": "ชูใจ",
    "lastName": "ใฝ่ดี",
    "displayName": "ชูใจ ใฝ่ดี",
    "shortName": "ชูใจ ฝ.",
    "email": "chujai.f@example.com",
    "phone": "080-000-0105",
    "departmentName": "ฝ่ายวางแผน",
    "position": "นักวางแผน",
    "supervisorId": "U06",
    "roles": [
      "EMPLOYEE"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": null
  },
  {
    "id": "U06",
    "employeeCode": "100106",
    "firstName": "วีระ",
    "lastName": "กล้าหาญ",
    "displayName": "วีระ กล้าหาญ",
    "shortName": "วีระ ก.",
    "email": "weera.k@example.com",
    "phone": "080-000-0106",
    "departmentName": "ฝ่ายวางแผน",
    "position": "ผู้จัดการฝ่ายวางแผน",
    "supervisorId": "U14",
    "roles": [
      "EMPLOYEE"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": null
  },
  {
    "id": "U07",
    "employeeCode": "100107",
    "firstName": "กนกพร",
    "lastName": "แสงทอง",
    "displayName": "กนกพร แสงทอง",
    "shortName": "กนกพร ส.",
    "email": "kanokporn.s@example.com",
    "phone": "080-000-0107",
    "departmentName": "ฝ่ายบุคคล",
    "position": "เจ้าหน้าที่บุคคล",
    "supervisorId": "U08",
    "roles": [
      "EMPLOYEE"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": null
  },
  {
    "id": "U08",
    "employeeCode": "100108",
    "firstName": "ธนพล",
    "lastName": "วงศ์ดี",
    "displayName": "ธนพล วงศ์ดี",
    "shortName": "ธนพล ว.",
    "email": "thanapon.w@example.com",
    "phone": "080-000-0108",
    "departmentName": "ฝ่ายบุคคล",
    "position": "ผู้จัดการฝ่ายบุคคล",
    "supervisorId": "U14",
    "roles": [
      "EMPLOYEE"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": null
  },
  {
    "id": "U09",
    "employeeCode": "100109",
    "firstName": "อรุณี",
    "lastName": "แก้วใส",
    "displayName": "อรุณี แก้วใส",
    "shortName": "อรุณี ก.",
    "email": "arunee.k@example.com",
    "phone": "080-000-0109",
    "departmentName": "ฝ่ายจัดซื้อ",
    "position": "เจ้าหน้าที่จัดซื้อ",
    "supervisorId": "U06",
    "roles": [
      "EMPLOYEE"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": null
  },
  {
    "id": "U10",
    "employeeCode": "100110",
    "firstName": "วิไล",
    "lastName": "ศรีสุข",
    "displayName": "วิไล ศรีสุข",
    "shortName": "วิไล ศ.",
    "email": "wilai.s@example.com",
    "phone": "080-000-0110",
    "departmentName": "ฝ่ายความปลอดภัยและสิ่งแวดล้อม",
    "position": "เจ้าหน้าที่ความปลอดภัย",
    "supervisorId": "U08",
    "roles": [
      "EMPLOYEE"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": null
  },
  {
    "id": "U11",
    "employeeCode": "100111",
    "firstName": "ประเสริฐ",
    "lastName": "ทองดี",
    "displayName": "ประเสริฐ ทองดี",
    "shortName": "ประเสริฐ ท.",
    "email": "prasert.t@example.com",
    "phone": "080-000-0111",
    "departmentName": "ฝ่ายผลิต",
    "position": "วิศวกรการผลิต",
    "supervisorId": "U06",
    "roles": [
      "EMPLOYEE"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-BANGSON",
    "stationId": null
  },
  {
    "id": "U12",
    "employeeCode": "100112",
    "firstName": "นภัสสร",
    "lastName": "ศรีงาม",
    "displayName": "นภัสสร ศรีงาม",
    "shortName": "นภัสสร ศ.",
    "email": "napatsorn.s@example.com",
    "phone": "080-000-0112",
    "departmentName": "ฝ่ายธุรการ",
    "position": "เจ้าหน้าที่ธุรการ",
    "supervisorId": "U08",
    "roles": [
      "EMPLOYEE",
      "ADMIN"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": null
  },
  {
    "id": "U13",
    "employeeCode": "100113",
    "firstName": "สมศักดิ์",
    "lastName": "มั่นคง",
    "displayName": "สมศักดิ์ มั่นคง",
    "shortName": "สมศักดิ์ ม.",
    "email": "somsak.m@example.com",
    "phone": "080-000-0113",
    "departmentName": "รักษาความปลอดภัย",
    "position": "พนักงานรักษาความปลอดภัย",
    "supervisorId": null,
    "roles": [
      "GUARD"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": "ST-GATE1"
  },
  {
    "id": "U14",
    "employeeCode": "100114",
    "firstName": "ดารณี",
    "lastName": "เลิศล้ำ",
    "displayName": "ดารณี เลิศล้ำ",
    "shortName": "ดารณี ล.",
    "email": "daranee.l@example.com",
    "phone": "080-000-0114",
    "departmentName": "สำนักผู้อำนวยการ",
    "position": "ผู้อำนวยการ",
    "supervisorId": null,
    "roles": [
      "EMPLOYEE"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": null
  },
  {
    "id": "U15",
    "employeeCode": "100115",
    "firstName": "อนันต์",
    "lastName": "ปลอดภัย",
    "displayName": "อนันต์ ปลอดภัย",
    "shortName": "อนันต์ ป.",
    "email": "anan.p@example.com",
    "phone": "080-000-0115",
    "departmentName": "รักษาความปลอดภัย",
    "position": "พนักงานรักษาความปลอดภัย",
    "supervisorId": null,
    "roles": [
      "GUARD"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": "ST-GATE1"
  },
  {
    "id": "U90",
    "employeeCode": "DEVICE-01",
    "firstName": "แท็บเล็ตป้อม",
    "lastName": "ประตู 1",
    "displayName": "แท็บเล็ตป้อม ประตู 1",
    "shortName": "แท็บเล็ตป้อม ป.",
    "email": "station-gate1@example.com",
    "phone": "080-000-0190",
    "departmentName": "–",
    "position": "อุปกรณ์ป้อม",
    "supervisorId": null,
    "roles": [
      "STATION"
    ],
    "photoUrl": null,
    "defaultSiteId": "SITE-OFFICE",
    "stationId": "ST-GATE1"
  }
];
export const sites:Site[]=[{"id":"SITE-OFFICE","name":"ฝั่ง Office"},{"id":"SITE-BANGSON","name":"ฝั่งโรงงานบางซ่อน"}];
export const buildings:Building[]=[{"id":"BLD-CANTEEN","siteId":"SITE-OFFICE","name":"อาคารข้างโรงอาหาร","sortOrder":1},{"id":"BLD-1","siteId":"SITE-OFFICE","name":"อาคาร 1","sortOrder":2},{"id":"BLD-4","siteId":"SITE-OFFICE","name":"อาคาร 4","sortOrder":3},{"id":"BLD-2","siteId":"SITE-OFFICE","name":"อาคาร 2","sortOrder":4},{"id":"BLD-CCTC","siteId":"SITE-BANGSON","name":"อาคาร CCTC","sortOrder":5}];
export const stations:GuardStation[]=[{id:'ST-GATE1',name:'ป้อม รปภ. ประตู 1',siteId:'SITE-OFFICE'}];
export const personaIds=['U01','U03','U02','U14','U12','U90'];
export const guardPins:Record<string,string>={U13:'1234',U15:'5678'};
