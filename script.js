/* Portfolio Starter (Static)
   - Loads content.json
   - i18n (zh/en) + theme toggle
   - Featured projects (tags filter) + modal
   - Research Library: documents archive (year/month/category + search) + modal PDF preview
*/

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const state = {
  lang: 'zh',
  theme: 'light',
  data: null,
  projectFilter: 'all',
  docFilter: { year: 'all', month: 'all', category: 'all', q: '' },
};

function el(tag, attrs={}, children=[]){
  const n = document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)){
    if(k === 'class') n.className = v;
    else if(k === 'dataset'){
      for(const [dk,dv] of Object.entries(v)) n.dataset[dk] = dv;
    } else if(k.startsWith('on') && typeof v === 'function'){
      n.addEventListener(k.slice(2), v);
    } else {
      n.setAttribute(k, v);
    }
  }
  for(const c of children){
    if(typeof c === 'string') n.appendChild(document.createTextNode(c));
    else if(c) n.appendChild(c);
  }
  return n;
}

function t(path){
  const parts = path.split('.');
  let cur = state.data?.i18n?.[state.lang];
  for(const p of parts){
    if(cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
    else return '';
  }
  return (typeof cur === 'string') ? cur : '';
}

function applyI18n(){
  $$('[data-i18n]').forEach(node=>{
    const key = node.getAttribute('data-i18n');
    const v = t(key);
    if(v) node.textContent = v;
  });

  // placeholders for inputs
  const ph = state.data?.i18n?.[state.lang]?.research?.searchPlaceholder;
  if(ph) $('#docSearch').setAttribute('placeholder', ph);

  // Meta
  const meta = state.data?.i18n?.[state.lang]?.meta;
  if(meta?.title) document.title = meta.title;
  const desc = $('meta[name="description"]');
  if(meta?.description && desc) desc.setAttribute('content', meta.description);
}

function setTheme(theme){
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
}

function setLang(lang){
  state.lang = lang;
  document.documentElement.lang = (lang === 'zh') ? 'zh-CN' : 'en';
  localStorage.setItem('lang', lang);
  $('#langToggleText').textContent = (lang === 'zh') ? 'EN' : '中文';
  applyI18n();
  renderAll();
}

function formatYearMonth(ym){
  // ym: "YYYY-MM"
  const [y,m] = ym.split('-');
  if(state.lang === 'zh') return `${y}年${String(m).padStart(2,'0')}月`;
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mm = Math.max(1, Math.min(12, parseInt(m,10)));
  return `${monthNames[mm-1]} ${y}`;
}

function getDocUrl(d){
  return d.file || d.url || '';
}

function isPdf(url){
  return typeof url === 'string' && url.toLowerCase().includes('.pdf');
}

function openModal(html){
  $('#modalBody').innerHTML = '';
  $('#modalBody').appendChild(html);
  $('#modal').setAttribute('aria-hidden','false');
}
function closeModal(){
  $('#modal').setAttribute('aria-hidden','true');
}

function renderHero(){
  const profile = state.data.profile;
  const name = profile.name?.[state.lang] || profile.name?.zh || 'Lee';
  $('#brandName').textContent = name;
  $('#heroName').textContent = name;
  $('#footerName').textContent = name;

  $('#heroTitle').textContent = profile.headline?.[state.lang] || '';
  $('#heroLead').textContent = profile.lead?.[state.lang] || '';
  $('#oneLiner').textContent = profile.oneLiner?.[state.lang] || '';

  // Metrics
  const metricsWrap = $('#heroMetrics');
  metricsWrap.innerHTML = '';
  (profile.metrics || []).forEach(m=>{
    metricsWrap.appendChild(el('div',{class:'metric'},[
      el('strong',{},[m.value?.[state.lang] || m.value?.zh || '']),
      el('span',{},[m.label?.[state.lang] || m.label?.zh || ''])
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
      (state.lang === 'zh' ? s.label?.zh : s.label?.en) || s.label?.zh || ''
    ]));
  });

  // Resume links + email
  const resumePath = profile.resumePath || './assets/resume.pdf';
  $('#resumeCta').setAttribute('href', resumePath);
  $('#resumeSecondary').setAttribute('href', resumePath);
  $('.resume-frame iframe').setAttribute('src', resumePath);

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
    links.appendChild(el('a',{href:l.url, target: l.url.startsWith('mailto:') ? '_self' : '_blank', rel:'noopener'},[
      (state.lang === 'zh' ? l.label?.zh : l.label?.en) || l.label?.zh || ''
    ]));
  });
}

