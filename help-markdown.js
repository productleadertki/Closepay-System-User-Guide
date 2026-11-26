(function(root){
'use strict';
const converter=new root.TurndownService({headingStyle:'atx',bulletListMarker:'-',codeBlockStyle:'fenced'});
converter.use(root.turndownPluginGfm.gfm);
function toHtml(source){return root.HelpRichText.sanitize(root.marked.parse(String(source||''),{gfm:true,breaks:false,async:false}));}
function fromHtml(html){return converter.turndown(root.HelpRichText.sanitize(html||''));}
root.HelpMarkdown={toHtml,fromHtml};
})(typeof globalThis!=='undefined'?globalThis:this);