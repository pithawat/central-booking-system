import 'server-only';
import { env } from '@/shared/config/env';
export function clockOffsetMs() {return env.DATA_SOURCE==='mock' ? globalThis.__bookingMockDb?.clockOffsetMs ?? 0 : 0;}
export function now() {return new Date(Date.now()+clockOffsetMs());}

