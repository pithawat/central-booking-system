import {cookies} from 'next/headers';
import {requireUser,requireFeature} from '@/shared/auth/require';
import {getServices} from '@/shared/data';
import {DevTools} from '@/shared/ui/dev-tools';
import {GuardScreen} from '@/features/cars/guard/guard-screen';
export default async function GuardPage(){
 requireFeature('cars');const me=await requireUser(['STATION']),s=await getServices(),stations=await s.guard.stations();
 const selected=(await cookies()).get('station_id')?.value,stationId=selected===me.stationId?selected:null;
 const [guards,shift,board,clock]=await Promise.all([stationId?s.guard.guardsOf(stationId):[],stationId?s.guard.activeShift(stationId):null,stationId?s.guard.board(stationId):{waiting:[],out:[]},s.dev?s.dev.clock():null]);
 return <main id="main-content" className="guard-screen p-4 md:p-6 pb-24 text-[20px]"><GuardScreen stations={stations} stationId={stationId} guards={guards} shift={shift} board={board}/>{clock&&<DevTools offsetMinutes={clock.offsetMinutes}/>}</main>;
}

