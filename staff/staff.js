/* =====================================================================
   PANEL DE STAFF — lógica
   ---------------------------------------------------------------------
   • Lee y escribe en tu Google Sheet a través de un Google Apps Script
     publicado como "aplicación web" (URL en CONFIG.appsScriptURL).
   • La contraseña se verifica EN EL SERVIDOR (Apps Script), no aquí.
   • Si no hay appsScriptURL, funciona en MODO DEMO (no guarda nada).
   ===================================================================== */
(function(){
  const $ = id => document.getElementById(id);
  const URL_API = (typeof CONFIG !== 'undefined' && CONFIG.appsScriptURL ? CONFIG.appsScriptURL : '').trim();
  const DEMO = !URL_API;

  // Estado en memoria
  let pass = '';
  let datos = { juegos: [], posiciones: {}, ganadores: {} };
  let juegoActual = '';

  // Datos de ejemplo para el modo demo
  const DEMO_DATOS = {
    juegos: ['Fortnite','Valorant','League of Legends','COD Mobile'],
    posiciones: {
      'Fortnite':[{equipo:'Equipo Alfa',pj:3,pts:21},{equipo:'Los Cracks',pj:3,pts:17},{equipo:'Nova',pj:3,pts:12}],
      'Valorant':[{equipo:'Phantom',pj:2,pts:6},{equipo:'Spike Rush',pj:2,pts:3}]
    },
    ganadores: { 'Fortnite':{campeon:'Equipo Alfa',segundo:'Los Cracks',tercero:'Nova'} }
  };

  /* ---------- Llamada al Apps Script (POST simple, sin preflight) ---------- */
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
        datos = { juegos:d.juegos||[], posiciones:d.posiciones||{}, ganadores:d.ganadores||{} };
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

  /* ---------- RENDER ---------- */
  function llenarSelectorJuegos(){
    const sel = $('sel-juego');
    sel.innerHTML = (datos.juegos.length ? datos.juegos : ['(sin juegos)'])
      .map(j => `<option value="${escAttr(j)}">${escHtml(j)}</option>`).join('');
  }

  function seleccionarJuego(j){
    juegoActual = j;
    $('sel-juego').value = j;
    renderFilas(datos.posiciones[j] || []);
    const g = datos.ganadores[j] || {};
    $('g-1').value = g.campeon || '';
    $('g-2').value = g.segundo || '';
    $('g-3').value = g.tercero || '';
    estado('', '');
  }

  function renderFilas(filas){
    const tb = $('filas');
    tb.innerHTML = '';
    if(!filas.length) agregarFila();
    else filas.forEach(f => agregarFila(f));
    renumerar();
  }

  function agregarFila(f){
    f = f || {equipo:'',pj:0,pts:0};
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="pos"></td>
      <td><input class="f-equipo" value="${escAttr(f.equipo||'')}" placeholder="Nombre del equipo"></td>
      <td class="col-num"><input class="f-pj" type="number" min="0" value="${Number(f.pj)||0}"></td>
      <td class="col-num"><input class="f-pts" type="number" min="0" value="${Number(f.pts)||0}"></td>
      <td><button class="btn-del" title="Quitar">✕</button></td>`;
    tr.querySelector('.btn-del').onclick = () => { tr.remove(); renumerar(); };
    $('filas').appendChild(tr);
  }

  function renumerar(){
    $('filas').querySelectorAll('tr').forEach((tr,i) => {
      tr.querySelector('.pos').textContent = i+1;
    });
  }

  // Lee la tabla del DOM -> array de filas (descarta equipos vacíos), ordenado por puntos
  function leerFilas(){
    const filas = [];
    $('filas').querySelectorAll('tr').forEach(tr => {
      const equipo = tr.querySelector('.f-equipo').value.trim();
      if(!equipo) return;
      filas.push({
        equipo,
        pj: Number(tr.querySelector('.f-pj').value) || 0,
        pts: Number(tr.querySelector('.f-pts').value) || 0
      });
    });
    filas.sort((a,b) => b.pts - a.pts || b.pj - a.pj);
    return filas;
  }

  function leerGanadores(){
    return {
      campeon: $('g-1').value.trim(),
      segundo: $('g-2').value.trim(),
      tercero: $('g-3').value.trim()
    };
  }

  /* ---------- GUARDAR ---------- */
  async function guardar(){
    if(!juegoActual){ estado('No hay juego seleccionado.','err'); return; }
    const posiciones = leerFilas();
    const ganadores = leerGanadores();

    // Guarda en el estado local para que la UI quede consistente
    datos.posiciones[juegoActual] = posiciones;
    datos.ganadores[juegoActual] = ganadores;

    if(DEMO){
      renderFilas(posiciones);
      estado('Guardado en demo (no se escribió en la hoja).','ok');
      toast('Modo demo: configura appsScriptURL para guardar de verdad.');
      return;
    }

    $('btn-guardar').disabled = true;
    estado('Guardando…','');
    try{
      await api({ action:'guardar', password:pass, juego:juegoActual, posiciones, ganadores });
      renderFilas(posiciones); // re-ordena visualmente
      estado('Cambios guardados ✓  Aparecerán en la web en unos momentos.','ok');
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
      datos = { juegos:d.juegos||[], posiciones:d.posiciones||{}, ganadores:d.ganadores||{} };
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
    $('btn-add').onclick = () => { agregarFila(); renumerar(); };
    $('sel-juego').onchange = e => seleccionarJuego(e.target.value);
    $('btn-guardar').onclick = guardar;
  });

  // Exponer para pruebas (no afecta el navegador)
  window.__staff = { get datos(){return datos;}, leerFilasDe:(arr)=>arr, };
})();
