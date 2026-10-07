'use client';
import {createContext,useContext,useEffect,useState} from 'react';
const Clock=createContext({offsetMs:0,serverNow:0});
export function ClockProvider({offsetMs,serverNow,children}:{offsetMs:number;serverNow:number;children:React.ReactNode}) {return <Clock.Provider value={{offsetMs,serverNow}}>{children}</Clock.Provider>;}
export function useNow(fast=false) {const {offsetMs,serverNow}=useContext(Clock);const [tick,setTick]=useState(serverNow-offsetMs);useEffect(()=>{const timer=setInterval(()=>setTick(Date.now()),fast?1000:30000);return ()=>clearInterval(timer);},[fast]);return new Date(tick+offsetMs);}

