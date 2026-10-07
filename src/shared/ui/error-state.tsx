'use client';
import Link from 'next/link';
import {TriangleAlert} from 'lucide-react';
import {Button} from '@/components/ui/button';
/** หน้าแสดงข้อผิดพลาดภาษาไทย ใช้ใน error.tsx */
export function ErrorState({reset}:{reset:()=>void}) {
 return <div role="alert" className="surface mx-auto my-8 max-w-xl p-8 text-center">
  <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-overdue-bg text-overdue"><TriangleAlert aria-hidden/></span>
  <h1 className="text-2xl">เกิดข้อผิดพลาด ลองใหม่อีกครั้ง</h1>
  <p className="mt-2 text-muted-foreground">โหลดข้อมูลไม่ได้ ตรวจการเชื่อมต่อแล้วกด &quot;ลองใหม่&quot; ถ้ายังไม่ได้ให้กลับหน้าแรก</p>
  <div className="mt-6 flex flex-wrap justify-center gap-2"><Button onClick={reset}>ลองใหม่</Button><Button variant="outline" asChild><Link href="/">กลับหน้าแรก</Link></Button></div>
 </div>;
}
