# Guía de diseño — Panel interno Apex Fruit

Esta guía extiende la identidad de marca del sitio público de Apex Fruit SPA hacia el
panel interno de inspección y control de calidad. No se inventa una marca nueva: se
respeta la paleta, el tono técnico-cercano y el vocabulario del negocio, y se agregan
las piezas que un sitio de marketing no necesita — estados de dato, densidad de tabla,
formularios de campo, gráficos.

El panel lo usan inspectores y administradores **todos los días**, muchas veces desde
el celular parados en la línea de packing. Prioridad: legible rápido, denso pero
ordenado, cero ambigüedad sobre el estado de un lote.

## 1. Paleta

### 1.1 Base de marca (heredada, sin cambios)

| Token | Hex | Uso en el panel |
|---|---|---|
| `--green-950` | `#0f2a20` | Sidebar, fondos oscuros, modo oscuro (superficie) |
| `--green-800` | `#164735` | Hover/activo sobre sidebar oscuro |
| `--green-700` | `#1f6b49` | Acción primaria, enlaces, foco |
| `--green-500` | `#3e9b63` | Acentos secundarios, iconografía activa |
| `--leaf` | `#a6c84f` | Chips positivos, variación al alza, detalle de marca |
| `--gold` | `#e7a93d` | Acento de marca, CTA secundaria, base de "advertencia" |
| `--cream` | `#f6f1e5` | Fondo de página (light) |
| `--paper` | `#fffdf8` | Superficie de tarjetas/tablas (light) |
| `--white` | `#ffffff` | Superficie elevada puntual (modales, popovers) |
| `--ink` | `#15211b` | Texto primario (light) |
| `--muted` | `#5d6b62` | Texto secundario, ayudas, placeholders |
| `--line` | `#dfe6dd` | Bordes, separadores |

### 1.2 Estados de dato (nuevos, derivados de la marca)

El panel necesita cuatro estados que el sitio público no tiene. Se construyeron a
partir de los hues de marca donde fue posible (éxito y advertencia son casi literales
a `--green-700` y `--gold`) y se agregaron dos hues nuevos —rojo para rechazo, azul
para información— porque la marca no tenía ni rojo ni azul y **un estado de rechazo
nunca puede heredar un verde o un dorado** sin romper la lectura de semáforo.

Cada color se validó con la herramienta `validate_palette.js` de la skill de dataviz
(seis chequeos: banda de luminosidad, piso de croma, separación bajo daltonismo,
piso a visión normal, contraste). Los cuatro pasan contraste ≥3:1 sobre `--paper`;
por eso **ningún estado se comunica solo con color** — siempre va acompañado de un
ícono y una etiqueta de texto (badge), nunca un punto de color solo.

| Estado | Uso | Texto/ícono (light) | Fondo tinte (light) | Texto/ícono (dark) |
|---|---|---|---|---|
| Éxito / Aprobado | Lote aprobado, defecto bajo umbral | `#1f6b49` | `#e4f0e9` | `#3fa06a` |
| Advertencia | Cerca del umbral, revisión pendiente | `#b8790f` | `#faf0da` | `#e0a83f` |
| Rechazo / Crítico | Sobre umbral de rechazo, defecto grave | `#b3261e` | `#fbe6e3` | `#e2645a` |
| Información | Notas, estados neutros, en proceso | `#2f6f8f` | `#e4eef2` | `#5a9ec2` |

### 1.3 Paleta categórica para gráficos (identidad de variedad)

Para comparar variedades en un mismo gráfico (líneas, barras agrupadas) se fija un
**orden único que no cambia entre pantallas**: quien vea "verde = manzana" en el
dashboard debe ver lo mismo en el detalle de lote. El orden es también la medida de
seguridad ante daltonismo — no es cosmético, no se reordena por gráfico.

| Orden | Variedad | Light | Dark |
|---|---|---|---|
| 1 | Arándano | `#2e6da4` | `#4a8bc9` |
| 2 | Manzana | `#2f7a4f` | `#3fa06a` |
| 3 | Cereza | `#c0392b` | `#e2643f` |
| 4 | Uva de mesa | `#7c5aa8` | `#9678c4` |

