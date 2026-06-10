/* Project Whisk v3 — app.js
   Gemini API key stored in localStorage, direct browser call */

let promptLog = [];
let historyImgs = [];
let activePill = 'Default';

/* ── INIT ── */
window.addEventListener('DOMContentLoaded', () => {
  const key = localStorage.getItem('whisk_gemini_key');
  if (key) showApp();
});

function saveKey() {
  const key = document.getElementById('api-key-input').value.trim();
  if (!key.startsWith('AIza')) {
    showToast('Invalid key — must start with AIza');
    return;
  }
  localStorage.setItem('whisk_gemini_key', key);
  showApp();
}

function showApp() {
  document.getElementById('key-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';
}

function changeKey() {
  localStorage.removeItem('whisk_gemini_key');
  document.getElementById('key-screen').style.display = 'flex';
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('api-key-input').value = '';
}

function toggleKeyVisibility() {
  const input = document.getElementById('api-key-input');
  const icon  = document.getElementById('eye-icon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'ti ti-eye-off';
  } else {
    input.type = 'password';
    icon.className = 'ti ti-eye';
  }
}

/* ── HELPERS ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove('show'), 2600);
}

function togglePill(el) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  activePill = el.textContent.trim();
}

/* ── PREVIEW ── */
const emptyIcons = { subject: 'ti-user-circle', scene: 'ti-mountain', style: 'ti-brush' };
function getEmpty(slot) {
  const label = slot.charAt(0).toUpperCase() + slot.slice(1);
  return `<div class="preview-empty"><i class="ti ${emptyIcons[slot]}"></i><span>${label}</span></div>`;
}
function previewUrl(slot) {
  const url = document.getElementById('url-' + slot).value.trim();
  const box = document.getElementById('preview-' + slot);
  if (!url) { box.innerHTML = getEmpty(slot); return; }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
  img.onload  = () => { box.innerHTML = ''; box.appendChild(img); };
  img.onerror = () => { box.innerHTML = getEmpty(slot); };
}

/* ── PROMPT BUILDER ── */
function buildPromptData() {
  const subject = document.getElementById('url-subject').value.trim();
  const scene   = document.getElementById('url-scene').value.trim();
  const styleV  = document.getElementById('url-style').value.trim();
  const extra   = document.getElementById('extra-prompt').value.trim();
  const styleTag = activePill !== 'Default' ? activePill + ' style, ' : '';

  const parts = [];
  if (subject) parts.push('subject inspired by: ' + subject);
  if (scene)   parts.push('background/scene: ' + scene);
  if (styleV)  parts.push('visual style from: ' + styleV);
  if (!parts.length) parts.push('creative abstract composition');

  let final = styleTag + parts.join(', ');
  if (extra) final += ', ' + extra;
  final += ', high quality, detailed';

  return { subject, scene, style: styleV, extra, styleTag: activePill, final: final.trim() };
}

/* ── GENERATE ── */
async function generate() {
  const apiKey = localStorage.getItem('whisk_gemini_key');
  if (!apiKey) { showToast('No API key found'); changeKey(); return; }

  const btn       = document.getElementById('gen-btn');
  const statusBar = document.getElementById('status-bar');
  const count     = parseInt(document.getElementById('batch-slider').value);
  const data      = buildPromptData();

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div>';
  statusBar.textContent = `Generating ${count} image${count > 1 ? 's' : ''}…`;

  addToLog(data);

  const cols = count <= 2 ? count : count <= 4 ? 2 : count <= 6 ? 3 : 4;
  const container = document.getElementById('results-container');
  container.className = 'results-grid';
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  container.innerHTML = Array.from({ length: count }, (_, i) => `
    <div class="loading-cell" id="cell-${i}">
      <div class="spinner"></div>
      <span class="load-text">Generating…</span>
    </div>`).join('');

  let done = 0;

  await Promise.all(Array.from({ length: count }, (_, i) =>
    generateOne(data.final, apiKey).then(result => {
      done++;
      statusBar.textContent = `Generated ${done} / ${count}`;
      const cell = document.getElementById('cell-' + i);
      if (!cell) return;

      if (result.error) {
        cell.innerHTML = `<div class="preview-empty" style="height:100%"><i class="ti ti-photo-off"></i><span style="font-size:11px;text-align:center;padding:0 8px">${result.error}</span></div>`;
        if (result.error.includes('API key')) changeKey();
        return;
      }

      const src = `data:${result.mimeType};base64,${result.image}`;
      cell.className = 'result-card';
      cell.innerHTML = `
        <img src="${src}" alt="Generated image ${i + 1}" loading="lazy" />
        <div class="result-overlay">
          <button class="ov-btn" onclick="dlImg('${src}', ${i})" title="Download" aria-label="Download"><i class="ti ti-download"></i></button>
          <button class="ov-btn" onclick="saveHistory('${src}')" title="Save" aria-label="Save"><i class="ti ti-bookmark"></i></button>
        </div>`;
    })
  ));

  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-wand"></i> Generate';
  statusBar.textContent = `Done — ${done} image${done > 1 ? 's' : ''} ready. Prompt saved to log.`;
}

async function generateOne(prompt, apiKey) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
        })
      }
    );

    const data = await res.json();

    if (data.error) {
      const msg = data.error.message || 'API error';
      return { error: msg.includes('API key') ? 'Invalid API key' : msg };
    }

    const parts    = data.candidates?.[0]?.content?.parts || [];
    const imgPart  = parts.find(p => p.inlineData);
    if (!imgPart) return { error: 'No image returned' };

    return { image: imgPart.inlineData.data, mimeType: imgPart.inlineData.mimeType };

  } catch (err) {
    return { error: 'Network error' };
  }
}

