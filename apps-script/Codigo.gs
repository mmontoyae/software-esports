/*********************************************************************
 *  SOFTWARE E-SPORTS 2026 — API del Panel de Staff (Google Apps Script)
 *  -------------------------------------------------------------------
 *  Vive DENTRO de tu Google Sheet y se publica como "aplicación web".
 *  El panel /staff registra los puntajes POR RONDA y este script:
 *    • Guarda la pestaña "Rondas"  (Juego | Equipo | Ronda 1 | Ronda 2 | …)
 *    • SUMA solo y recalcula "Posiciones" (Pts = suma, PJ = rondas jugadas)
 *  Además, si editas "Rondas" a mano, recalcula "Posiciones" automáticamente.
 *
 *  INSTALACIÓN (una sola vez):
 *   1. Google Sheet ▸ Extensiones ▸ Apps Script.
 *   2. Borra todo y pega ESTE archivo.
 *   3. Cambia STAFF_PASSWORD por tu contraseña.
 *   4. Guarda (💾).
 *   5. Implementar ▸ Nueva implementación ▸ "Aplicación web"
 *        - Ejecutar como: Yo     - Acceso: Cualquier persona
 *      Copia la URL que termina en /exec y pégala en js/config.js (appsScriptURL).
 *   6. (Opcional pero recomendado) Ejecuta una vez la función  instalarDisparador
 *      desde el editor (menú ▸ Ejecutar) para que "Posiciones" se recalcule
 *      también cuando edites "Rondas" a mano. Autoriza cuando lo pida.
 *********************************************************************/

/******** ⚙️ CONFIGURACIÓN ********/
const STAFF_PASSWORD = "cambia-esta-clave";   // 🔐 contraseña del panel de staff
const TAB_RONDAS     = "Rondas";              // Juego | Equipo | Ronda 1 | Ronda 2 | …
const TAB_POSICIONES = "Posiciones";          // Juego | Equipo | PJ | Pts  (se calcula solo)
const TAB_GANADORES  = "Ganadores";           // Juego | Campeon | Segundo | Tercero
const TAB_JUEGOS     = "Juegos";              // para listar los juegos activos


/******** ENTRADAS HTTP ********/
function doGet(e){
  return responder({ ok:true, info:"API del panel de staff activa. Las operaciones usan POST." });
}

function doPost(e){
  try{
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if(String(body.password) !== String(STAFF_PASSWORD)){
      return responder({ ok:false, error:"Contraseña incorrecta." });
    }
    switch(body.action){
      case "login":   return responder({ ok:true });
      case "datos":   return responder(Object.assign({ ok:true }, leerDatos()));
      case "guardar": return responder(guardarJuego(body.juego, body.rondas || [], body.numRondas || 0, body.ganadores || null));
      default:        return responder({ ok:false, error:"Acción no reconocida: " + body.action });
    }
  }catch(err){
    return responder({ ok:false, error:String(err) });
  }
}

function responder(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}


/******** UTILIDADES ********/
function ss(){ return SpreadsheetApp.getActiveSpreadsheet(); }

function hojaDe(nombre){
  const sh = ss().getSheetByName(nombre);
  if(!sh) throw new Error("No existe la pestaña: " + nombre);
  return sh;
}
function hojaDeOCrear(nombre){
  return ss().getSheetByName(nombre) || ss().insertSheet(nombre);
}

