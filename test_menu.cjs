const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('./help-index.js', 'utf8');
const context = { window: {} }; vm.runInNewContext(source, context);
const docs = context.window.HELP_TOPICS;
const menus = require('./menu-config.js');

test('board includes every category exactly once', () => {
  assert.deepEqual(new Set(menus.map(m => m.category)), new Set(docs.map(d => d.category)));
  assert.equal(menus.length, new Set(menus.map(m => m.category)).size);
});
test('every featured need resolves to a document within its menu', () => {
  for (const menu of menus) {
    assert.ok(menu.featured.length >= 3, menu.category);
    for (const need of menu.featured) {
      const doc = docs.find(d => d.slug === need.slug);
      assert.ok(doc, need.slug);
      assert.equal(doc.category, menu.category, need.slug);
      assert.ok(need.label.length > 4);
    }
  }
});
test('each menu has a local conceptual image', () => {
  for (const menu of menus) assert.ok(fs.existsSync(`./assets/${menu.image}.svg`), menu.image);
});
