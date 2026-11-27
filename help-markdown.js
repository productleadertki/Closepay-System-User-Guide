(function(root){
'use strict';
const converter=new root.TurndownService({headingStyle:'atx',bulletListMarker:'-',codeBlockStyle:'fenced'});
converter.use(root.turndownPluginGfm.gfm);
converter.addRule('styledSpan',{filter:node=>node.nodeName==='SPAN'&&(node.hasAttribute('data-font')||node.hasAttribute('data-size')),replacement:(_content,node)=>node.outerHTML});
converter.addRule('alignedBlock',{filter:node=>['P','H1','H2','H3','BLOCKQUOTE'].includes(node.nodeName)&&node.hasAttribute('data-align'),replacement:(_content,node)=>'\n\n'+node.outerHTML+'\n\n'});
converter.addRule('resizedImage',{filter:node=>node.nodeName==='IMG'&&node.hasAttribute('data-width'),replacement:(_content,node)=>node.outerHTML});
function toHtml(source){return root.HelpRichText.sanitize(root.marked.parse(String(source||''),{gfm:true,breaks:false,async:false}));}
function fromHtml(html){return converter.turndown(root.HelpRichText.sanitize(html||''));}
root.HelpMarkdown={toHtml,fromHtml};
})(typeof globalThis!=='undefined'?globalThis:this);