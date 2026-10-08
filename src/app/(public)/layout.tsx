import Link from 'next/link';
import {env} from '@/shared/config/env';
import {BrandLogo} from '@/shared/ui/brand-logo';
export default function PublicLayout({children}:{children:React.ReactNode}) {
 return <>
  <header className="border-b bg-white"><div className="mx-auto flex h-16 max-w-3xl items-center px-4"><Link href="/" className="flex min-h-12 items-center rounded-sm"><BrandLogo/><span className="sr-only"> {env.NEXT_PUBLIC_APP_NAME} · หน้าแรก</span></Link></div></header>
  <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 md:py-12">{children}</main>
 </>;
}
