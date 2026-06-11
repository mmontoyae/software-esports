/* =====================================================================
   🧠 APP — LÓGICA PRINCIPAL
   ---------------------------------------------------------------------
   Dibuja TODA la página a partir de los datos (JUEGOS, REGLAMENTO,
   PREMIOS, TORNEO, STREAMS). Tú normalmente NO necesitas tocar esto:
   edita los juegos/reglas/precios en la hoja de Google Sheets o, como
   respaldo, en js/datos-locales.js
   ===================================================================== */

const $  = id => document.getElementById(id);
const wa = n  => `https://wa.me/${CONFIG.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(n)}`;
// Escapa texto para insertarlo en HTML de forma segura (los datos vienen de la hoja)
const esc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// Juegos visibles (activo:true). Es la fuente de verdad de toda la web.
const juegosActivos = () => JUEGOS.filter(j => j && j.activo !== false);
const juegoPorId    = id => JUEGOS.find(j => j.id === id);

// Convierte un color escrito en la hoja (cyan / magenta / #f9a826…) a CSS válido
function colorCss(c){
  c = (c||'').trim();
  const named = {cyan:'var(--cyan)',magenta:'var(--magenta)',violet:'var(--violet)',
                 gold:'var(--gold)',silver:'var(--silver)',bronze:'var(--bronze)',
                 azul:'var(--cyan)',rosa:'var(--magenta)',morado:'var(--violet)'};
  if(named[c.toLowerCase()]) return named[c.toLowerCase()];
  if(/^#[0-9a-fA-F]{3,8}$/.test(c)) return c;
  if(/^var\(--[\w-]+\)$/.test(c))   return c;
  return 'var(--cyan)';
}

/* Si una imagen de juego no carga, se reemplaza por su emoji (respaldo) */
window.imgFallbackCover = function(img){
  const d = document.createElement('div');
  d.className = 'ico';
  d.textContent = img.dataset.emoji || '🎮';
  const card = img.closest('.game'); if(card) card.classList.remove('has-img');
  img.replaceWith(d);
};
window.imgFallbackPill = function(img){
  const s = document.createElement('span');
  s.textContent = img.dataset.emoji || '🎮';
  img.replaceWith(s);
};

/* ---------- RENDER: HERO (pastillas de juegos) ---------- */
function renderHeroPills(){
  $('hero-pills').innerHTML = juegosActivos()
    .map(j => {
      const ico = j.imagen
        ? `<img class="pill-img" src="${esc(j.imagen)}" alt="" data-emoji="${esc(j.icono)}" onerror="imgFallbackPill(this)">`
        : esc(j.icono);
      return `<span class="pill">${ico} <b>${esc(j.nombre)}</b></span>`;
    }).join('');
}

/* ---------- RENDER: tarjetas de juegos ---------- */
function renderGamesGrid(){
  $('games-grid').innerHTML = juegosActivos().map(j => {
    const media = j.imagen
      ? `<img class="cover" src="${esc(j.imagen)}" alt="${esc(j.nombre)}" loading="lazy" data-emoji="${esc(j.icono)}" onerror="imgFallbackCover(this)">`
      : `<div class="ico">${esc(j.icono)}</div>`;
    return `
    <div class="game reveal${j.imagen ? ' has-img' : ''}" style="--c:${colorCss(j.color)}">
      ${media}
      <h3>${esc(j.nombre)}</h3>
      <p>${esc(j.descripcion)}</p>
      <span class="mode">${esc(j.modo)}</span>
    </div>`;
  }).join('');
}

/* ---------- RENDER: selector de juego en la inscripción + precio ---------- */
/* ---------- RENDER: selector de juego en la inscripción + precio ---------- */
function renderSelectJuegos(){
  const sel = $('sel-juego');
  const prev = sel.value;
  sel.innerHTML = `<option value="">Selecciona…</option>` +
    juegosActivos().map(j => `<option value="${esc(j.id)}">${esc(j.nombre)}</option>`).join('');
  if([...sel.options].some(o => o.value === prev)) sel.value = prev;  // conserva la selección
  actualizarPrecio();
}
function costoSeleccion(){
  const j = juegoPorId($('sel-juego').value);
  return (j && Number(j.costo) > 0) ? Number(j.costo) : CONFIG.precioPorJugador;
}
function actualizarPrecio(){
  const juegoSeleccionado = $('sel-juego').value;
  // CONTROL DE RESPALDO: Si no hay juego seleccionado, muestra $... y detiene el proceso
  if (!juegoSeleccionado) {
    $('precio-jugador').textContent = '$...';
    $('total-ui').textContent = '$0';
    return; 
  }
  $('precio-jugador').textContent = '$' + costoSeleccion();
  // Autocompleta el nº de jugadores sugerido del juego (si el usuario no lo cambió a mano)
  const j = juegoPorId(juegoSeleccionado);
  const inp = $('jugadores');
  if(j && Number(j.jugadores) > 0 && !inp.dataset.tocado) inp.value = j.jugadores;
  calcTotal();
}
function calcTotal(){
  // Si no hay juego seleccionado, el total siempre debe ser $0
  if (!$('sel-juego').value) {
    $('total-ui').textContent = '$0';
    return;
  }
  const n = Math.max(0, parseInt($('jugadores').value) || 0);
  $('total-ui').textContent = '$' + (n * costoSeleccion());
}

/* ---------- RENDER: PREMIOS (pestañas + podio) ---------- */
let prizeActivo = null;
function renderPrizeTabs(){
  const juegos = juegosActivos();
  if(!juegos.length){ $('prize-tabs').innerHTML=''; $('prize-podium').innerHTML=''; return; }
  if(!juegos.some(j => j.id === prizeActivo)) prizeActivo = juegos[0].id;
  $('prize-tabs').innerHTML = juegos.map(j =>
    `<button data-game="${esc(j.id)}" class="${j.id===prizeActivo?'active':''}">${esc(j.nombre)}</button>`).join('');
  $('prize-tabs').querySelectorAll('button').forEach(b =>
    b.onclick = () => { prizeActivo = b.dataset.game; renderPrizeTabs(); });
  renderPrizes(prizeActivo);
}
function renderPrizes(game){
  const p = PREMIOS[game] || {oro:'$',plata:'$',bronce:'$'};
  $('prize-podium').innerHTML = `
    <div class="pod silver"><div class="medal">🥈</div><div class="place">2.º Lugar</div><div class="prize">${esc(p.plata)}</div></div>
    <div class="pod gold"><div class="medal">🥇</div><div class="place">1.º Lugar</div><div class="prize">${esc(p.oro)}</div></div>
    <div class="pod bronze"><div class="medal">🥉</div><div class="place">3.º Lugar</div><div class="prize">${esc(p.bronce)}</div></div>`;
}

/* ---------- RENDER: RESULTADOS (pestañas + campeones + tabla) ---------- */
let resultActivo = null;
function renderResultTabs(){
  const juegos = juegosActivos();
  if(!juegos.length){ $('result-tabs').innerHTML=''; $('champs').innerHTML=''; $('standings-body').innerHTML=''; return; }
  if(!juegos.some(j => j.id === resultActivo)) resultActivo = juegos[0].id;
  $('result-tabs').innerHTML = juegos.map(j =>
    `<button data-game="${esc(j.id)}" class="${j.id===resultActivo?'active':''}">${esc(j.nombre)}</button>`).join('');
  $('result-tabs').querySelectorAll('button').forEach(b =>
    b.onclick = () => { resultActivo = b.dataset.game; renderResultTabs(); });
  renderResultados(resultActivo);
}
function renderResultados(game){
  const d = TORNEO[game] || {ganadores:["Por definir","Por definir","Por definir"], posiciones:[]};
  const g = d.ganadores || ["Por definir","Por definir","Por definir"];
  $('champs').innerHTML = `
    <div class="champ g2"><div class="m">🥈</div><div class="p">2.º</div><div class="team">${esc(g[1])}</div></div>
    <div class="champ g1"><div class="m">🥇</div><div class="p">Campeón</div><div class="team">${esc(g[0])}</div></div>
    <div class="champ g3"><div class="m">🥉</div><div class="p">3.º</div><div class="team">${esc(g[2])}</div></div>`;
  const rows = [...(d.posiciones || [])].sort((a,b) => b.pts - a.pts);
  $('standings-body').innerHTML = rows.map((r,i) =>
    `<tr><td>${i+1}</td><td>${esc(r.equipo)}</td><td>${esc(r.pj)}</td><td>${esc(r.pts)}</td></tr>`).join('');
  // Indicador "Ronda X en juego" (la ronda en curso = mayor nº de rondas jugadas)
  const elRonda = $('ronda-actual');
  if(elRonda){
    const ronda = rows.reduce((m,r) => Math.max(m, Number(r.pj) || 0), 0);
    elRonda.innerHTML = ronda ? `<span class="ronda-pill-in">🔴 Ronda ${ronda} en juego</span>` : '';
  }
}

/* ---------- RENDER: REGLAMENTO (pestañas + tarjetas) ---------- */
let rulesActivo = 'General';
function renderRulesTabs(){
  const claves = ['General', ...juegosActivos().map(j => j.id)];
  if(!claves.includes(rulesActivo)) rulesActivo = 'General';
  $('rules-tabs').innerHTML = claves.map(k => {
    const label = (k === 'General') ? 'General' : ((juegoPorId(k) && juegoPorId(k).nombre) || k);
    return `<button data-key="${esc(k)}" class="${k===rulesActivo?'active':''}">${esc(label)}</button>`;
  }).join('');
  $('rules-tabs').querySelectorAll('button').forEach(b =>
    b.onclick = () => { rulesActivo = b.dataset.key; renderRulesTabs(); });
  renderRules(rulesActivo);
}
function renderRules(key){
  const cards = REGLAMENTO[key] || [];
  $('rules-panes').innerHTML = `<div class="tabpane show"><div class="rules">${
    cards.map(c => `<div class="rule"><h3>${esc(c.titulo)}</h3><ul>${
      (c.reglas || []).map(r => `<li>${esc(r)}</li>`).join('')
    }</ul></div>`).join('')
  }</div></div>`;
}

/* ---------- RENDER: TRANSMISIONES (2 pantallas Twitch) ---------- */
function renderStreams(streams){
  streams = streams || [];
  const parent = location.hostname || "localhost";
  const frames = [$('live-frame-1'), $('live-frame-2')];
  const links  = [$('twitch-link-1'), $('twitch-link-2')];
  const titles = document.querySelectorAll('#envivo .stream-title');
  frames.forEach((frame, i) => {
    const s = streams[i];
    if(!frame) return;
    if(titles[i] && s && s.juego) titles[i].textContent = s.juego;
    if(s && s.canal){
      frame.innerHTML = `<iframe src="https://player.twitch.tv/?channel=${encodeURIComponent(s.canal)}&parent=${parent}&autoplay=false" allowfullscreen></iframe>`;
      links[i].href = `https://twitch.tv/${s.canal}`;
      links[i].textContent = 'Ver en Twitch ↗';
    }else{
      frame.innerHTML = `<div class="live-off"><div style="font-size:2.4rem">📡</div><p style="margin-top:10px">Transmisión próximamente</p></div>`;
      links[i].href = CONFIG.discord;
      links[i].textContent = 'Avisos en Discord ↗';
    }
  });
}
window.renderStreams = renderStreams; // lo usa sheets.js

/* ---------- Animación al hacer scroll (.reveal) ---------- */
let _io;
function observeReveals(){
  // Si el navegador no soporta IntersectionObserver, mostramos todo directo.
  if(typeof IntersectionObserver === 'undefined'){
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    return;
  }
  if(!_io){
    _io = new IntersectionObserver(es => es.forEach(en => {
      if(en.isIntersecting){ en.target.classList.add('in'); _io.unobserve(en.target); }
    }), {threshold:.12});
  }
  let i = 0;
  document.querySelectorAll('.reveal').forEach(el => {
    if(el.dataset.obs) return;
    el.dataset.obs = '1';
    el.style.transitionDelay = (i++ % 4 * 70) + 'ms';
    _io.observe(el);
  });
}

/* Red de seguridad: si por cualquier motivo el observer no activa los
   elementos (error, navegador raro, etc.), los mostramos igual tras un
   instante. Así el contenido NUNCA queda invisible. */
function revealFallback(){
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in'));
  }, 1500);
}

