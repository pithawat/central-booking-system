export const escapeHtml=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function template(subject:string,rows:[string,string][],links:{label:string;url:string}[]=[],extra='') {
 const text=[subject,...rows.map(([k,v])=>k+': '+v),...links.map(l=>l.label+': '+l.url)].join('\n');
 const html='<html lang="th"><body style="font-family:Tahoma,Leelawadee UI,sans-serif;color:#0f172a;background:#f1f5f9;padding:24px"><table style="max-width:640px;width:100%;background:white;padding:24px;margin:auto"><tr><td><h1 style="font-size:24px">'+escapeHtml(subject)+'</h1><table style="width:100%">'+rows.map(([k,v])=>'<tr><th style="text-align:left;padding:8px">'+escapeHtml(k)+'</th><td style="padding:8px">'+escapeHtml(v)+'</td></tr>').join('')+'</table>'+extra+links.map(l=>'<p><a target="_top" href="'+escapeHtml(l.url)+'" style="display:inline-block;background:#1d4ed8;color:white;min-height:44px;line-height:44px;padding:0 20px;border-radius:8px;text-decoration:none">'+escapeHtml(l.label)+'</a></p>').join('')+'</td></tr></table></body></html>';
 return {subject,text,html};
}

