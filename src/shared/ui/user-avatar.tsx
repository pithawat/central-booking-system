import {Avatar,AvatarFallback,AvatarImage} from '@/components/ui/avatar';
import type {User} from '@/shared/data/types';
export function initials(user:Pick<User,'firstName'|'lastName'>) {const first=(s:string)=>s.replace(/^[เแโใไ]+/,'')[0]??'';return first(user.firstName)+first(user.lastName);}
/** variant brand = ไอคอนโปรไฟล์ของผู้ใช้ที่หัวเว็บ: แบบไอคอนแอป BAM คือกรอบมุมมน ไล่สีน้ำเงิน→อินดิโก→ม่วง อักษรขาวตัวหนา เงานุ่มสีอินดิโก · soft = รูปคนในรายการทั่วไป */
export function UserAvatar({user,className,variant='soft'}:{user:Pick<User,'firstName'|'lastName'|'photoUrl'|'displayName'>;className?:string;variant?:'soft'|'brand'}) {
 if(variant==='brand')return <Avatar className={'rounded-[26%] shadow-[0_3px_8px_-2px_rgb(79_70_229/0.45)] after:rounded-[26%] after:border-0 '+(className ?? 'size-12')}><AvatarImage className="rounded-[26%]" src={user.photoUrl??undefined} alt={user.displayName}/><AvatarFallback className="rounded-[26%] bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600 font-heading font-bold tracking-wide text-white">{initials(user)}</AvatarFallback></Avatar>;
 return <Avatar className={className ?? 'size-12'}><AvatarImage src={user.photoUrl??undefined} alt={user.displayName}/><AvatarFallback className="bg-linear-to-br from-blue-100 to-indigo-100 text-blue-800 font-semibold">{initials(user)}</AvatarFallback></Avatar>;
}