/* ---------- Redibuja TODO lo que depende de los datos ---------- */
function renderTodo(){
  renderHeroPills();
  renderGamesGrid();
  renderSelectJuegos();
  renderPrizeTabs();
  renderResultTabs();
  renderRulesTabs();
  observeReveals();
}
window.renderTodo = renderTodo; // lo usa sheets.js tras leer la hoja

/* ===================================================================== */
/* INICIALIZACIÓN (eventos y partes fijas)                                */
/* ===================================================================== */
function init(){
  // 1) LO PRIMERO: dibujar el contenido y hacerlo visible.
  //    Si algo de abajo falla, la página igual se ve.
  try { renderTodo(); renderStreams(STREAMS); }
  catch(e){ console.error('Error al dibujar el contenido:', e); }
  revealFallback();

  // 2) Enlaces y eventos. Protegido: un fallo aquí NO deja la página en blanco.
  try {
  // Enlaces de comunidad / redes / PDF
  $('link-discord').href  = CONFIG.discord;
  $('link-whatsapp').href = wa("¡Hola! Quiero información sobre el torneo Software E-Sports 2026 🎮");
  const pdfBtn = $('reglamento-pdf');
  if(CONFIG.reglamentoPDF){ pdfBtn.href = CONFIG.reglamentoPDF; pdfBtn.target = "_blank"; }
  else { pdfBtn.style.display = "none"; }

  const socialDefs = [
    {icon:'🎧',title:'Discord',  url:CONFIG.discord},
    {icon:'💬',title:'WhatsApp', url:wa("¡Hola! Quiero información sobre el torneo Software E-Sports 2026 🎮")},
    {icon:'📸',title:'Instagram',url:CONFIG.instagram},
    {icon:'🎵',title:'TikTok',   url:CONFIG.tiktok},
    {icon:'▶️',title:'YouTube',  url:CONFIG.youtube}
  ];
  $('socials').innerHTML = socialDefs.filter(s => s.url)
    .map(s => `<a href="${s.url}" title="${s.title}" target="_blank" rel="noopener">${s.icon}</a>`).join('')
    + '<a href="#inscripcion" title="Inscribirse">⚡</a>';

  // Fecha / cuenta regresiva
  (function(){
    const zona = $('fecha-zona');
    if(!CONFIG.fechaTorneo){
      zona.innerHTML = '<div class="date-badge">📅 Fecha de inicio del torneo: <b>27/06/2026</b> — síguenos en Discord</div>';
      return;
    }
    zona.innerHTML = '<div class="count"><div class="box"><div class="n" id="cd-d">--</div><div class="l">Días</div></div><div class="box"><div class="n" id="cd-h">--</div><div class="l">Horas</div></div><div class="box"><div class="n" id="cd-m">--</div><div class="l">Min</div></div><div class="box"><div class="n" id="cd-s">--</div><div class="l">Seg</div></div></div>';
    const target = new Date(CONFIG.fechaTorneo).getTime();
    function tick(){
      const d = target - Date.now();
      if(isNaN(target) || d < 0){ zona.innerHTML = '<div class="date-badge">🔴 <b>¡El torneo ya comenzó!</b> Mira el directo en la pestaña En vivo.</div>'; return; }
      $('cd-d').textContent = Math.floor(d/864e5);
      $('cd-h').textContent = String(Math.floor(d%864e5/36e5)).padStart(2,'0');
      $('cd-m').textContent = String(Math.floor(d%36e5/6e4)).padStart(2,'0');
      $('cd-s').textContent = String(Math.floor(d%6e4/1e3)).padStart(2,'0');
    }
    setInterval(tick,1000); tick();
  })();

  // Menú móvil
  const burger = $('burger'), menu = $('menu');
  burger.onclick = () => menu.classList.toggle('open');
  menu.querySelectorAll('a').forEach(a => a.onclick = () => menu.classList.remove('open'));

  // Inscripción: precio dinámico por juego
  $('sel-juego').addEventListener('change', actualizarPrecio);
  $('jugadores').addEventListener('input', () => { $('jugadores').dataset.tocado = '1'; calcTotal(); });

  // Formulario → WhatsApp (con costo del juego elegido)
  $('form').addEventListener('submit', function(e){
    e.preventDefault();
    const f = new FormData(this);
    const n = parseInt(f.get('jugadores')) || 0;
    const costo = costoSeleccion();
    const total = n * costo;
    const msg = `🎮 *INSCRIPCIÓN — SOFTWARE E-SPORTS 2026*
━━━━━━━━━━━━━━━━━
🏷️ *Equipo:* ${f.get('equipo')}
🕹️ *Juego:* ${f.get('juego')}
👥 *Jugadores:* ${n}
👤 *Capitán:* ${f.get('capitan')}
📱 *WhatsApp:* ${f.get('telefono')}
🧑‍🤝‍🧑 *Integrantes:* ${f.get('integrantes')}
📝 *Comentario:* ${f.get('comentario') || '—'}
━━━━━━━━━━━━━━━━━
💳 *Total a pagar:* $${total} (${n} × $${costo})
Quedo atento(a) para coordinar el pago ✅`;
    toast('Abriendo WhatsApp… ¡envía el mensaje para confirmar! ✅');
    setTimeout(() => window.open(wa(msg), '_blank'), 700);
  });

  // Donaciones
  let donAmt = '';
  const amounts = $('amounts');
  amounts.querySelectorAll('button').forEach(b => b.onclick = () => {
    amounts.querySelectorAll('button').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); donAmt = b.dataset.amt;
    $('donate-note').textContent = donAmt
      ? `Donarás $${donAmt}. Al pulsar "Donar ahora" abrimos WhatsApp para coordinarlo.`
      : 'Indica el monto al organizador por WhatsApp.';
  });
  $('link-donate').addEventListener('click', function(e){
    e.preventDefault();
    const num = (CONFIG.donacionWhatsapp || CONFIG.whatsapp).replace(/\D/g,'');
    const monto = donAmt ? `$${donAmt}` : 'una cantidad';
    const msg = `💖 ¡Hola! Quiero hacer una donación de ${monto} para apoyar el torneo Software E-Sports 2026. ¿Cómo puedo realizar el pago?`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  });
  } catch(e){ console.error('Error al enlazar eventos (el contenido sí se muestra):', e); }

  // 3) Intenta leer Google Sheets (si está configurado). Está en sheets.js
  try { if(typeof cargarGoogleSheets === 'function') cargarGoogleSheets(); }
  catch(e){ console.error('Error al leer Google Sheets:', e); }
}

// Aviso flotante (toast)
function toast(m){ const t=$('toast'); t.textContent=m; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3800); }

// Arranque
document.addEventListener('DOMContentLoaded', init);
