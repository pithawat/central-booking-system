import {requireUser} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {env} from '@/shared/config/env';
import {AppShell} from '@/shared/ui/app-shell';
import {DevTools} from '@/shared/ui/dev-tools';
export default async function MainLayout({children}:{children:React.ReactNode}) {
 const user=await requireUser(),s=await getServices();
 const supervisor=env.NEXT_PUBLIC_ENABLE_ROOMS&&(user.roles.includes('ADMIN')||await s.users.isSupervisor(user.id));
 const pending=supervisor?await s.approvals.pendingCount():0;
 const clock=s.dev?await s.dev.clock():null;
 return <AppShell user={user} name={env.NEXT_PUBLIC_APP_NAME} cars={env.NEXT_PUBLIC_ENABLE_CARS} rooms={env.NEXT_PUBLIC_ENABLE_ROOMS} supervisor={supervisor} pending={pending} mock={env.DATA_SOURCE==='mock'}>{children}{clock&&<DevTools offsetMinutes={clock.offsetMinutes}/>}</AppShell>;
}

