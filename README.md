# 🎮 Cómo editar la web del torneo — Guía fácil

No necesitas saber programar. Solo vas a **cambiar textos entre comillas**.

### Lo único que tienes que saber para empezar
1. Abre el archivo **`index.html`** con el **Bloc de notas** (o cualquier editor de texto).
2. Para encontrar algo rápido usa **Ctrl + F** (en Mac: Cmd + F) y escribe la palabra que te indico abajo.
3. Cambia **solo lo que está entre comillas** `"así"`. No borres las comillas ni las comas.
4. Guarda (Ctrl + S) y abre la web para ver el cambio.

> 💡 Casi todo se edita en una sola zona del archivo. Busca con Ctrl+F la palabra **`CONFIG`** y empieza por ahí.

---

## 📋 Tabla rápida — "Quiero cambiar… → busca esto"

| Quiero cambiar… | Busca con Ctrl+F |
|---|---|
| Número de **WhatsApp** | `whatsapp:` |
| Enlace de **Discord** | `discord:` |
| **Precio** por jugador | `precioPorJugador:` |
| **Fecha** del torneo | `fechaTorneo:` |
| **Transmisiones** de Twitch | `streams:` |
| WhatsApp para **donaciones** | `donacionWhatsapp:` |
| **Instagram / TikTok / YouTube** | `instagram:` |
| **Premios** de cada juego | `PREMIOS` |
| **Ganadores y tabla** de posiciones | `TORNEO` |
| El **logo** | (pon tu imagen, ver al final) |

---

## 1) WhatsApp, Discord y precio

Busca `whatsapp:` y verás algo así:

```
whatsapp: "593989336030",
discord:  "https://discord.gg/YnHqrNw9",
precioPorJugador: 7,
```

- **WhatsApp:** solo números, con el código del país y **sin** el `+`.
  Ejemplo Ecuador: país `593` + número `989336030` = `"593989336030"`.
- **Discord:** pega el enlace completo de tu invitación.
- **Precio:** cambia solo el número (aquí `7`). El total de la inscripción se calcula solo.

---

## 2) Premios de cada juego

Busca `PREMIOS`. Verás un bloque por juego. Cambia el texto de cada puesto:

```
"Fortnite": {
  oro:    "$75 + Trofeo + Medallas",   ← premio del 1.º lugar
  plata:  "$45 + Medallas",            ← 2.º lugar
  bronce: "Diploma + Medallas"         ← 3.º lugar
},
```

Puedes escribir lo que quieras entre comillas: `"$100 + Trofeo"`, `"Vale de $50"`, etc.
Haz lo mismo con Valorant, League of Legends y COD Mobile.

---

## 3) Ganadores y tabla de posiciones

Busca `TORNEO`. Por cada juego hay dos cosas:

```
"Fortnite": {
  ganadores: ["Equipo A", "Equipo B", "Equipo C"],   ← campeón, 2.º y 3.º
  posiciones: [
    {equipo:"Equipo A", pj:5, pts:42},
    {equipo:"Equipo B", pj:5, pts:38},
    {equipo:"Equipo C", pj:5, pts:30}
  ]
},
```

- **ganadores:** los 3 nombres del podio (en orden: 1.º, 2.º, 3.º).
- **posiciones:** cada renglón es un equipo. `pj` = partidas jugadas, `pts` = puntos.
  La tabla se ordena sola del que más puntos tiene al que menos.
- Para **agregar un equipo**: copia un renglón completo y pégalo debajo.
- 👉 Recuerda: cada renglón termina en coma `,` **menos el último** de la lista.

---

## 4) Transmisiones en vivo (Twitch)

Busca `streams:` y verás:

```
streams: [
  {
    juego: "Valorant",
    host:  "Host Principal",
    canal: ""        ← aquí va el nombre del canal de Twitch
  },
  {
    juego: "COD Mobile",
    host:  "Host Secundario",
    canal: ""
  }
],
```

- En **`canal`** pon **solo el nombre del canal**, no el enlace.
  Si tu canal es `twitch.tv/softwareesports`, escribe `canal: "softwareesports"`.
- Si lo dejas vacío (`""`), ese recuadro dirá **"Transmisión próximamente"**.
- El título que se ve arriba del video (Valorant, COD Mobile) lo cambias en **`juego`**.

> 📺 Nota: el video de Twitch solo se ve cuando la web ya está publicada en internet.
> Si abres el archivo desde tu computadora puede salir en negro; es normal.

---

## 5) Fecha del torneo

Busca `fechaTorneo:`.

- Si lo dejas vacío → la web muestra **"Por confirmar"**.
- Si pones una fecha → aparece una **cuenta regresiva**. Se escribe así:

```
fechaTorneo: "2026-12-20T18:00:00",
```

Eso significa: 20 de diciembre de 2026 a las 6:00 de la tarde
(formato: año-mes-día**T**hora:minuto:segundo, en 24 horas).

---

## 6) Donaciones y redes sociales

```
donacionWhatsapp: "593989336030",   ← WhatsApp para coordinar donaciones

instagram: "",   ← pega tu enlace, ej: "https://instagram.com/tucuenta"
tiktok:    "",
youtube:   ""
```

Si dejas una red en `""` (vacío), su ícono **no aparece**. Así de simple.

---

## 7) El logo

La web busca una imagen llamada **`logo.png`**. Pon tu logo con **ese mismo nombre**
en la **misma carpeta** que el archivo `index.html`. Listo, aparecerá solo.

---

## ⚠️ 3 reglas para no romper nada

1. Cambia **solo lo que está entre comillas** `"..."`.
2. **No borres las comas** entre líneas (cada línea de una lista lleva coma, menos la última).
3. **No cambies las palabras de la izquierda** (`oro`, `equipo`, `canal`, etc.); cambia solo lo que va después.

Si algo deja de verse, casi siempre es por una comilla o una coma de menos. Revisa el último cambio que hiciste.

---

¡Eso es todo! Cambias contenido sin tocar el diseño. 🚀
