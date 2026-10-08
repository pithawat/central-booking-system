'use client';
import {useSyncExternalStore} from 'react';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {Drawer,DrawerContent,DrawerHeader,DrawerTitle,DrawerDescription} from '@/components/ui/drawer';
function subscribe(callback:()=>void){const q=matchMedia('(max-width:767px)');q.addEventListener('change',callback);return ()=>q.removeEventListener('change',callback);}
export function useMobile(){return useSyncExternalStore(subscribe,()=>matchMedia('(max-width:767px)').matches,()=>false);}
type Props={open:boolean;onOpenChange:(open:boolean)=>void;title:string;description?:React.ReactNode;children:React.ReactNode;onOpenAutoFocus?:(e:Event)=>void;onCloseAutoFocus?:(e:Event)=>void};
export function ResponsivePanel({open,onOpenChange,title,description,children,onOpenAutoFocus,onCloseAutoFocus}:Props) {
 const mobile=useMobile();
 if(mobile)return <Drawer open={open} onOpenChange={onOpenChange}><DrawerContent className="max-h-[92dvh]" onOpenAutoFocus={onOpenAutoFocus} onCloseAutoFocus={onCloseAutoFocus}><DrawerHeader className="text-left"><DrawerTitle className="font-heading text-xl font-semibold">{title}</DrawerTitle><DrawerDescription asChild={typeof description!=='string'&&!!description}>{typeof description==='string'||!description?description??'ตรวจสอบข้อมูลก่อนยืนยัน':<div className="text-base">{description}</div>}</DrawerDescription></DrawerHeader><div className="overflow-y-auto px-4">{/* เว้นล่างไว้ในกล่องด้านใน แถบปุ่ม sticky จะได้ชิดขอบล่างลิ้นชักจริง ไม่มีเนื้อหาโผล่ใต้แถบ */}<div className="pb-[calc(2rem+env(safe-area-inset-bottom))]">{children}</div></div></DrawerContent></Drawer>;
 return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="w-full sm:max-w-[480px] overflow-y-auto gap-0" onOpenAutoFocus={onOpenAutoFocus} onCloseAutoFocus={onCloseAutoFocus}><SheetHeader className="border-b p-5 pr-14"><SheetTitle className="font-heading text-xl font-semibold">{title}</SheetTitle><SheetDescription asChild={typeof description!=='string'&&!!description}>{typeof description==='string'||!description?description??'ตรวจสอบข้อมูลก่อนยืนยัน':<div className="text-base">{description}</div>}</SheetDescription></SheetHeader><div className="p-5">{children}</div></SheetContent></Sheet>;
}
