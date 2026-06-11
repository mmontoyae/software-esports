/* =====================================================================
   📦 DATOS LOCALES (RESPALDO)
   ---------------------------------------------------------------------
   Esto es lo que se muestra MIENTRAS carga Google Sheets, o si la hoja
   falla / está vacía. Si usas la hoja, puedes dejar esto tal cual:
   solo sirve de "plan B".

   ⭐ LO MÁS IMPORTANTE: la lista JUEGOS de abajo es la ÚNICA fuente de
   verdad de los juegos. Si quitas un juego de aquí (o pones activo:false),
   desaparece de TODA la página automáticamente: hero, tarjetas,
   formulario de inscripción, pestañas de reglas, premios y resultados.
   ===================================================================== */

/* 🎮 JUEGOS — cada juego es un objeto. Para QUITAR un juego, bórralo o
   pon  activo:false . Para AÑADIR uno, copia un bloque { ... }.
   - id:          identificador interno (debe coincidir en premios/resultados)
   - nombre:      nombre visible
   - icono:       emoji
   - descripcion: texto de la tarjeta
   - modo:        etiqueta pequeña (ej. "5 vs 5 · Shooter táctico")
   - color:       acento. Usa: cyan, magenta, violet, gold, o un hex #f9a826
   - costo:       💵 precio POR JUGADOR de ESE juego (en USD)
   - jugadores:   nº de jugadores sugerido por equipo (se autocompleta en el form)
   - activo:      true = se muestra · false = oculto en toda la web */
let JUEGOS = [
  {
    id:"Fortnite", nombre:"Fortnite", icono:"🏗️",
    descripcion:"Battle Royale competitivo donde la construcción, la estrategia y la puntería son clave para alcanzar la Victoria Magistral.",
    modo:"Escuadras · Battle Royale", color:"violet", costo:5, jugadores:4, activo:true
  },
  {
    id:"Valorant", nombre:"Valorant", icono:"🎯",
    descripcion:"Shooter táctico 5 vs 5 donde la coordinación, el control de mapas y el uso inteligente de agentes marcan la diferencia.",
    modo:"5 vs 5 · Shooter táctico", color:"magenta", costo:5, jugadores:5, activo:true
  },
  {
    id:"League of Legends", nombre:"League of Legends", icono:"⚔️",
    descripcion:"MOBA estratégico donde dos equipos de cinco jugadores luchan por destruir el nexo enemigo en la Grieta del Invocador.",
    modo:"5 vs 5 · MOBA", color:"cyan", costo:5, jugadores:5, activo:true
  },
  {
    id:"COD Mobile", nombre:"COD Mobile", icono:"📱",
    descripcion:"Acción competitiva en dispositivos móviles con modos como Buscar y Destruir, Punto Caliente y Control bajo reglas de torneo.",
    modo:"5 vs 5 · Mobile FPS", color:"#f9a826", costo:5, jugadores:5, activo:true
  }
];

/* 📜 REGLAMENTO — reglas por juego. La clave "General" siempre sale primero;
   las demás claves deben coincidir con el "id" de cada juego.
   Cada juego/sección tiene varias "tarjetas" { titulo, reglas:[ ... ] }. */