Validado en pares adyacentes (uso real: barras agrupadas y líneas, nunca dispersión
libre) en ambos modos — pasa banda de luminosidad, piso de croma, piso de visión
normal y contraste; la separación CVD queda en banda "aceptable con apoyo" (ΔE 6–8),
por eso **todo gráfico de variedades lleva leyenda + etiqueta directa**, nunca color
solo. Si en el futuro se necesita una 5ª variedad, no se inventa un color: se
pliega a "Otras" o se separa en un panel aparte — ocho hues es el techo del método,
y para gráficos de dispersión libre (no aplica hoy) el techo real son 3.

**No reusar** los hues de estado (rojo `#b3261e`, azul `#2f6f8f`) como color de
variedad y viceversa: cereza-rojo y rechazo-rojo son hues cercanos a propósito
para pertenecer a la misma familia visual "fruta", pero por eso mismo **nunca
comparten gráfico** — un gráfico de % de rechazo por variedad usa el hue de
severidad (estado), no el hue de identidad de variedad, y notas al pie/leyenda
aclaran cuál está activo.

### 1.4 Neutrales de UI (extensión, no está en el sitio público)

El sitio público solo necesita `--ink`/`--muted`/`--line`. El panel necesita más
pasos de gris para tablas densas, fondos anidados y estados deshabilitados. Se
generaron con un leve sesgo verde (no gris puro) para que sigan leyendo como parte
de la misma marca:

`--surface-2: #f0ece1` (fondo de fila alterna) · `--surface-3: #e7e1d3` (fondo de
celda de encabezado) · `--disabled: #b7bdb2` · `--focus-ring: #3e9b63` a 40% opacidad.

## 2. Tipografía

El sitio público usa Arial/Helvetica — correcto para una landing simple, insuficiente
para una tabla de 200 filas con calibres, porcentajes y códigos de lote donde los
dígitos deben alinear.

**Recomendación: IBM Plex Sans + IBM Plex Mono** (Google Fonts, ambas con soporte
completo de tildes y "ñ").

- **IBM Plex Sans** — interfaz, títulos, cuerpo. Fue diseñada para paneles técnicos
  (IBM), tiene el mismo carácter serio/sobrio que ya transmite el verde de la marca,
  pero con más matices de peso (400/500/600/700) que Arial para construir jerarquía
  sin subir el tamaño de fuente — clave en pantallas densas.
- **IBM Plex Mono** — códigos de lote (`LT-2026-0347`), porcentajes, calibres, guías
  de despacho y cualquier columna de tabla donde los números deben alinear
  verticalmente. Le da al panel un aire "de instrumento de medición", coherente con
  ser una empresa de *inspección y control técnico*, no de e-commerce.

```
Google Fonts:
https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap
Fallback: "IBM Plex Sans", Arial, Helvetica, sans-serif
Fallback mono: "IBM Plex Mono", ui-monospace, "Courier New", monospace
```

### Escala tipográfica

| Rol | Tamaño / línea | Peso | Familia |
|---|---|---|---|
| Título de página | 24 / 30px | 600 | Plex Sans |
| Título de tarjeta/sección | 16 / 22px | 600 | Plex Sans |
| Cifra KPI (hero number) | 32 / 36px | 600 | Plex Sans, tabular-nums |
| Cuerpo / celda de tabla | 14 / 20px | 400 | Plex Sans |
| Etiqueta de campo, eyebrow | 12 / 16px, +0.04em tracking, mayúsculas | 600 | Plex Sans |
| Código de lote, % , calibre | 13–14 / 20px | 500 | Plex Mono, tabular-nums |
| Ayuda / metadato | 12 / 16px | 400 | Plex Sans, `--muted` |

## 3. Principios de layout para pantallas densas en datos

1. **La grilla de 12 columnas vive en el contenido, no en la pantalla completa.**
   El sidebar y la barra superior son fijos; el área de trabajo adentro usa grid con
   `gap`, nunca márgenes acumulados entre tarjetas.
2. **Resumen antes que detalle.** Cada pantalla abre con lo que decide una acción
   (KPIs, estado del lote, alertas) y el detalle tabular queda debajo o en un panel
   lateral — un inspector escanea, no lee de corrido.
3. **El estado se ve en la forma, no solo en el color.** Un badge de rechazo lleva
   ícono + texto + tinte de fondo; una fila crítica en tabla lleva además un borde
   izquierdo de 3px del color de estado — así funciona aunque alguien tenga el
   celular en luz de sol directa en el packing.
