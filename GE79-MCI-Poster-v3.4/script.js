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

// The D3 animation owns the dot canvas. The clean transparent head PNG stays as the top layer.
if (typeof BrainAnimation !== 'undefined' && window.d3) {
  BrainAnimation.init('#brain-dots', { width: 800, height: 800, particleCount: 2250, backgroundColor: '#ffffff' });
}
// End note: all displayed comparison values flow from data.js.
