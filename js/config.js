/* =====================================================================
   ⚙️ CONFIG — AJUSTES GENERALES DEL TORNEO
   ---------------------------------------------------------------------
   Aquí van los datos que CASI NUNCA cambian (WhatsApp, Discord, redes,
   ID de la hoja de Google Sheets, etc.).

   👉 Los JUEGOS, las REGLAS, los PRECIOS por juego, los PREMIOS,
      las POSICIONES, los GANADORES y las TRANSMISIONES se editan
      desde tu hoja de Google Sheets (sin tocar código).
      Mientras la hoja carga (o si falla), se usan los valores de
      respaldo del archivo  js/datos-locales.js
   ===================================================================== */
const CONFIG = {
  whatsapp: "593989336030",                       // WhatsApp de contacto (país + número, sin + ni espacios)
  discord:  "https://discord.gg/YnHqrNw9",        // invitación de Discord
  precioPorJugador: 5,                            // 💵 PRECIO POR DEFECTO (se usa si un juego no tiene precio propio)
  fechaTorneo: "",                                // "" = Por confirmar. Ej: "2026-12-20T18:00:00"
  reglamentoPDF: "",                              // enlace a PDF del reglamento (opcional)

  // 📊 GOOGLE SHEETS — administra TODO desde una sola hoja.
  //    Pega SOLO el ID de tu hoja. Si lo dejas en "", se usan los datos
  //    locales de js/datos-locales.js
  googleSheetID:  "1l5xYvT0ixhVBCfkkiDo55YXRBJ54sX_KToVeo5_jLqU",

  // Nombres EXACTOS de las pestañas de tu hoja:
  hojaJuegos:        "Juegos",          // 🆕 juegos + precio + icono + descripción + modo + activo
  hojaReglamento:    "Reglamento",      // 🆕 reglas por juego (y "General")
  hojaPosiciones:    "Posiciones",
  hojaGanadores:     "Ganadores",
  hojaPremios:       "Premios",
  hojaTransmisiones: "Transmisiones",   // transmisiones (columnas: Juego / Host / Canal)

  // 🔐 PANEL DE STAFF (árbitros / hosts) — carpeta /staff
  //    Pega aquí la URL del "Web App" de Google Apps Script (ver staff/LÉEME.md).
  //    Sirve para que el staff GUARDE puntos/partidas y campeones en la hoja.
  //    Si lo dejas en "", el panel funciona en modo demo (no guarda nada).
  appsScriptURL: "https://script.google.com/macros/s/AKfycbxsxs18toAZ6S6DIZHWvCbDutLuqbEwUWCQvUxKK6UkJoDeW7Udb_TGZ1uQCkyD-wLjmw/exec",

  // 💖 Donaciones: WhatsApp donde coordinas las donaciones
  donacionWhatsapp: "593989336030",

  // 📱 Redes sociales (deja "" para ocultar el ícono en el pie de página)
  instagram: "",                                  // ej: "https://instagram.com/tucuenta"
  tiktok:    "",                                  // ej: "https://tiktok.com/@tucuenta"
  youtube:   ""                                   // ej: "https://youtube.com/@tucanal"
};