let REGLAMENTO = {
  "General":[
    {titulo:"🤝 1. Respeto y conducta", reglas:[
      "Mantén una actitud respetuosa y deportiva con compañeros, rivales, organizadores y espectadores.",
      "Toda conducta ofensiva, discriminatoria o violenta en los chats del juego o canales oficiales será motivo de descalificación inmediata."]},
    {titulo:"🎓 2. Requisitos de participación y modalidad", reglas:[
      "El torneo es 100% virtual (en línea), por lo que los competidores participan desde sus hogares.",
      "Todos los juegos se disputarán exclusivamente en PC, a excepción de COD Mobile, que se jugará únicamente en Celular (dispositivos móviles).",
      "Ser estudiante activo de la universidad o invitado autorizado.",
      "Tener el juego instalado y actualizado a la última versión en la plataforma correspondiente."]},
    {titulo:"⏱️ 3. Puntualidad", reglas:[
      "Los equipos deben estar conectados en la sala virtual y listos en el horario establecido.",
      "Se otorgará un tiempo de espera máximo de 10 minutos; superado este lapso, se aplicará W.O. (pérdida por ausencia) a favor del equipo puntual."]},
    {titulo:"🚫 4. Prohibición de trampas", reglas:[
      "Prohibido el uso de hacks, software externo, macros o cualquier método de alteración del juego. La detección de anomalías implicará la expulsión inmediata.",
      "Queda estrictamente prohibido el uso de emuladores en PC para el juego de celular (COD Mobile)."]},
    {titulo:"⚖️ 5. Decisiones del comité", reglas:[
      "Las decisiones del equipo organizador son definitivas e inapelables.",
      "Solo los capitanes están autorizados para presentar observaciones o quejas formales ante el comité."]},
    {titulo:"📺 6. Transmisión", reglas:[
      "Mientras esperan su turno, los competidores deben permanecer en las transmisiones oficiales para apoyar y hacer crecer la comunidad.",
      "Quien desee transmitir o retransmitir las partidas debe solicitar autorización previa al comité organizador."]},
    {titulo:"🛑 7. Sanciones", reglas:[
      "Advertencia verbal o escrita según la gravedad de la falta.",
      "Pérdida de puntos en la fase de grupos o pérdida del mapa en juego.",
      "Expulsión del torneo y veto para futuros eventos de la comunidad."]}
  ],
  "Fortnite":[
    {titulo:"🎮 Formato del torneo", reglas:[
      "Fase de Grupos (Todos contra todos): Los equipos competirán de forma virtual en salas personalizadas para acumular puntos por posición y eliminaciones a lo largo de varias partidas.",
      "Fase Eliminatoria: En base a la tabla de puntos general, las mejores escuadras clasificarán a las llaves de Cuartos de Final, avanzando por eliminación directa a Semifinal y Gran Final."]},
    {titulo:"🏆 Sistema de puntos", reglas:[
      "Se sumarán los puntos obtenidos por partida: Victoria Magistral (10 pts), Top 3 (7 pts), Top 5 (5 pts) y cada eliminación sumará 1 pt.",
      "En caso de empate en la tabla de posiciones, el criterio de desempate definitivo será el total de eliminaciones acumuladas."]},
    {titulo:"⚙️ Reglas de juego", reglas:[
      "Se juega obligatoriamente en PC de forma nativa. Está prohibido el uso de mandos con asistencias externas o scripts.",
      "Es responsabilidad de los capitanes ingresar el código de la sala privada a tiempo y asegurar su lugar en la partida."]},
    {titulo:"📌 Reportes", reglas:[
      "El capitán de cada equipo debe tomar captura de pantalla completa al morir o ganar, y reportar el resultado al comité inmediatamente al finalizar cada mapa."]}
  ],
  "Valorant":[
    {titulo:"🎯 Formato del torneo", reglas:[
      "Fase de Grupos (Todos contra todos): Los equipos se distribuyen en grupos donde jugarán partidos en modo virtual sumando 3 puntos por victoria y 0 por derrota.",
      "Fase Eliminatoria: Los mejores de cada grupo avanzan a la llave de Cuartos de Final (al mejor de 1 mapa), Semifinal (al mejor de 3 mapas) y Gran Final (al mejor de 3 mapas)."]},
    {titulo:"🗺️ Mapas y agentes", reglas:[
      "Se utilizará el pool de mapas competitivos activos con sistema de veto entre capitanes antes de iniciar el enfrentamiento.",
      "Todos los agentes están permitidos, excepto los bloqueados por la organización debido a bugs conocidos del juego."]},
    {titulo:"⚙️ Durante la partida", reglas:[
      "Partidas 5 vs 5 en modo Táctico Estándar de PC. Queda estrictamente prohibido el coaching externo durante las rondas de juego.",
      "El reinicio de una ronda solo se aprueba por fallos técnicos comprobables en los primeros 30 segundos de la misma."]},
    {titulo:"🚫 Sanciones específicas", reglas:[
      "El uso verificado de programas externos ilegales (cheats) resultará en descalificación inmediata.",
      "La suplantación de identidad de cualquier jugador provocará la eliminación automática de todo el equipo."]}
  ],
  "League of Legends":[
    {titulo:"⚔️ Formato del torneo", reglas:[
      "Fase de Grupos (Todos contra todos): Formato de liga por grupos en la Grieta del Invocador en PC de forma virtual. La victoria otorga puntos directos para la tabla de posiciones.",
      "Fase Eliminatoria: Los equipos con mayor puntuación clasifican a Cuartos de Final, avanzando por eliminación directa (Bo1) hacia las Semifinales y la Gran Final (Bo3)."]},
    {titulo:"🧩 Campeones y picks", reglas:[
      "Modo Torneo (Draft Pick) con la fase de selecciones y bloqueos estándar integrada en el cliente.",
      "Todos los campeones están habilitados a menos que la organización anuncie un baneo global por fallos o reworks recientes del juego."]},
    {titulo:"⏸️ Pausas", reglas:[
      "Permitidas únicamente por desconexión o problemas de latencia severos. Cada equipo cuenta con un máximo de 10 minutos de pausa acumulada por mapa.",
      "La reanudación del juego solo se efectuará cuando ambos capitanes den el \"listo\" en el chat de la partida."]},
    {titulo:"📌 Importante", reglas:[
      "Es obligatorio tomar una captura de pantalla completa de la sala de estadísticas final (pantalla de victoria) para validar el resultado ante el staff."]}
  ],
  "COD Mobile":[
    {titulo:"📱 Formato del torneo", reglas:[
      "Fase de Grupos (Todos contra todos): Los equipos se enfrentarán de manera virtual en partidas privadas sumando puntos en la tabla según los partidos ganados.",
      "Fase Eliminatoria: Los mejores posicionados avanzan a las rondas eliminatorias de Cuartos de Final, Semifinal y Gran Final mediante series al mejor de 3 mapas (Bo3).",
      "Modalidades: Cada partido de la serie constará de modos competitivos alternados: Buscar y Destruir, Punto Caliente y Control."]},
    {titulo:"🚫 Restricciones de plataforma", reglas:[
      "Se juega únicamente en dispositivos móviles (Celular/Tablet) de forma táctil.",
      "Queda estrictamente prohibido usar emuladores de PC, mandos conectados por bluetooth o gatillos físicos adaptables."]},
    {titulo:"⚙️ Configuración y mapas", reglas:[
      "Las armas, rachas y operadores permitidos se limitarán bajo las reglas oficiales de la temporada competitiva de COD Mobile.",
      "La rotación de mapas será entregada por los organizadores antes de cada ronda. El modo espectador debe estar cerrado para externos."]},
    {titulo:"📌 Desconexiones y reportes", reglas:[
      "Si un jugador se desconecta antes de la primera baja (First Blood), el mapa se reinicia. Si ocurre después, la partida sigue y debe reincorporarse.",
      "El capitán del equipo ganador debe reportar enviando las capturas de pantalla de los marcadores finales de cada mapa jugado."]}
  ]
};

