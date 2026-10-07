import {test,expect} from '@playwright/test';
test('Phase 0: login personas, mailbox, clock and reset',async({page})=>{
 await page.goto('/');await expect(page).toHaveURL(/\/login/);
 for(const name of ['สมชาย ใจดี','มานี มีสุข','วิชัย สุขสันต์','ดารณี เลิศล้ำ','นภัสสร ศรีงาม','แท็บเล็ตป้อม ประตู 1']) {
 await page.goto('/login');await page.getByRole('button',{name:new RegExp(name)}).click();
 await expect(page).toHaveURL(name.startsWith('แท็บเล็ต')?/\/guard$/:/\/$/);
 }
 await expect(page.getByRole('heading',{name:'เลือกป้อม'})).toBeVisible();await expect(page.getByRole('button',{name:'ป้อม รปภ. ประตู 1',exact:true})).toBeVisible();
 await page.goto('/login');await page.getByRole('button',{name:/สมชาย ใจดี/}).click();
 await expect(page.locator('body')).toHaveCSS('font-family',/IBM Plex Sans Thai Looped/);
 await page.getByRole('button',{name:'เครื่องมือทดสอบ'}).click();
 await page.getByRole('button',{name:'+15 นาที',exact:true}).click();
 await expect(page.getByText(/เวลาจำลอง:.*\(\+15 นาที\)/)).toBeVisible();
 await page.getByRole('button',{name:'รีเซ็ตข้อมูลทดสอบทั้งหมด',exact:true}).click();
 await page.getByRole('button',{name:'รีเซ็ตข้อมูลทดสอบทั้งหมด',exact:true}).click();
 await expect(page.getByText(/เวลาจำลอง:.*\(\+0 นาที\)/)).toBeVisible();
 await page.getByRole('link',{name:'เปิดกล่องจดหมายทดสอบ'}).click();
 await expect(page.getByRole('heading',{name:'กล่องจดหมายทดสอบ'})).toBeVisible();
 await expect(page.getByRole('heading',{name:/ยืนยันการจองรถ #12/}).first()).toBeVisible();
 await expect(page.getByRole('heading',{name:/ขออนุมัติจองห้อง/}).first()).toBeVisible();
});

