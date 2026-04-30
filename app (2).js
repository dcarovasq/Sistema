/* ============================================
   LIFE SYSTEM — app.js
   ============================================ */

// STORE
let store = JSON.parse(localStorage.getItem('life_v2')) || {
  aseo: { date: '', tasks: [] },
  trabajo: [],
  estudio: [],
  economia: { ingreso: 0, categorias: [
    { nombre: 'Ahorro', porcentaje: 20, color: '#34c759' },
    { nombre: 'Gastos fijos', porcentaje: 50, color: '#007aff' },
    { nombre: 'Personal', porcentaje: 30, color: '#ff9500' }
  ], pin: null, desbloqueado: false },
  food: [],
  gym: [],
  diario: {},
  streaks: { aseo: { lastDate: '', count: 0 } }
};

function save() { localStorage.setItem('life_v2', JSON.stringify(store)); }
function today() { return new Date().toISOString().split('T')[0]; }
function formatDate(d) {
  const date = d ? new Date(d + 'T12:00:00') : new Date();
  return date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
}
function formatCOP(n) { return '$' + (parseFloat(n)||0).toLocaleString('es-CO'); }


// NAV
const TITLES = { aseo:'Aseo', trabajo:'Trabajo', estudio:'Estudio', economia:'Economia', food:'Alimentacion', gym:'Gimnasio', diario:'Diario' };
let currentTab = 'aseo';

function nav(section) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === section));
  document.getElementById('topTitle').textContent = TITLES[section];
  currentTab = section;
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.className = 'main-content page-enter';
  const VIEWS = { aseo:viewAseo, trabajo:viewTrabajo, estudio:viewEstudio, economia:viewEconomia, food:viewFood, gym:viewGym, diario:viewDiario };
  VIEWS[section]();
  updateStreak();
}

function updateStreak() {
  const s = store.streaks.aseo;
  const el = document.getElementById('topStreak');
  el.textContent = s.count > 1 ? s.count + ' dias' : '';
}

function updateTopDate() {
  const el = document.getElementById('topDate');
  el.textContent = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric' });
}


// ASEO
function viewAseo() {
  if (store.aseo.date !== today()) {
    store.aseo.tasks.forEach(t => t.done = false);
    store.aseo.date = today();
    save();
  }
  const total = store.aseo.tasks.length;
  const done = store.aseo.tasks.filter(t => t.done).length;
  const pct = total > 0 ? Math.round((done/total)*100) : 0;
  let html = `<div class="card">
    <div class="card-header">
      <span class="card-title">Hoy</span>
      <span class="badge ${pct===100?'green':'blue'}">${done}/${total}</span>
    </div>
    <div class="progress-row">
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <span class="progress-text">${pct}%</span>
    </div>
  </div><div class="card">`;
  if (total === 0) {
    html += `<div class="empty-state">
      <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/></svg></div>
      <p class="empty-title">Sin rutinas</p><p class="empty-sub">Agrega tus habitos diarios</p></div>`;
  } else {
    store.aseo.tasks.forEach((t,i) => {
      html += `<div class="list-item ${t.done?'done':''}" onclick="toggleAseo(${i})">
        <div class="check-circle ${t.done?'checked':''}">
          <svg viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <span class="item-text">${t.text}</span>
        <button class="item-delete" onclick="event.stopPropagation();deleteAseo(${i})">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
        </button></div>`;
    });
  }
  html += `<div class="input-row">
    <input class="input-field" id="aseoInput" placeholder="Nueva rutina..." onkeydown="if(event.key==='Enter')addAseo()">
    <button class="input-btn" onclick="addAseo()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
  </div></div>`;
  if (pct===100 && total>0) {
    html += `<div class="card"><div style="padding:16px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">✓</div>
      <p style="font-weight:700;font-size:18px;margin:0 0 4px;">Todo listo</p>
      <p class="text-secondary text-sm">Rutina completada hoy</p></div></div>`;
    checkAseoStreak();
  }
  html += '<div class="scroll-pad"></div>';
  document.getElementById('app').innerHTML = html;
}
function addAseo() {
  const input = document.getElementById('aseoInput');
  const val = (input.value||'').trim();
  if (!val) return;
  store.aseo.tasks.push({text:val, done:false});
  save(); input.value=''; viewAseo();
}
function toggleAseo(i) { store.aseo.tasks[i].done=!store.aseo.tasks[i].done; save(); viewAseo(); }
function deleteAseo(i) { store.aseo.tasks.splice(i,1); save(); viewAseo(); }
function checkAseoStreak() {
  const s = store.streaks.aseo; const t = today();
  if (s.lastDate !== t) {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const yStr = yesterday.toISOString().split('T')[0];
    s.count = (s.lastDate===yStr) ? s.count+1 : 1;
    s.lastDate = t; save();
  }
}


