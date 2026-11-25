const fs = require('node:fs');
const menus = require('./menu-config.js');
const topics = menus.flatMap(menu => menu.featured.map(need => ({
  title: need.label,
  slug: need.slug,
  category: menu.category,
  type: 'Panduan',
  description: need.description || ''
})));
if (new Set(topics.map(topic => topic.slug)).size !== topics.length) throw Error('Slug topik tidak unik');
fs.writeFileSync('./help-index.js', 'window.HELP_TOPICS = ' + JSON.stringify(topics, null, 2) + ';\n', 'utf8');
console.log('Indeks lokal berisi', topics.length, 'contoh kebutuhan.');
