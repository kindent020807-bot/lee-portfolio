/* Lee Portfolio Starter - script.js
   - Renders content from content.json
   - Language toggle (zh/en)
   - Theme toggle (light/dark)
   - Project filtering + modal
*/

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const state = {
  lang: 'zh',
  theme: 'light',
  data: null,
  filter: 'all',
};

function setTheme(theme){
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
}

function setLang(lang){
  state.lang = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  localStorage.setItem('lang', lang);
  $('#langToggleText').textContent = (lang === 'zh') ? 'EN' : '中文';
  applyI18n();
  renderDynamic();
}

function t(path){
  // safe getter: t('hero.title')
  const parts = path.split('.');
  let cur = state.data?.i18n?.[state.lang];
  for(const p of parts){
    if(cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
    else return '';
  }
  return (typeof cur === 'string') ? cur : '';
}

function applyI18n(){
  $$('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    const value = t(key);
    if(value) el.textContent = value;
  });
  document.title = t('meta.title') || document.title;
  const desc = $('meta[name="description"]');
  if(desc && t('meta.description')) desc.setAttribute('content', t('meta.description'));
}

function el(tag, attrs={}, children=[]){
  const node = document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)){
    if(k === 'class') node.className = v;
    else if(k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if(k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v);
  }
  for(const c of children){
    if(typeof c === 'string') node.appendChild(document.createTextNode(c));
    else if(c) node.appendChild(c);
  }
  return node;
}

function renderHero(){
  const profile = state.data.profile;
  $('#brandName').textContent = profile.name[state.lang] || profile.name.zh || 'Lee';
  $('#heroName').textContent = profile.name[state.lang] || profile.name.zh || 'Lee';
  $('#footerName').textContent = profile.name[state.lang] || profile.name.zh || 'Lee';

  $('#heroTitle').textContent = profile.headline[state.lang] || '';
  $('#heroLead').textContent = profile.lead[state.lang] || '';

  $('#oneLiner').textContent = profile.oneLiner[state.lang] || '';

  // Metrics
  const metricsWrap = $('#heroMetrics');
  metricsWrap.innerHTML = '';
  (profile.metrics || []).forEach(m=>{
    metricsWrap.appendChild(el('div',{class:'metric'},[
      el('strong',{},[m.value[state.lang] || m.value.zh || '']),
      el('span',{},[m.label[state.lang] || m.label.zh || ''])
    ]));
  });

  // Highlights
  const hl = $('#highlights');
  hl.innerHTML = '';
  (profile.highlights?.[state.lang] || []).forEach(item=>{
    hl.appendChild(el('li',{},[item]));
  });

  // Social
  const social = $('#socialLinks');
  social.innerHTML = '';
  (profile.social || []).forEach(s=>{
    social.appendChild(el('a',{href:s.url, target:'_blank', rel:'noopener'},[
      (state.lang === 'zh' ? s.label.zh : s.label.en) || s.label.zh || ''
    ]));
  });

  // Resume links + email
  $('#resumeCta').setAttribute('href', profile.resumePath || './assets/resume.pdf');
  $('#resumeSecondary').setAttribute('href', profile.resumePath || './assets/resume.pdf');

  const email = profile.email || 'hello@example.com';
  $('#emailBtn').setAttribute('href', `mailto:${email}`);
  $('#copyEmailBtn').dataset.email = email;

  $('#contactTitle').textContent = profile.contactTitle?.[state.lang] || '';
  $('#contactText').textContent = profile.contactText?.[state.lang] || '';
  $('#contactMeta').textContent = profile.contactMeta?.[state.lang] || '';

  // Contact links
  const links = $('#contactLinks');
  links.innerHTML = '';
  (profile.contactLinks || []).forEach(l=>{
    links.appendChild(el('a',{href:l.url, target:'_blank', rel:'noopener'},[
      (state.lang === 'zh' ? l.label.zh : l.label.en) || l.label.zh || ''
    ]));
  });
}