// TRABAJO
function viewTrabajo() {
  const pending = store.trabajo.filter(t=>!t.done).length;
  let html = `<div class="card"><div class="card-header">
    <span class="card-title">Tareas</span>
    ${pending>0?`<span class="badge orange">${pending} pendiente${pending!==1?'s':''}</span>`:'<span class="badge green">Al dia</span>'}
  </div>`;
  if (store.trabajo.length===0) {
    html += `<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
      <p class="empty-title">Sin tareas</p><p class="empty-sub">Agrega lo que tienes pendiente</p></div>`;
  } else {
    const pendingTasks = store.trabajo.filter(t=>!t.done);
    const doneTasks = store.trabajo.filter(t=>t.done);
    [...pendingTasks,...doneTasks].forEach(t => {
      const i = store.trabajo.indexOf(t);
      html += `<div class="list-item ${t.done?'done':''}" onclick="toggleTrabajo(${i})">
        <div class="check-circle ${t.done?'checked':''}"><svg viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <span class="item-text">${t.text}</span>
        <button class="item-delete" onclick="event.stopPropagation();deleteTrabajo(${i})"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>
      </div>`;
    });
  }
  html += `<div class="input-row">
    <input class="input-field" id="trabajoInput" placeholder="Nueva tarea..." onkeydown="if(event.key==='Enter')addTrabajo()">
    <button class="input-btn" onclick="addTrabajo()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
  </div></div>`;
  if (store.trabajo.some(t=>t.done)) {
    html += `<button class="btn-secondary mt-8" onclick="clearTrabajo()">Limpiar completadas</button>`;
  }
  html += '<div class="scroll-pad"></div>';
  document.getElementById('app').innerHTML = html;
}
function addTrabajo() {
  const input = document.getElementById('trabajoInput');
  const val = (input.value||'').trim();
  if (!val) return;
  store.trabajo.push({text:val,done:false}); save(); input.value=''; viewTrabajo();
}
function toggleTrabajo(i) { store.trabajo[i].done=!store.trabajo[i].done; save(); viewTrabajo(); }
function deleteTrabajo(i) { store.trabajo.splice(i,1); save(); viewTrabajo(); }
function clearTrabajo() { store.trabajo=store.trabajo.filter(t=>!t.done); save(); viewTrabajo(); }


