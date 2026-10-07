import 'server-only';
import {randomUUID} from 'node:crypto';
import {getDb} from '@/shared/data/mock/store';
import {now} from '@/shared/lib/clock';
import type {MailInput} from './index';
export async function sendMock(input:MailInput) {getDb().mail.push({...structuredClone(input),id:randomUUID(),type:input.type ?? 'MESSAGE',createdAt:now().toISOString()});}

