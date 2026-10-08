# BAM — Blue to violet gradient identity

วันที่: 8 ตุลาคม 2026

## โจทย์ล่าสุด

โลโก้แอพจองของ Business Administration Management (BAM) ภายใต้ Business Support and Sustainable Development (BSSD) ต้องดูทันสมัย ให้ชื่อย่อเด่น ใช้ไล่สีน้ำเงินไปทางม่วง และไม่มีสีแดง ข้อความในโลโก้มีเพียง BAM

## กรณีศึกษาที่อ่าน

- [PayPal — Pentagram](https://www.pentagram.com/work/paypal): ศึกษาการใช้ตัวอักษรที่ออกแบบเฉพาะเป็นแกนหลักของอัตลักษณ์ และการควบคุมชุดสี
- [Twitch — COLLINS](https://wearecollins.com/case-studies/twitch/): ศึกษาการใช้สีม่วงร่วมกับระบบสีและตัวอักษรที่มีบุคลิก

นำหลักการเรื่องความชัดของตัวอักษรและความสม่ำเสมอของระบบภาพมาใช้เป็นแนวทางออกแบบ BAM ไม่ได้นำรูปทรงโลโก้อ้างอิงมาใช้เป็นชิ้นส่วนของภาพ

## แนวทางที่ออกแบบ

ตัวอักษร BAM รูปทรงเรขาคณิตมุมมน ใช้ความหนาและจังหวะช่องว่างที่สัมพันธ์กัน เป็นแกนของโลโก้

ภาพแสดงการใช้งานสองแบบของแนวเดียวกัน:
1. BAM สีขาวบนไอคอนแอพมุมมน พื้นไล่สี พร้อมเงานุ่มด้านล่าง
2. BAM แบบไล่สีบนพื้นขาว สำหรับพื้นที่แนวนอน เช่น หัวแอพ

ไล่สีจากซ้ายบนลงขวาล่าง:
- น้ำเงิน: #2563EB
- อินดิโก: #4F46E5
- ม่วง: #7C3AED

การไล่สีและเงาในภาพเป็นภาพต้นแบบจาก imagegen จึงอาจไม่ตรงกับค่าตัวเลขทุกพิกเซล

## แนวทางนำไปวางในแอพ

ใช้ bg-linear-to-br เป็นทิศทางไล่สี, p-4 เป็นจุดเริ่มต้นของระยะขอบ, shadow-raised สำหรับเงาของกรอบ และ transition สำหรับการเปลี่ยนสถานะขององค์ประกอบ โดยต้องปรับตามขนาดจริงและการตั้งค่าของโครงการ

transition เป็นพฤติกรรมเมื่อนำไปใช้งานใน UI จึงไม่ได้แสดงการเคลื่อนไหวในไฟล์ PNG นี้

## ไฟล์

[bam-blue-violet-concept-v1.png](./bam-blue-violet-concept-v1.png)

เป็นภาพนำเสนอแนวคิด PNG พื้นขาว ไม่ใช่ไฟล์เวกเตอร์หรือการเปลี่ยนหน้าแอพจริง

## เครื่องมือและพรอมป์ต์

สร้างด้วย imagegen ในตัว (built-in tool mode)

```text
Use case: logo-brand
Asset type: a beautifully art-directed brand identity presentation for the BAM internal corporate booking app, showing ONE original typographic logo in two practical applications.
Primary request: The user wants professional graphic-design quality, sophisticated BLUE TO PURPLE GRADIENTS, a modern digital product feel, and very prominent BAM initials. Previous plain dark-blue text logos were too generic. Create genuinely crafted custom letterforms and exquisite color. BAM = Business Administration Management, under Business Support and Sustainable Development. These long names are CONTEXT ONLY.
Text (verbatim): "BAM". Only BAM may appear anywhere. No slogans, no department full name, no BSSD, no UI text, no concept names, no labels, no palette hex labels.
Core wordmark: A bespoke bold geometric BAM, readable at a glance, cohesive original lettering constructed from one shared system of rounded corners, stroke widths and disciplined internal spaces. B has two softly rectangular open counters like organized resource slots. A has a subtly flattened apex and a clear horizontal bridge crossbar; its counter rhythm aligns with the B. M has substantial upright outside stems and a clean deep central vertex. Use tight but optically correct kerning. The three letters must be distinctive and sophisticated without touching or overlapping. Stay authoritative, contemporary and friendly. Do not simply typeset a generic font. Avoid stencil cuts, slanted gaming lettering, symbols, leaves, checkmarks, calendar outlines or a separate B icon.
Primary application: an elegantly proportioned square app tile with continuous rounded corners, radius about 22 percent. Inside it, WHITE BAM occupies 76 percent of the tile width, optically centered. Tile background uses one exceptionally smooth diagonal gradient from top-left luminous royal blue #2563EB through central rich indigo #4F46E5 to lower-right saturated blue-violet #7C3AED. Rich controlled hue transition, no dull gray middle, no pink or magenta. A faint upper-left ambient lift gives the surface depth without a glossy highlight. Add a short, soft, low-opacity indigo-gray shadow below the tile, subtly raised like premium modern UI. Tile is frontal, perfectly square, not in perspective. No bevels or 3D extrusion.
Secondary application: to its right, the EXACT SAME bespoke BAM letterforms as a standalone wordmark, colored with the SAME top-left-to-bottom-right blue-indigo-violet gradient, no tile, no shadow. This shows the branding on a white app header.
Composition: landscape white or extremely pale cool-gray canvas. Large app tile on left, secondary wordmark on right. The tile is clearly the hero, with the wordmark on the right optically balanced at about half the tile height. Generous whitespace, clean alignment, premium agency identity board with no extra graphic decoration. The two presentations should feel deliberately spaced and carefully composed, not like floating mockups.
Design references in principle only: disciplined custom typography, a tightly controlled digital brand palette, and a logo that works in a solid white version and color version. Produce original BAM geometry, do not imitate any existing studio's exact wordmark or brand.
Color restrictions: blue, indigo, blue-violet, white and a pale cool neutral only. Absolutely no red, orange, pink, fuchsia, yellow, green or teal. No rainbow. 
Quality: razor-sharp contours, large clear counters, professional optical balance, clean sophisticated vector-like geometry with exceptionally smooth gradient fills. No gritty textures, bloom, glow, glass, metallic effects, fake embossing, noisy edges, extra shapes, tiny captions or watermark.
```