function renderAbout(){
  const about = state.data.about;
  $('#aboutSubtitle').textContent = about.subtitle?.[state.lang] || '';

  const ps = $('#aboutParagraphs');
  ps.innerHTML = '';
  (about.paragraphs?.[state.lang] || []).forEach(p=>{
    ps.appendChild(el('p',{},[p]));
  });

  const bullets = $('#aboutBullets');
  bullets.innerHTML = '';
  (about.bullets?.[state.lang] || []).forEach(b=>{
    bullets.appendChild(el('li',{},[b]));
  });

  const facts = $('#aboutFacts');
  facts.innerHTML = '';
  (about.quickFacts || []).forEach(f=>{
    facts.appendChild(el('div',{class:'fact'},[
      el('div',{class:'k'},[f.k?.[state.lang] || f.k?.zh || '']),
      el('div',{class:'v'},[f.v?.[state.lang] || f.v?.zh || ''])
    ]));
  });
}

function renderProjectTags(){
  const tags = new Set();
  (state.data.projects || []).forEach(p=>{
    (p.tags || []).forEach(t=>tags.add(t));
  });
  const wrap = $('#projectTags');
  wrap.innerHTML = '';
  Array.from(tags).sort().forEach(tag=>{
    wrap.appendChild(el('button',{class:'chip', dataset:{filter:tag}},[tag]));
  });
}

function setProjectFilter(filter){
  state.projectFilter = filter;
  $$('.filters [data-filter]').forEach(btn=>{
    btn.classList.toggle('chip-primary', btn.dataset.filter === filter);
  });
  renderProjects();
}

function projectMatches(p){
  if(state.projectFilter === 'all') return true;
  return (p.tags || []).includes(state.projectFilter);
}

function renderProjects(){
  const grid = $('#projectGrid');
  grid.innerHTML = '';

  (state.data.projects || []).filter(projectMatches).forEach(p=>{
    const title = p.title?.[state.lang] || p.title?.zh || '';
    const summary = p.summary?.[state.lang] || p.summary?.zh || '';
    const card = el('div',{class:'card'},[
      el('h3',{},[title]),
      el('p',{},[summary]),
      el('div',{class:'meta'}, (p.tags || []).map(tag=>el('span',{class:'tag'},[tag])) ),
      el('div',{style:'margin-top:12px;'},[
        el('button',{class:'btn btn-ghost', onClick:()=>openProject(p)},[
          el('span',{class:'btn-icon', 'aria-hidden':'true'},['↗']),
          el('span',{},[t('projects.view') || (state.lang==='zh'?'查看详情':'View')])
        ])
      ])
    ]);
    grid.appendChild(card);
  });
}

function openProject(p){
  const title = p.title?.[state.lang] || p.title?.zh || '';
  const desc = p.description?.[state.lang] || p.description?.zh || '';
  const role = p.role?.[state.lang] || p.role?.zh || '';
  const metrics = p.metrics?.[state.lang] || p.metrics?.zh || [];
  const stack = p.stack || [];
  const bullets = p.bullets?.[state.lang] || p.bullets?.zh || [];
  const links = p.links || {};

  const root = el('div',{},[
    el('h3',{},[title]),
    desc ? el('p',{},[desc]) : null,
    el('div',{class:'row'},[
      el('div',{class:'box'},[
        el('div',{class:'k'},[t('projects.role') || (state.lang==='zh'?'角色':'Role')]),
        el('div',{class:'v'},[role || '-'])
      ]),
      el('div',{class:'box'},[
        el('div',{class:'k'},[t('projects.stack') || 'Stack']),
        el('div',{class:'v'},[(stack.length ? stack.join(' · ') : '-')])
      ])
    ]),
    metrics.length ? el('div',{class:'box', style:'margin-top:12px;'},[
      el('div',{class:'k'},[t('projects.metrics') || (state.lang==='zh'?'结果/指标':'Metrics')]),
      el('div',{class:'v'},[el('ul',{}, metrics.map(m=>el('li',{},[m])))])
    ]) : null,
    bullets.length ? el('div',{class:'box', style:'margin-top:12px;'},[
      el('div',{class:'k'},[state.lang==='zh'?'关键动作':'Key actions']),
      el('div',{class:'v'},[el('ul',{}, bullets.map(b=>el('li',{},[b])))])
    ]) : null,
    el('div',{class:'links'},[
      links.case ? el('a',{class:'btn btn-primary', href:links.case, target:'_blank', rel:'noopener'},['Case']) : null,
      links.demo ? el('a',{class:'btn btn-ghost', href:links.demo, target:'_blank', rel:'noopener'},['Demo']) : null,
    ].filter(Boolean))
  ]);
  openModal(root);
}