4. **Tablas con encabezado fijo (`sticky`) y overflow horizontal propio.** El body
   de la página nunca scrollea lateralmente; la tabla sí, dentro de su contenedor.
   Columna de estado y acciones siempre visibles (no se pierden al hacer scroll
   horizontal): van fijas a la izquierda/derecha con `position: sticky`.
5. **Mobile no es "el desktop encogido".** Bajo ~720px las tablas de listado pasan a
   tarjetas apiladas (una por fila, con las mismas etiquetas), los formularios pasan
   a una columna, los KPIs pasan a scroll horizontal de tarjetas. El formulario de
   nueva inspección se piensa mobile-first porque se llena en la línea, no en la
   oficina.
6. **Números alineados.** Toda columna numérica (%, kg, calibre, cantidad de
   defectos) usa `font-variant-numeric: tabular-nums` y alineación a la derecha.
7. **Densidad controlada.** Alto de fila de tabla: 44px (objetivo táctil en mobile),
   40px en desktop denso. Padding de tarjeta: 20px desktop / 16px mobile. Nunca
   menos que eso — es más rápido scrollear un poco más que forzar la vista.

## 4. Aplicación a componentes

### Tablas
- Encabezado: `--surface-3`, texto `--muted`, 12px mayúsculas, `sticky top`.
- Fila: `--paper`, alterna con `--surface-2`. Hover: `--cream`.
- Fila con estado crítico: borde izquierdo 3px `#b3261e` + fondo `#fbe6e3` al 40%.
- Celda de estado: badge (ver más abajo), nunca texto de color suelto.
- Celdas numéricas: Plex Mono, tabular-nums, alineadas a la derecha.

### Tarjetas de métrica / KPI
- Superficie `--paper`, borde 1px `--line`, radio 10px, sombra solo en hover si es
  interactiva (una tarjeta no interactiva no lleva sombra — la sombra se reserva
  para lo que se puede abrir).
- Cifra grande en Plex Sans 600 + tabular-nums; eyebrow arriba en mayúsculas
  `--muted`; delta (▲/▼ %) en color de estado, nunca en `--leaf` o `--gold` "porque
  quedan lindos" — el delta es semántico.
- Sparkline opcional debajo de la cifra: 2px, color de estado, sin ejes.

### Formularios
- Un campo por fila en mobile; en desktop, pares de campos relacionados (ej.
  "Calibre" + "Color") comparten fila vía grid de 2 columnas.
- Label 12px mayúscula `--muted` encima del campo (nunca placeholder-como-label).
- Foco: anillo de 2px `--green-500` al 40% + borde `--green-700` sólido.
- Error de campo: borde `#b3261e`, texto de ayuda debajo en el mismo color con
  ícono — explica qué pasó y qué hacer, no un genérico "campo inválido".
- Acción primaria (Enviar/Guardar) siempre `--green-700` sólido; acción secundaria
  (Guardar borrador) contorno `--line` con texto `--ink`; nunca dos botones sólidos
  compitiendo por atención en la misma fila.

### Badges de estado de inspección
Forma fija: ícono (12px) + texto (12px, 600, mayúsculas ligeras) + fondo tinte +
radio 999px (píldora). Los cuatro estados posibles de un lote:

`● Aprobado` verde · `▲ Advertencia` dorado · `✕ Rechazado` rojo · `… En revisión` azul

Nunca se usa un punto de color aislado como único indicador de estado — el texto
va siempre, porque el panel se usa también con el celular en modo escala de grises
por batería baja en terreno (caso real de uso en packing).

## 5. Modo oscuro

El panel define modo oscuro completo (no es opcional en una herramienta que se usa
antes del amanecer en la línea de packing). Superficie oscura de referencia
`#132420` (variante de `--green-950`), texto primario `#f3f0e6`, texto secundario
`#a9b8ae`, bordes `#24382f`. Los hues de estado y de variedad tienen su propio paso
más claro para modo oscuro (ver tablas §1.2 y §1.3) — no es un filtro invertido,
son pasos elegidos y validados contra la superficie oscura real.

## Mockups

Artifact publicado con las 4 pantallas clave (dashboard, listado de inspecciones,
formulario de nueva inspección, detalle de lote), navegables desde el menú lateral,
con datos de ejemplo de variedades del Maule (manzana, uva de mesa, cereza,
arándano) y con selector de modo claro/oscuro en la barra superior:

https://claude.ai/code/artifact/4ccafeb4-ae33-47fb-a2e7-c1c1fb62cacb