// Normaliza un encabezado (minúsculas, sin tildes)
function norm(s){
  return String(s == null ? "" : s).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Mapea encabezados a índices, tolerando variantes
function indices(fila){
  const idx = {};
  (fila || []).forEach(function(c, i){ const k = norm(c); if(k) idx[k] = i; });
  if(idx.juego  === undefined && idx.nombre       !== undefined) idx.juego  = idx.nombre;
  if(idx.equipo === undefined && idx.jugador      !== undefined) idx.equipo = idx.jugador;
  if(idx.equipo === undefined && idx.participante !== undefined) idx.equipo = idx.participante;
  if(idx.equipo === undefined && idx["equipo / jugador"] !== undefined) idx.equipo = idx["equipo / jugador"];
  if(idx.pj     === undefined && idx.partidas !== undefined) idx.pj  = idx.partidas;
  if(idx.pts    === undefined && idx.puntos   !== undefined) idx.pts = idx.puntos;
  return idx;
}

// Detecta las columnas de ronda (encabezado que empieza por "ronda" o "r1", "r2"…), en orden
function columnasRonda(fila){
  const cols = [];
  (fila || []).forEach(function(c, i){
    const k = norm(c);
    if(/^ronda\s*\d+$/.test(k) || /^r\s*\d+$/.test(k)){
      const num = parseInt(k.replace(/[^\d]/g, ""), 10) || (cols.length + 1);
      cols.push({ i: i, num: num });
    }
  });
  cols.sort(function(a, b){ return a.num - b.num; });
  return cols;
}


/******** LECTURA ********/
function leerDatos(){
  return {
    juegos:    juegosActivos(),
    rondas:    leerRondas(),     // { juego: { equipos:[{equipo,puntajes:[]}], numRondas } }
    ganadores: leerGanadores()
  };
}

function juegosActivos(){
  const sh = ss().getSheetByName(TAB_JUEGOS);
  if(!sh) return [];
  const v = sh.getDataRange().getValues();
  if(v.length < 2) return [];
  const h = indices(v[0]);
  const out = [];
  for(let i = 1; i < v.length; i++){
    const nombre = String(v[i][h.juego] || "").trim();
    if(!nombre) continue;
    const activo = (h.activo !== undefined)
      ? ["no","false","0","inactivo","oculto","off"].indexOf(norm(v[i][h.activo])) === -1
      : true;
    if(activo) out.push(nombre);
  }
  return out;
}

function leerRondas(){
  const res = {};
  const sh = ss().getSheetByName(TAB_RONDAS);
  if(!sh) return res;
  const v = sh.getDataRange().getValues();
  if(v.length < 2) return res;
  const h = indices(v[0]);
  const cols = columnasRonda(v[0]);
  const numRondas = cols.length;
  for(let i = 1; i < v.length; i++){
    const juego = String(v[i][h.juego] || "").trim();
    if(!juego) continue;
    const equipo = String(v[i][h.equipo] || "").trim();
    if(!equipo) continue;
    const puntajes = cols.map(function(c){
      const val = v[i][c.i];
      return (val === "" || val == null) ? "" : (Number(val));
    });
    (res[juego] = res[juego] || { equipos: [], numRondas: numRondas }).equipos.push({ equipo: equipo, puntajes: puntajes });
    res[juego].numRondas = numRondas;
  }
  return res;
}

function leerGanadores(){
  const sh = ss().getSheetByName(TAB_GANADORES);
  const res = {};
  if(!sh) return res;
  const v = sh.getDataRange().getValues();
  if(v.length < 2) return res;
  const h = indices(v[0]);
  for(let i = 1; i < v.length; i++){
    const juego = String(v[i][h.juego] || "").trim();
    if(!juego) continue;
    res[juego] = {
      campeon: String(v[i][h.campeon] || "").trim(),
      segundo: String(v[i][h.segundo] || "").trim(),
      tercero: String(v[i][h.tercero] || "").trim()
    };
  }
  return res;
}


/******** ESCRITURA ********/
function guardarJuego(juego, rondas, numRondas, ganadores){
  juego = String(juego || "").trim();
  if(!juego) return { ok:false, error:"Falta indicar el juego." };

  escribirRondas(juego, rondas || [], numRondas || 0);
  recomputarPosiciones();                 // suma sola → Posiciones
  if(ganadores) guardarGanadores(juego, ganadores);

  return { ok:true };
}

// Reescribe SOLO las filas de este juego en "Rondas" (formato ancho: una columna por ronda)
function escribirRondas(juego, rondas, numRondas){
  const sh = hojaDeOCrear(TAB_RONDAS);
  const v  = sh.getDataRange().getValues();
  const tieneDatos = v.length >= 1 && v[0].length >= 1 && String(v[0][0]||"").trim() !== "";

  // Encabezado actual (o uno por defecto)
  let headerJuego = "Juego", headerEquipo = "Equipo";
  let colsExist = [];
  let h = {};
  if(tieneDatos){
    h = indices(v[0]);
    if(h.juego  !== undefined) headerJuego  = v[0][h.juego];
    if(h.equipo !== undefined) headerEquipo = v[0][h.equipo];
    colsExist = columnasRonda(v[0]);
  }

  // Cuántas rondas tendrá la hoja: el máximo entre lo que ya había y lo que llega
  const N = Math.max(numRondas || 0, colsExist.length, 1);

  // Encabezado canónico: Juego | Equipo | Ronda 1 | … | Ronda N
  const header = [headerJuego, headerEquipo];
  for(let r = 1; r <= N; r++) header.push("Ronda " + r);
  const ancho = header.length;

  // Filas de OTROS juegos (se conservan, re-mapeadas al ancho nuevo)
  const otras = [];
  if(tieneDatos){
    for(let i = 1; i < v.length; i++){
      const jg = String(v[i][h.juego] || "").trim();
      if(!jg || jg === juego) continue;
      const eq = String(v[i][h.equipo] || "").trim();
      if(!eq) continue;
      const fila = new Array(ancho).fill("");
      fila[0] = jg; fila[1] = eq;
      colsExist.forEach(function(c, k){ fila[2 + k] = v[i][c.i]; });
      otras.push(fila);
    }
  }

  // Filas NUEVAS de este juego
  const nuevas = (rondas || []).map(function(p){
    const fila = new Array(ancho).fill("");
    fila[0] = juego;
    fila[1] = String(p.equipo || "").trim();
    (p.puntajes || []).forEach(function(val, k){
      if(k < N) fila[2 + k] = (val === "" || val == null) ? "" : Number(val);
    });
    return fila;
  }).filter(function(f){ return f[1] !== ""; });

  const todo = [header].concat(otras, nuevas);
  sh.clear();
  sh.getRange(1, 1, todo.length, ancho).setValues(todo);
}

// SUMA SOLA: recalcula toda la pestaña "Posiciones" a partir de "Rondas"
function recomputarPosiciones(){
  const datos = leerRondas();                  // { juego: {equipos, numRondas} }
  const shP = hojaDeOCrear(TAB_POSICIONES);
  const vP  = shP.getDataRange().getValues();
  const headerP = (vP.length && String(vP[0][0]||"").trim() !== "") ? vP[0] : ["Juego","Equipo","PJ","Pts"];
  const h = indices(headerP);
  const ancho = headerP.length;
  const ij = (h.juego  !== undefined) ? h.juego  : 0;
  const ie = (h.equipo !== undefined) ? h.equipo : 1;
  const ipj= (h.pj     !== undefined) ? h.pj     : 2;
  const ipt= (h.pts    !== undefined) ? h.pts    : 3;

  const filas = [headerP];
  Object.keys(datos).forEach(function(juego){
    const equipos = datos[juego].equipos.map(function(t){
      let pts = 0, pj = 0;
      t.puntajes.forEach(function(x){
        if(x !== "" && x != null && !isNaN(Number(x))){ pts += Number(x); pj++; }
      });
      return { equipo: t.equipo, pj: pj, pts: pts };
    });
    equipos.sort(function(a, b){ return b.pts - a.pts || b.pj - a.pj; });
    equipos.forEach(function(t){
      const fila = new Array(ancho).fill("");
      fila[ij] = juego; fila[ie] = t.equipo; fila[ipj] = t.pj; fila[ipt] = t.pts;
      filas.push(fila);
    });
  });

  shP.clear();
  shP.getRange(1, 1, filas.length, ancho).setValues(filas);
}

// Actualiza (o crea) la fila de este juego en "Ganadores"
function guardarGanadores(juego, g){
  const sh = hojaDeOCrear(TAB_GANADORES);
  let v = sh.getDataRange().getValues();
  if(!(v.length && String(v[0][0]||"").trim() !== "")){
    v = [["Juego","Campeon","Segundo","Tercero"]];
  }
  const h = indices(v[0]);
  const ancho = v[0].length;
  const ij = (h.juego!==undefined)?h.juego:0, ic=(h.campeon!==undefined)?h.campeon:1,
        is = (h.segundo!==undefined)?h.segundo:2, it=(h.tercero!==undefined)?h.tercero:3;
  let encontrada = false;
  for(let i = 1; i < v.length; i++){
    if(String(v[i][ij] || "").trim() === juego){
      v[i][ic] = g.campeon || ""; v[i][is] = g.segundo || ""; v[i][it] = g.tercero || "";
      encontrada = true; break;
    }
  }
  if(!encontrada){
    const fila = new Array(ancho).fill("");
    fila[ij] = juego; fila[ic] = g.campeon || ""; fila[is] = g.segundo || ""; fila[it] = g.tercero || "";
    v.push(fila);
  }
  sh.clear();
  sh.getRange(1, 1, v.length, ancho).setValues(v);
}


/******** AUTO-RECÁLCULO AL EDITAR A MANO ********/
// Recalcula "Posiciones" cuando editas la pestaña "Rondas" directamente en la hoja.
function alEditar(e){
  try{
    if(e && e.range && e.range.getSheet().getName() === TAB_RONDAS){
      recomputarPosiciones();
    }
  }catch(err){ /* silencioso */ }
}

// Ejecuta esta función UNA vez (menú ▸ Ejecutar) para activar el auto-recálculo.
function instalarDisparador(){
  const yaHay = ScriptApp.getProjectTriggers().some(function(t){ return t.getHandlerFunction() === "alEditar"; });
  if(!yaHay){
    ScriptApp.newTrigger("alEditar").forSpreadsheet(ss()).onEdit().create();
  }
  SpreadsheetApp.getActiveSpreadsheet().toast("Auto-recálculo activado ✔", "Software E-Sports", 5);
}
