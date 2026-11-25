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
test('home shows Recommended Reads above Our Products and keeps top tabs',()=>{
  const html=fs.readFileSync('./index.html','utf8');
  const app=fs.readFileSync('./app.js','utf8');
  assert.match(html,/id="top-product-nav"/);
  assert.match(html,/<script src="home-config\.js"><\/script>/);
  assert.ok(html.indexOf('home-config.js')<html.indexOf('app.js'));
  assert.match(app,/function renderTopNav/);
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

test('product workspace uses top tabs instead of five cascading selects',()=>{
  const ui=fs.readFileSync('./hierarchy-ui.js','utf8');
  assert.doesNotMatch(ui,/hierarchy-combos|selector\('Produk'/);
  assert.match(ui,/module-list/);
});
