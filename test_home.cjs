const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const menus=require('./menu-config.js');

test('home recommendations reference up to six valid local guides',()=>{
  const vm=require('node:vm');
  const context={window:{}};
  vm.runInNewContext(fs.readFileSync('./help-index.js','utf8'),context);
  const docs=context.window.HELP_TOPICS;
  const home=require('./home-config.js');
  assert.ok(home.recommended.length>0&&home.recommended.length<=6);
  assert.equal(new Set(home.recommended).size,home.recommended.length);
  for(const slug of home.recommended)assert.ok(docs.some(doc=>doc.slug===slug),slug);
});
test('home shows Recommended Reads above Our Products without duplicate outer product tabs',()=>{
  const html=fs.readFileSync('./index.html','utf8');
  const app=fs.readFileSync('./app.js','utf8');
  assert.doesNotMatch(html,/id="top-product-nav"/);
  assert.doesNotMatch(app,/renderTopNav/);
  assert.match(html,/<script src="home-config\.js"><\/script>/);
  assert.ok(html.indexOf('home-config.js')<html.indexOf('app.js'));
  assert.match(app,/Recommended Reads/);
  assert.match(app,/Our Products/);
  assert.match(app,/home\.recommended\.slice\(0,6\)/);
  assert.ok(app.indexOf("view.append(reads)")<app.indexOf("view.append(products)"));
  assert.ok(menus.length>=2);
});
test('home search sits in a dedicated help banner',()=>{
  const html=fs.readFileSync('./index.html','utf8');
  assert.match(html,/<div class="home-hero">/);
  assert.match(html,/class="hero-copy"/);
  assert.ok(html.indexOf('class="home-hero"')<html.indexOf('class="intro"'));
  assert.ok(html.indexOf('class="intro"')<html.indexOf('class="searchbar"'));
  assert.ok(html.indexOf('class="searchbar"')<html.indexOf('id="view"'));
});

test('search hero names Closepay and centers a readable search field',()=>{
  const html=fs.readFileSync('./index.html','utf8');
  assert.match(html,/Temukan semua panduan Closepay/);
  assert.match(html,/\.home-hero\{[^}]*text-align:center/);
  assert.match(html,/\.home-hero \.searchbar\{[^}]*max-width:680px/);
  assert.doesNotMatch(html,/Xendit/i);
});

test('recommendation and product cards use equal columns and no redundant count copy',()=>{
 const html=fs.readFileSync('./index.html','utf8'),app=fs.readFileSync('./app.js','utf8');
 assert.match(html,/\.reads-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(html,/\.products \.product-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(html,/@media\(max-width:760px\)\{\.reads-grid,\.products \.product-grid\{grid-template-columns:1fr/);
 assert.doesNotMatch(app,/element\('span','product-count'/);
});

test('product workspace uses top tabs instead of five cascading selects',()=>{
  const ui=fs.readFileSync('./hierarchy-ui.js','utf8');
  assert.doesNotMatch(ui,/hierarchy-combos|selector\('Produk'/);
  assert.match(ui,/module-list/);
});

test('product icons appear on product cards and Recommended Reads',()=>{
 const app=fs.readFileSync('./app.js','utf8');
 assert.match(app,/read-icon',ProductModel\.iconForProduct/);
 assert.match(app,/product-icon',ProductModel\.iconForProduct/);
});
