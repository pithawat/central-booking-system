import {PageSkeleton} from '@/shared/ui/page-skeleton';
import {BrandLogo} from '@/shared/ui/brand-logo';
export default function Loading(){return <main className="p-6"><BrandLogo className="mb-6 w-28"/><PageSkeleton variant="cards"/></main>;}
