/* =====================================================================
   PANEL DE STAFF — lógica (puntajes por ronda)
   ---------------------------------------------------------------------
   • Registra el puntaje de cada equipo/jugador POR RONDA.
   • El TOTAL se suma solo. Al guardar, el Apps Script escribe la pestaña
     "Rondas" y recalcula "Posiciones" (Pts = suma, PJ = rondas jugadas).
   • La contraseña se verifica en el servidor (Apps Script).
   • Sin appsScriptURL → MODO DEMO (no guarda).
   ===================================================================== */
(function(){
  const $ = id => document.getElementById(id);
  const URL_API = (typeof CONFIG !== 'undefined' && CONFIG.appsScriptURL ? CONFIG.appsScriptURL : '').trim();
  const DEMO = !URL_API;

  let pass = '';
  let datos = { juegos: [], rondas: {}, ganadores: {} };
  let juegoActual = '';

  // Datos de ejemplo (modo demo)
  const DEMO_DATOS = {
    juegos: ['Fortnite','Valorant','League of Legends','COD Mobile'],
    rondas: {
      'Fortnite': { numRondas:3, equipos:[
        {equipo:'Equipo Alfa', puntajes:[8,7,6]},
        {equipo:'Los Cracks',  puntajes:[5,6,'']},
        {equipo:'Nova',        puntajes:[4,'','']}
      ]},
      'Valorant': { numRondas:2, equipos:[
        {equipo:'Phantom', puntajes:[3,3]},
        {equipo:'Spike Rush', puntajes:[3,'']}
      ]}
    },
    ganadores: { 'Fortnite':{campeon:'Equipo Alfa',segundo:'Los Cracks',tercero:'Nova'} }
  };

  /* ---------- Apps Script ---------- */
  async function api(payload){
    if(DEMO) throw new Error('demo');
    const res = await fetch(URL_API, { method:'POST', body: JSON.stringify(payload) });
    let data;
    try { data = await res.json(); }
    catch(e){ throw new Error('Respuesta no válida del servidor. Revisa que el Apps Script esté publicado para "Cualquiera".'); }
    if(!data.ok) throw new Error(data.error || 'Error desconocido.');
    return data;
  }

  /* ---------- LOGIN ---------- */
  async function entrar(){
    const msg = $('login-msg');
    pass = $('pass').value.trim();
    if(!pass){ msg.className='msg err'; msg.textContent='Escribe la contraseña.'; return; }
    $('btn-entrar').disabled = true;
    msg.className='msg'; msg.textContent='Verificando…';
    try{
      if(DEMO){
        datos = JSON.parse(JSON.stringify(DEMO_DATOS));
      }else{
        await api({ action:'login', password:pass });
        const d = await api({ action:'datos', password:pass });
        datos = { juegos:d.juegos||[], rondas:d.rondas||{}, ganadores:d.ganadores||{} };
      }
      abrirPanel();
    }catch(err){
      msg.className='msg err';
      msg.textContent = err.message==='demo' ? '' : ('No se pudo entrar: ' + err.message);
    }finally{
      $('btn-entrar').disabled = false;
    }
  }

  function abrirPanel(){
    $('login').hidden = true;
    $('panel').hidden = false;
    $('demo-banner').hidden = !DEMO;
    llenarSelectorJuegos();
    seleccionarJuego(datos.juegos[0] || '');
  }
  function salir(){
    pass=''; $('pass').value=''; $('login-msg').textContent='';
    $('panel').hidden = true; $('login').hidden = false;
  }

  /* ---------- selector de juego ---------- */
  function llenarSelectorJuegos(){
    $('sel-juego').innerHTML = (datos.juegos.length ? datos.juegos : ['(sin juegos)'])
      .map(j => `<option value="${escAttr(j)}">${escHtml(j)}</option>`).join('');
  }

  function seleccionarJuego(j){
    juegoActual = j;
    $('sel-juego').value = j;
    const r = datos.rondas[j];
    const data = r
      ? { numRondas: Math.max(1, r.numRondas||1), filas: (r.equipos||[]).map(e => ({equipo:e.equipo, puntajes:(e.puntajes||[]).slice()})) }
      : { numRondas: 1, filas: [] };
    if(!data.filas.length) data.filas.push({equipo:'', puntajes:['']});
    renderGrid(data);
    const g = datos.ganadores[j] || {};
    $('g-1').value = g.campeon || '';
    $('g-2').value = g.segundo || '';
    $('g-3').value = g.tercero || '';
    estado('', '');
  }

  /* ---------- cuadrícula de rondas ---------- */
  function renderGrid(data){
    const N = Math.max(1, data.numRondas||1);
    // encabezado
    let th = '<tr><th>#</th><th>Equipo / Jugador</th>';
    for(let r=1;r<=N;r++) th += `<th class="col-num">R${r}</th>`;
    th += '<th class="col-num">Total</th><th></th></tr>';
    $('grid-head').innerHTML = th;
    // filas
    $('filas').innerHTML = '';
    data.filas.forEach(f => agregarFila(f, N));
    if(!data.filas.length) agregarFila({equipo:'',puntajes:[]}, N);
    refrescar();
  }

  function agregarFila(f, N){
    f = f || {equipo:'', puntajes:[]};
    const tr = document.createElement('tr');
    let celdas = `<td class="pos"></td>
      <td><input class="f-equipo" value="${escAttr(f.equipo||'')}" placeholder="Nombre"></td>`;
    for(let r=0;r<N;r++){
      const val = (f.puntajes && f.puntajes[r]!=null && f.puntajes[r]!=='') ? f.puntajes[r] : '';
      celdas += `<td class="col-num"><input class="f-r" type="number" inputmode="numeric" value="${val}"></td>`;
    }
    celdas += `<td class="col-num f-total">0</td><td><button class="btn-del" title="Quitar">✕</button></td>`;
    tr.innerHTML = celdas;
    tr.querySelector('.btn-del').onclick = () => { tr.remove(); refrescar(); };
    tr.querySelectorAll('.f-r').forEach(inp => inp.addEventListener('input', refrescar));
    $('filas').appendChild(tr);
  }

  // Recalcula totales por fila, numeración y "ronda actual"
  function refrescar(){
    let rondaActual = 0;
    $('filas').querySelectorAll('tr').forEach((tr,i) => {
      tr.querySelector('.pos').textContent = i+1;
      let total = 0;
      tr.querySelectorAll('.f-r').forEach((inp,k) => {
        const v = inp.value.trim();
        if(v!=='' && !isNaN(Number(v))){ total += Number(v); if(k+1>rondaActual) rondaActual = k+1; }
      });
      tr.querySelector('.f-total').textContent = total;
    });
    const now = $('ronda-now');
    if(now) now.innerHTML = rondaActual
      ? `🔴 <b>Ronda ${rondaActual}</b> en juego`
      : `<span class="off">Aún sin puntajes registrados</span>`;
  }

  // Lee la cuadrícula del DOM
  function leerGrid(){
    const head = $('grid-head').querySelectorAll('th.col-num').length; // incluye Total
    const N = Math.max(1, head - 1);
    const filas = [];
    $('filas').querySelectorAll('tr').forEach(tr => {
      const equipo = tr.querySelector('.f-equipo').value.trim();
      const puntajes = [];
      tr.querySelectorAll('.f-r').forEach(inp => {
        const v = inp.value.trim();
        puntajes.push(v==='' ? '' : (isNaN(Number(v)) ? '' : Number(v)));
      });
      if(equipo) filas.push({ equipo, puntajes });
    });
    return { numRondas:N, filas };
  }

  function cambiarRondas(delta){
    const d = leerGrid();
    d.numRondas = Math.max(1, d.numRondas + delta);
    // ajusta longitud de puntajes
    d.filas.forEach(f => { f.puntajes.length = d.numRondas; });
    if(!d.filas.length) d.filas.push({equipo:'',puntajes:[]});
    renderGrid(d);
  }
  function nuevaFila(){
    const d = leerGrid();
    d.filas.push({equipo:'', puntajes:Array(d.numRondas).fill('')});
    renderGrid(d);
  }

  function leerGanadores(){
    return { campeon:$('g-1').value.trim(), segundo:$('g-2').value.trim(), tercero:$('g-3').value.trim() };
  }

  /* ---------- GUARDAR ---------- */
  async function guardar(){
    if(!juegoActual){ estado('No hay juego seleccionado.','err'); return; }
    const grid = leerGrid();
    const ganadores = leerGanadores();

    // guarda en estado local
    datos.rondas[juegoActual] = {
      numRondas: grid.numRondas,
      equipos: grid.filas.map(f => ({equipo:f.equipo, puntajes:f.puntajes.slice()}))
    };
    datos.ganadores[juegoActual] = ganadores;

    if(DEMO){
      estado('Guardado en demo (no se escribió en la hoja).','ok');
      toast('Modo demo: configura appsScriptURL para guardar de verdad.');
      return;
    }

    $('btn-guardar').disabled = true;
    estado('Guardando…','');
    try{
      await api({ action:'guardar', password:pass, juego:juegoActual,
                  rondas:grid.filas, numRondas:grid.numRondas, ganadores });
      estado('Cambios guardados ✓  El total se sumó solo. Aparecerá en la web en unos momentos.','ok');
      toast('¡Guardado! ✅');
    }catch(err){
      estado('No se pudo guardar: ' + err.message, 'err');
    }finally{
      $('btn-guardar').disabled = false;
    }
  }

  async function recargar(){
    if(DEMO){ datos = JSON.parse(JSON.stringify(DEMO_DATOS)); llenarSelectorJuegos(); seleccionarJuego(juegoActual||datos.juegos[0]); toast('Recargado (demo).'); return; }
    estado('Recargando…','');
    try{
      const d = await api({ action:'datos', password:pass });
      datos = { juegos:d.juegos||[], rondas:d.rondas||{}, ganadores:d.ganadores||{} };
      llenarSelectorJuegos();
      seleccionarJuego(datos.juegos.includes(juegoActual) ? juegoActual : (datos.juegos[0]||''));
      toast('Datos recargados.');
    }catch(err){ estado('No se pudo recargar: ' + err.message,'err'); }
  }

  /* ---------- utilidades ---------- */
  function estado(t,cls){ const e=$('estado'); e.textContent=t; e.className='msg '+(cls||''); }
  let _tt;
  function toast(m){ const t=$('toast'); t.textContent=m; t.classList.add('show'); clearTimeout(_tt); _tt=setTimeout(()=>t.classList.remove('show'),3500); }
  function escHtml(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function escAttr(s){ return escHtml(s); }

  /* ---------- eventos ---------- */
  document.addEventListener('DOMContentLoaded', function(){
    $('btn-entrar').onclick = entrar;
    $('pass').addEventListener('keydown', e => { if(e.key==='Enter') entrar(); });
    $('btn-salir').onclick = salir;
    $('btn-recargar').onclick = recargar;
    $('btn-add').onclick = nuevaFila;
    $('btn-ronda-mas').onclick = () => cambiarRondas(+1);
    $('btn-ronda-menos').onclick = () => cambiarRondas(-1);
    $('sel-juego').onchange = e => seleccionarJuego(e.target.value);
    $('btn-guardar').onclick = guardar;
  });
})();
