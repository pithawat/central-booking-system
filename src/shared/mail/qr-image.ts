import 'server-only';
import QRCode from 'qrcode';
export async function qrImage(token:string) {return QRCode.toDataURL(token,{width:240,margin:4,errorCorrectionLevel:'M'});}

