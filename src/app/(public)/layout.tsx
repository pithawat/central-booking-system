import {CalendarCheck2} from 'lucide-react';
import {env} from '@/shared/config/env';
export default function PublicLayout({children}:{children:React.ReactNode}) {
 return <>
  <header className="border-b bg-white"><div className="mx-auto flex h-16 max-w-3xl items-center gap-2.5 px-4 font-heading font-semibold"><span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><CalendarCheck2 size={20} aria-hidden/></span>{env.NEXT_PUBLIC_APP_NAME}</div></header>
  <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 md:py-12">{children}</main>
 </>;
}
