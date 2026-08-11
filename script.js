const data = window.POSTER_DATA;
const stats = [[data.study.participants, "GE-79 participants"], [data.study.variables, "original variables"], [data.study.features, "shared features"], [data.study.folds, "stratified CV folds"]];
document.querySelector('#hero-stats').innerHTML = stats.map(([value, label]) => `<div><b>${value}</b><span>${label}</span></div>`).join('');

const cohort = document.querySelector('#cohort-viz');
const cohortValues = [[data.study.noImpairment, 'No impairment', '#6dcfa5'], [data.study.impaired, 'Impaired', '#cde975']];
cohort.innerHTML = cohortValues.map(([value, label, color]) => `<div class="person-bar" style="height:${value * 1.55}px;background:${color}"><span>${value} ${label}</span></div>`).join('');

const visual = { lr: '<div class="dot-score">' + data.models[0].values.map(v => `<i style="height:${v}%"></i>`).join('') + '</div>', dt: '<div class="tree-viz"></div>', rf: '<div class="forest-viz">' + [55, 72, 44, 86, 63, 78].map(v => `<i style="height:${v}%"></i>`).join('') + '</div>' };
document.querySelector('#model-grid').innerHTML = data.models.map(model => `<article class="model-card"><div class="model-label"><span>${model.short}</span><span>${model.role}</span></div><h3>${model.name}</h3><p>${model.id === 'lr' ? 'A linear probability model used as a transparent baseline for binary classification.' : model.id === 'dt' ? 'A readable if/then partition of feature values, useful for inspecting decision paths.' : 'Many decorrelated trees vote together, improving stability in a small and complex feature space.'}</p><div class="mini-viz" aria-hidden="true">${visual[model.id]}</div><p class="model-takeaway">${model.takeaway}</p></article>`).join('');

const [noNo, noImp, impNo, impImp] = [0, 1, 2, 3];
const matrix = (model) => `<div class="matrix-wrap"><div class="matrix-key"><span class="correct-key"></span> correct prediction <span class="error-key"></span> model error</div><div class="matrix"><span></span><b>Predicted:<br>No impairment</b><b>Predicted:<br>Impaired</b><b>Actual:<br>No impairment</b><i class="correct">${model.matrix[noNo]}</i><i class="error">${model.matrix[noImp]}</i><b>Actual:<br>Impaired</b><i class="error">${model.matrix[impNo]}</i><i class="correct">${model.matrix[impImp]}</i></div></div>`;
document.querySelector('#model-evidence').innerHTML = data.models.map(model => `<article class="model-evidence-card"><div><p class="eyebrow">${model.short.toUpperCase()} · ${model.name.toUpperCase()}</p><h3>${model.role}</h3>${matrix(model)}</div><aside><p class="evidence-stat"><b>${model.values[0]}%</b> accuracy</p><p class="evidence-stat"><b>${model.values[2]}%</b> impaired recall</p><p class="model-takeaway"><b>Takeaway:</b> ${model.takeaway}</p></aside></article>`).join('');

document.querySelector('#comparison-chart').innerHTML = data.metrics.map((metric, i) => `<div class="metric-row"><b>${metric}</b><div class="bar-stack">${data.models.map(model => `<i class="bar" style="width:${model.values[i]}%"><em>${model.values[i]}%</em></i>`).join('')}</div></div>`).join('');

const featureMax = data.shap[0][1];
document.querySelector('#feature-bars').innerHTML = data.shap.map(([name, value]) => `<div class="feature-row"><span>${name}</span><span class="shap-bar" style="width:${(value / featureMax) * 100}%"><em>${value.toFixed(3)}</em></span></div>`).join('');

const qrItems = [
  ['GitHub Page', 'This poster’s live GitHub Pages address.', data.links.poster, 'assets/qr/github-page.png'],
  ['Interactive Streamlit Visualizations', 'Explore the project’s interactive model visualizations.', data.links.prototype],
  ['Slide presentation', 'Group 6C presentation resource.', 'https://tinyurl.com/AI4ALL-Group6C-Presentation', 'assets/qr/group6c-presentation.png'],
  ['Group 6C Prototype App', 'Interactive prototype resource.', 'https://tinyurl.com/AI4ALL-Group6C-Prototype', 'assets/qr/prototype.png']
];
document.querySelector('#qr-grid').innerHTML = qrItems.map(([title, description, href, asset], i) => `<article class="qr-card"><h3>${title}</h3><p>${description}</p><div class="qr-code" id="qr-${i}" aria-label="QR code for ${title}">${asset ? `<img src="${asset}" alt="QR code for ${title}">` : ''}</div><a href="${href.startsWith('http') ? href : '#resources'}" ${href.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''}>${href}</a></article>`).join('');
if (window.QRCode) qrItems.filter(item => !item[3]).forEach((item) => { const i = qrItems.indexOf(item); new QRCode(document.querySelector(`#qr-${i}`), { text: item[2].startsWith('http') ? item[2] : data.links.poster, width: 110, height: 110, colorDark: '#062f29', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M }); });