// ESTUDIO
function viewEstudio() {
  const now = new Date(); const year=now.getFullYear(); const month=now.getMonth();
  const monthNames=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dayNames=['D','L','M','M','J','V','S'];
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const todayNum=now.getDate();
  let html=`<div class="card"><div class="card-header">
    <span class="card-title">${monthNames[month]} ${year}</span>
    <button class="btn-sm blue" onclick="openEstudioModal()">+ Agregar</button>
  </div><div class="calendar-grid">`;
  dayNames.forEach(d=>{ html+=`<div class="cal-day-name">${d}</div>`; });
  for(let i=0;i<firstDay;i++) html+=`<div class="cal-day empty"></div>`;
  for(let d=1;d<=daysInMonth;d++) {
    const dateStr=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const hasEvent=store.estudio.some(e=>e.fecha===dateStr);
    const isToday=d===todayNum;
    html+=`<div class="cal-day ${isToday?'today':''} ${hasEvent?'has-event':''}" onclick="showDayEvents('${dateStr}')">${d}</div>`;
  }
  html+=`</div></div>`;
  const upcoming=store.estudio.filter(e=>e.fecha>=today()).sort((a,b)=>a.fecha.localeCompare(b.fecha));
  if(upcoming.length>0) {
    html+=`<div class="card"><div class="card-header"><span class="card-title">Proximos</span></div>`;
    upcoming.forEach(e=>{
      const realIdx=store.estudio.indexOf(e);
      const daysLeft=Math.ceil((new Date(e.fecha+'T12:00:00')-new Date())/86400000);
      const urgency=daysLeft<=2?'red':daysLeft<=7?'orange':'blue';
      html+=`<div class="list-item">
        <div style="flex:1"><div class="item-text" style="font-size:15px;">${e.texto}</div>
        <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px;">${formatDate(e.fecha)}</div></div>
        <span class="badge ${urgency}">${daysLeft<=0?'Hoy':daysLeft===1?'Manana':daysLeft+'d'}</span>
        <button class="item-delete" onclick="deleteEstudio(${realIdx})"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>
      </div>`;
    });
    html+=`</div>`;
  }
  html+='<div class="scroll-pad"></div>';
  document.getElementById('app').innerHTML=html;
}
function openEstudioModal() {
  openModal(`<p class="modal-title">Nueva fecha</p>
    <label class="form-label">Descripcion</label>
    <input class="form-input" id="mTexto" placeholder="Ej: Parcial de psicopatologia">
    <label class="form-label">Fecha</label>
    <input class="form-input" type="date" id="mFecha" value="${today()}">
    <button class="btn-primary mt-16" onclick="addEstudio()">Agregar</button>`);
}
function addEstudio() {
  const fecha=document.getElementById('mFecha').value;
  const texto=(document.getElementById('mTexto').value||'').trim();
  if(!fecha||!texto) return;
  store.estudio.push({fecha,texto}); save(); closeModal(); viewEstudio();
}
function deleteEstudio(i) { store.estudio.splice(i,1); save(); viewEstudio(); }
function showDayEvents(dateStr) {
  const events=store.estudio.filter(e=>e.fecha===dateStr);
  if(events.length===0) {
    openModal(`<p class="modal-title">Agregar al ${formatDate(dateStr)}</p>
      <label class="form-label">Descripcion</label>
      <input class="form-input" id="mTexto" placeholder="Ej: Parcial">
      <input type="hidden" id="mFecha" value="${dateStr}">
      <button class="btn-primary mt-16" onclick="addEstudio()">Agregar</button>`);
    return;
  }
  let body=`<p class="modal-title">${formatDate(dateStr)}</p>`;
  events.forEach(e=>{ body+=`<div class="card" style="margin-bottom:8px;padding:14px 16px;">${e.texto}</div>`; });
  openModal(body);
}


