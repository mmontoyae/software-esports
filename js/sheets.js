/* =====================================================================
   📊 GOOGLE SHEETS
   ---------------------------------------------------------------------
   Lee tu hoja y actualiza la web SIN tocar código. Pestañas que lee:
     • Juegos        → lista de juegos + precio + icono + descripción + modo + activo
     • Reglamento    → reglas por juego (y "General")
     • Posiciones    → tabla de posiciones por juego
     • Ganadores     → campeones por juego
     • Premios       → premios por juego
     • Transmisiones → streams de Twitch
   Si no hay ID configurado o una pestaña falla, se usan los datos locales
   de js/datos-locales.js. Funciona en GitHub Pages (no necesita servidor).
   ===================================================================== */

// Normaliza texto: minúsculas, sin tildes, sin espacios sobrantes
const norm = s => (s==null?'':String(s)).trim().toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g,'');

// Relaciona un texto con el id de un juego existente (tolera variantes: lol, cod…)
function matchJuego(v){
  const n = norm(v); if(!n) return null;
  let aprox = null;
  for(const j of JUEGOS){
    const idn = norm(j.id), nm = norm(j.nombre);
    if(idn === n || nm === n) return j.id;                 // coincidencia exacta
    if(n.includes(idn) || idn.includes(n) || n.includes(nm)) aprox = aprox || j.id;
  }
  const alias = [['fortnite','fortnite'],['valorant','valorant'],['league','league'],
                 ['lol','league'],['cod','cod'],['call of duty','cod'],['mobile','cod']];
  for(const [palabra,clave] of alias){
    if(n.includes(palabra)){
      const f = JUEGOS.find(j => norm(j.id).includes(clave) || norm(j.nombre).includes(clave));
      if(f) return f.id;
    }
  }
  return aprox;
}

