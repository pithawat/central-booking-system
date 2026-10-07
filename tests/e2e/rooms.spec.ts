import {test,expect,type Page} from '@playwright/test';
const bangkokDay=(offset:number)=>new Date(Date.now()+7*3600000+offset*86400000).toISOString().slice(0,10);
async function login(page:Page,name:RegExp) {await page.goto('/login');await page.getByRole('button',{name}).click();await page.waitForURL(u=>!u.pathname.startsWith('/login'));}
async function resetData(page:Page) {
 await page.getByRole('button',{name:'เครื่องมือทดสอบ'}).click();
 await page.getByRole('button',{name:'รีเซ็ตข้อมูลทดสอบทั้งหมด',exact:true}).click();await page.getByRole('button',{name:'รีเซ็ตข้อมูลทดสอบทั้งหมด',exact:true}).click();
 await expect(page.getByText(/เวลาจำลอง:.*\(\+0 นาที\)/)).toBeVisible();await page.keyboard.press('Escape');
}

test('F: จองห้องแล้วหัวหน้าอนุมัติผ่านลิงก์ในอีเมล',async({browser})=>{
 const ctx=await browser.newContext({viewport:{width:1440,height:900}}),p=await ctx.newPage();
 await login(p,/สมชาย ใจดี/);await resetData(p);
 await p.goto('/rooms?date='+bangkokDay(0)+'&site=all');
 await expect(p.getByRole('button',{name:/RMCx DevTeam CPAC Partner Connect.*ของคุณ/})).toBeVisible();
 // RB-020 เริ่ม 14:00 ถ้าเวลาจริงเลยแล้วจะหมดอายุตั้งแต่เริ่ม (หัวข้อ 14 H)
 if(new Date(Date.now()+7*3600000).getUTCHours()<14)await expect(p.getByRole('button',{name:/ประชุมทีมขายประจำสัปดาห์.*รออนุมัติ/})).toBeVisible();
 const day=bangkokDay(1);
 await p.goto('/rooms?date='+day+'&site=all');
 await p.getByRole('button',{name:'จอง 2/4 ห้อง 402 เวลา 07:00–07:30'}).click();
 await expect(p.getByRole('heading',{name:'จอง 2/4 ห้อง 402'})).toBeVisible();
 await expect(p.getByText('ส่งขออนุมัติถึง วิชัย สุขสันต์ (หัวหน้าของคุณ)')).toBeVisible();
 await expect(p.getByRole('radio',{name:'1 ชม.'})).toHaveAttribute('aria-checked','true');
 await expect(p.getByLabel('เรื่องที่ประชุม')).toBeFocused();
 await p.getByLabel('เรื่องที่ประชุม').fill('ทดสอบจองห้อง');await p.getByRole('button',{name:'ส่งขออนุมัติ'}).click();
 await expect(p.getByText('ส่งคำขออนุมัติแล้ว รอ วิชัย ส. อนุมัติ').first()).toBeVisible();
 await expect(p.getByRole('button',{name:/ทดสอบจองห้อง.*รออนุมัติ/})).toBeVisible();

 await p.goto('/dev/mailbox?to=wichai.s@example.com');
 await p.getByRole('link',{name:/ขออนุมัติจองห้อง 2\/4 ห้อง 402/}).first().click();
 const html=await p.locator('iframe').getAttribute('srcdoc');
 const link=/href="([^"]*\/approve\/[^"?]+)\?d=approve"/.exec(html??'')?.[1];expect(link).toBeTruthy();
 const approver=await (await browser.newContext()).newPage();
 await approver.goto(new URL(link!).pathname+'?d=approve');
 await expect(approver.getByRole('heading',{name:'พิจารณาคำขอจองห้อง'})).toBeVisible();
 await expect(approver.getByText('ทดสอบจองห้อง')).toBeVisible();
 await approver.reload();await expect(approver.getByText('รออนุมัติ').first()).toBeVisible();
 await approver.getByRole('button',{name:'อนุมัติ',exact:true}).click();
 await expect(approver.getByText('อนุมัติแล้ว ระบบแจ้งผู้จองทางอีเมลแล้ว')).toBeVisible();
 await approver.reload();await expect(approver.getByText(/อนุมัติแล้วเมื่อ/)).toBeVisible();

 await p.goto('/dev/mailbox?to=somchai.j@example.com');
 await p.getByRole('link',{name:/อนุมัติจองห้อง 2\/4 ห้อง 402 แล้ว/}).first().click();
 await expect(p.getByRole('link',{name:'ดาวน์โหลด invite.ics'})).toBeVisible();
 await p.goto('/rooms?date='+day+'&site=all');
 await expect(p.getByRole('button',{name:/ทดสอบจองห้อง.*อนุมัติแล้ว · ของคุณ/})).toBeVisible();
 await ctx.close();
});

test('ไม่มีการเลื่อนแนวนอนทั้งหน้าที่ทุกความกว้างหลัก',async({browser})=>{
 test.setTimeout(600000);
 for(const [persona,paths] of [[/นภัสสร ศรีงาม/,['/','/cars','/rooms','/rooms/RM-B1-402','/my?tab=cars','/my?tab=rooms','/admin/key-log','/dev/mailbox']],[/วิชัย สุขสันต์/,['/rooms/approvals']]] as const) {
  for(const width of [375,768,1024,1366,1440]) {
   const ctx=await browser.newContext({viewport:{width,height:900}}),page=await ctx.newPage();
   await login(page,persona);
   for(const path of paths){await page.goto(path);await page.waitForLoadState('networkidle');expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth),path+' @'+width).toBeLessThanOrEqual(0);}
   await ctx.close();
  }
 }
});
