(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.HelpSearch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const aliases = {
    'siswa baru': 'calon peserta', 'murid baru': 'calon peserta',
    'pendaftaran siswa': 'pendaftaran', 'daftar sekolah': 'pendaftaran',
    'bayar tagihan': 'pembayaran', 'bukti bayar': 'bukti pembayaran',
    'cek transaksi': 'status transaksi'
  };
  function normalize(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  }
  function expandQuery(query) {
    const value = normalize(query);
    if (!value) return [];
    const variants = [value];
    for (const [from, to] of Object.entries(aliases)) {
      if ((' ' + value + ' ').includes(' ' + from + ' ')) {
        variants.push(value.replace(new RegExp('\\b' + from + '\\b', 'g'), to));
      }
    }
    return [...new Set(variants)];
  }
  function searchDocs(docs, query = '', category = 'Semua topik') {
    const variants = expandQuery(query);
    return docs.map((doc, index) => {
      if (category !== 'Semua topik' && doc.category !== category) return null;
      if (!variants.length) return { doc, score: 0, index };
      const title = normalize(doc.title), slug = normalize(doc.slug);
      const description = normalize(doc.description), group = normalize(doc.category), body = normalize(doc.body);
      let score = 0;
      for (const variant of variants) {
        const words = variant.split(' ');
        const combined = [title, slug, description, group, body].join(' ');
        if (!words.every(word => combined.includes(word))) continue;
        let points = title === variant ? 120 : title.includes(variant) ? 75 : 0;
        if (slug.includes(variant)) points += 28;
        if (description.includes(variant)) points += 12;
        if (body.includes(variant)) points += 2;
        for (const word of words) {
          if (title.split(' ').includes(word)) points += 15;
          else if (title.includes(word)) points += 8;
          if (slug.includes(word)) points += 6;
          if (description.includes(word)) points += 3;
          if (body.includes(word)) points += 1;
          if (group.includes(word)) points += 1;
        }
        score = Math.max(score, points);
      }
      return score ? { doc, score, index } : null;
    }).filter(Boolean).sort((a, b) => b.score - a.score || a.index - b.index).map(item => item.doc);
  }
  return { normalize, expandQuery, searchDocs };
});
