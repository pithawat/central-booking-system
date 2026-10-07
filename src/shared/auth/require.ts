import 'server-only';
import {redirect,notFound} from 'next/navigation';
import {getServices} from '@/shared/data';
import {env} from '@/shared/config/env';
import {getSession} from './session';
import type {Role} from '@/shared/data/types';
export async function requireUser(roles:Role[]=['EMPLOYEE','ADMIN']) {
 const session=await getSession();if(!session)redirect('/login');
 const services=await getServices();
 let user;try{user=await services.users.me();}catch{redirect('/login');}
 if(!user.roles.some(r=>roles.includes(r)))redirect(user.roles.includes('STATION')?'/guard':'/');
 return user;
}
export function requireFeature(feature:'cars'|'rooms') {if(feature==='cars'?!env.NEXT_PUBLIC_ENABLE_CARS:!env.NEXT_PUBLIC_ENABLE_ROOMS)notFound();}

