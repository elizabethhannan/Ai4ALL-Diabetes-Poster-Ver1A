const data = window.POSTER_DATA;
const stats = [[data.study.participants, "GE-79 participants"], [data.study.variables, "original variables"], [data.study.features, "shared features"], [data.study.folds, "stratified CV folds"]];
document.querySelector('#hero-stats').innerHTML = stats.map(([value, label]) => `<div><b>${value}</b><span>${label}</span></div>`).join('');

const cohort = document.querySelector('#cohort-viz');
const cohortValues = [[data.study.noImpairment, 'No impairment', '#6dcfa5'], [data.study.impaired, 'Impaired', '#cde975']];
cohort.innerHTML = cohortValues.map(([value, label, color]) => `<div class="person-bar" style="height:${value * 1.55}px;background:${color}"><span>${value} ${label}</span></div>`).join('');

const visual = { lr: '<div class="dot-score">' + data.models[0].values.map(v => `<i style="height:${v}%"></i>`).join('') + '</div>', dt: '<div class="tree-viz"></div>', rf: '<div class="forest-viz">' + [55, 72, 44, 86, 63, 78].map(v => `<i style="height:${v}%"></i>`).join('') + '</div>' };
document.querySelector('#model-grid').innerHTML = data.models.map(model => `<article class="model-card"><div class="model-label"><span>${model.short}</span><span>${model.role}</span></div><h3>${model.name}</h3><p>${model.id === 'lr' ? 'A linear probability model used as a transparent baseline for binary classification.' : model.id === 'dt' ? 'A readable if/then partition of feature values, useful for inspecting decision paths.' : 'Many decorrelated trees vote together, improving stability in a small and complex feature space.'}</p><div class="mini-viz" aria-hidden="true">${visual[model.id]}</div><p class="model-takeaway">${model.takeaway}</p></article>`).join('');

document.querySelector('#comparison-chart').innerHTML = data.metrics.map((metric, i) => `<div class="metric-row"><b>${metric}</b><div class="bar-stack">${data.models.map(model => `<i class="bar" style="width:${model.values[i]}%"><em>${model.values[i]}%</em></i>`).join('')}</div></div>`).join('');

const features = [['glucose_mg_dl', 100], ['systolic_bp', 88], ['wmh_volume', 74], ['sVCAM', 63], ['perfusion / vascular anchors', 56], ['other selected biomarkers', 45]];
document.querySelector('#feature-bars').innerHTML = features.map(([name, value]) => `<div class="feature-row"><span>${name}</span><span style="width:${value}%"></span></div>`).join('');

const qrItems = [
  ['Poster website', 'This poster’s live GitHub Pages address.', data.links.poster],
  ['Research code & documentation', 'Methods, notebooks, and technical materials.', data.links.code],
  ['Interactive Streamlit prototype', 'Explore the Random Forest model interface.', data.links.prototype],
  ['Slide presentation', 'AI4ALL Ignite Group 6C presentation.', data.links.slides],
  ['Elizabeth Hannan', 'Coauthor profile and project contact.', data.links.elizabeth],
  ['Agastyya Kala', 'Coauthor profile and project contact.', data.links.agastyya]
];
document.querySelector('#qr-grid').innerHTML = qrItems.map(([title, description, href], i) => `<article class="qr-card"><h3>${title}</h3><p>${description}</p><div class="qr-code" id="qr-${i}" aria-label="QR code for ${title}"></div><a href="${href.startsWith('http') ? href : '#resources'}" ${href.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''}>${href}</a></article>`).join('');
if (window.QRCode) qrItems.forEach((item, i) => new QRCode(document.querySelector(`#qr-${i}`), { text: item[2].startsWith('http') ? item[2] : data.links.poster, width: 110, height: 110, colorDark: '#062f29', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M }));

const menu = document.querySelector('.menu'), nav = document.querySelector('.nav');
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }));
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`)); }), { rootMargin: '-35% 0px -55%' });
document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
// End note: all displayed comparison values flow from data.js.