/* 🏆 PREMIOS (podio) — clave = id del juego. */
let PREMIOS = {
  "Fortnite":          {oro:"$ + Trofeo + Medallas", plata:"$ + Medallas", bronce:"Diploma + Medallas"},
  "Valorant":          {oro:"$", plata:"$", bronce:"$"},
  "League of Legends": {oro:"$", plata:"$", bronce:"$"},
  "COD Mobile":        {oro:"$", plata:"$", bronce:"$"}
};

/* 📊 RESULTADOS por juego — clave = id del juego. */
let TORNEO = {
  "Fortnite":          {ganadores:["Por definir","Por definir","Por definir"], posiciones:filasVacias()},
  "Valorant":          {ganadores:["Por definir","Por definir","Por definir"], posiciones:filasVacias()},
  "League of Legends": {ganadores:["Por definir","Por definir","Por definir"], posiciones:filasVacias()},
  "COD Mobile":        {ganadores:["Por definir","Por definir","Por definir"], posiciones:filasVacias()}
};
function filasVacias(){return Array.from({length:6},()=>({equipo:"Por definir",pj:0,pts:0}));}

/* 📺 STREAMS (respaldo). Si configuras la pestaña "Transmisiones" en la
   hoja, estos valores solo se usan mientras carga o si la hoja falla. */
let STREAMS = [
  {juego:"Pantalla 1", host:"Host Principal",  canal:""},
  {juego:"Pantalla 2", host:"Host Secundario", canal:""}
];
