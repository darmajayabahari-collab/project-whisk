/* Project Whisk v4 — app.js */

const WORKER_URL = 'https://whisk-api.darmajayabahari.workers.dev';

let promptLog = [];
let historyImgs = [];
let activePill = 'Default';
let imageCount = 1;
let imageRatio = '768x768';
let batchCount = 1;
let batchRatio = '768x768';
let batchPrompts = [];
let batchStopped = false;
let globalIndex = 0;

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(".tab[onclick=\"switchTab('" + tab + "')\"]").classList.add('active');
  document.getElementById('tab-single').style.display = tab === 'single' ? 'block' : 'none';
  document.getElementById('tab-batch').style.display  = tab === 'batch'  ? 'block' : 'none';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid = setTimeout(function() { t.classList.remove('show'); }, 2600);
}

function togglePill(el) {
  document.querySelectorAll('.pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');
  activePill = el.textContent.trim();
}

function setCount(el, n) {
  document.querySelectorAll('#num-pills .num-pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');
  imageCount = n;
}

function setRatio(el, res, label) {
  el.closest('.ratio-pills').querySelectorAll('.ratio-pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');
  imageRatio = res;
}

function setBatchCount(el, n) {
  el.closest('.num-pills').querySelectorAll('.num-pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');
  batchCount = n;
}

function setBatchRatio(el, res, label) {
  el.closest('.ratio-pills').querySelectorAll('.ratio-pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');
  batchRatio = res;
}

var emptyIcons = { subject: 'ti-user-circle', scene: 'ti-mountain', style: 'ti-brush' };
function getEmpty(slot) {
  return '<div class="preview-empty"><i class="ti ' + emptyIcons[slot] + '"></i><span>' + slot.charAt(0).toUpperCase() + slot.slice(1) + '</span></div>';
}
function previewUrl(slot) {
  var url = document.getElementById('url-' + slot).value.trim();
  var box = document.getElementById('preview-' + slot);
  if (!url) { box.innerHTML = getEmpty(slot); return; }
  var img = new Image();
  img.src = url;
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
  img.onload  = function() { box.innerHTML = ''; box.appendChild(img); };
  img.onerror = function() { box.innerHTML = getEmpty(slot); };
}

function buildPromptData() {
  var subject = document.getElementById('url-subject').value.trim();
  var scene   = document.getElementById('url-scene').value.trim();
  var styleV  = document.getElementById('url-style').value.trim();
  var extra   = document.getElementById('extra-prompt').value.trim();
  var styleTag = activePill !== 'Default' ? activePill + ' style, ' : '';
  var parts = [];
  if (subject) parts.push('subject inspired by: ' + subject);
  if (scene)   parts.push('background/scene: ' + scene);
  if (styleV)  parts.push('visual style from: ' + styleV);
  if (!parts.length) parts.push('creative abstract composition');
  var final = styleTag + parts.join(', ');
  if (extra) final += ', ' + extra;
  final += ', high quality, detailed';
  return { subject: subject, scene: scene, style: styleV, extra: extra, styleTag: activePill, final: final.trim() };
}

async function generateOne(prompt, ratio) {
  var parts = ratio.split('x');
  var w = parseInt(parts[0]);
  var h = parseInt(parts[1]);
  try {
    var res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt, width: w, height: h })
    });
    if (!res.ok) {
      var err = await res.json().catch(function() { return { error: 'Failed' }; });
      return { error: err.error || 'Failed' };
    }
    var blob = await res.blob();
    return { url: URL.createObjectURL(blob) };
  } catch(e) {
    return { error: 'Network error' };
  }
}

