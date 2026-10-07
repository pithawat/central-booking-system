'use client';
import {ErrorState} from '@/shared/ui/error-state';
export default function ErrorPage({reset}:{reset:()=>void}) {return <main id="main-content" className="px-4"><ErrorState reset={reset}/></main>;}