// ECONOMIA
let pinBuffer='';
function viewEconomia() {
  if(store.economia.pin && !store.economia.desbloqueado) { renderPinScreen(); return; }
  renderEco();
}
function renderPinScreen() {
  pinBuffer='';
  document.getElementById('app').innerHTML=`<div class="pin-screen">
    <div class="pin-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
    <p class="pin-title">Economia protegida</p>
    <div class="pin-dots" id="pinDots">
      <div class="pin-dot" id="pd0"></div><div class="pin-dot" id="pd1"></div>
      <div class="pin-dot" id="pd2"></div><div class="pin-dot" id="pd3"></div>
    </div>
    <div class="pin-pad">
      ${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="pin-key" onclick="pinPress('${n}')">${n}</button>`).join('')}
      <button class="pin-key empty"></button>
      <button class="pin-key" onclick="pinPress('0')">0</button>
      <button class="pin-key delete" onclick="pinDelete()"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg></button>
    </div></div>`;
}
function pinPress(digit) {
  if(pinBuffer.length>=4) return;
  pinBuffer+=digit;
  for(let i=0;i<4;i++){const dot=document.getElementById('pd'+i);if(dot)dot.classList.toggle('filled',i<pinBuffer.length);}
  if(pinBuffer.length===4) {
    setTimeout(()=>{
      if(pinBuffer===store.economia.pin){store.economia.desbloqueado=true;renderEco();}
      else {
        pinBuffer='';
        for(let i=0;i<4;i++){const dot=document.getElementById('pd'+i);if(dot){dot.classList.remove('filled');dot.style.borderColor='var(--red)';}}
        setTimeout(()=>{for(let i=0;i<4;i++){const dot=document.getElementById('pd'+i);if(dot)dot.style.borderColor='';}},800);
      }
    },100);
  }
}
function pinDelete() {
  pinBuffer=pinBuffer.slice(0,-1);
  for(let i=0;i<4;i++){const dot=document.getElementById('pd'+i);if(dot)dot.classList.toggle('filled',i<pinBuffer.length);}
}
function renderEco() {
  const eco=store.economia; const ingreso=parseFloat(eco.ingreso)||0;
  let html=`<div class="card"><div class="eco-summary">
    <div class="eco-total">${formatCOP(ingreso)}</div>
    <div class="eco-label">Ingreso total</div>
    <button class="btn-sm blue" onclick="openIngresoModal()">Editar ingreso</button>
  </div>
  <div class="eco-bar-container"><div class="eco-bar-segments">
    ${eco.categorias.map(c=>`<div class="eco-segment" style="width:${c.porcentaje}%;background:${c.color};"></div>`).join('')}
  </div></div>`;
  eco.categorias.forEach(c=>{
    html+=`<div class="eco-category">
      <div class="eco-color" style="background:${c.color};"></div>
      <span class="eco-cat-name">${c.nombre}</span>
      <div style="text-align:right;"><div class="eco-cat-amount">${formatCOP(ingreso*c.porcentaje/100)}</div>
      <div class="text-sm text-secondary">${c.porcentaje}%</div></div></div>`;
  });
  html+=`</div><div class="card"><div class="card-header"><span class="card-title">Categorias</span>
    <button class="btn-sm blue" onclick="openCatModal()">+ Agregar</button></div>`;
  eco.categorias.forEach((c,i)=>{
    html+=`<div class="list-item"><div class="eco-color" style="background:${c.color};width:12px;height:12px;border-radius:3px;flex-shrink:0;"></div>
      <span class="item-text">${c.nombre}</span><span class="item-meta">${c.porcentaje}%</span>
      <button class="item-delete" onclick="deleteCat(${i})"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button></div>`;
  });
  html+=`</div><div class="card"><div class="card-header"><span class="card-title">Seguridad</span></div>
    <div style="padding:12px 16px 16px;display:flex;flex-direction:column;gap:8px;">
      ${eco.pin?`<button class="btn-secondary" onclick="clearPin()">Quitar bloqueo</button><button class="btn-danger" onclick="lockEco()">Bloquear ahora</button>`:`<button class="btn-primary" onclick="openPinModal()">Activar PIN</button>`}
    </div></div><div class="scroll-pad"></div>`;
  document.getElementById('app').innerHTML=html;
}
function openIngresoModal() {
  openModal(`<p class="modal-title">Ingreso mensual</p>
    <label class="form-label">Monto en COP</label>
    <input class="form-input" type="number" id="mIngreso" value="${store.economia.ingreso}" placeholder="0">
    <button class="btn-primary mt-16" onclick="saveIngreso()">Guardar</button>`);
}
function saveIngreso() {
  store.economia.ingreso=parseFloat(document.getElementById('mIngreso').value)||0;
  save(); closeModal(); renderEco();
}
function openCatModal() {
  const colors=['#34c759','#007aff','#ff9500','#ff3b30','#af52de','#5ac8fa'];
  openModal(`<p class="modal-title">Nueva categoria</p>
    <label class="form-label">Nombre</label>
    <input class="form-input" id="mCatNombre" placeholder="Ej: Entretenimiento">
    <label class="form-label">Porcentaje</label>
    <input class="form-input" type="number" id="mCatPct" placeholder="10" min="1" max="100">
    <label class="form-label">Color</label>
    <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;">
      ${colors.map((c,i)=>`<div onclick="selectColor('${c}',this)" style="width:36px;height:36px;border-radius:50%;background:${c};cursor:pointer;border:3px solid ${i===0?'#000':'transparent'};" class="color-opt"></div>`).join('')}
    </div>
    <input type="hidden" id="mCatColor" value="${colors[0]}">
    <button class="btn-primary mt-16" onclick="addCat()">Agregar</button>`);
}
function selectColor(c,el) {
  document.querySelectorAll('.color-opt').forEach(e=>e.style.borderColor='transparent');
  el.style.borderColor='#000';
  document.getElementById('mCatColor').value=c;
}
function addCat() {
  const nombre=(document.getElementById('mCatNombre').value||'').trim();
  const pct=parseInt(document.getElementById('mCatPct').value)||10;
  const color=document.getElementById('mCatColor').value;
  if(!nombre) return;
  store.economia.categorias.push({nombre,porcentaje:pct,color}); save(); closeModal(); renderEco();
}
function deleteCat(i) { store.economia.categorias.splice(i,1); save(); renderEco(); }
let modalPinBuf='';
function openPinModal() {
  modalPinBuf='';
  openModal(`<p class="modal-title">Crear PIN de 4 digitos</p>
    <div class="pin-dots" id="mPinDots">
      <div class="pin-dot" id="mpd0"></div><div class="pin-dot" id="mpd1"></div>
      <div class="pin-dot" id="mpd2"></div><div class="pin-dot" id="mpd3"></div>
    </div>
    <div class="pin-pad" style="max-width:260px;margin:16px auto 0;">
      ${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="pin-key" onclick="modalPinPress('${n}')">${n}</button>`).join('')}
      <button class="pin-key empty"></button>
      <button class="pin-key" onclick="modalPinPress('0')">0</button>
      <button class="pin-key delete" onclick="modalPinDel()"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg></button>
    </div>`);
}
function modalPinPress(d) {
  if(modalPinBuf.length>=4) return; modalPinBuf+=d;
  for(let i=0;i<4;i++){const dot=document.getElementById('mpd'+i);if(dot)dot.classList.toggle('filled',i<modalPinBuf.length);}
  if(modalPinBuf.length===4) {
    setTimeout(()=>{store.economia.pin=modalPinBuf;store.economia.desbloqueado=true;save();modalPinBuf='';closeModal();renderEco();},200);
  }
}
function modalPinDel() {
  modalPinBuf=modalPinBuf.slice(0,-1);
  for(let i=0;i<4;i++){const dot=document.getElementById('mpd'+i);if(dot)dot.classList.toggle('filled',i<modalPinBuf.length);}
}
function clearPin() { store.economia.pin=null; store.economia.desbloqueado=false; save(); renderEco(); }
function lockEco() { store.economia.desbloqueado=false; save(); renderPinScreen(); }


