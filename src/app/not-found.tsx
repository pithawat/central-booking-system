import Link from 'next/link';
import {SearchX} from 'lucide-react';
import {BrandLogo} from '@/shared/ui/brand-logo';
export default function NotFound(){return <main id="main-content" className="px-4 pt-8"><BrandLogo className="mx-auto w-32"/><div className="surface mx-auto my-12 max-w-xl p-8 text-center"><span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><SearchX aria-hidden/></span><h1 className="text-2xl">ไม่พบข้อมูลนี้</h1><p className="mt-2 text-muted-foreground">หน้าที่ต้องการอาจถูกปิดหรือไม่มีอยู่แล้ว</p><Link className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 font-medium text-primary-foreground" href="/">กลับหน้าแรก</Link></div></main>;}
