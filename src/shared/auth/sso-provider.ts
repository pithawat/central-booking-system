import 'server-only';
import type {AuthProvider} from './mock-provider';
import type {Session} from './session';
export class SsoAuthProvider implements AuthProvider {
 async getSession():Promise<Session|null> {throw new Error('ยังไม่ได้เชื่อมระบบล็อกอินองค์กร');}
 async signIn():Promise<Session> {throw new Error('ยังไม่ได้เชื่อมระบบล็อกอินองค์กร');}
 async signOut():Promise<void> {throw new Error('ยังไม่ได้เชื่อมระบบล็อกอินองค์กร');}
}

