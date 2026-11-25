"""Generate small conceptual flow diagrams used by the help-board demo."""
from pathlib import Path
from html import escape

ROOT = Path(__file__).with_name('assets')
ROOT.mkdir(exist_ok=True)
FLOWS = {
    'ppdb': ('PPDB', ['Pendaftaran', 'Seleksi', 'Pengumuman'], '#2d65d9'),
    'ppob': ('PPOB', ['Pilih layanan', 'Periksa tagihan', 'Bayar'], '#0c8f8b'),
}
for name, (title, steps, accent) in FLOWS.items():
    cards = []
    for i, step in enumerate(steps):
        x = 36 + i * 183
        cards.append(f'<rect x="{x}" y="135" width="150" height="94" rx="12" fill="white" stroke="#dce5ee"/>')
        cards.append(f'<circle cx="{x+26}" cy="165" r="13" fill="{accent}"/><text x="{x+26}" y="170" text-anchor="middle" font-size="13" font-weight="700" fill="white">{i+1}</text>')
        cards.append(f'<text x="{x+16}" y="204" font-size="13" font-weight="600" fill="#273a54">{escape(step)}</text>')
        if i < 2:
            cards.append(f'<path d="M{x+155} 182 h24 m-8 -7 8 7 -8 7" fill="none" stroke="{accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>')
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="280" viewBox="0 0 600 280" role="img" aria-labelledby="title desc">
<title id="title">Ilustrasi alur {escape(title)}</title><desc id="desc">{escape(' menuju '.join(steps))}</desc>
<rect width="600" height="280" rx="18" fill="#f1f6fb"/><circle cx="560" cy="32" r="100" fill="{accent}" opacity=".07"/>
<text x="36" y="57" font-size="12" letter-spacing="2" font-weight="700" fill="{accent}">ILUSTRASI KONSEP</text>
<text x="36" y="92" font-size="24" font-weight="700" font-family="Arial,Helvetica,sans-serif" fill="#18304e">{escape(title)}</text>
<g font-family="Arial,Helvetica,sans-serif">{''.join(cards)}</g>
<text x="36" y="259" font-family="Arial,Helvetica,sans-serif" font-size="11" fill="#708199">Alur umum ilustratif • sesuaikan dengan sistem Anda</text>
</svg>'''
    (ROOT / f'{name}.svg').write_text(svg, encoding='utf-8')
print(f'Generated {len(FLOWS)} conceptual SVG diagrams in {ROOT}')