function renderTimeline(){
  const wrap = $('#timeline');
  wrap.innerHTML = '';

  (state.data.experience || []).forEach(x=>{
    const title = x.title?.[state.lang] || x.title?.zh || '';
    const org = x.org?.[state.lang] || x.org?.zh || '';
    const time = x.time?.[state.lang] || x.time?.zh || '';
    const bullets = x.bullets?.[state.lang] || x.bullets?.zh || [];

    const item = el('div',{class:'titem'},[
      el('div',{class:'top'},[
        el('div',{},[
          el('div',{style:'font-weight:850;'},[title]),
          el('div',{class:'org'},[org]),
        ]),
        el('div',{class:'org'},[time])
      ]),
      el('ul',{}, bullets.map(b=>el('li',{},[b])))
    ]);
    wrap.appendChild(item);
  });
}

function renderSkills(){
  const grid = $('#skillsGrid');
  grid.innerHTML = '';

  (state.data.skills || []).forEach(s=>{
    const group = s.group?.[state.lang] || s.group?.zh || '';
    const items = s.items?.[state.lang] || s.items?.zh || [];
    const box = el('div',{class:'sgroup'},[
      el('div',{class:'title'},[group]),
      el('div',{class:'items'}, items.map(i=>el('span',{class:'tag'},[i])))
    ]);
    grid.appendChild(box);
  });
}

// --------- Research Library ---------

function parseDocDate(d){
  // Accept "YYYY-MM-DD" or "YYYY-MM"
  const s = (d || '').trim();
  if(!s) return { ym:'', y:'', m:'' };
  const ym = s.slice(0,7);
  const [y,m] = ym.split('-');
  return { ym, y, m };
}

function buildDocFilterOptions(docs){
  const years = new Set();
  const months = new Set(); // year-month
  const categories = new Set();

  docs.forEach(d=>{
    const { ym, y } = parseDocDate(d.date);
    if(y) years.add(y);
    if(ym) months.add(ym);
    if(d.category) categories.add(d.category);
  });

  const yearSel = $('#docYear');
  const monthSel = $('#docMonth');
  const catSel = $('#docCategory');

  yearSel.innerHTML = '';
  monthSel.innerHTML = '';
  catSel.innerHTML = '';

  yearSel.appendChild(el('option',{value:'all'},[t('research.filters.allYears') || (state.lang==='zh'?'全部年份':'All years')]));
  Array.from(years).sort((a,b)=>b.localeCompare(a)).forEach(y=>{
    yearSel.appendChild(el('option',{value:y},[y]));
  });

  monthSel.appendChild(el('option',{value:'all'},[t('research.filters.allMonths') || (state.lang==='zh'?'全部月份':'All months')]));
  Array.from(months).sort((a,b)=>b.localeCompare(a)).forEach(ym=>{
    monthSel.appendChild(el('option',{value:ym},[formatYearMonth(ym)]));
  });

  catSel.appendChild(el('option',{value:'all'},[t('research.filters.allCategories') || (state.lang==='zh'?'全部类别':'All categories')]));
  Array.from(categories).sort().forEach(c=>{
    catSel.appendChild(el('option',{value:c},[c]));
  });

  // Restore selection after rebuild
  yearSel.value = state.docFilter.year;
  monthSel.value = state.docFilter.month;
  catSel.value = state.docFilter.category;
}