// Descarga una pestaña como filas { encabezado_normalizado: valor }
async function leerHoja(hoja){
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.googleSheetID}`
            + `/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(hoja)}`;
  const res = await fetch(url);
  const txt = await res.text();
  const json = JSON.parse(txt.replace(/^[\s\S]*?setResponse\(/, '').replace(/\);?\s*$/, ''));
  const cols = (json.table.cols || []).map(c => norm(c.label));
  return (json.table.rows || []).map(r => {
    const o = {};
    (r.c || []).forEach((cell, i) => { o[cols[i]] = cell ? cell.v : null; });
    return o;
  });
}

// Convierte una fila de la pestaña "Juegos" en un objeto de juego
function parseJuego(r){
  const nombre = (r['juego'] ?? r['nombre'] ?? '').toString().trim();
  if(!nombre) return null;
  const activoRaw = norm(r['activo']);
  const activo = !['no','false','0','inactivo','oculto','off'].includes(activoRaw);
  return {
    id: nombre,
    nombre,
    icono: ((r['icono'] ?? r['emoji'] ?? '').toString().trim()) || '🎮',
    imagen: (r['imagen'] ?? r['imagenes'] ?? r['foto'] ?? r['img'] ?? '').toString().trim(),
    descripcion: (r['descripcion'] ?? r['descripción'] ?? '').toString().trim(),
    modo: (r['modo'] ?? '').toString().trim(),
    color: ((r['color'] ?? '').toString().trim()) || 'cyan',
    costo: Number(r['costo'] ?? r['precio']) || CONFIG.precioPorJugador,
    jugadores: Number(r['jugadores']) || 5,
    activo
  };
}

// Convierte las filas de "Reglamento" en { clave: [ {titulo, reglas:[...]} ] }
function parseReglamento(filas){
  const out = {};
  filas.forEach(r => {
    const juegoRaw = (r['juego'] ?? '').toString().trim();
    const titulo   = (r['titulo'] ?? r['título'] ?? r['seccion'] ?? r['sección'] ?? '').toString().trim();
    const celda    = (r['reglas'] ?? r['regla'] ?? '').toString();
    // Cada viñeta va en una línea aparte (Alt+Enter) o separada por  |  o  •
    const reglas = celda.split(/\r?\n|\||•/).map(s => s.trim()).filter(Boolean);
    if(!titulo && !reglas.length) return;
    let key;
    if(!juegoRaw || norm(juegoRaw) === 'general') key = 'General';
    else key = matchJuego(juegoRaw) || juegoRaw;
    (out[key] = out[key] || []).push({titulo, reglas});
  });
  return out;
}

// Punto de entrada (lo llama app.js)
async function cargarGoogleSheets(){
  if(!CONFIG.googleSheetID) return;   // sin ID → solo datos locales

  // 1) JUEGOS primero: define la lista y los precios que usan las demás pestañas
  try{
    const filas = await leerHoja(CONFIG.hojaJuegos);
    const nuevos = filas.map(parseJuego).filter(Boolean);
    if(nuevos.length) JUEGOS = nuevos;
  }catch(e){ console.warn('No se pudo leer la pestaña Juegos; se usan los juegos locales.', e); }

  // 2) El resto en paralelo (cada una protegida por su propio try)
  await Promise.all([
    (async () => {
      try{
        const nuevo = parseReglamento(await leerHoja(CONFIG.hojaReglamento));
        Object.keys(nuevo).forEach(k => REGLAMENTO[k] = nuevo[k]);
      }catch(e){ console.warn('Sin pestaña Reglamento; se usan las reglas locales.', e); }
    })(),

    (async () => {
      try{
        const pos = await leerHoja(CONFIG.hojaPosiciones);
        const porJuego = {};
        pos.forEach(r => {
          const g = matchJuego(r['juego']); if(!g) return;
          (porJuego[g] = porJuego[g] || []).push({
            equipo: r['equipo'] || 'Por definir',
            pj: Number(r['pj']) || 0,
            pts: Number(r['pts']) || 0
          });
        });
        Object.keys(porJuego).forEach(g => {
          if(!TORNEO[g]) TORNEO[g] = {ganadores:["Por definir","Por definir","Por definir"], posiciones:[]};
          TORNEO[g].posiciones = porJuego[g];
        });
      }catch(e){ console.warn('Sin pestaña Posiciones; se usan los datos locales.', e); }
    })(),

    (async () => {
      try{
        const gan = await leerHoja(CONFIG.hojaGanadores);
        gan.forEach(r => {
          const g = matchJuego(r['juego']); if(!g) return;
          if(!TORNEO[g]) TORNEO[g] = {ganadores:[], posiciones:[]};
          TORNEO[g].ganadores = [
            r['campeon'] || r['campeón'] || 'Por definir',
            r['segundo'] || 'Por definir',
            r['tercero'] || 'Por definir'
          ];
        });
      }catch(e){ console.warn('Sin pestaña Ganadores; se usan los datos locales.', e); }
    })(),

    (async () => {
      try{
        const pre = await leerHoja(CONFIG.hojaPremios);
        pre.forEach(r => {
          const g = matchJuego(r['juego']); if(!g) return;
          if(!PREMIOS[g]) PREMIOS[g] = {oro:'$', plata:'$', bronce:'$'};
          if(r['oro']    != null && r['oro']    !== '') PREMIOS[g].oro    = r['oro'];
          if(r['plata']  != null && r['plata']  !== '') PREMIOS[g].plata  = r['plata'];
          if(r['bronce'] != null && r['bronce'] !== '') PREMIOS[g].bronce = r['bronce'];
        });
      }catch(e){ console.warn('Sin pestaña Premios; se usan los datos locales.', e); }
    })(),

    (async () => {
      if(!CONFIG.hojaTransmisiones) return;
      try{
        const filas = await leerHoja(CONFIG.hojaTransmisiones);
        const limpiarCanal = v => (v==null?'':String(v)).trim()
          .replace(/^@/,'').replace(/^https?:\/\//,'')
          .replace(/^(www\.)?twitch\.tv\//,'').replace(/[/?#].*$/,'');
        const streams = filas
          .filter(r => (r['juego'] || r['canal']))
          .map(r => ({ juego:r['juego']||'', host:r['host']||'', canal:limpiarCanal(r['canal']) }));
        if(streams.length && typeof window.renderStreams === 'function') window.renderStreams(streams);
      }catch(e){ console.warn('Sin pestaña Transmisiones; se usan los canales locales.', e); }
    })()
  ]);

  // 3) Vuelve a dibujar TODA la web con los datos ya cargados
  if(typeof window.renderTodo === 'function') window.renderTodo();
}