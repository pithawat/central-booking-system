import 'server-only';
import {env} from '@/shared/config/env';
import {getSession} from '@/shared/auth/session';
import {createMockServices} from './mock';
import {createApiServices} from './api';
import type {Services} from './contracts';
export async function getServices():Promise<Services> {const session=await getSession();return env.DATA_SOURCE==='api'?createApiServices(session):createMockServices(session);}

