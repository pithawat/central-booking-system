# BAM จอง — โลโก้แบบสื่อหน้าที่โดยตรง

วันที่: 8 ตุลาคม 2026

## แนวคิด

ใช้กรอบปฏิทินและคำไทย **จอง** ขนาดใหญ่เป็นสัญลักษณ์เดียว ตัดช่องย่อยและเครื่องหมายถูกจากแบบก่อนเพื่อให้เหลือองค์ประกอบน้อยลง คำว่า จอง ช่วยสื่อหน้าที่ชัดกว่ารูปปฏิทินล้วน ซึ่งอาจถูกเข้าใจว่าเป็นแอปตารางนัดหมาย

ชื่อที่เสนอสำหรับแนวนี้: **BAM จอง**  
คำอธิบาย: **ศูนย์รวมการจอง**

ภาพต้นแบบ: [bam-jong-concept-v1.png](./bam-jong-concept-v1.png)

ภาพมีโลโก้หลักแนวนอน สัญลักษณ์สีน้ำเงินบนขาว และตัวอย่างไอคอนแอพสีขาวบนพื้นน้ำเงิน ไม่ใช่ไฟล์เวกเตอร์สำหรับใช้งานจริง

## แนวทางใช้งาน

- ไอคอนใช้เพียงกรอบปฏิทินกับคำ จอง
- ชื่อ BAM อยู่ในชื่อแอพหรือ wordmark ข้างสัญลักษณ์
- สีน้ำเงิน #1D4ED8 กรมท่า #0F172A และขาว #FFFFFF ตามธีมของระบบ
- เมื่อย่อขนาดมาก เช่น favicon ต้องตรวจความชัดของตัวอักษรและปรับรูปทรงสำหรับขนาดนั้น
- แบบนี้มุ่งให้เข้าใจว่าเป็นระบบจอง ส่วนประเภททรัพยากร เช่น รถและห้องประชุม อธิบายบนหน้าแรกได้
- ยังไม่มีผลทดสอบการรับรู้กับพนักงานจริง

## วิธีสร้างและพรอมป์ต์

สร้างด้วย imagegen ในตัว (built-in tool mode)

```text
Use case: logo-brand
Asset type: a polished, compact app logo design proposal on a landscape white presentation board.
Primary request: A Thai internal corporate unified booking app for the BAM department needs a much simpler logo that communicates BOOKING immediately to an unfamiliar Thai user. Proposed name "BAM จอง". The main concept is an extremely simple CALENDAR FRAME with the actual Thai word "จอง" as the dominant element INSIDE the frame. Literal readable Thai text is essential; do not replace it with abstract graphics.
Design: A thick royal blue rounded square calendar outline with two short binding tabs at the top, generous open white center. Inside that center is the exact Thai word "จอง" set in a beautiful, bold, highly legible modern Thai sans-serif. The word is large, centered optically and occupies most of the interior width without touching the outline. No date grid, no dates, no checkmark, no ticks, no mini tiles, no decorative dots. Only frame and Thai word.
Composition: One clean brand presentation board. Main hero occupies upper two thirds: large blue calendar-word emblem on the left, and a compact two-line wordmark on the right. First line "BAM จอง" with "BAM" in dark navy and "จอง" in royal blue, bold modern geometric Latin and Thai typography, beautifully kerned. Second line exact Thai descriptor "ศูนย์รวมการจอง" in smaller dark slate Thai font. Balanced comfortable spacing. Bottom third contains two modest examples of exactly the same calendar-word emblem: blue on white, and white on a royal-blue rounded app square. Both must retain the Thai word "จอง" large and accurately spelled. These are visual applications of the one concept, not separate competing concepts. White margins and plenty of breathing room. No separators, no labels, no palette swatches.
Style/medium: exceptionally crisp FLAT graphic logo, vector-like hard edges, solid uniform colors, premium professional design. Simple enough to redraw as real vector artwork. No 3D, mockups, embossing, lighting, reflections, textures, soft focus, shadows or gradients.
Color palette: royal blue #1D4ED8, deep navy #0F172A, pure white #FFFFFF. No other saturated colors.
Text verbatim: "จอง" inside EVERY emblem, "BAM จอง" beside hero, "ศูนย์รวมการจอง" as single descriptor. Check Thai characters carefully, do not add extra characters. Thai word จอง contains exactly จ อ ง.
Avoid: decorative slogans, tiny illegible captions, complicated logo symbolism, vehicles, meeting rooms, other icons, official corporate seals, any existing BAM corporate emblem. No watermark.
```

