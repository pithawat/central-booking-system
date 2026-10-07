'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {appConfig} from '@/shared/config/app.config';
export function useAutoRefresh(enabled=true) {const router=useRouter();useEffect(()=>{if(!enabled)return;const refresh=()=>{if(!document.hidden)router.refresh();};const timer=setInterval(refresh,appConfig.pollIntervalSeconds*1000);document.addEventListener('visibilitychange',refresh);return ()=>{clearInterval(timer);document.removeEventListener('visibilitychange',refresh);};},[enabled,router]);}

