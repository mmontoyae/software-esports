/*********************************************************************
 *  SOFTWARE E-SPORTS 2026 — API del Panel de Staff (Google Apps Script)
 *  -------------------------------------------------------------------
 *  Este script vive DENTRO de tu Google Sheet y se publica como
 *  "aplicación web". El panel /staff le envía los cambios y este
 *  script los escribe en las pestañas Posiciones y Ganadores.
 *
 *  CÓMO INSTALARLO (rápido):
 *   1. Abre tu Google Sheet.
 *   2. Menú  Extensiones ▸ Apps Script.
 *   3. Borra lo que haya y pega TODO este archivo.
 *   4. Cambia STAFF_PASSWORD por la contraseña que quieras.
 *   5. Guarda (💾).
 *   6. Implementar ▸ Nueva implementación ▸ tipo "Aplicación web".
 *        - Ejecutar como:  Yo (tu cuenta)
 *        - Quién tiene acceso:  Cualquier persona
 *      Pulsa "Implementar", autoriza, y COPIA la URL que termina en /exec
 *   7. Pega esa URL en  js/config.js  →  appsScriptURL: "…"
 *
 *  (Cada vez que edites este script, crea una "Nueva implementación" o
 *   "Administrar implementaciones ▸ editar ▸ Versión: nueva" para que
 *   los cambios tomen efecto.)
 *********************************************************************/

/******** ⚙️ CONFIGURACIÓN ********/
const STAFF_PASSWORD = "cambia-esta-clave";   // 🔐 contraseña del panel de staff
const TAB_POSICIONES = "Posiciones";          // columnas: Juego | Equipo | PJ | Pts
const TAB_GANADORES  = "Ganadores";           // columnas: Juego | Campeon | Segundo | Tercero
const TAB_JUEGOS     = "Juegos";              // se usa para listar los juegos activos


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
      case "guardar": return responder(guardarJuego(body.juego, body.posiciones || [], body.ganadores || null));
      default:        return responder({ ok:false, error:"Acción no reconocida: " + body.action });
    }
  }catch(err){
    return responder({ ok:false, error:String(err) });
  }
}

function responder(obj){
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/******** LECTURA ********/
function leerDatos(){
  return {
    juegos:     juegosActivos(),
    posiciones: leerPosiciones(),
    ganadores:  leerGanadores()
  };
}

function hojaDe(nombre){
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombre);
  if(!sh) throw new Error("No existe la pestaña: " + nombre);
  return sh;
}

// Mapea encabezados (1ª fila) a índices, tolerando tildes/variantes
function indices(filaEncabezados){
  const idx = {};
  (filaEncabezados || []).forEach(function(c, i){
    const k = String(c == null ? "" : c).trim().toLowerCase()
               .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if(k) idx[k] = i;
  });
  if(idx.juego   === undefined && idx.nombre   !== undefined) idx.juego = idx.nombre;
  if(idx.pj      === undefined && idx.partidas !== undefined) idx.pj = idx.partidas;
  if(idx.pts     === undefined && idx.puntos   !== undefined) idx.pts = idx.puntos;
  return idx;
}

function juegosActivos(){
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_JUEGOS);
  if(!sh) return [];
  const v = sh.getDataRange().getValues();
  if(v.length < 2) return [];
  const h = indices(v[0]);
  const out = [];
  for(let i = 1; i < v.length; i++){
    const nombre = String(v[i][h.juego] || "").trim();
    if(!nombre) continue;
    const activo = (h.activo !== undefined)
      ? ["no","false","0","inactivo","oculto","off"].indexOf(String(v[i][h.activo]).trim().toLowerCase()) === -1
      : true;
    if(activo) out.push(nombre);
  }
  return out;
}

function leerPosiciones(){
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_POSICIONES);
  const res = {};
  if(!sh) return res;
  const v = sh.getDataRange().getValues();
  if(v.length < 2) return res;
  const h = indices(v[0]);
  for(let i = 1; i < v.length; i++){
    const juego = String(v[i][h.juego] || "").trim();
    if(!juego) continue;
    (res[juego] = res[juego] || []).push({
      equipo: String(v[i][h.equipo] || "").trim(),
      pj:  Number(v[i][h.pj])  || 0,
      pts: Number(v[i][h.pts]) || 0
    });
  }
  return res;
}

function leerGanadores(){
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_GANADORES);
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
function guardarJuego(juego, posiciones, ganadores){
  juego = String(juego || "").trim();
  if(!juego) return { ok:false, error:"Falta indicar el juego." };

  guardarPosiciones(juego, posiciones || []);
  if(ganadores) guardarGanadores(juego, ganadores);

  return { ok:true };
}

// Reescribe SOLO las filas de este juego en Posiciones (las de otros juegos no se tocan)
function guardarPosiciones(juego, posiciones){
  const sh = hojaDe(TAB_POSICIONES);
  const v  = sh.getDataRange().getValues();
  const header = v.length ? v[0] : ["Juego","Equipo","PJ","Pts"];
  const h = indices(header);
  const ancho = header.length;

  const otras = v.slice(1).filter(function(f){
    return String(f[h.juego] || "").trim() !== juego;
  });

  const nuevas = posiciones.map(function(p){
    const fila = new Array(ancho).fill("");
    fila[h.juego] = juego;
    if(h.equipo !== undefined) fila[h.equipo] = p.equipo || "";
    if(h.pj     !== undefined) fila[h.pj]  = Number(p.pj)  || 0;
    if(h.pts    !== undefined) fila[h.pts] = Number(p.pts) || 0;
    return fila;
  });

  const todo = [header].concat(otras, nuevas);
  sh.clearContents();
  sh.getRange(1, 1, todo.length, ancho).setValues(todo);
}

// Actualiza (o crea) la fila de este juego en Ganadores
function guardarGanadores(juego, g){
  const sh = hojaDe(TAB_GANADORES);
  const v  = sh.getDataRange().getValues();
  const header = v.length ? v[0] : ["Juego","Campeon","Segundo","Tercero"];
  const h = indices(header);
  const ancho = header.length;

  let encontrada = false;
  for(let i = 1; i < v.length; i++){
    if(String(v[i][h.juego] || "").trim() === juego){
      if(h.campeon !== undefined) v[i][h.campeon] = g.campeon || "";
      if(h.segundo !== undefined) v[i][h.segundo] = g.segundo || "";
      if(h.tercero !== undefined) v[i][h.tercero] = g.tercero || "";
      encontrada = true;
      break;
    }
  }
  if(!encontrada){
    const fila = new Array(ancho).fill("");
    fila[h.juego] = juego;
    if(h.campeon !== undefined) fila[h.campeon] = g.campeon || "";
    if(h.segundo !== undefined) fila[h.segundo] = g.segundo || "";
    if(h.tercero !== undefined) fila[h.tercero] = g.tercero || "";
    v.push(fila);
  }

  sh.clearContents();
  sh.getRange(1, 1, v.length, ancho).setValues(v);
}