function docMatches(d){
  const { ym, y } = parseDocDate(d.date);
  if(state.docFilter.year !== 'all' && y !== state.docFilter.year) return false;
  if(state.docFilter.month !== 'all' && ym !== state.docFilter.month) return false;
  if(state.docFilter.category !== 'all' && (d.category || '') !== state.docFilter.category) return false;

  const q = (state.docFilter.q || '').trim().toLowerCase();
  if(!q) return true;

  const hay = [
    d.title?.[state.lang], d.title?.zh, d.title?.en,
    d.summary?.[state.lang], d.summary?.zh, d.summary?.en,
    d.category,
    ...(d.tags || [])
  ].filter(Boolean).join(' ').toLowerCase();

  return hay.includes(q);
}

function groupDocs(docs){
  // group by year-month
  const map = new Map();
  docs.forEach(d=>{
    const { ym } = parseDocDate(d.date);
    const key = ym || 'unknown';
    if(!map.has(key)) map.set(key, []);
    map.get(key).push(d);
  });
  // sort groups by key desc
  const keys = Array.from(map.keys()).sort((a,b)=>b.localeCompare(a));
  return keys.map(k=>({ ym:k, items: map.get(k).sort((a,b)=>(b.date||'').localeCompare(a.date||'')) }));
}

function openDoc(d){
  const title = d.title?.[state.lang] || d.title?.zh || '';
  const summary = d.summary?.[state.lang] || d.summary?.zh || '';
  const url = getDocUrl(d);
  const tags = d.tags || [];
  const dateText = d.date || '';
  const category = d.category || '-';

  const root = el('div',{},[
    el('h3',{},[title]),
    el('p',{},[summary]),
    el('div',{class:'row'},[
      el('div',{class:'box'},[
        el('div',{class:'k'},[t('research.card.date') || (state.lang==='zh'?'日期':'Date')]),
        el('div',{class:'v'},[dateText])
      ]),
      el('div',{class:'box'},[
        el('div',{class:'k'},[t('research.card.category') || (state.lang==='zh'?'类别':'Category')]),
        el('div',{class:'v'},[category])
      ]),
    ]),
    tags.length ? el('div',{class:'box', style:'margin-top:12px;'},[
      el('div',{class:'k'},[t('research.card.tags') || 'Tags']),
      el('div',{class:'v'},[tags.join(' · ')])
    ]) : null,
    url ? el('div',{class:'links'},[
      el('a',{class:'btn btn-primary', href:url, target:'_blank', rel:'noopener'},[t('research.card.open') || (state.lang==='zh'?'打开':'Open')])
    ]) : null,
    (url && isPdf(url) && d.preview !== false) ? el('div',{class:'doc-preview'},[
      el('iframe',{title:'Document preview', src:url})
    ]) : null
  ].filter(Boolean));

  openModal(root);
}

function renderDocuments(){
  const wrap = $('#docGroups');
  wrap.innerHTML = '';
  const docs = (state.data.documents || []).filter(docMatches);

  if(!docs.length){
    wrap.appendChild(el('div',{class:'doc-empty'},[
      t('research.empty') || (state.lang==='zh'
        ? '暂无文档。你可以把 PDF 放到 assets/docs/YYYY/MM/ 下面，并在 content.json -> documents 里新增一条记录。'
        : 'No documents yet. Put PDFs under assets/docs/YYYY/MM/ and add entries to content.json -> documents.')
    ]));
    return;
  }

  const groups = groupDocs(docs);
  groups.forEach(g=>{
    const title = (g.ym === 'unknown') ? (state.lang==='zh'?'未设置日期':'No date') : formatYearMonth(g.ym);
    const groupEl = el('div',{class:'doc-group'},[
      el('div',{class:'doc-group-title'},[title]),
      el('div',{class:'doc-list'}, g.items.map(d=>{
        const dt = d.date || '';
        const category = d.category || '';
        const url = getDocUrl(d);
        const title = d.title?.[state.lang] || d.title?.zh || '';
        const summary = d.summary?.[state.lang] || d.summary?.zh || '';
        const tags = d.tags || [];

        const actions = [];
        actions.push(el('button',{onClick:()=>openDoc(d)},[t('research.card.preview') || (state.lang==='zh'?'预览':'Preview')]));
        if(url) actions.push(el('a',{href:url, target:'_blank', rel:'noopener'},[t('research.card.open') || (state.lang==='zh'?'打开':'Open')]));

        return el('div',{class:'doc-card'},[
          el('h3',{},[title]),
          el('div',{class:'doc-meta'},[
            dt ? el('span',{},[dt]) : null,
            category ? el('span',{},[category]) : null,
            tags.length ? el('span',{},[tags.slice(0,3).join(' · ') + (tags.length>3?'…':'')]) : null
          ].filter(Boolean)),
          summary ? el('div',{class:'doc-summary'},[summary]) : null,
          el('div',{class:'doc-actions'},actions)
        ].filter(Boolean));
      }))
    ]);
    wrap.appendChild(groupEl);
  });
}

