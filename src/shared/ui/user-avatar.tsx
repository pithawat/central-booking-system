import {Avatar,AvatarFallback,AvatarImage} from '@/components/ui/avatar';
import type {User} from '@/shared/data/types';
export function initials(user:Pick<User,'firstName'|'lastName'>) {const first=(s:string)=>s.replace(/^[เแโใไ]+/,'')[0]??'';return first(user.firstName)+first(user.lastName);}
export function UserAvatar({user,className}:{user:Pick<User,'firstName'|'lastName'|'photoUrl'|'displayName'>;className?:string}) {
 return <Avatar className={className ?? 'size-12'}><AvatarImage src={user.photoUrl??undefined} alt={user.displayName}/><AvatarFallback className="bg-linear-to-br from-blue-100 to-indigo-100 text-blue-800 font-semibold">{initials(user)}</AvatarFallback></Avatar>;
}
