// Simple dashboard logic — beginner friendly
const defaultData = {
  level: 1,
  xp: 0,
  streak: 0,
  achievements: [],
  skills: {maths:70, physics:70, ioc:70, oc:70, pc:70},
  lastSync: null
};

let state = {...defaultData};

// Utilities
function qsToState(qs){
  if(!qs) return {};
  const params = new URLSearchParams(qs.replace(/^\?/,''));
  const out = {};
  for(const [k,v] of params) out[k]=isNaN(v)?v:Number(v);
  return out;
}

function applyState(data){
  state = {...state,...data};
  // skills may be present
  if(data.maths!=null) state.skills.maths = data.maths;
  if(data.physics!=null) state.skills.physics = data.physics;
  if(data.ioc!=null) state.skills.ioc = data.ioc;
  if(data.oc!=null) state.skills.oc = data.oc;
  if(data.pc!=null) state.skills.pc = data.pc;
  renderAll();
}

function renderAll(){
  document.getElementById('level').textContent = state.level;
  const xpText = `${Math.round(state.xp)} / 100`;
  document.getElementById('xpText').textContent = xpText;
  const xpPercent = Math.min(100, Math.round((state.xp / 100) * 100));
  document.getElementById('xpFill').style.width = xpPercent + '%';
  document.getElementById('streak').textContent = state.streak;
  // achievements
  const achWrap = document.getElementById('achievements');
  achWrap.innerHTML = '';
  state.achievements.forEach(a=>{
    const el = document.createElement('div'); el.className='achievement'; el.textContent=a;
    achWrap.appendChild(el);
  });
  // mini bars
  const mini = document.getElementById('miniBars'); mini.innerHTML='';
  Object.entries(state.skills).forEach(([k,v])=>{
    const bar = document.createElement('div'); bar.className='mini-bar';
    const fill = document.createElement('div'); fill.className='fill'; fill.style.width = (v)+'%';
    // colour ramp for fill
    fill.style.background = scoreToColor(v);
    bar.appendChild(fill);
    mini.appendChild(bar);
  });
  // skills list
  const skillsList = document.getElementById('skillsList'); skillsList.innerHTML='';
  Object.entries(state.skills).forEach(([k,v])=>{
    const item = document.createElement('div'); item.className='skill-item';
    item.innerHTML = `<div class="skill-left"><div class="skill-name">${k.toUpperCase()}</div></div>
      <div style="width:50%"><div class="skill-progress"><div class="skill-fill" style="width:${v}% ; background:${scoreToColor(v)}"></div></div></div>
      <div style="width:60px;text-align:right">${v}</div>`;
    skillsList.appendChild(item);
  });
  // last sync
  document.getElementById('lastSync').textContent = 'Last sync: ' + (state.lastSync ? new Date(state.lastSync).toLocaleString() : '—');
  // iframe reload to refresh radar (if needed)
  // document.getElementById('radarFrame').contentWindow.location.reload();
}

function scoreToColor(score){
  // same logic: blue -> red -> gold -> fire
  if(score <= 40){
    const t = score/40;
    const r = 0;
    const g = Math.round(208*(1-t));
    const b = 255;
    return `rgb(${r},${g},${b})`;
  } else if(score <= 70){
    const t = (score-40)/30;
    const r = 255;
    const g = Math.round(0*(1-t)+69*t);
    const b = 0;
    return `rgb(${r},${g},${b})`;
  } else if(score <= 89){
    const t = (score-71)/18;
    const r = 255;
    const g = Math.round(215*(1-t)+140*t);
    const b = 0;
    return `rgb(${r},${g},${b})`;
  } else {
    const t = (score-90)/10;
    const r = 255;
    const g = Math.round(250*(1-t)+140*t);
    const b = 0;
    return `rgb(${r},${g},${b})`;
  }
}

// Load initial data: try status.json, else use query string, else default
async function loadStatus(){
  try{
    const res = await fetch('assets/status.json', {cache:'no-store'});
    if(res.ok){
      const j = await res.json();
      applyState(j);
      return;
    }
  }catch(e){/* ignore */}
  // Try query string
  const qs = location.search;
  const parsed = qsToState(qs);
  if(Object.keys(parsed).length>0){
    applyState(parsed);
    return;
  }
  applyState(state);
}

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', ()=>{
  document.body.classList.toggle('light');
  document.body.classList.toggle('dark');
});

// Tabs
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.tab;
    document.querySelectorAll('.tabcontent').forEach(s=> s.removeAttribute('data-visible'), s.setAttribute('aria-hidden','true'));
    const el = document.getElementById(target);
    el.setAttribute('data-visible','');
    el.removeAttribute('aria-hidden');
    // small transition
  });
});

// Refresh button (reload status)
document.getElementById('refreshBtn').addEventListener('click', ()=> loadStatus());

// Example export CSV (simple)
document.getElementById('exportCSV').addEventListener('click', ()=>{
  const rows = [
    ['level','xp','streak','maths','physics','ioc','oc','pc'],
    [state.level,state.xp,state.streak,state.skills.maths,state.skills.physics,state.skills.ioc,state.skills.oc,state.skills.pc]
  ];
  const csv = rows.map(r=>r.join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='midnight-status.csv'; document.body.appendChild(a); a.click(); a.remove();
});

// On load
loadStatus();
