import type {LucideIcon} from 'lucide-react';
export function PageHeader({title,description,icon:Icon,eyebrow,children}:{title:string;description?:string;icon?:LucideIcon;eyebrow?:string;children?:React.ReactNode}) {
 return <header className="mb-6 md:mb-8 flex flex-wrap items-end justify-between gap-4">
  <div className="flex min-w-0 items-start gap-4">
   {Icon&&<span className="hidden sm:grid size-14 shrink-0 place-items-center rounded-2xl bg-accent text-primary ring-1 ring-primary/10"><Icon size={28} aria-hidden/></span>}
   <div className="min-w-0">
    {eyebrow&&<p className="text-sm font-medium text-primary">{eyebrow}</p>}
    <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
    {description&&<p className="text-muted-foreground mt-1.5">{description}</p>}
   </div>
  </div>
  {children&&<div className="flex flex-wrap items-center gap-2">{children}</div>}
 </header>;
}
