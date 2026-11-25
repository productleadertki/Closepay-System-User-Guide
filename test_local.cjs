const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const menus = require('./menu-config.js');
const indexSource = fs.readFileSync('./help-index.js', 'utf8');
const context = { window: {} };
vm.runInNewContext(indexSource, context);
const topics = context.window.HELP_TOPICS;

test('every menu has local, unique topics', () => {
  assert.equal(topics.length, menus.reduce((n, menu) => n + menu.featured.length, 0));
  assert.equal(new Set(topics.map(topic => topic.slug)).size, topics.length);
  for (const menu of menus) {
    assert.ok(menu.featured.length >= 3);
    for (const need of menu.featured) assert.ok(topics.some(t => t.slug === need.slug && t.category === menu.category));
  }
});
test('active app has no third-party brand or external help links', () => {
  for (const file of ['index.html', 'app.js', 'product-model.js', 'hierarchy-config.js', 'hierarchy-model.js', 'hierarchy-ui.js', 'help-index.js', 'menu-config.js', 'home-config.js', 'admin.html', 'admin.js', 'help-admin-model.js', 'help-data.js', 'README.md']) {
    const text = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(text.toLowerCase(), new RegExp(['xen', 'dit'].join('')), file);
    if (file === 'README.md') continue; // Deployment documentation may name the public site.
    const urls = [...text.matchAll(/https?:\/\/[^\s`"']+/gi)].map(match => match[0]);
    for (const url of urls) assert.match(url, /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\//i, file);
  }
  assert.ok(topics.every(t => !('url' in t)));
});
