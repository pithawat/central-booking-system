import {test,expect} from '@playwright/test';
test('A/B: ผู้จองและป้อมรับ–คืนรถร่วมกัน',async({browser})=>{
 const employee=await browser.newContext(),station=await browser.newContext(),p=await employee.newPage(),g=await station.newPage();
 await p.goto('/login');await p.getByRole('button',{name:/สมชาย ใจดี/}).click();
 await p.getByRole('button',{name:'เครื่องมือทดสอบ'}).click();await p.getByRole('button',{name:'รีเซ็ตข้อมูลทดสอบทั้งหมด',exact:true}).click();await p.getByRole('button',{name:'รีเซ็ตข้อมูลทดสอบทั้งหมด',exact:true}).click();await expect(p.getByText(/เวลาจำลอง:.*\(\+0 นาที\)/)).toBeVisible();await p.keyboard.press('Escape');
 await expect(p.getByRole('heading',{name:'บัตรรับรถ #12'})).toBeVisible();
 await g.goto('/login');await g.getByRole('button',{name:/แท็บเล็ตป้อม ประตู 1/}).click();
 await g.getByRole('button',{name:'ป้อม รปภ. ประตู 1',exact:true}).click();await g.getByRole('button',{name:/สมศักดิ์ มั่นคง/}).click();await g.getByLabel('PIN 4 หลัก').fill('1234');await g.getByRole('button',{name:'เข้าเวร',exact:true}).click();
 await g.getByLabel('หรือพิมพ์รหัส 4 หลัก').fill('4827');await expect(g.getByRole('heading',{name:'ตรงกับการจอง'})).toBeVisible();await g.getByRole('button',{name:'มอบกุญแจ',exact:true}).click();await expect(g.getByText(/มอบกุญแจแล้ว/)).toBeVisible();
 await expect(p.getByRole('heading',{name:/กำลังใช้รถ #12/})).toBeVisible({timeout:15000});
 await p.getByRole('button',{name:'คืนรถ',exact:true}).click();await p.getByLabel('เลขไมล์',{exact:true}).fill('40000');await p.getByRole('button',{name:'บันทึก แล้วนำกุญแจไปคืนที่ป้อม'}).click();await expect(p.getByText('เลขไมล์ต้องไม่น้อยกว่า 45,210')).toBeVisible();
 await p.getByLabel('เลขไมล์',{exact:true}).fill('45260');await p.getByRole('button',{name:'บันทึก แล้วนำกุญแจไปคืนที่ป้อม'}).click();await expect(p.getByText('บันทึกเลขไมล์แล้ว นำกุญแจไปคืนที่ป้อม')).toBeVisible();
 await g.getByRole('tab',{name:/รถที่ออกอยู่/}).click();await g.getByRole('button',{name:/#12 · สมชาย ใจดี/}).click();await expect(g.getByText('เลขไมล์ 45,260 กม.')).toBeVisible();await g.getByRole('button',{name:'รับกุญแจคืน',exact:true}).click();await expect(g.getByText(/รับกุญแจคืนแล้ว/)).toBeVisible();
 await employee.close();await station.close();
});

