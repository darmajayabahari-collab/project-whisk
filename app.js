<<<<<<< HEAD
/* Project Whisk — app.js v4
   Features: ratio, images per prompt, auto-download, batch */
=======
/* Project Whisk — app.js
   Backend: Cloudflare Workers AI */
>>>>>>> 4c98f71b64da90bc93ece8fbac978ac6fff1c16d

const WORKER_URL = 'https://whisk-api.darmajayabahari.workers.dev';

let promptLog = [];
let historyImgs = [];
let activePill = 'Default';
<<<<<<< HEAD
let imageCount = 1;
let imageRatio = '768x768';
let batchCount = 1;
let batchRatio = '768x768';
let batchPrompts = [];
let batchRunning = false;
let batchStopped = false;
let globalIndex = 0;

/* ── TABS ── */
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.tab[onclick="switchTab('${tab}')"]`).classList.add('active');
  document.getElementById('tab-single').style.display = tab === 'single' ? 'block' : 'none';
  document.getElementById('tab-batch').style.display  = tab === 'batch'  ? 'block' : 'none';
}

/* ── HELPERS ── */
=======

>>>>>>> 4c98f71b64da90bc93ece8fbac978ac6fff1c16d
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

<<<<<<< HEAD
function setCount(el, n) {
  document.querySelectorAll('#num-pills .num-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  imageCount = n;
}

function setRatio(el, res, label) {
  el.closest('.ratio-pills').querySelectorAll('.ratio-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  imageRatio = res;
}

function setBatchCount(el, n) {
  el.closest('.num-pills').querySelectorAll('.num-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  batchCount = n;
}

function setBatchRatio(el, res, label) {
  el.closest('.ratio-pills').querySelectorAll('.ratio-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  batchRatio = res;
}

/* ── PREVIEW ── */
=======
>>>>>>> 4c98f71b64da90bc93ece8fbac978ac6fff1c16d
const emptyIcons = { subject: 'ti-user-circle', scene: 'ti-mountain', style: 'ti-brush' };
function getEmpty(slot) {
  return `<div class="preview-empty"><i class="ti ${emptyIcons[slot]}"></i><span>${slot.charAt(0).toUpperCase()+slot.slice(1)}</span></div>`;
}
function previewUrl(slot) {
  const url = document.getElementById('url-' + slot).value.trim();
  const box = document.getElementById('preview-' + slot);
  if (!url) { box.innerHTML = getEmpty(slot); return; }
  const img = new Image();
  img.src = url;
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
  img.onload  = () => { box.innerHTML = ''; box.appendChild(img); };
  img.onerror = () => { box.innerHTML = getEmpty(slot); };
}

<<<<<<< HEAD
/* ── PROMPT BUILDER ── */
=======
>>>>>>> 4c98f71b64da90bc93ece8fbac978ac6fff1c16d
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

<<<<<<< HEAD
/* ── GENERATE ONE IMAGE ── */
async function generateOne(prompt, ratio) {
  const [w, h] = ratio.split('x').map(Number);
  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, width: w, height: h })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed' }));
      return { error: err.error || 'Failed' };
    }
    const blob = await res.blob();
    return { url: URL.createObjectURL(blob) };
  } catch (err) {
    return { error: 'Network error' };
  }
}

/* ── AUTO DOWNLOAD ── */
function downloadImg(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ── SINGLE GENERATE ── */
async function generate() {
  const btn       = document.getElementById('gen-btn');
  const statusBar = document.getElementById('status-bar');
  const data      = buildPromptData();
  const prefix    = document.getElementById('filename-prefix').value.trim() || 'whisk';
  const autodl    = document.getElementById('auto-download').checked;
  const count     = imageCount;
=======
async function generate() {
  const btn       = document.getElementById('gen-btn');
  const statusBar = document.getElementById('status-bar');
  const count     = parseInt(document.getElementById('batch-slider').value);
  const data      = buildPromptData();
>>>>>>> 4c98f71b64da90bc93ece8fbac978ac6fff1c16d

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div>';
  statusBar.textContent = `Generating ${count} image${count > 1 ? 's' : ''}...`;
  addToLog(data);

<<<<<<< HEAD
  const [w, h] = imageRatio.split('x').map(Number);
  const aspectStyle = `aspect-ratio:${w}/${h}`;
  const cols = count <= 2 ? count : count <= 4 ? 2 : 3;

=======
  const cols = count <= 2 ? count : count <= 4 ? 2 : count <= 6 ? 3 : 4;
>>>>>>> 4c98f71b64da90bc93ece8fbac978ac6fff1c16d
  const container = document.getElementById('results-container');
  container.className = 'results-grid';
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  container.innerHTML = Array.from({ length: count }, (_, i) => `
<<<<<<< HEAD
    <div class="loading-cell" id="cell-${i}" style="${aspectStyle}">