const menu = document.querySelector('.menu'), nav = document.querySelector('.nav');
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }));
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`)); }), { rootMargin: '-35% 0px -55%' });
document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));

const presentationVideo = document.querySelector('.video-frame video');
if (presentationVideo) {
  presentationVideo.addEventListener('canplay', () => presentationVideo.closest('.video-frame').classList.add('ready'), { once: true });
}

// Static-site canvas implementation of the interactive brain-dot header visual.
(() => {
  const canvas = document.querySelector('#brain-dots');
  const overlay = document.querySelector('#brain-head-overlay');
  const stage = document.querySelector('.brain-anim-stage');
  if (!canvas || !overlay || !stage) return;
  const width = canvas.width, height = canvas.height;
  const ctx = canvas.getContext('2d');
  const overlayCtx = overlay.getContext('2d');
  const pointer = { x: 0, y: 0, active: false };
  const darkEvergreen = [6, 47, 41];
  const nodes = [];
  const random = (min, max) => min + Math.random() * (max - min);
  const pushNode = (x, y, r) => nodes.push({ x, y, ox: x, oy: y, vx: 0, vy: 0, r });

  for (let i = 0; i < 170; i += 1) {
    const angle = (i / 170) * Math.PI * 2;
    const radius = 128 + Math.sin(angle * 4) * 22 + Math.cos(angle * 3) * 18;
    pushNode(width / 2 + Math.cos(angle) * radius + random(-20, 20), height / 2 - 35 + Math.sin(angle) * radius * .77 + random(-18, 18), random(2, 7));
  }
  for (let i = 0; i < 30; i += 1) {
    const angle = (i / 30) * Math.PI * 2;
    pushNode(width / 2 + Math.cos(angle) * random(35, 57), height / 2 + 117 + Math.sin(angle) * random(27, 45), random(2.5, 5));
  }

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    nodes.forEach((node) => {
      const dx = node.x - pointer.x, dy = node.y - pointer.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      if (pointer.active && dist < 118) {
        const force = (118 - dist) / 118 * .75;
        node.vx += dx / dist * force;
        node.vy += dy / dist * force;
      }
      node.vx += (node.ox - node.x) * .011;
      node.vy += (node.oy - node.y) * .011;
      node.vx *= .86; node.vy *= .86;
      node.x += node.vx; node.y += node.vy;
      ctx.beginPath(); ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = node.r > 5.3 ? '#4db5a7' : node.r > 3.5 ? '#2d9a96' : '#166b6b';
      ctx.globalAlpha = .88; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = .45; ctx.stroke();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  };
  const setPointer = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) * (width / rect.width);
    pointer.y = (event.clientY - rect.top) * (height / rect.height);
    pointer.active = true;
  };
  stage.addEventListener('pointermove', setPointer);
  stage.addEventListener('pointerleave', () => { pointer.active = false; });
  stage.addEventListener('pointerdown', setPointer);

  // Remove the supplied aqua backdrop and turn only its near-black marks evergreen.
  const head = new Image();
  head.onload = () => {
    const source = document.createElement('canvas'); source.width = head.naturalWidth; source.height = head.naturalHeight;
    const sourceCtx = source.getContext('2d'); sourceCtx.drawImage(head, 0, 0);
    const image = sourceCtx.getImageData(0, 0, source.width, source.height);
    for (let i = 0; i < image.data.length; i += 4) {
      const r = image.data[i], g = image.data[i + 1], b = image.data[i + 2];
      const isBackdrop = Math.abs(r - 149) < 19 && Math.abs(g - 199) < 25 && Math.abs(b - 200) < 25;
      if (isBackdrop) { image.data[i + 3] = 0; continue; }
      if (r < 28 && g < 55 && b < 55) { image.data[i] = darkEvergreen[0]; image.data[i + 1] = darkEvergreen[1]; image.data[i + 2] = darkEvergreen[2]; }
    }
    sourceCtx.putImageData(image, 0, 0);
    const scale = Math.min(width / source.width, height / source.height) * .93;
    const w = source.width * scale, h = source.height * scale;
    overlayCtx.clearRect(0, 0, width, height);
    overlayCtx.drawImage(source, (width - w) / 2, (height - h) / 2, w, h);
  };
  head.src = 'assets/brain/brain-head.png';
  draw();
})();
// Model 3.3 retains the circular particle visual with the supplied head artwork overlaid.
if (typeof BrainAnimation !== 'undefined' && window.d3) {
  BrainAnimation.init('#brain-dots', { width: 800, height: 800, particleCount: 2250, backgroundColor: '#ffffff' });
}
// End note: all displayed comparison values flow from data.js.