function renderAbout(){
  const about = state.data.about;
  const body = $('#aboutBody');
  body.innerHTML = '';
  (about.paragraphs?.[state.lang] || []).forEach(p=>{
    body.appendChild(el('p',{},[p]));
  });
  if(about.bullets?.[state.lang]?.length){
    body.appendChild(el('ul',{}, (about.bullets[state.lang] || []).map(x=>el('li',{},[x])) ));
  }
  $('#aboutSubtitle').textContent = about.subtitle?.[state.lang] || '';

  const facts = $('#quickFacts');
  facts.innerHTML = '';
  (about.quickFacts || []).forEach(f=>{
    facts.appendChild(el('div',{},[
      el('dt',{},[f.k[state.lang] || f.k.zh || '']),
      el('dd',{},[f.v[state.lang] || f.v.zh || '']),
    ]));
  });
}

function uniqueTags(projects){
  const set = new Set();
  projects.forEach(p => (p.tags || []).forEach(t => set.add(t)));
  return Array.from(set).sort((a,b)=>a.localeCompare(b));
}

function renderProjectTags(){
  const tags = uniqueTags(state.data.projects);
  const wrap = $('#tagChips');
  wrap.innerHTML = '';
  tags.forEach(tag=>{
    const btn = el('button',{class:'chip', type:'button', 'data-filter': tag, onclick:()=>setFilter(tag)},[tag]);
    wrap.appendChild(btn);
  });
}

function setFilter(filter){
  state.filter = filter;
  // update chips
  $$('.chip').forEach(c=>{
    if(c.dataset.filter === filter) c.classList.add('is-active');
    else c.classList.remove('is-active');
  });
  renderProjects();
}

function projectCard(p){
  const title = p.title?.[state.lang] || p.title?.zh || '';
  const desc = p.summary?.[state.lang] || p.summary?.zh || '';
  const role = p.role?.[state.lang] || p.role?.zh || '';
  const badges = [
    ...(p.tags || []).map(tg=>el('span',{class:'badge'},[tg])),
    ...(role ? [el('span',{class:'badge'},[role])] : []),
  ];

  const open = ()=>openModal(p);

  const actions = [];
  if(p.links?.case){
    actions.push(el('a',{class:'btn btn-primary', href:p.links.case, target:'_blank', rel:'noopener'},[
      'Case Study'
    ]));
  }
  if(p.links?.demo){
    actions.push(el('a',{class:'btn btn-ghost', href:p.links.demo, target:'_blank', rel:'noopener'},[
      state.lang === 'zh' ? '演示' : 'Demo'
    ]));
  }
  actions.push(el('button',{class:'btn btn-ghost', type:'button', onclick:open},[
    state.lang === 'zh' ? '查看详情' : 'Details'
  ]));

  return el('article',{class:'card', role:'button', tabindex:'0', onclick:open, onkeydown:(e)=>{ if(e.key==='Enter' || e.key===' ') open(); }},[
    el('h3',{class:'card-title'},[title]),
    el('p',{class:'card-desc'},[desc]),
    el('div',{class:'card-meta'},badges),
    el('div',{class:'card-actions'},actions),
  ]);
}

function renderProjects(){
  const grid = $('#projectGrid');
  grid.innerHTML = '';
  const list = state.data.projects.filter(p=>{
    if(state.filter === 'all') return true;
    return (p.tags || []).includes(state.filter);
  });
  list.forEach(p=>grid.appendChild(projectCard(p)));
}

function openModal(p){
  const modal = $('#projectModal');
  const c = $('#modalContent');
  const title = p.title?.[state.lang] || p.title?.zh || '';
  const desc = p.description?.[state.lang] || p.description?.zh || '';
  const bullets = p.bullets?.[state.lang] || [];
  const stack = p.stack || [];
  const metrics = p.metrics?.[state.lang] || [];

  c.innerHTML = '';
  c.appendChild(el('h3',{},[title]));
  c.appendChild(el('p',{},[desc]));

  const metaRow = el('div',{class:'meta-row'},[
    ...(p.tags || []).map(tg=>el('span',{class:'badge'},[tg])),
    ...(stack || []).map(s=>el('span',{class:'badge'},[s])),
  ]);
  c.appendChild(metaRow);

  if(metrics?.length){
    c.appendChild(el('h4',{},[state.lang==='zh'?'结果 / 指标':'Impact / Metrics']));
    c.appendChild(el('ul',{}, metrics.map(x=>el('li',{},[x])) ));
  }

  if(bullets?.length){
    c.appendChild(el('h4',{},[state.lang==='zh'?'关键动作':'Key Moves']));
    c.appendChild(el('ul',{}, bullets.map(x=>el('li',{},[x])) ));
  }

  const links = [];
  if(p.links?.case) links.push(el('a',{class:'btn btn-primary', href:p.links.case, target:'_blank', rel:'noopener'},['Case Study']));
  if(p.links?.repo) links.push(el('a',{class:'btn btn-ghost', href:p.links.repo, target:'_blank', rel:'noopener'},['Repo']));
  if(p.links?.demo) links.push(el('a',{class:'btn btn-ghost', href:p.links.demo, target:'_blank', rel:'noopener'},[state.lang==='zh'?'演示':'Demo']));
  if(links.length){
    c.appendChild(el('div',{class:'card-actions'},links));
  }

  modal.showModal();
}

