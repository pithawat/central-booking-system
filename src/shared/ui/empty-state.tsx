import type {LucideIcon} from 'lucide-react';
import {Inbox} from 'lucide-react';
import {Empty,EmptyHeader,EmptyTitle,EmptyDescription,EmptyMedia} from '@/components/ui/empty';
export function EmptyState({title,description,icon:Icon=Inbox,children}:{title:string;description?:string;icon?:LucideIcon;children?:React.ReactNode}) {
 return <Empty className="rounded-2xl border border-dashed bg-white/60 py-10">
  <EmptyHeader>
   <EmptyMedia variant="icon" className="size-12 rounded-2xl bg-muted text-muted-foreground"><Icon className="size-6" aria-hidden/></EmptyMedia>
   <EmptyTitle className="font-heading text-lg">{title}</EmptyTitle>
   {description&&<EmptyDescription className="text-base">{description}</EmptyDescription>}
  </EmptyHeader>
  {children}
 </Empty>;
}