/* ── DOWNLOAD ── */
function dlImg(src, idx) {
  const a = document.createElement('a');
  a.href = src;
  a.download = 'whisk-' + Date.now() + '-' + idx + '.png';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

/* ── HISTORY ── */
function saveHistory(src) {
  if (historyImgs.includes(src)) { showToast('Already saved'); return; }
  historyImgs.unshift(src);
  if (historyImgs.length > 16) historyImgs.pop();
  renderHistory();
  showToast('Saved to history');
}
function renderHistory() {
  const sec  = document.getElementById('history-section');
  const grid = document.getElementById('history-grid');
  if (!historyImgs.length) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  grid.innerHTML = historyImgs.map(u =>
    `<div class="history-thumb" onclick="window.open('${u}','_blank')">
      <img src="${u}" alt="History" loading="lazy" />
    </div>`).join('');
}
function clearHistory() { historyImgs = []; renderHistory(); showToast('Cleared'); }

/* ── PROMPT LOG ── */
function addToLog(entry) {
  promptLog.push(entry);
  document.getElementById('log-count').textContent = promptLog.length;
  document.getElementById('export-btn').disabled   = false;
  document.getElementById('log-total-label').textContent = promptLog.length + ' total';
  renderLog();
}
function renderLog() {
  const sec  = document.getElementById('log-section');
  const list = document.getElementById('log-list');
  if (!promptLog.length) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  list.innerHTML = [...promptLog].reverse().map((e, i) => {
    const num  = promptLog.length - i;
    const rows = [
      e.subject ? `<div><span class="log-entry-key">subject: </span><span class="log-entry-val">${e.subject}</span></div>` : '',
      e.scene   ? `<div><span class="log-entry-key">scene: </span><span class="log-entry-val">${e.scene}</span></div>`   : '',
      e.style   ? `<div><span class="log-entry-key">style ref: </span><span class="log-entry-val">${e.style}</span></div>` : '',
      e.extra   ? `<div><span class="log-entry-key">extra: </span><span class="log-entry-val">${e.extra}</span></div>`   : '',
    ].filter(Boolean).join('');
    return `<div class="log-entry">
      <div class="log-entry-meta">#${num} · ${e.styleTag}</div>
      ${rows}
      <div><span class="log-entry-key">final: </span><span class="log-entry-final">${e.final}</span></div>
    </div>`;
  }).join('');
}
function clearLog() {
  promptLog = [];
  document.getElementById('log-count').textContent = '0';
  document.getElementById('export-btn').disabled   = true;
  document.getElementById('log-section').style.display = 'none';
  showToast('Log cleared');
}

/* ── EXPORT TXT ── */
function exportTxt() {
  if (!promptLog.length) return;
  const lines = promptLog.map(e => {
    const meta = [];
    if (e.subject) meta.push('# subject: '   + e.subject);
    if (e.scene)   meta.push('# scene: '     + e.scene);
    if (e.style)   meta.push('# style ref: ' + e.style);
    if (e.extra)   meta.push('# extra: '     + e.extra);
    meta.push('# style pill: ' + e.styleTag);
    meta.push(e.final);
    return meta.join('\n');
  });
  const blob = new Blob([lines.join('\n\n')], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const ts   = new Date().toISOString().slice(0,16).replace('T','_').replace(':','-');
  const a    = document.createElement('a');
  a.href = url; a.download = 'whisk-prompts-' + ts + '.txt';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast('Exported ' + promptLog.length + ' prompts');
}
