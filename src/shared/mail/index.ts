import 'server-only';
import {env} from '@/shared/config/env';
import {sendMock} from './mock-transport';
import {sendSmtp} from './smtp-transport';
export interface MailInput {to:string[];cc?:string[];subject:string;html:string;text:string;type?:string;bookingId?:string;attachments?:{filename:string;contentType:string;contentBase64:string;cid?:string}[];}
export const MailService={async send(input:MailInput) {if(env.MAIL_MODE==='smtp')await sendSmtp(input);else await sendMock(input);}};