function renderTimeline(){
  const wrap = $('#timeline');
  wrap.innerHTML = '';
  (state.data.experience || []).forEach(item=>{
    const title = item.title?.[state.lang] || item.title?.zh || '';
    const org = item.org?.[state.lang] || item.org?.zh || '';
    const time = item.time?.[state.lang] || item.time?.zh || '';
    const bullets = item.bullets?.[state.lang] || [];
    const header = el('div',{class:'t-head'},[
      el('h3',{class:'t-title'},[`${title} · ${org}`]),
      el('div',{class:'t-time'},[time]),
    ]);
    const body = el('div',{class:'t-body'},[
      el('ul',{}, bullets.map(x=>el('li',{},[x])) )
    ]);
    wrap.appendChild(el('li',{class:'t-item'},[header, body]));
  });
}

function renderSkills(){
  const wrap = $('#skillGroups');
  wrap.innerHTML = '';
  (state.data.skills || []).forEach(g=>{
    const title = g.group?.[state.lang] || g.group?.zh || '';
    const items = g.items?.[state.lang] || [];
    wrap.appendChild(el('div',{class:'skill-group'},[
      el('h3',{},[title]),
      el('div',{class:'skill-list'}, items.map(x=>el('span',{class:'skill'},[x])) )
    ]));
  });
}

function renderDynamic(){
  renderHero();
  renderAbout();
  renderProjects();
  renderTimeline();
  renderSkills();
}

function bindUI(){
  // Theme
  $('#themeToggle').addEventListener('click', ()=>{
    const next = (state.theme === 'light') ? 'dark' : 'light';
    setTheme(next);
  });

  // Language
  $('#langToggle').addEventListener('click', ()=>{
    const next = (state.lang === 'zh') ? 'en' : 'zh';
    setLang(next);
  });

  // Filter chips
  $$('.chip').forEach(c=>{
    c.addEventListener('click', ()=>setFilter(c.dataset.filter));
  });

  // Modal
  $('#modalClose').addEventListener('click', ()=>$('#projectModal').close());
  $('#projectModal').addEventListener('click', (e)=>{
    const rect = $('#projectModal .modal-inner').getBoundingClientRect();
    const inside = (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom);
    if(!inside) $('#projectModal').close();
  });

  // Copy email
  $('#copyEmailBtn').addEventListener('click', async ()=>{
    const email = $('#copyEmailBtn').dataset.email || '';
    try{
      await navigator.clipboard.writeText(email);
      $('#copyEmailBtn').textContent = (state.lang === 'zh') ? '已复制' : 'Copied';
      setTimeout(()=>{ $('#copyEmailBtn').innerHTML = '<span class="btn-icon" aria-hidden="true">⧉</span><span>'+ (state.lang==='zh'?'复制邮箱':'Copy') +'</span>'; }, 1200);
    }catch{
      alert(email);
    }
  });
}

async function init(){
  const langStored = localStorage.getItem('lang');
  const themeStored = localStorage.getItem('theme');
  if(themeStored) setTheme(themeStored);

  const res = await fetch('./content.json', {cache:'no-store'});
  state.data = await res.json();

  // default language: stored -> browser -> zh
  const browserZh = (navigator.language || '').toLowerCase().startsWith('zh');
  const initLang = langStored || (browserZh ? 'zh' : 'en');
  setLang(initLang);

  renderProjectTags();
  bindUI();

  // Year
  $('#year').textContent = String(new Date().getFullYear());

  // Default filter chip highlight
  setFilter('all');
}

init().catch(err=>{
  console.error(err);
  document.body.innerHTML = '<div style="padding:24px;font-family:system-ui">Failed to load content.json. Please run via a local server (see README) or host it.</div>';
});
