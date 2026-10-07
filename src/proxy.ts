import {NextResponse,type NextRequest} from 'next/server';
export function proxy(request:NextRequest) {
 const {pathname,search}=request.nextUrl;
 if(pathname==='/login'||pathname.startsWith('/approve/'))return NextResponse.next();
 if(!request.cookies.has('session')) {const url=new URL('/login',request.url);url.searchParams.set('next',pathname+search);return NextResponse.redirect(url);}
 return NextResponse.next();
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|svg|woff2)$).*)']};

