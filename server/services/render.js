// Printable HTML. Open in a browser and use Print -> Save as PDF (handles Hindi and other scripts correctly).
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function renderDocument(report, doc) {
  const c = doc.content;
  const used = new Set([...(c.evidence || []), ...(c.sections || []).flatMap((s) => s.citations || [])]);
  const rows = [...used].map((id) => report.readings.find((r) => r.id === id)).filter(Boolean);

  const sections = (c.sections || []).map((s) => `
    <section>
      <h2>${esc(s.heading)}</h2>
      ${(s.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('')}
      ${s.bullets?.length ? `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
      ${s.table?.columns ? `<table><thead><tr>${s.table.columns.map((x) => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${(s.table.rows || []).map((r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : ''}
      ${s.citations?.length ? `<p class="cite">Evidence: ${s.citations.map(esc).join(', ')}</p>` : ''}
    </section>`).join('');

  const evidence = doc.kind === 'briefing' && rows.length ? `
    <section><h2>Evidence index</h2>
    <table><thead><tr><th>ID</th><th>File</th><th>Row</th><th>Location</th><th>Date</th><th>Readings (status)</th></tr></thead><tbody>
    ${rows.map((r) => `<tr><td>${esc(r.id)}</td><td>${esc(r.sourceFile)}</td><td>${r.rowNumber}</td><td>${esc(r.location)}</td><td>${esc(r.date)} ${esc(r.time || '')}</td><td>${Object.entries(r.values).map(([f, v]) => `${f}: ${v.value ?? 'n/a'} (${v.status})`).join('; ')}</td></tr>`).join('')}
    </tbody></table></section>` : '';

  return `<!doctype html><html lang="${esc(doc.language)}"><head><meta charset="utf-8"><title>${esc(c.title)}</title>
<style>
body{font-family:'Noto Sans','Noto Sans Devanagari','Segoe UI',system-ui,sans-serif;max-width:820px;margin:32px auto;padding:0 20px;color:#1b1f23;line-height:1.55}
h1{margin-bottom:4px} .sub{color:#555;margin-top:0} h2{border-bottom:2px solid #0f766e;padding-bottom:4px;margin-top:28px;color:#0f766e}
table{border-collapse:collapse;width:100%;font-size:.9em} th,td{border:1px solid #ccc;padding:6px 8px;text-align:left} th{background:#f0f5f4}
.cite{font-size:.8em;color:#666} .note{margin-top:32px;padding:12px;background:#f6f6f6;border-radius:6px;font-size:.9em}
button{position:fixed;top:12px;right:12px;padding:8px 14px} @media print{button{display:none}}
</style></head><body><button onclick="window.print()">Print / Save as PDF</button>
<h1>${esc(c.title)}</h1><p class="sub">${esc(c.subtitle)}</p>${sections}${evidence}
<div class="note">${esc(c.footer_note)}</div></body></html>`;
}
