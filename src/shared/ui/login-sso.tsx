'use client';
import {useState,useTransition} from 'react';
import {Button} from '@/components/ui/button';
import {signInSso} from '@/shared/auth/actions';
export function LoginSso(){const [error,setError]=useState(''),[pending,start]=useTransition();return <><Button disabled={pending} onClick={()=>start(async()=>{const r=await signInSso();if(!r.ok)setError(r.error.message);})}>เข้าสู่ระบบด้วยบัญชีองค์กร</Button>{error&&<p role="alert" className="text-destructive mt-4">{error}</p>}</>;}

