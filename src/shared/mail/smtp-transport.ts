import 'server-only';
import nodemailer from 'nodemailer';
import {env} from '@/shared/config/env';
import type {MailInput} from './index';
export async function sendSmtp(input:MailInput) {
 const transport=nodemailer.createTransport({host:env.SMTP_HOST,port:env.SMTP_PORT,secure:env.SMTP_PORT===465,auth:env.SMTP_USER?{user:env.SMTP_USER,pass:env.SMTP_PASS}:undefined});
 await transport.sendMail({...input,from:env.MAIL_FROM,attachments:input.attachments?.map(a=>({filename:a.filename,content:Buffer.from(a.contentBase64,'base64'),contentType:a.contentType,cid:a.cid}))});
}