function downloadImg(url, filename) {
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function generate() {
  var btn       = document.getElementById('gen-btn');
  var statusBar = document.getElementById('status-bar');
  var data      = buildPromptData();
  var prefix    = document.getElementById('filename-prefix').value.trim() || 'whisk';
  var autodl    = document.getElementById('auto-download').checked;
  var count     = imageCount;

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div>';
  statusBar.textContent = 'Generating ' + count + ' image' + (count > 1 ? 's' : '') + '...';
  addToLog(data);

  var ratioParts = imageRatio.split('x');
  var w = ratioParts[0]; var h = ratioParts[1];
  var aspectStyle = 'aspect-ratio:' + w + '/' + h;
  var cols = count <= 2 ? count : count <= 4 ? 2 : 3;

  var container = document.getElementById('results-container');
  container.className = 'results-grid';
  container.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
  var cells = '';
  for (var i = 0; i < count; i++) {
    cells += '<div class="loading-cell" id="cell-' + i + '" style="' + aspectStyle + '"><div class="spinner"></div><span class="load-text">Generating...</span></div>';
  }
  container.innerHTML = cells;

  var done = 0;
  var promises = [];
  for (var idx = 0; idx < count; idx++) {
    promises.push((function(i) {
      return generateOne(data.final, imageRatio).then(function(result) {
        done++;
        statusBar.textContent = 'Generated ' + done + ' / ' + count;
        var cell = document.getElementById('cell-' + i);
        if (!cell) return;
        if (result.error) {
          cell.innerHTML = '<div class="preview-empty" style="height:100%"><i class="ti ti-photo-off"></i><span style="font-size:11px;padding:0 8px;text-align:center">' + result.error + '</span></div>';
          return;
        }
        var ts = Date.now();
        var filename = prefix + '_' + ts + '_' + (i+1) + '.png';
        cell.className = 'result-card';
        cell.style = aspectStyle;
        cell.innerHTML = '<img src="' + result.url + '" alt="Generated image ' + (i+1) + '" loading="lazy" /><div class="result-overlay"><button class="ov-btn" onclick="downloadImg(\'' + result.url + '\',\'' + filename + '\')" title="Download"><i class="ti ti-download"></i></button><button class="ov-btn" onclick="saveHistory(\'' + result.url + '\')" title="Save"><i class="ti ti-bookmark"></i></button></div>';
        if (autodl) downloadImg(result.url, filename);
      });
    })(idx));
  }
  await Promise.all(promises);

  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-wand"></i> Generate';
  statusBar.textContent = 'Done — ' + done + ' image' + (done > 1 ? 's' : '') + ' ready.';
}

function loadBatchFile(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var lines = e.target.result.split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l && !l.startsWith('#'); });
    batchPrompts = lines;
    renderBatchPreview();
    document.getElementById('batch-gen-btn').disabled = false;
    showToast('Loaded ' + lines.length + ' prompts');
  };
  reader.readAsText(file);
}

function renderBatchPreview() {
  var preview = document.getElementById('batch-preview');
  var info    = document.getElementById('batch-info');
  var list    = document.getElementById('batch-prompt-list');
  preview.style.display = 'block';
  info.textContent = batchPrompts.length + ' prompts loaded';
  var html = '';
  var limit = Math.min(batchPrompts.length, 20);
  for (var i = 0; i < limit; i++) {
    var p = batchPrompts[i];
    html += '<div class="batch-prompt-item" id="bpi-' + i + '"><span class="idx">' + (i+1) + '.</span><span>' + (p.length > 80 ? p.slice(0,80)+'...' : p) + '</span></div>';
  }
  if (batchPrompts.length > 20) {
    html += '<div class="batch-prompt-item"><span class="idx">...</span><span>' + (batchPrompts.length - 20) + ' more prompts</span></div>';
  }
  list.innerHTML = html;
}

async function startBatch() {
  if (!batchPrompts.length) return;
  batchStopped = false;
  globalIndex = 0;

  var btn     = document.getElementById('batch-gen-btn');
  var stopBtn = document.getElementById('batch-stop-btn');
  var prefix  = document.getElementById('batch-prefix').value.trim() || 'batch';
  var delay   = parseInt(document.getElementById('batch-delay').value) * 1000;

  btn.style.display     = 'none';
  stopBtn.style.display = 'flex';

  var progress = document.getElementById('batch-progress');
  var bar      = document.getElementById('progress-bar');
  var ptext    = document.getElementById('progress-text');
  var results  = document.getElementById('batch-results');
  progress.style.display = 'block';
  results.innerHTML = '';

  for (var i = 0; i < batchPrompts.length; i++) {
    if (batchStopped) break;

    var prompt = batchPrompts[i];
    var pct = Math.round((i / batchPrompts.length) * 100);
    bar.style.width = pct + '%';
    ptext.textContent = 'Prompt ' + (i+1) + ' / ' + batchPrompts.length + ' (' + pct + '%)';

    var bpi = document.getElementById('bpi-' + i);
    if (bpi) bpi.classList.add('active');

    var rowId = 'br-' + i;
    results.innerHTML += '<div class="batch-result-row" id="' + rowId + '"><span class="br-num">' + (i+1) + '</span><span class="br-prompt">' + (prompt.length > 60 ? prompt.slice(0,60)+'...' : prompt) + '</span><span class="br-status running">Generating...</span></div>';
    results.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    for (var j = 0; j < batchCount; j++) {
      if (batchStopped) break;
      var result = await generateOne(prompt, batchRatio);
      if (result.url) {
        var filename = prefix + '_' + String(i+1).padStart(4,'0') + '_' + (j+1) + '.png';
        downloadImg(result.url, filename);
        globalIndex++;
      }
    }

    var row = document.getElementById(rowId);
    if (row) {
      var status = row.querySelector('.br-status');
      status.className = 'br-status done';
      status.textContent = 'Done (' + batchCount + ' img)';
    }
    if (bpi) { bpi.classList.remove('active'); bpi.classList.add('done'); }

    if (i < batchPrompts.length - 1 && !batchStopped) {
      await new Promise(function(r) { setTimeout(r, delay); });
    }
  }

  bar.style.width = '100%';
  ptext.textContent = batchStopped
    ? 'Stopped — ' + globalIndex + ' images downloaded'
    : 'Complete! ' + batchPrompts.length + ' prompts, ' + globalIndex + ' images downloaded';

  btn.style.display     = 'flex';
  stopBtn.style.display = 'none';
  showToast(batchStopped ? 'Batch stopped' : 'Batch complete!');
}

