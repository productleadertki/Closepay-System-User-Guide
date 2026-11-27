(function(root){
'use strict';
const allowed=new Set(['p','h1','h2','h3','strong','em','u','s','span','ul','ol','li','blockquote','br','a','img','pre','code','hr','table','thead','tbody','tr','th','td','caption']);
const blocked=new Set(['script','style','iframe','object','embed','svg','math','form','input','button','textarea','template','link','meta','video','audio','canvas']);
const canonical={b:'strong',i:'em',strike:'s',div:'p'};
const formats={font:new Set(['sans','serif','mono']),size:new Set(['small','normal','large','xlarge']),align:new Set(['left','center','right','justify']),width:new Set(['25','50','75','100'])};
function formatOk(kind,value){return typeof value==='string'&&!!formats[kind]?.has(value);}
function safeHref(raw){if(!raw||!raw.trim())return null;try{const url=new URL(raw,location.href);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch{return null;}}
function safeImageSrc(raw){if(typeof raw!=='string')return null;if(raw.startsWith('data:'))return raw.length<=1500000&&/^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/i.test(raw)?raw:null;return safeHref(raw);}
function cleanNode(node,doc){
 if(node.nodeType===Node.TEXT_NODE)return doc.createTextNode(node.nodeValue);
 if(node.nodeType!==Node.ELEMENT_NODE)return null;
 const source=node.localName.toLowerCase();
 if(blocked.has(source))return null;
 const tag=canonical[source]||source;
 const output=allowed.has(tag)?doc.createElement(tag):doc.createDocumentFragment();
 if(tag==='a'&&output.nodeType===Node.ELEMENT_NODE){const href=safeHref(node.getAttribute('href'));if(href){output.setAttribute('href',href);output.setAttribute('target','_blank');output.setAttribute('rel','noopener noreferrer');}}
 if(tag==='img'&&output.nodeType===Node.ELEMENT_NODE){const src=safeImageSrc(node.getAttribute('src'));if(!src)return null;output.setAttribute('src',src);output.setAttribute('alt',node.getAttribute('alt')||'');output.setAttribute('loading',src.startsWith('data:')?'eager':'lazy');output.setAttribute('referrerpolicy','no-referrer');const width=node.getAttribute('data-width');if(formatOk('width',width))output.setAttribute('data-width',width);}
 if(tag==='span'&&output.nodeType===Node.ELEMENT_NODE){for(const kind of ['font','size']){const value=node.getAttribute('data-'+kind);if(formatOk(kind,value))output.setAttribute('data-'+kind,value);}}
 if(['p','h1','h2','h3','blockquote'].includes(tag)&&output.nodeType===Node.ELEMENT_NODE){
  const alignment=node.getAttribute('data-align')||node.style?.textAlign;
  if(formatOk('align',alignment))output.setAttribute('data-align',alignment);
 }
 for(const child of node.childNodes){const safe=cleanNode(child,doc);if(safe)output.append(safe);}
 return output;
}
function fragment(html){const doc=document,template=doc.createElement('template');template.innerHTML=String(html||'');const result=doc.createDocumentFragment();for(const node of template.content.childNodes){const safe=cleanNode(node,doc);if(safe)result.append(safe);}return result;}
function sanitize(html){const holder=document.createElement('div');holder.append(fragment(html));return holder.innerHTML;}
function fromText(text){const holder=document.createElement('div');for(const block of String(text||'').split(/\n\s*\n/).filter(Boolean)){const p=document.createElement('p');block.split('\n').forEach((line,index)=>{if(index)p.append(document.createElement('br'));p.append(document.createTextNode(line));});holder.append(p);}return holder.innerHTML;}
function plainText(html){const holder=document.createElement('div');holder.append(fragment(html));const lines=[];function walk(node){if(node.nodeType===Node.TEXT_NODE){lines.push(node.nodeValue);return;}if(node.nodeType!==Node.ELEMENT_NODE)return;if(node.localName==='br')lines.push('\n');if(node.localName==='img')lines.push(node.getAttribute('alt')||'');for(const child of node.childNodes)walk(child);if(['th','td'].includes(node.localName))lines.push(' ');if(['p','h1','h2','h3','li','blockquote','div','tr','caption','pre'].includes(node.localName))lines.push('\n');}for(const child of holder.childNodes)walk(child);return lines.join('').replace(/\n{3,}/g,'\n\n').trim();}
function safeVideo(raw){if(!root.HelpAdminModel?.videoOk(raw))return null;const url=new URL(raw),host=url.hostname.toLowerCase();if(['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(host)){const id=host==='youtu.be'?url.pathname.slice(1):url.pathname==='/watch'?url.searchParams.get('v'):url.pathname.split('/')[2];return {kind:'youtube',src:'https://www.youtube-nocookie.com/embed/'+id};}return {kind:'file',src:url.href};}
root.HelpRichText={fragment,sanitize,fromText,plainText,safeVideo,safeImageSrc,formatOk};
})(typeof globalThis!=='undefined'?globalThis:this);