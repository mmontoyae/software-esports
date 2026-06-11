# 🎮 Software E-Sports 2026 · 2da Edición — Manual de uso

Sitio web del torneo, **modular** (HTML, CSS y JS separados) y **editable sin tocar
código** desde tu Google Sheet. Incluye un **panel privado para el staff** (árbitros y
hosts) que registra los puntajes por ronda y suma el total automáticamente.

> Si solo quieres una respuesta rápida, salta al **[Resumen rápido](#resumen-rápido)**
> del final.

---

## Índice

1. [Cómo está armado el proyecto](#1-cómo-está-armado-el-proyecto)
2. [Subirlo a GitHub](#2-subirlo-a-github)
3. [La idea clave: los juegos mandan](#3-la-idea-clave-los-juegos-mandan)
4. [Tu Google Sheet (todas las pestañas)](#4-tu-google-sheet-todas-las-pestañas)
5. [Imágenes de los juegos](#5-imágenes-de-los-juegos)
6. [Panel de Staff + puntajes por ronda](#6-panel-de-staff--puntajes-por-ronda)
7. [Ajustes generales (config.js)](#7-ajustes-generales-configjs)
8. [Si no quieres usar Google Sheets](#8-si-no-quieres-usar-google-sheets)
9. [Problemas frecuentes](#9-problemas-frecuentes)
10. [Resumen rápido](#resumen-rápido)

---

## 1. Cómo está armado el proyecto

```
index.html              ← PÁGINA PÚBLICA (tusitio.com/)
logo.png                ← tu logo (lo subes tú)
imagenes/               ← imágenes de los juegos (las subes tú)
  fortnite.png
  valorant.png
  league-of-legends.png
  cod-mobile.png
css/
  estilos.css           ← todo el diseño (colores, fuentes, efectos)
js/
  config.js             ← ajustes generales (WhatsApp, Discord, redes, ID de la hoja, URL del staff)
  datos-locales.js      ← RESPALDO: lo que se ve mientras carga la hoja o si falla
  sheets.js             ← lee tu Google Sheet y actualiza la página
  app.js                ← arma la página y maneja botones, formulario, etc.
staff/                  ← PANEL PRIVADO del staff (tusitio.com/staff/)
  index.html            ← login + editor de puntajes por ronda
  staff.css
  staff.js
  LÉEME.md
apps-script/
  Codigo.gs             ← código que va DENTRO de tu Google Sheet (para que el staff guarde)

index-todo-en-uno.html  ← versión alternativa de la página pública en UN solo archivo
Datos-Torneo-GoogleSheets.xlsx  ← Excel con todos los datos para copiar/pegar en tu hoja
```

Hay **dos páginas** distintas, cada una llamada `index.html` pero en carpeta diferente:

- **`index.html`** (en la raíz) → la **página pública**, la que ve todo el mundo.
- **`staff/index.html`** → la **página del staff**, con login y contraseña.

> **logo.png e imágenes:** no vienen incluidos; los subes tú a la raíz y a `imagenes/`.

---

## 2. Subirlo a GitHub

Todo va en **un mismo repositorio** (no crees uno nuevo para el staff). Usas el mismo
GitHub Pages que ya tienes:

- La página pública queda en `https://tusitio.com/` (o `https://usuario.github.io/repo/`).
- El panel del staff queda en `https://tusitio.com/staff/`.

### ⚠️ Respeta las carpetas al subir
El error más común es subir los archivos **sueltos**, sin sus carpetas. Si las carpetas
`css/`, `js/`, `imagenes/` o `staff/` no quedan creadas, la página carga **sin estilos**
o **vacía**. Para evitarlo:

- Arrastra las **carpetas completas** (no archivo por archivo) en *Add file ▸ Upload files*, **o**
- Usa GitHub Desktop / `git`, que conservan la estructura.

El repositorio debe quedar exactamente con el árbol de la sección 1.

### `apps-script/Codigo.gs` es la excepción
Ese archivo **no se ejecuta desde GitHub**. GitHub solo sirve páginas web; ese código va
**pegado dentro de tu Google Sheet** (ver sección 6). Súbelo al repo solo para tenerlo
guardado.

### ¿Y el `index-todo-en-uno.html`?
Es una versión de respaldo de la **página pública** con el CSS y el JS metidos en un solo
archivo. Si alguna vez la versión modular falla al subir (carpetas perdidas), renombra ese
archivo a `index.html` y funciona sin depender de carpetas. No reemplaza al panel de staff.

---

## 3. La idea clave: los juegos mandan

Los **juegos** son la única fuente de verdad. Cuando **quitas un juego**, desaparece solo
de **toda** la web: encabezado, tarjetas, **formulario de inscripción**, y pestañas de
**reglas, premios y resultados**. Lo quitas una vez y se actualiza en cascada.

Cada juego tiene su **costo por jugador**, así que el total de la inscripción cambia según
el juego que el equipo elija.

Todo esto se controla desde la pestaña **Juegos** de tu hoja.

- **Para quitar un juego:** en la pestaña `Juegos`, pon `no` en la columna **Activo** (o borra su fila).
- **Para añadir un juego:** agrega una fila nueva en `Juegos`. Aparece solo en todas las secciones.
- El **nombre del juego** es lo que enlaza todo, así que debe escribirse **igual** en todas las pestañas (`Fortnite` ≠ `fortnite` ≠ `Fornite`).

---

## 4. Tu Google Sheet (todas las pestañas)

Es la **misma hoja** de siempre
(ID: `1l5xYvT0ixhVBCfkkiDo55YXRBJ54sX_KToVeo5_jLqU`).

> **Reglas generales:** la **primera fila** de cada pestaña son los títulos de columna.
> Los nombres de pestañas y columnas deben escribirse como aquí abajo (no importan
> mayúsculas ni tildes). La hoja debe estar compartida como
> **"Cualquier persona con el enlace: Lector"** para que la web pueda leerla.

> 💡 **Atajo:** en el archivo `Datos-Torneo-GoogleSheets.xlsx` están TODAS estas pestañas
> ya armadas con tus datos. Ábrelo, copia y pega en tu Google Sheet.

### Pestaña `Juegos` — juegos, precios e imágenes

| Juego | Icono | Imagen | Descripcion | Modo | Color | Costo | Jugadores | Activo |
|-------|-------|--------|-------------|------|-------|-------|-----------|--------|
| Fortnite | 🏗️ | imagenes/fortnite.png | Battle Royale… | Escuadras · Battle Royale | violet | 5 | 4 | sí |
| Valorant | 🎯 | imagenes/valorant.png | Shooter táctico… | 5 vs 5 · Shooter táctico | magenta | 5 | 5 | sí |
| League of Legends | ⚔️ | imagenes/league-of-legends.png | MOBA… | 5 vs 5 · MOBA | cyan | 5 | 5 | sí |
| COD Mobile | 📱 | imagenes/cod-mobile.png | Acción móvil… | 5 vs 5 · Mobile FPS | #f9a826 | 5 | 5 | sí |

- **Icono** = emoji (se usa como respaldo si no hay imagen).
- **Imagen** = ruta a la imagen del juego (ej. `imagenes/fortnite.png`). Si la dejas vacía,
  o si el archivo aún no existe, se usa el emoji automáticamente.
- **Color** = `cyan`, `magenta`, `violet`, `gold`, o un hex como `#f9a826`.
- **Costo** = precio por jugador de ese juego (puede ser distinto en cada uno).
- **Jugadores** = número sugerido por equipo (se autocompleta en el formulario).
- **Activo** = `sí` para mostrarlo, `no` para ocultarlo en toda la web.

### Pestaña `Reglamento` — reglas por juego

| Juego | Titulo | Reglas |
|-------|--------|--------|
| General | 🤝 1. Respeto y conducta | Mantén una actitud respetuosa… ⏎ Toda conducta ofensiva… |
| General | ⏱️ 3. Puntualidad | Conéctate a tiempo… ⏎ Espera máxima de 10 minutos… |
| Fortnite | 🎮 Formato del torneo | Fase de grupos… ⏎ Fase eliminatoria… |

- `General` (en la columna **Juego**) sale **primero** y aplica a todos.
- Para reglas de un juego, usa el **mismo nombre** que en la pestaña `Juegos`.
- **Cada viñeta va en una línea** dentro de la celda **Reglas**. Para saltar de línea sin
  cambiar de celda: **Alt + Enter** (Windows) o **⌥ Option + Enter** (Mac). También puedes
  separar viñetas con `|` o `•`.

### Pestañas de resultados

- **`Rondas`** → `Juego | Equipo | Ronda 1 | Ronda 2 | …`
  Aquí van los puntajes por ronda. La **crea y maneja el panel de staff** (sección 6),
  pero también puedes editarla a mano. Cada fila es un equipo o jugador, según el juego.
- **`Posiciones`** → `Juego | Equipo | PJ | Pts`. **No se edita a mano:** se **calcula
  sola** desde `Rondas` (Pts = suma de rondas, PJ = rondas jugadas).
- **`Ganadores`** → `Juego | Campeon | Segundo | Tercero` (el podio de cada juego).
- **`Premios`** → `Juego | Oro | Plata | Bronce`.
- **`Transmisiones`** → `Juego | Host | Canal` (solo el nombre del canal de Twitch).

> En la web pública, la sección Resultados muestra **"🔴 Ronda X en juego"** según las
> rondas jugadas, el podio de campeones y la tabla de posiciones (Pos · Equipo · PJ · Pts).

---

## 5. Imágenes de los juegos

1. Crea la carpeta **`imagenes`** junto a `index.html` y sube ahí las imágenes.
2. En la pestaña **Juegos**, columna **Imagen**, escribe la ruta (ej. `imagenes/fortnite.png`).
3. Si no pones imagen, se usa el emoji de la columna **Icono**.

- Nombres por defecto: `fortnite.png`, `valorant.png`, `league-of-legends.png`, `cod-mobile.png`.
- Tamaño recomendado: horizontal (ej. 600×360 px). Formatos: `.png`, `.jpg` o `.webp`.
- Si pones una ruta pero la imagen aún no existe, la web muestra el emoji y la imagen
  aparece apenas la subas (no se rompe nada).

---

## 6. Panel de Staff + puntajes por ronda

Página privada (`staff/`) donde árbitros y hosts registran, **por juego**, el puntaje de
cada equipo/jugador **por ronda**. El **total se suma solo** y se calcula la tabla de
posiciones. Al guardar, se escribe en tu Google Sheet y aparece en la web pública.

> La web pública solo **lee** la hoja. Para **escribir** se usa un **Google Apps Script**
> (gratis, parte de tu cuenta de Google). Es una configuración que se hace **una sola vez**.

### ⚠️ Sobre la seguridad
- La contraseña se verifica **en el servidor** (dentro del Apps Script), no en el código
  que descarga el navegador.
- Es una protección **sencilla** para un torneo, no de nivel bancario. Usa una clave
  dedicada, no la compartas fuera del staff y cámbiala si se filtra.
- La página `staff/` lleva `noindex` (no la indexa Google) y no se enlaza desde el sitio,
  pero quien adivine la URL puede abrir el login. Sin la contraseña no puede guardar nada.

### Instalación (una sola vez, ~5 minutos)

**1) Pega el script en tu hoja**
1. Abre tu **Google Sheet**.
2. **Extensiones ▸ Apps Script**.
3. Borra lo que haya y **pega todo** el contenido de `apps-script/Codigo.gs`.
4. Cambia la línea `const STAFF_PASSWORD = "cambia-esta-clave";` por tu contraseña.
5. **Guarda** (💾).

**2) Publícalo como aplicación web**
1. **Implementar ▸ Nueva implementación**.
2. En "Tipo" (engranaje ⚙️) elige **Aplicación web**.
3. **Ejecutar como:** *Yo* — **Quién tiene acceso:** **Cualquier persona**.
4. **Implementar** y **autoriza** los permisos.
5. Copia la **URL** que termina en `/exec`.

**3) Conecta el panel**
1. Abre `js/config.js`.
2. Pega la URL en `appsScriptURL: "https://script.google.com/.../exec",`.
3. Sube a GitHub la carpeta `staff/` y el `js/config.js` actualizado.

Entra a `tusitio.com/staff/`, escribe la contraseña y listo.

> 🔁 **Si luego editas `Codigo.gs`**, los cambios no se aplican solos: ve a
> **Implementar ▸ Administrar implementaciones ▸ ✏️ ▸ Versión: Nueva ▸ Implementar**.
> (Si creas una implementación totalmente nueva, la URL cambia y hay que volver a pegarla
> en `config.js`.)

### Cómo se usa
1. Entra a `…/staff/` y escribe la contraseña.
2. Elige el **juego** en el selector.
3. **Puntajes por ronda:** cada fila es un equipo o jugador (escribes el nombre que toque).
   Pon el puntaje de cada ronda en su columna; el **Total** se suma solo. Deja en blanco
   las rondas que aún no se juegan.
   - **+ Ronda / – Ronda:** agrega o quita columnas de ronda.
   - **+ Equipo/Jugador:** agrega una fila. La **✕** la quita.
   - Arriba se muestra **"Ronda X en juego"**.
4. **Campeones:** escribe 1.º, 2.º y 3.º lugar.
5. **💾 Guardar cambios:** escribe la pestaña `Rondas` y recalcula sola `Posiciones`.
6. **↻ Recargar:** vuelve a traer lo que hay en la hoja.

### (Opcional) Auto-suma al editar la hoja a mano
Para que `Posiciones` se recalcule también cuando edites `Rondas` directamente en Google
Sheets: en el editor de Apps Script, elige la función **`instalarDisparador`** y pulsa
**Ejecutar** una vez (autoriza cuando lo pida).

### Modo demo
Si `appsScriptURL` está vacío en `config.js`, el panel funciona en **modo demo**: puedes
probar la interfaz con datos de ejemplo, pero **no guarda nada**.

---

## 7. Ajustes generales (config.js)

En **`js/config.js`** están, comentados, los datos que rara vez cambian:

- `whatsapp`, `donacionWhatsapp`, `discord`, redes (`instagram`, `tiktok`, `youtube`).
- `googleSheetID` (el ID de tu hoja). Si lo dejas en `""`, la web usa los datos locales.
- `appsScriptURL` (la URL del staff, sección 6).
- Nombres de las pestañas, fecha del torneo, PDF del reglamento, precio por defecto.

---

## 8. Si no quieres usar Google Sheets

Puedes editar todo directamente en **`js/datos-locales.js`** (listas `JUEGOS`,
`REGLAMENTO`, `PREMIOS`, `TORNEO`, `STREAMS`). Ese archivo es el **respaldo** y funciona
aunque no haya hoja: es lo que la web muestra mientras carga, o si la hoja falla. Para usar
**solo** datos locales, deja `googleSheetID: ""` en `js/config.js`.

> No borres `datos-locales.js`: es la red de seguridad del sitio público.

---

## 9. Problemas frecuentes

**La página carga sin estilos (texto negro sobre blanco).**
No se cargó `css/estilos.css`: casi siempre las carpetas no se subieron bien. Confirma que
en el repo existen las carpetas `css/` y `js/` con sus archivos dentro. Solución rápida:
usa `index-todo-en-uno.html` (renómbralo a `index.html`).

**La página carga vacía (se ve el diseño pero sin contenido).**
Suele ser un archivo de `js/` que no subió o quedó viejo, o caché del navegador. Recarga
con caché limpia: **Ctrl + F5** (Windows/Linux) o **Cmd + Shift + R** (Mac). Si sigue,
abre la página, pulsa **F12 ▸ Console** y revisa los errores en rojo (un `404` indica qué
archivo falta). La versión `index-todo-en-uno.html` evita este problema.

**El staff no puede entrar o guardar / error de red.**
Casi siempre: la implementación del Apps Script no quedó como **"Cualquier persona"**,
falta pegar la URL `/exec` en `config.js`, o editaste el script sin crear una **versión
nueva** de la implementación.

**"Contraseña incorrecta".**
Revisa `STAFF_PASSWORD` en el Apps Script (distingue mayúsculas).

**Un resultado no aparece en la web pública.**
Verifica que el nombre del juego coincide **exacto** en `Juegos`, `Rondas`, `Posiciones` y
`Ganadores`. Espera un momento y recarga: la lectura pública tiene un pequeño retraso.

**Subí logo/imágenes y no se ven.**
`logo.png` va en la raíz (junto a `index.html`) y las imágenes en `imagenes/`, con el mismo
nombre que pusiste en la columna **Imagen** de la pestaña `Juegos`.

---

## Resumen rápido

| Quiero… | Dónde lo hago |
|---------|---------------|
| Quitar / añadir un juego | Pestaña **Juegos** (columna **Activo**, o agrega/borra fila) |
| Cambiar el costo de un juego | Pestaña **Juegos**, columna **Costo** |
| Poner la imagen de un juego | Pestaña **Juegos**, columna **Imagen** + subir la imagen a `imagenes/` |
| Editar reglas | Pestaña **Reglamento** |
| Registrar puntajes por ronda | **Panel de staff** (`/staff/`) → se guardan en `Rondas` |
| Ver la tabla de posiciones | Se **calcula sola** (no se edita a mano) |
| Editar campeones | **Panel de staff**, o pestaña **Ganadores** |
| Editar premios | Pestaña **Premios** |
| Cambiar transmisiones | Pestaña **Transmisiones** |
| WhatsApp, Discord, redes, fecha | `js/config.js` |
| Conectar el panel de staff | `apps-script/Codigo.gs` + `appsScriptURL` en `js/config.js` |

---

*Sitio del torneo Software E-Sports 2026 · 2da Edición.*