// FOOD
const HEALTHY=['ensalada','fruta','verdura','pollo','pescado','agua','avena','huevo','yogur','arroz','legumbre','lenteja','garbanzo','espinaca','brocoli','zanahoria','manzana','platano','naranja','tomate','pepino','lechuga','atun','salmon','proteina','aguacate','quinoa','batata'];
const UNHEALTHY=['pizza','hamburguesa','gaseosa','fritada','papas fritas','dulce','dona','alcohol','cerveza','mayonesa','perro','salchicha','chorizo','empanada','helado','brownie','galleta','snack','azucar','mantequilla'];
function scoreFood(text) {
  const lower=text.toLowerCase(); let s=0;
  HEALTHY.forEach(w=>{if(lower.includes(w))s++;});
  UNHEALTHY.forEach(w=>{if(lower.includes(w))s--;});
  return s;
}
function scoreToBadge(s) {
  if(s>=2) return ['green','Saludable'];
  if(s===1) return ['blue','Aceptable'];
  if(s===0) return ['orange','Neutral'];
  return ['red','Cuidado'];
}
function viewFood() {
  const todayFood=store.food.filter(f=>f.date===today());
  const totalScore=todayFood.reduce((sum,f)=>sum+f.score,0);
  const pct=todayFood.length>0?Math.min(100,Math.max(0,((totalScore+todayFood.length)/(todayFood.length*2+todayFood.length))*100)):50;
  const [badgeClass,badgeText]=todayFood.length>0?scoreToBadge(totalScore):['blue','Sin registros'];
  const barColor=pct>60?'var(--green)':pct>30?'var(--orange)':'var(--red)';
  let html=`<div class="card"><div class="card-header">
    <span class="card-title">Balance hoy</span>
    <span class="badge ${badgeClass}">${badgeText}</span>
  </div>
  <div class="food-score-bar"><div class="food-score-fill" style="width:${pct}%;background:${barColor};"></div></div>
  <div class="food-score-text">${todayFood.length} comidas registradas hoy</div>
  <div style="padding:0 16px 14px;"><button class="btn-primary" onclick="openFoodModal()">+ Registrar comida</button></div></div>`;
  if(todayFood.length>0) {
    html+=`<div class="card"><div class="card-header"><span class="card-title">Hoy</span></div>`;
    const colors={green:'#34c759',blue:'#007aff',orange:'#ff9500',red:'#ff3b30'};
    todayFood.slice().reverse().forEach(f=>{
      const [bc]=scoreToBadge(f.score);
      html+=`<div class="food-item">
        <div class="food-dot" style="background:${colors[bc]};"></div>
        <div style="flex:1;"><div class="food-name">${f.name}</div>
        ${f.nota?`<div class="food-time">${f.nota}</div>`:''}</div>
        <span class="badge ${bc}" style="font-size:11px;">${f.tiempo}</span>
      </div>`;
    });
    html+=`</div>`;
  }
  const pastDays=[...new Set(store.food.map(f=>f.date))].filter(d=>d!==today()).sort().reverse().slice(0,5);
  if(pastDays.length>0) {
    html+=`<div class="card"><div class="card-header"><span class="card-title">Historial</span></div>`;
    pastDays.forEach(d=>{
      const dayFoods=store.food.filter(f=>f.date===d);
      const ds=dayFoods.reduce((sum,f)=>sum+f.score,0);
      const [bc,bt]=scoreToBadge(ds);
      html+=`<div class="list-item"><span class="item-text" style="font-size:14px;">${formatDate(d)}</span>
        <span class="badge ${bc}" style="font-size:11px;">${bt}</span></div>`;
    });
    html+=`</div>`;
  }
  html+='<div class="scroll-pad"></div>';
  document.getElementById('app').innerHTML=html;
}
function openFoodModal() {
  openModal(`<p class="modal-title">Registrar comida</p>
    <label class="form-label">Que comiste</label>
    <input class="form-input" id="mFoodName" placeholder="Ej: Arroz con pollo y ensalada">
    <label class="form-label">Momento del dia</label>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px;">
      <button class="btn-secondary" id="tDesayuno" onclick="selectTiempo('Desayuno')">Desayuno</button>
      <button class="btn-secondary" id="tAlmuerzo" onclick="selectTiempo('Almuerzo')">Almuerzo</button>
      <button class="btn-secondary" id="tCena" onclick="selectTiempo('Cena')">Cena</button>
      <button class="btn-secondary" id="tSnack" onclick="selectTiempo('Snack')">Snack</button>
    </div>
    <input type="hidden" id="mFoodTiempo" value="Almuerzo">
    <label class="form-label">Nota (opcional)</label>
    <input class="form-input" id="mFoodNota" placeholder="Ej: poca proteina">
    <button class="btn-primary mt-16" onclick="addFood()">Registrar</button>`);
  setTimeout(()=>selectTiempo('Almuerzo'),50);
}
function selectTiempo(t) {
  ['Desayuno','Almuerzo','Cena','Snack'].forEach(s=>{
    const btn=document.getElementById('t'+s);
    if(btn){btn.style.background=s===t?'var(--accent)':'';btn.style.color=s===t?'white':'';}
  });
  const hidden=document.getElementById('mFoodTiempo');
  if(hidden) hidden.value=t;
}
function addFood() {
  const name=(document.getElementById('mFoodName').value||'').trim();
  if(!name) return;
  const tiempo=document.getElementById('mFoodTiempo').value;
  const nota=(document.getElementById('mFoodNota').value||'').trim();
  store.food.push({name,tiempo,nota,score:scoreFood(name),date:today(),ts:Date.now()});
  save(); closeModal(); viewFood();
}