function stopBatch() {
  batchStopped = true;
}

function saveHistory(src) {
  if (historyImgs.indexOf(src) !== -1) { showToast('Already saved'); return; }
  historyImgs.unshift(src);
  if (historyImgs.length > 16) historyImgs.pop();
  renderHistory();
  showToast('Saved');
}
function renderHistory() {
  var sec = document.getElementById('history-section');
  var grid = document.getElementById('history-grid');
  if (!historyImgs.length) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  grid.innerHTML = historyImgs.map(function(u) {
    return '<div class="history-thumb" onclick="window.open(\'' + u + '\',\'_blank\')"><img src="' + u + '" loading="lazy" /></div>';
  }).join('');
}
function clearHistory() { historyImgs = []; renderHistory(); }

function addToLog(entry) {
  promptLog.push(entry);
  document.getElementById('log-count').textContent = promptLog.length;
  document.getElementById('export-btn').disabled   = false;
  document.getElementById('log-total-label').textContent = promptLog.length + ' total';
  renderLog();
}
function renderLog() {
  var sec  = document.getElementById('log-section');
  var list = document.getElementById('log-list');
  if (!promptLog.length) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  var html = '';
  var reversed = promptLog.slice().reverse();
  for (var i = 0; i < reversed.length; i++) {
    var e = reversed[i];
    var num = promptLog.length - i;
    var rows = '';
    if (e.subject) rows += '<div><span class="log-entry-key">subject: </span><span class="log-entry-val">' + e.subject + '</span></div>';
    if (e.scene)   rows += '<div><span class="log-entry-key">scene: </span><span class="log-entry-val">' + e.scene + '</span></div>';
    if (e.style)   rows += '<div><span class="log-entry-key">style: </span><span class="log-entry-val">' + e.style + '</span></div>';
    if (e.extra)   rows += '<div><span class="log-entry-key">extra: </span><span class="log-entry-val">' + e.extra + '</span></div>';
    html += '<div class="log-entry"><div class="log-entry-meta">#' + num + ' · ' + e.styleTag + '</div>' + rows + '<div><span class="log-entry-key">final: </span><span class="log-entry-final">' + e.final + '</span></div></div>';
  }
  list.innerHTML = html;
}
function clearLog() {
  promptLog = [];
  document.getElementById('log-count').textContent = '0';
  document.getElementById('export-btn').disabled   = true;
  document.getElementById('log-section').style.display = 'none';
  showToast('Log cleared');
}

function exportTxt() {
  if (!promptLog.length) return;
  var lines = promptLog.map(function(e) {
    var meta = [];
    if (e.subject) meta.push('# subject: ' + e.subject);
    if (e.scene)   meta.push('# scene: ' + e.scene);
    if (e.style)   meta.push('# style ref: ' + e.style);
    if (e.extra)   meta.push('# extra: ' + e.extra);
    meta.push('# style pill: ' + e.styleTag);
    meta.push(e.final);
    return meta.join('\n');
  });
  var blob = new Blob([lines.join('\n\n')], { type: 'text/plain' });
  var url  = URL.createObjectURL(blob);
  var ts   = new Date().toISOString().slice(0,16).replace('T','_').replace(':','-');
  var a    = document.createElement('a');
  a.href = url; a.download = 'whisk-prompts-' + ts + '.txt';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast('Exported ' + promptLog.length + ' prompts');
}
