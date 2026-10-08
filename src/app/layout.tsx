import type {Metadata,Viewport} from 'next';
import {IBM_Plex_Sans_Thai_Looped,IBM_Plex_Sans_Thai} from 'next/font/google';
import {connection} from 'next/server';
import {Toaster} from '@/components/ui/sonner';
import {ClockProvider} from '@/shared/ui/clock-provider';
import {clockOffsetMs,now} from '@/shared/lib/clock';
import {env} from '@/shared/config/env';
import './globals.css';
const body=IBM_Plex_Sans_Thai_Looped({subsets:['thai','latin'],weight:['400','500','600','700'],variable:'--font-plex-looped',display:'swap'});
const heading=IBM_Plex_Sans_Thai({subsets:['thai','latin'],weight:['500','600','700'],variable:'--font-plex-thai',display:'swap'});
export const metadata:Metadata={title:'ระบบจององค์กร',description:'จองรถและห้องประชุมองค์กร'};
// viewportFit cover เพื่อให้ใช้ safe area ของ iPhone (แถบเมนูล่างไม่ทับ home indicator)
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#ffffff'};
export default async function RootLayout({children}:{children:React.ReactNode}) {
 await connection();void env;
 return <html lang="th" className={body.variable+' '+heading.variable}><body><a href="#main-content" className="sr-only focus:not-sr-only focus:block focus:p-4">ข้ามไปเนื้อหา</a><ClockProvider offsetMs={clockOffsetMs()} serverNow={now().getTime()}>{children}<Toaster position="top-center"/></ClockProvider></body></html>;
}