=======
    <div class="loading-cell" id="cell-${i}">
>>>>>>> 4c98f71b64da90bc93ece8fbac978ac6fff1c16d
      <div class="spinner"></div>
      <span class="load-text">Generating...</span>
    </div>`).join('');

  let done = 0;
  await Promise.all(Array.from({ length: count }, (_, i) =>
<<<<<<< HEAD
    generateOne(data.final, imageRatio).then(result => {
=======
    generateOne(data.final).then(src => {
>>>>>>> 4c98f71b64da90bc93ece8fbac978ac6fff1c16d
      done++;
      statusBar.textContent = `Generated ${done} / ${count}`;
      const cell = document.getElementById('cell-' + i);
      if (!cell) return;
<<<<<<< HEAD
      if (result.error) {
        cell.innerHTML = `<div class="preview-empty" style="height:100%"><i class="ti ti-photo-off"></i><span style="font-size:11px;padding:0 8px;text-align:center">${result.error}</span></div>`;
        return;
      }
      const ts = Date.now();
      const filename = `${prefix}_${ts}_${i+1}.png`;
      cell.className = 'result-card';
      cell.style = aspectStyle;
      cell.innerHTML = `
        <img src="${result.url}" alt="Generated image ${i+1}" loading="lazy" />
        <div class="result-overlay">
          <button class="ov-btn" onclick="downloadImg('${result.url}','${filename}')" title="Download"><i class="ti ti-download"></i></button>
          <button class="ov-btn" onclick="saveHistory('${result.url}')" title="Save"><i class="ti ti-bookmark"></i></button>
        </div>`;
      if (autodl) downloadImg(result.url, filename);
=======
      if (!src) {
        cell.innerHTML = `<div class="preview-empty" style="height:100%"><i class="ti ti-photo-off"></i><span>Failed</span></div>`;
        return;
      }
      cell.className = 'result-card';
      cell.innerHTML = `
        <img src="${src}" alt="Generated image ${i+1}" loading="lazy" />
        <div class="result-overlay">
          <button class="ov-btn" onclick="dlImg('${src}',${i})" title="Download"><i class="ti ti-download"></i></button>
          <button class="ov-btn" onclick="saveHistory('${src}')" title="Save"><i class="ti ti-bookmark"></i></button>
        </div>`;
>>>>>>> 4c98f71b64da90bc93ece8fbac978ac6fff1c16d
    })
  ));

  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-wand"></i> Generate';
  statusBar.textContent = `Done — ${done} image${done > 1 ? 's' : ''} ready.`;
}

<<<<<<< HEAD
/* ── BATCH ── */
function loadBatchFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const lines = e.target.result.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    batchPrompts = lines;
    renderBatchPreview();
    document.getElementById('batch-gen-btn').disabled = false;
    showToast(`Loaded ${lines.length} prompts`);
  };
  reader.readAsText(file);
}

function renderBatchPreview() {
  const preview = document.getElementById('batch-preview');
  const info    = document.getElementById('batch-info');
  const list    = document.getElementById('batch-prompt-list');
  preview.style.display = 'block';
  info.textContent = `${batchPrompts.length} prompts loaded`;
  list.innerHTML = batchPrompts.slice(0, 20).map((p, i) => `
    <div class="batch-prompt-item" id="bpi-${i}">
      <span class="idx">${i+1}.</span>
      <span>${p.length > 80 ? p.slice(0,80)+'...' : p}</span>
    </div>`).join('') + (batchPrompts.length > 20 ? `<div class="batch-prompt-item"><span class="idx">...</span><span>${batchPrompts.length - 20} more prompts</span></div>` : '');
}

async function startBatch() {
  if (!batchPrompts.length) return;
  batchRunning = true;
  batchStopped = false;
  globalIndex = 0;

  const btn     = document.getElementById('batch-gen-btn');
  const stopBtn = document.getElementById('batch-stop-btn');
  const prefix  = document.getElementById('batch-prefix').value.trim() || 'batch';
  const delay   = parseInt(document.getElementById('batch-delay').value) * 1000;

  btn.style.display  = 'none';
  stopBtn.style.display = 'flex';

  const progress = document.getElementById('batch-progress');
  const bar      = document.getElementById('progress-bar');
  const ptext    = document.getElementById('progress-text');
  const results  = document.getElementById('batch-results');
  progress.style.display = 'block';
  results.innerHTML = '';

  for (let i = 0; i < batchPrompts.length; i++) {
    if (batchStopped) break;

    const prompt = batchPrompts[i];
    const pct = Math.round((i / batchPrompts.length) * 100);
    bar.style.width = pct + '%';
    ptext.textContent = `Prompt ${i+1} / ${batchPrompts.length} (${pct}%)`;

    // Mark active
    const bpi = document.getElementById('bpi-' + i);
    if (bpi) bpi.classList.add('active');

    // Add result row
    const rowId = 'br-' + i;
    results.innerHTML += `
      <div class="batch-result-row" id="${rowId}">
        <span class="br-num">${i+1}</span>
        <span class="br-prompt">${prompt.length > 60 ? prompt.slice(0,60)+'...' : prompt}</span>
        <span class="br-status running">Generating...</span>
      </div>`;
    results.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Generate images per prompt
    for (let j = 0; j < batchCount; j++) {
      if (batchStopped) break;
      const result = await generateOne(prompt, batchRatio);
      if (result.url) {
        const filename = `${prefix}_${String(i+1).padStart(4,'0')}_${j+1}.png`;
        downloadImg(result.url, filename);
        globalIndex++;
      }
    }

    // Update status
    const row = document.getElementById(rowId);
    if (row) {
      const status = row.querySelector('.br-status');
      status.className = 'br-status done';
      status.textContent = `Done (${batchCount} img)`;
    }
    if (bpi) { bpi.classList.remove('active'); bpi.classList.add('done'); }

    // Delay between prompts
    if (i < batchPrompts.length - 1 && !batchStopped) {
      await new Promise(r => setTimeout(r, delay));
    }
  }

  bar.style.width = '100%';
  ptext.textContent = batchStopped
    ? `Stopped at prompt ${globalIndex} — ${globalIndex} images downloaded`
    : `Complete! ${batchPrompts.length} prompts, ${globalIndex} images downloaded`;

  btn.style.display  = 'flex';
  stopBtn.style.display = 'none';
  batchRunning = false;
  showToast(batchStopped ? 'Batch stopped' : 'Batch complete!');
}

function stopBatch() {
  batchStopped = true;
  batchRunning = false;
}

/* ── HISTORY ── */
=======
async function generateOne(prompt) {
  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    return null;
  }
}

function dlImg(src, idx) {
  const a = document.createElement('a');
  a.href = src; a.download = 'whisk-' + Date.now() + '-' + idx + '.png';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

>>>>>>> 4c98f71b64da90bc93ece8fbac978ac6fff1c16d
function saveHistory(src) {
  if (historyImgs.includes(src)) { showToast('Already saved'); return; }
  historyImgs.unshift(src);
  if (historyImgs.length > 16) historyImgs.pop();
  renderHistory();
  showToast('Saved');
}
function renderHistory() {
  const sec = document.getElementById('history-section');
  const grid = document.getElementById('history-grid');
  if (!historyImgs.length) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  grid.innerHTML = historyImgs.map(u => `<div class="history-thumb" onclick="window.open('${u}','_blank')"><img src="${u}" loading="lazy" /></div>`).join('');
}
function clearHistory() { historyImgs = []; renderHistory(); }

<<<<<<< HEAD
/* ── PROMPT LOG ── */
=======
>>>>>>> 4c98f71b64da90bc93ece8fbac978ac6fff1c16d
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
    const num = promptLog.length - i;
    const rows = [
      e.subject ? `<div><span class="log-entry-key">subject: </span><span class="log-entry-val">${e.subject}</span></div>` : '',
      e.scene   ? `<div><span class="log-entry-key">scene: </span><span class="log-entry-val">${e.scene}</span></div>`   : '',
      e.style   ? `<div><span class="log-entry-key">style: </span><span class="log-entry-val">${e.style}</span></div>`   : '',
      e.extra   ? `<div><span class="log-entry-key">extra: </span><span class="log-entry-val">${e.extra}</span></div>`   : '',
    ].filter(Boolean).join('');
    return `<div class="log-entry"><div class="log-entry-meta">#${num} · ${e.styleTag}</div>${rows}<div><span class="log-entry-key">final: </span><span class="log-entry-final">${e.final}</span></div></div>`;
  }).join('');
}
function clearLog() {
  promptLog = [];
  document.getElementById('log-count').textContent = '0';
  document.getElementById('export-btn').disabled   = true;
  document.getElementById('log-section').style.display = 'none';
  showToast('Log cleared');
}

<<<<<<< HEAD
/* ── EXPORT TXT ── */
=======
>>>>>>> 4c98f71b64da90bc93ece8fbac978ac6fff1c16d
function exportTxt() {
  if (!promptLog.length) return;
  const lines = promptLog.map(e => {
    const meta = [];
    if (e.subject) meta.push('# subject: ' + e.subject);
    if (e.scene)   meta.push('# scene: ' + e.scene);
    if (e.style)   meta.push('# style ref: ' + e.style);
    if (e.extra)   meta.push('# extra: ' + e.extra);
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
