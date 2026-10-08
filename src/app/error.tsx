'use client';
import {ErrorState} from '@/shared/ui/error-state';
import {BrandLogo} from '@/shared/ui/brand-logo';
export default function ErrorPage({reset}:{reset:()=>void}) {return <main id="main-content" className="px-4 pt-8"><BrandLogo className="mx-auto w-32"/><ErrorState reset={reset}/></main>;}