// GYM
const ROUTINE_STYLES=[
  {bg:'#e8f8ed',icon:'🦵'},{bg:'#e8f0fe',icon:'💪'},{bg:'#fff3e0',icon:'🏋️'},
  {bg:'#ffebe9',icon:'❤️'},{bg:'#f3eaff',icon:'🔵'},{bg:'#e6f9ff',icon:'🌊'},{bg:'#f5f5f0',icon:'⚡'}
];
function viewGym() {
  let html='';
  if(store.gym.length<7) {
    html+=`<div class="card" style="padding:14px 16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <span class="card-title">Mis rutinas</span>
        <span class="text-secondary text-sm">${store.gym.length}/7</span>
      </div>
      <button class="btn-primary" onclick="openRutinaModal()">+ Nueva rutina</button>
    </div>`;
  } else {
    html+=`<div class="card" style="padding:12px 16px;"><div style="display:flex;align-items:center;justify-content:space-between;">
      <span class="card-title">Mis rutinas</span><span class="badge orange">Maximo 7</span></div></div>`;
  }
  if(store.gym.length===0) {
    html+=`<div class="card"><div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg></div>
      <p class="empty-title">Sin rutinas</p><p class="empty-sub">Crea hasta 7 rutinas de entrenamiento</p></div></div>`;
  }
  store.gym.forEach((r,i)=>{
    const style=ROUTINE_STYLES[i%7];
    html+=`<div class="routine-card">
      <div class="routine-header" onclick="toggleRoutine(${i})">
        <div class="routine-dot" style="background:${style.bg};"><span style="font-size:20px;">${style.icon}</span></div>
        <span class="routine-name">${r.nombre}</span>
        <span style="font-size:12px;color:var(--text-tertiary);">${r.ejercicios.length} ejerc.</span>
        <button class="item-delete" onclick="event.stopPropagation();deleteRutina(${i})"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>
      </div>
      <div class="routine-exercises ${r.open?'open':''}">`;
    if(r.ejercicios.length===0) {
      html+=`<div style="padding:14px 16px;color:var(--text-tertiary);font-size:14px;">Sin ejercicios aun.</div>`;
    } else {
      r.ejercicios.forEach((ej,j)=>{
        html+=`<div class="exercise-row">
          <span class="exercise-name">${ej.nombre}</span>
          <div class="exercise-inputs">
            <div><input class="mini-input" type="number" value="${ej.series}" onchange="updateEj(${i},${j},'series',this.value)" placeholder="4"><span class="mini-label">Series</span></div>
            <div><input class="mini-input" type="number" value="${ej.reps}" onchange="updateEj(${i},${j},'reps',this.value)" placeholder="12"><span class="mini-label">Reps</span></div>
            <div><input class="mini-input" type="number" value="${ej.peso}" onchange="updateEj(${i},${j},'peso',this.value)" placeholder="0"><span class="mini-label">Kg</span></div>
          </div>
          <button class="item-delete" onclick="deleteEj(${i},${j})"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>`;
      });
    }
    html+=`<div class="inline-form">
      <input class="form-input" id="ejInput${i}" placeholder="Nombre del ejercicio..." onkeydown="if(event.key==='Enter')addEj(${i})">
      <button class="input-btn" onclick="addEj(${i})" style="flex-shrink:0;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
    </div></div></div>`;
  });
  html+='<div class="scroll-pad"></div>';
  document.getElementById('app').innerHTML=html;
}
function toggleRoutine(i) { store.gym[i].open=!store.gym[i].open; save(); viewGym(); }
function openRutinaModal() {
  openModal(`<p class="modal-title">Nueva rutina</p>
    <label class="form-label">Nombre</label>
    <input class="form-input" id="mRutinaNombre" placeholder="Ej: Pierna, Pecho, Espalda...">
    <button class="btn-primary mt-16" onclick="addRutina()">Crear rutina</button>`);
}
function addRutina() {
  const nombre=(document.getElementById('mRutinaNombre').value||'').trim();
  if(!nombre||store.gym.length>=7) return;
  store.gym.push({nombre,ejercicios:[],open:true}); save(); closeModal(); viewGym();
}
function deleteRutina(i) { store.gym.splice(i,1); save(); viewGym(); }
function addEj(i) {
  const input=document.getElementById('ejInput'+i);
  if(!input) return; const nombre=input.value.trim(); if(!nombre) return;
  store.gym[i].ejercicios.push({nombre,series:4,reps:12,peso:0}); save(); input.value=''; viewGym();
}
function updateEj(i,j,field,value) { store.gym[i].ejercicios[j][field]=parseFloat(value)||0; save(); }
function deleteEj(i,j) { store.gym[i].ejercicios.splice(j,1); save(); viewGym(); }