function renderAll(){
  renderHero();
  renderAbout();
  renderProjects();
  renderTimeline();
  renderSkills();
  renderDocuments();
}

function bindUI(){
  // theme toggle
  $('#themeToggle').addEventListener('click', ()=>{
    setTheme(state.theme === 'light' ? 'dark' : 'light');
  });

  // language toggle
  $('#langToggle').addEventListener('click', ()=>{
    setLang(state.lang === 'zh' ? 'en' : 'zh');
  });

  // project filter chips
  $('.filters').addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-filter]');
    if(!btn) return;
    setProjectFilter(btn.dataset.filter);
  });

  // modal close
  $('#modal').addEventListener('click', (e)=>{
    if(e.target.dataset.close) closeModal();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeModal();
  });

  // copy email
  $('#copyEmailBtn').addEventListener('click', ()=>{
    const email = $('#copyEmailBtn').dataset.email || '';
    if(!email) return;
    navigator.clipboard.writeText(email).then(()=>{
      const old = $('#copyEmailBtn').textContent;
      $('#copyEmailBtn').textContent = (state.lang === 'zh') ? '已复制' : 'Copied';
      setTimeout(()=>$('#copyEmailBtn').textContent = old, 1000);
    });
  });

  // doc filters
  $('#docSearch').addEventListener('input', (e)=>{
    state.docFilter.q = e.target.value || '';
    renderDocuments();
  });
  $('#docYear').addEventListener('change', (e)=>{
    state.docFilter.year = e.target.value;
    // if year changes and month selected doesn't match year, reset month
    if(state.docFilter.month !== 'all' && !state.docFilter.month.startsWith(state.docFilter.year)) state.docFilter.month = 'all';
    renderDocuments();
  });
  $('#docMonth').addEventListener('change', (e)=>{
    state.docFilter.month = e.target.value;
    renderDocuments();
  });
  $('#docCategory').addEventListener('change', (e)=>{
    state.docFilter.category = e.target.value;
    renderDocuments();
  });
}

async function init(){
  const themeStored = localStorage.getItem('theme');
  setTheme(themeStored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  const langStored = localStorage.getItem('lang');

  // Load content.json
  const res = await fetch('./content.json');
  state.data = await res.json();
// Load documents library from documents.json (frequent updates live here)
state.data.documents = state.data.documents || [];

try {
  const docsRes = await fetch('./documents.json', { cache: 'no-store' });
  if (docsRes.ok) {
    const docs = await docsRes.json();
    if (Array.isArray(docs)) state.data.documents = docs;
  } else {
    console.warn('documents.json not found, fallback to content.json documents');
  }
} catch (e) {
  console.warn('documents.json load failed, fallback to content.json documents', e);
}

  // default language: stored -> browser -> zh
  const browserZh = (navigator.language || '').toLowerCase().startsWith('zh');
  const initLang = langStored || (browserZh ? 'zh' : 'en');
  state.lang = initLang; // set before options build
  applyI18n();

  // Build filters before render
  renderProjectTags();
  buildDocFilterOptions(state.data.documents || []);

  bindUI();

  // Year
  $('#year').textContent = String(new Date().getFullYear());

  setLang(initLang);
  setProjectFilter('all');
}

init().catch(err=>{
  console.error(err);
  document.body.innerHTML = '<div style="padding:24px;font-family:system-ui">Failed to load. Please run via a local server or host it.</div>';
});
