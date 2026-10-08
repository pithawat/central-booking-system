# BAM One — แนวทางชื่อแอพและโลโก้

วันที่: 8 ตุลาคม 2026

## ชื่อที่เสนอ

**BAM One** อ่านว่า **แบม วัน**

คำอธิบาย: **ศูนย์รวมการจอง**

สโลแกน: **ทุกการจอง รวมไว้ที่เดียว**

BAM ระบุหน่วยงาน ส่วน One สื่อถึงการรวมระบบการจองไว้ในจุดเดียว ชื่อรองรับทั้งการจองรถ ห้องประชุม และประเภทการจองที่จะเพิ่มในอนาคต ใช้คำอธิบายภาษาไทยร่วมกับชื่อในจุดที่พนักงานพบครั้งแรกเพื่อให้เข้าใจหน้าที่ของแอพทันที

ชื่อทางเลือก:
- **BAM จองกลาง** — บอกหน้าที่โดยตรง เหมาะกับการเรียกใช้ในองค์กร
- **BAM พร้อมจอง** — เป็นมิตรและจำง่าย แต่สื่อการรวมระบบน้อยกว่า BAM One

## แนวคิดโลโก้

ปฏิทินมุมมนเป็นกรอบร่วมของช่องการจองหลายช่อง แทนบริการหลายประเภทที่อยู่ในแอพเดียว เครื่องหมายถูกเชื่อมโยงกับการยืนยันการจอง รูปทรงเรียบง่ายและใช้ได้กับประเภททรัพยากรใหม่

ภาพแนวคิด: [bam-one-concept-v1.png](./bam-one-concept-v1.png)

ในภาพมีโลโก้หลักพร้อมสโลแกน สัญลักษณ์เดี่ยว ตัวอย่างไอคอนแอพ และโลโก้แนวนอนขนาดเล็ก ภาพนี้เป็นต้นแบบ PNG สำหรับพิจารณาทิศทางการออกแบบ

## แนวทางสีและตัวอักษร

ยึดสีของระบบตาม docs/SPEC.md และ src/app/globals.css:
- น้ำเงินหลัก: #1D4ED8
- กรมท่าสำหรับข้อความ: #0F172A
- ขาว: #FFFFFF
- น้ำเงินอ่อนสำหรับพื้นที่รอง: #EFF6FF

ตัวอักษรสำหรับนำไปจัดทำไฟล์ใช้งาน: IBM Plex Sans Thai สำหรับชื่อและหัวข้อ, IBM Plex Sans Thai Looped สำหรับคำอธิบายภาษาไทย

เมื่อใช้ในแอพ ให้แสดงชื่อ BAM One และคำกำกับ ศูนย์รวมการจอง คู่กันตามพื้นที่ที่เหมาะสม ส่วนไอคอนแอพใช้สัญลักษณ์เดี่ยวโดยไม่ใส่ข้อความขนาดเล็ก

## วิธีสร้างภาพและพรอมป์ต์

สร้างด้วยเครื่องมือ imagegen ในตัว (built-in tool mode)

```text
Use case: logo-brand
Asset type: one polished logo identity concept presentation board for an internal Thai corporate booking app.
Primary request: Design an original, beautifully restrained, highly legible app logo and wordmark for "BAM One", an internal BAM department application that brings all reservations into one place, starting with cars and meeting rooms and expanding to other resources.
Scene/backdrop: pure white canvas, landscape presentation, generous deliberate whitespace, exceptionally clean Swiss editorial brand design.
Subject: one single coherent brand identity, repeated consistently at different sizes. Main logo symbol is a bold geometric rounded calendar silhouette with two subtle binding tabs and a simple interior composed of a few unified rounded booking tiles, one tile incorporating a small confident check. It must convey many bookings united in one place. Make the symbol ownable, balanced, minimal and instantly recognizable at app-icon size. Two or three internal shapes maximum; do not make a dense detailed calendar grid.
Style/medium: flat vector-style graphic design with crisp edges and careful optical alignment, professional friendly enterprise software identity. No gradients, mock photography, 3D, glass, gloss, textures or shadows.
Composition: Upper two-thirds contain one large primary horizontal lockup centered on the white page: blue symbol to the left, "BAM One" wordmark to the right in a modern geometric sans-serif, semibold, beautiful kerning. BAM in deep navy and One in blue. Beneath the wordmark place the exact Thai tagline "ทุกการจอง รวมไว้ที่เดียว" in a clear readable Thai sans-serif, dark slate. Bottom third shows three small, carefully spaced applications of EXACTLY THE SAME mark: the symbol alone in blue on white, the symbol in white inside a solid blue rounded-square app tile, and a smaller all-navy horizontal BAM One wordmark with symbol. Use one fine light-gray horizontal separator before the bottom examples. Keep layout elegant with abundant empty space; main identity clearly dominates, not a crowded moodboard.
Color palette: royal blue #1D4ED8, deep navy #0F172A, white #FFFFFF, pale blue #EFF6FF used only subtly if needed. No red, pink, purple, green or orange.
Text (verbatim): "BAM One" and "ทุกการจอง รวมไว้ที่เดียว". No other text. Thai spelling must be precise.
Constraints: Original APP logo, do not invent an official corporate BAM emblem. Only one consistent logo design across all examples, no unrelated alternatives. No cars, buildings, people, tiny decorative icons, arrows, abstract network diagrams, generic stock logo swooshes or complex interlocking loops. Strong bold readable silhouette. No watermark.
```