// DIARIO
function viewDiario() {
  const days=Object.keys(store.diario).sort().reverse();
  const todayEntry=store.diario[today()]||'';
  let html=`<div class="card"><div class="diary-header">
    <div class="diary-date">${formatDate()}</div></div>
    <textarea class="diary-textarea" id="diaryArea" placeholder="Como fue tu dia hoy...">${todayEntry}</textarea>
    <div style="padding:0 16px 14px;"><button class="btn-primary" onclick="saveDiary()">Guardar</button></div>
    <div class="diary-save-indicator" id="diaryIndicator">Guardado</div>
  </div>`;
  const pastDays=days.filter(d=>d!==today());
  if(pastDays.length>0) {
    html+=`<div class="card"><div class="card-header"><span class="card-title">Entradas anteriores</span></div>`;
    pastDays.slice(0,10).forEach(d=>{
      const entry=store.diario[d];
      const preview=entry.length>70?entry.slice(0,70)+'...':entry;
      html+=`<div class="list-item" onclick="openDiaryEntry('${d}')">
        <div style="flex:1;"><div style="font-size:13px;font-weight:600;margin-bottom:3px;">${formatDate(d)}</div>
        <div style="font-size:13px;color:var(--text-secondary);">${preview}</div></div>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-tertiary)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>`;
    });
    html+=`</div>`;
  }
  html+='<div class="scroll-pad"></div>';
  document.getElementById('app').innerHTML=html;
  const area=document.getElementById('diaryArea');
  if(area) {
    let saveTimer;
    area.addEventListener('input',()=>{
      clearTimeout(saveTimer);
      saveTimer=setTimeout(()=>{
        store.diario[today()]=area.value; save();
        const ind=document.getElementById('diaryIndicator');
        if(ind){ind.classList.add('show');setTimeout(()=>ind.classList.remove('show'),1500);}
      },800);
    });
  }
}
function saveDiary() {
  const area=document.getElementById('diaryArea');
  if(area){store.diario[today()]=area.value;save();}
  const ind=document.getElementById('diaryIndicator');
  if(ind){ind.classList.add('show');setTimeout(()=>ind.classList.remove('show'),1500);}
}
function openDiaryEntry(d) {
  openModal(`<p class="modal-title">${formatDate(d)}</p>
    <div style="font-size:15px;line-height:1.7;color:var(--text-primary);white-space:pre-wrap;">${store.diario[d]}</div>
    <button class="btn-danger mt-16" onclick="deleteDiary('${d}')">Eliminar entrada</button>`);
}
function deleteDiary(d) { delete store.diario[d]; save(); closeModal(); viewDiario(); }

// MODAL
function openModal(bodyHTML) {
  document.getElementById('modalBody').innerHTML=bodyHTML;
  document.getElementById('modalOverlay').classList.add('show');
  document.getElementById('modalSheet').classList.add('show');
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  document.getElementById('modalSheet').classList.remove('show');
  modalPinBuf='';
}

// INIT
updateTopDate();
nav('aseo');
