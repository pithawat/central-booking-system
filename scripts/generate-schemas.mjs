import fs from 'node:fs';
import ts from 'typescript';
let out="import {z} from 'zod';\n";
function expr(n) {
 if(n.kind===ts.SyntaxKind.StringKeyword)return 'z.string()';
 if(n.kind===ts.SyntaxKind.NumberKeyword)return 'z.number()';
 if(n.kind===ts.SyntaxKind.BooleanKeyword)return 'z.boolean()';
 if(ts.isLiteralTypeNode(n)) {if(n.literal.kind===ts.SyntaxKind.NullKeyword)return 'z.null()';return 'z.literal('+n.literal.getText()+')';}
 if(ts.isArrayTypeNode(n))return expr(n.elementType)+'.array()';
 if(ts.isUnionTypeNode(n))return 'z.union(['+n.types.map(expr).join(',')+'])';
 if(ts.isTypeReferenceNode(n))return n.typeName.getText()+'Schema';
 if(ts.isTypeLiteralNode(n))return object(n.members);
 throw new Error(n.getText());
}
function object(members) {return 'z.object({'+members.map(m=>m.name.getText()+':'+expr(m.type)+(m.questionToken?'.optional()':'')).join(',')+'})';}
for(const file of ['src/shared/data/types.ts','src/shared/data/contracts.ts']) {
 const sf=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
 for(const n of sf.statements) {
 if(ts.isTypeAliasDeclaration(n)) out+='export const '+n.name.text+'Schema = '+(n.name.text==='ISODateTime'?'z.iso.datetime()':n.name.text==='ISODate'?"z.iso.date()":expr(n.type))+';\n';
 if(ts.isInterfaceDeclaration(n) && !n.name.text.endsWith('Service') && n.name.text!=='Services') {
 const base=n.heritageClauses?.[0]?.types?.[0]?.expression.getText();
 out+='export const '+n.name.text+'Schema = '+(base?base+'Schema.extend('+object(n.members).slice(9,-1)+')':object(n.members))+';\n';
 }
 }
}
fs.writeFileSync('src/shared/data/schemas.ts',out);

