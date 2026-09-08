# Usabilidad para control de calidad en terreno — hallazgos y recomendaciones

**Fecha de investigación:** 2026-09-08
**Motivo:** Apex Fruit va a contratar a una persona externa de control de calidad que será la usuaria diaria real del sistema. No es programadora, probablemente no tiene un perfil técnico avanzado, y va a usar el sistema parada en la línea de packing, muchas veces desde el celular, con las manos ocupadas o mojadas, a veces antes del amanecer o con sol directo en la pantalla.

Este documento no rediseña el sistema — señala qué ajustar para que una persona nueva sin capacitación técnica pueda usarlo bien desde el primer turno, y contrasta el modelo de datos y el formulario actuales (`apps/web/prisma/schema.prisma`, `apps/web/src/app/inspecciones/nueva/NuevaInspeccionForm.tsx`) contra lo que la plantilla de campo real de Apex Fruit (`docs/research/material-existente.md`) le pide anotar hoy en papel.

---

## 1. Quién es la usuaria y qué implica para el diseño

- **No es técnica.** No hay que asumir que entiende qué es un "enum", un "borrador", o que sepa qué pasa si pierde señal a mitad de un formulario. Cada pantalla debe explicarse sola.
- **Usa el celular parada, en movimiento, con guantes o manos húmedas.** Objetivos táctiles grandes (la guía de diseño ya fija 44px de alto de fila en mobile — ese mismo criterio debe aplicarse a botones y controles del formulario, no solo a tablas).
- **Trabaja bajo presión de tiempo real.** El camión con fruta no espera a que termine de tipear; cada campo que se puede autocompletar, precalcular o convertir en una opción de un toque en vez de tipeo libre, ahorra segundos que se multiplican por decenas de inspecciones al día.
- **Su fuente de verdad hoy es papel + WhatsApp + Excel.** Cualquier fricción nueva que el sistema introduzca por sobre ese hábito (más pasos, más pantallas, más cosas que recordar) es una razón real para volver al papel "por esta vez", que es como fracasan estos sistemas en la práctica.

---

## 2. Onboarding y capacitación: qué tan simple debe ser

Referencia de la industria (Clarifresh y similares, ver `requisitos.md` §5): estas herramientas apuestan a que un inspector nuevo pueda registrar su primera inspección real sin manual, en su primer turno. Eso implica:

1. **Cero configuración inicial a cargo de la usuaria.** Login con email/password ya existe y es lo mínimo correcto; no agregar pasos de "primero configura tu perfil" o "elige tus preferencias" antes de poder registrar una inspección.
2. **El formulario debe poder completarse de arriba hacia abajo sin tener que devolverse.** Hoy el formulario ya sigue ese orden (lote → inspector → fecha → parámetros → defectos → fotos), lo cual es correcto — pero es un formulario largo de una sola pantalla con ~20 campos visibles a la vez. Para una usuaria nueva, es más fácil de aprender si la primera vez que lo ve el flujo se siente como "iría contestando preguntas", no como "lleno una planilla". No es necesario convertirlo en un wizard de varios pasos para el MVP, pero si el tiempo alcanza, dividir en 3 pantallas cortas (Identificación del lote → Mediciones → Defectos y fotos) reduce la sensación de "formulario de Excel" y baja la tasa de campos saltados por error.
3. **Los valores por defecto tienen que ser los correctos el 95% de las veces**, para que la usuaria casi nunca tenga que tocarlos: fecha = hoy (ya está), inspector = ella misma (ya está y además está bloqueado para el rol INSPECTOR, correcto), resultado por defecto = Categoría 1 (ya está). Cada campo que la usuaria tiene que tocar sin necesidad real es una oportunidad de error.
4. **Un solo "camino feliz" documentado, no un manual de 18 secciones.** El manual operativo real de Apex Fruit (`Manual_Inspeccion_ApexFruit_FINAL.docx`, 18 secciones) es la referencia correcta de las reglas de negocio, pero no debe traducirse en 18 secciones de interfaz. La regla práctica: si una sección del manual no cambia lo que la usuaria hace con las manos en el momento de inspeccionar (ej. protocolos de qué hacer si el lote queda objetado, a quién avisar), va como texto de ayuda/tooltip o como documentación aparte para el jefe de calidad — no como campos adicionales del formulario.
5. **Mensajes de error que dicen qué hacer, no que algo salió mal.** La guía de diseño ya fija este principio (§3 "Formularios" en `guia-diseno.md`: "explica qué pasó y qué hacer, no un genérico 'campo inválido'"). Es el punto más crítico de todo el documento para una usuaria no técnica: un error como "Firmeza debe ser un número entre 0 y 100" es capacitación en sí mismo: le enseña el rango válido sin que nadie se lo explique antes.

---

## 3. Evitar errores de tipeo y de carga en terreno

### 3.1 Reemplazar texto libre por opciones donde el dato es realmente categórico

El principio: **si el universo de valores válidos es conocido y finito, no debe ser un `<input type="text">`.** Cada campo de texto libre es una oportunidad de error de tipeo, de inconsistencia entre inspectores (uno escribe "80% cobertura", otro "cobertura 80", otro "80%") y de datos que después no se pueden agregar ni graficar de forma confiable.

Estado actual del formulario (`NuevaInspeccionForm.tsx`) y qué falta:

| Campo | Estado actual | Problema | Recomendación |
|---|---|---|---|
| **Calibre** (cereza) | Select con categorías reales (Pre, L, XL, J, 2J, 3J, 4J) | Ninguno — ya sigue el patrón correcto | Usar como modelo para las demás especies |
| **Calibre** (manzana/pera/kiwi) | `<input type="text">` libre, placeholder `"70-75mm"` | Cada inspector tipea el formato distinto; imposible de agregar/filtrar de forma confiable en el dashboard | Definir tabla de calibres por especie (ya lo pide `requisitos.md` §2 — "tablas de calibre configurables") y convertir a select, igual que cereza |
| **Color** (todas las especies no-cereza) | `<input type="text">` libre, placeholder `"80% cubrimiento"` | Mismo problema: texto libre sin estructura | Para manzana/pera/kiwi, definir una escala corta de opciones (ej. insuficiente / aceptable / óptimo, o rangos de % predefinidos) en vez de texto libre |
| **% Dark / % Light** (cereza) | Input numérico 0–100 | Correcto — es una medición real, no una categoría | Sin cambios |
| **Defectos: tipo** | Select con el catálogo completo | Correcto | Sin cambios, pero ver 3.2 sobre el flujo de carga |
| **Espera > 1h antes de hidrocooler** | Select Sí/No | Correcto — patrón a imitar para cualquier campo binario | Sin cambios |
| **Firmeza** | Input numérico libre, sin rango visible en pantalla | Sin validación de rango en el momento; una usuaria puede tipear 750 en vez de 75 sin que nada la alerte | Agregar validación en el momento (rango esperado según especie/unidad) con mensaje explicativo, no solo al guardar |
| **% Rechazo total**, **% de la muestra por defecto** | Input numérico libre 0–100 sin tope | Nada impide tipear 150% | Agregar `max=100` y validación en el momento |

### 3.2 El flujo de carga de defectos es el punto de mayor fricción hoy

El formulario actual agrega defectos **uno por uno** con un botón "+ Agregar defecto" (hasta 10 filas), y cada fila requiere: abrir el select, elegir el tipo, tipear el %, tipear la cantidad. Comparado con la plantilla de papel real de cereza (`material-existente.md` §2.1), que ya lista los 15 defectos posibles (5 de calidad + 10 de condición) en una tabla fija donde la persona solo llena el % al lado de los que encontró, el flujo actual le pide a la usuaria **recordar y buscar** cada defecto en un menú, en vez de **reconocer** el defecto en una lista ya visible — reconocer es más rápido y con menos error que recordar, especialmente bajo presión de tiempo.

**Recomendación concreta:** para especies con catálogo de defectos cerrado y conocido (cereza hoy; cualquier especie que en el futuro tenga su propio catálogo configurado), mostrar la lista completa de defectos posibles como filas fijas (agrupadas visualmente en Calidad / Condición, tal como ya distingue `categoriaDefecto` en `src/lib/normas.ts`) con un campo de % junto a cada uno, dejando en 0 o vacío los que no se detectaron. Esto:
- Elimina el paso de "buscar el defecto en el menú".
- Hace visible de un vistazo cuáles son los defectos que sí importan para la especie actual (evita que alguien elija por error un defecto de otra fruta que quedó en el catálogo por compatibilidad legada, como `DESGRANE` o `DANO_GRANIZO`, que el propio schema marca como "legado / no forman parte del catálogo real de cereza").
- Coincide exactamente con la plantilla en papel que la persona ya conoce, bajando la curva de aprendizaje a casi cero para quien migra de papel al sistema.

### 3.3 Validación en el momento, no solo al guardar

Hoy la validación es mínima y del lado servidor (confirmado en `apps/web/README.md`, pendiente #8: "Validación de formularios más robusta"). Para una usuaria de terreno esto importa más que para un desarrollador probando en escritorio: si el error solo aparece después de enviar el formulario completo (con conexión intermitente, con el celular en la mano, quizás habiendo tomado ya varias fotos), corregir un typo de hace diez campos es una fricción real que invita a abandonar el registro o a tipear cualquier cosa para poder avanzar. Recomendación de prioridad alta pese a ser "no visible" en una demo: validar rango y formato campo por campo mientras se tipea (`onBlur` es suficiente, no hace falta validar por cada tecla), con el mismo estilo de mensaje ya definido en la guía de diseño.

### 3.4 Teclado numérico correcto en celulares

Todos los campos numéricos (`firmeza`, `brixGrados`, `acidez`, `pesoMuestraKg`, porcentajes, cantidades) deberían forzar el teclado numérico del celular (`inputMode="decimal"` o `"numeric"` según corresponda, más allá de `type="number"`, que en varios navegadores móviles igual muestra el teclado alfabético completo). Es un cambio de una línea por campo con impacto directo en velocidad de carga y en errores de tipeo (evita que aparezcan letras sueltas por rozar la tecla equivocada en un teclado completo).

---

## 4. Campos indispensables vs. "nice to have" por tipo de inspección

Esta clasificación no propone eliminar campos del modelo de datos — todos los campos actuales tienen respaldo en `requisitos.md` o en `material-existente.md`. Propone qué debe **verse siempre** en el formulario principal y qué puede quedar **oculto tras un "modo avanzado" o sección colapsable**, para que la usuaria nueva no enfrente ~20 campos simultáneos cuando la mayoría de las inspecciones del día son rutinarias.

### 4.1 Indispensable siempre (cualquier especie)

- Lote (selección, no tipeo — ya es select)
- Inspector (autocompletado, ya lo es)
- Fecha (con default de hoy, ya lo es)
- Calibre
- Al menos un resultado de defectos (aunque sea "sin defectos detectados" explícito — hoy no existe esa opción explícita, el formulario simplemente puede quedar sin filas de defecto, lo cual es ambiguo entre "no se revisó" y "no tiene defectos")
- Resultado / clasificación final (autocalculado para cereza, y recomendable extender el autocálculo a las demás especies apenas tengan su propio catálogo de tolerancias)
- Al menos una foto de la fruta muestreada

### 4.2 Indispensable según especie, pero puede ocultarse para las especies donde no aplica (ya se hace parcialmente)

El formulario ya condiciona por especie con buen criterio (`esCereza` oculta/muestra % Dark, % Light y la sección completa de hidroenfriado). Esta misma técnica debería extenderse a:

- **Firmeza**: unidad y rango esperado cambian por especie (Durofel en cereza, libras en kiwi, kgF en manzana/pera) — hoy el label ya cambia dinámicamente, correcto; falta el rango de validación en el momento (ver 3.3).
- **Color**: relevante siempre, pero la forma de capturarlo debería ser distinta por especie en vez de un único campo de texto libre genérico (ver 3.1).

### 4.3 Candidatos a "modo avanzado" (no rutinarios, no deberían competir por atención con lo esencial)

- **Acidez**: solo relevante para uva de mesa, que hoy no está entre las 4 especies activas del demo (manzana/pera/kiwi/cereza, según `guia-diseno.md`). Se puede ocultar completamente salvo que la especie lo amerite.
- **N° de cajas muestreadas / N° de unidades muestreadas / Peso de muestra (kg)**: son datos de trazabilidad importantes, pero en la práctica real (ver `index.html` en `material-existente.md` §1) el tamaño de muestra requerido **se calcula automáticamente según el número de totes/bins del lote**, no se tipea a criterio del inspector. Recomendación: en vez de "nice to have para ocultar", esto es candidato a **autocompletar/calcular** a partir de `cajasTotales` del lote (aplicando la tabla real: 1–150 totes → 1,0 kg; 151–300 → 2,0 kg; 301–500 → 3,0 kg; >500 → 4,0 kg) y solo dejarlo editable si la usuaria necesita corregirlo. Esto elimina tipeo y elimina una fuente de error de cumplimiento de norma de muestreo.
- **Observaciones (texto libre)**: debe quedar disponible siempre pero al final del formulario y sin marcarlo como obligatorio — es el único campo donde el texto libre es correcto porque no hay forma de anticipar todo lo que un inspector puede necesitar anotar.

---

## 5. Desajustes entre el modelo de datos actual y lo que la persona de control de calidad anota hoy en papel

Contraste directo entre `apps/web/prisma/schema.prisma` + el formulario actual, y la plantilla de campo real descrita en `material-existente.md` §2.1–2.2. Estos son los desajustes concretos que una persona que migra de papel al sistema notaría de inmediato:

1. **No existe un folio/N° de reporte legible.** El modelo usa `cuid()` como identificador de la inspección; la plantilla real pide un "N° de Reporte" que la usuaria pueda escribir a mano, comunicar por WhatsApp o buscar rápido ("el reporte tal"). Un `cuid` no cumple esa función. Esto también es lo que pide `requisitos.md` §1.1 ("N° de inspección/folio correlativo interno") y hoy no está implementado como campo visible ni buscable.
2. **Solo se puede registrar un instrumento de firmeza a la vez.** El schema tiene un único par `firmeza` / `firmezaUnidad`. La plantilla real de cereza pide **dos mediciones en paralelo** (Durofel en UD y FirmPro en gf/mm) porque se usan dos instrumentos distintos en la misma inspección. Hoy no hay forma de registrar ambas sin perder una.
3. **No existe temperatura de pulpa en recepción.** El schema sí tiene `hidrocoolerTempPulpaPostC` (temperatura de pulpa *después* del hidroenfriado), pero la plantilla real también pide la temperatura de pulpa **al momento de la recepción**, con tolerancia ≤25°C, como un dato distinto y anterior. Falta ese campo.
4. **No hay distinción entre "Materia Prima" y "Producto Terminado" como dos momentos de inspección con tolerancias distintas.** El manual operativo (`material-existente.md` §2.2) es explícito: son dos tablas de tolerancia distintas (ej. pudrición húmeda tolera 0–1% en materia prima pero 0% en producto terminado). Hoy `evaluarResultadoCereza()` en `src/lib/normas.ts` aplica un único criterio (12% condición / 1% pudrición húmeda) sin distinguir en qué etapa se hizo la inspección. Es el desajuste de mayor impacto de negocio de esta lista, ya señalado como recomendación #4 en `material-existente.md` §7.
5. **No hay captura de firma.** El modelo actual no tiene ningún campo ni tabla para firma digital o física. La plantilla real pide **tres firmas** (Inspector Apex Fruit, Jefe de Calidad, Representante Exportadora). Aunque capturar las tres firmas en el MVP es exigente, ni siquiera la firma del propio inspector — la más simple de agregar — existe hoy. Ver `docs/research/integraciones-recomendadas.md` para una propuesta de implementación de bajo esfuerzo.
6. **No hay tolerancias de embalaje.** La plantilla/manual real definen tolerancias específicas de empaque (Descalibre 8%, Bajo Peso 4%, Embalaje/Etiquetado Erróneo 0%, Especie/Variedad Errónea 0%) que hoy no tienen representación en el modelo de defectos (que está orientado a defectos de fruta, no de embalaje).
7. **Las fotos no siguen la convención de nomenclatura real.** El modelo `Foto` solo guarda `url` y `descripcion` libre. El manual real exige nomenclatura fija (`AAAAMMDD_Productor_Variedad_TipoDeFoto`, ej. `20251201_LasFuentes_Lapins_Firmeza.jpg`). Para la usuaria esto no es un problema de tipeo (no es ella quien nombra el archivo), pero si el sistema no clasifica automáticamente el "tipo de foto" (fruta / defecto / hidrocooler / etiqueta) al subirla, se pierde la organización que la Fase 2 de IA por fotos (`requisitos.md` §4) necesita más adelante — vale la pena, como mínimo, agregar un campo de "tipo de foto" con opciones (no texto libre) al subir cada foto.
8. **No existe el flujo de "lote objetado" como estado, solo como resultado final.** El manual real describe un protocolo completo (reinspección → aviso a jefe de calidad y comercial → decisión de la exportadora, nunca de Apex Fruit → registro de hora de detección, hora de aviso, persona contactada y decisión). Hoy `ResultadoInspeccion` es un valor final sin historial de este proceso. No es urgente para el MVP, pero si se implementa una versión mínima (un campo de notas de seguimiento en la inspección objetada), evita que ese seguimiento vuelva a vivir solo en WhatsApp, que es exactamente lo que el sistema busca reemplazar.
9. **Tipo de inspección (origen/packing) no está modelado.** `requisitos.md` §1.1 lo pide como campo de contexto del lote; hoy ni `Lote` ni `Inspeccion` distinguen si la inspección ocurrió en huerto o en packing. Es un dato barato de agregar (un enum de 2 valores) con valor real para reportes y dashboard.

---

## 6. Patrones de uso móvil/offline que más importan en un packing chileno real

`requisitos.md` §6 ya recomienda PWA con guardado local como plataforma — este documento no repite esa decisión, la complementa desde el ángulo de la usuaria:

1. **Conectividad intermitente es la norma, no la excepción, en un packing rural del Maule.** El riesgo más costoso no es "la app es lenta", es **perder los datos que la usuaria ya tipeó** porque se cortó la señal a mitad del formulario. Aunque el 100% offline (sincronización automática en segundo plano) es ambicioso para el plazo, el mínimo no negociable es que **nunca se pierda un formulario a medio llenar por pérdida de señal o cierre accidental de la pestaña** — un guardado local automático (borrador en el propio navegador) cubre el 80% del riesgo con una fracción del esfuerzo de una solución offline completa, y ya está sugerido como alternativa mínima viable en `requisitos.md` §6.3.
2. **Evitar el doble envío por reintento.** Con conexión inestable, es común que una usuaria presione "Guardar" dos veces porque no vio confirmación la primera vez. El botón de envío debe deshabilitarse inmediatamente al presionarlo y mostrar un estado de "guardando…" visible, para no generar inspecciones duplicadas.
3. **Cámara directa, no selector de galería.** El flujo de carga de fotos debe abrir la cámara del dispositivo directamente (`capture` en el input de archivo) como opción principal, no obligar a la usuaria a salir de la app, tomar la foto, volver y navegar la galería para encontrarla — cada paso extra en el packing es una foto que "se toma después" y termina sin subirse.
4. **Pantalla legible con sol directo y en escala de grises por batería baja.** La guía de diseño ya lo exige explícitamente para los badges de estado (§4 "Badges de estado de inspección" en `guia-diseno.md`: nunca depender solo de color). Este mismo criterio debe extenderse a cualquier indicador nuevo que se agregue (ej. si se agrega un semáforo de firmeza o de tolerancia, debe llevar ícono + texto, no solo el tinte).
5. **Sesión que no expira a mitad de una inspección.** Si el token de sesión vence mientras la usuaria está completando un formulario largo en el packing, perder el trabajo y tener que loguearse de nuevo es exactamente el tipo de fricción que hace que alguien vuelva al papel. Vale la pena revisar que la expiración de sesión (hoy fija en 7 días según `apps/web/README.md`) no interrumpa un formulario en progreso, y que si expira, el navegador conserve el borrador local para no perder la carga.
6. **Orientación y tamaño de fuente.** El formulario debe usarse cómodo en portrait (una mano sostiene el celular, la otra fruta o toca la pantalla) — la guía de diseño ya define mobile como una columna, lo cual es correcto para este caso de uso.

---

## 7. Resumen de recomendaciones (orden sugerido de implementación)

1. Agregar validación en el momento con mensajes explicativos (rango de firmeza, tope 100% en porcentajes) — bajo esfuerzo, alto impacto en confianza de una usuaria nueva.
2. Convertir el catálogo de defectos de "agregar fila por fila" a "lista fija con % por defecto" para especies con catálogo cerrado (cereza hoy) — coincide exactamente con la plantilla de papel que la usuaria ya conoce.
3. Reemplazar calibre y color de texto libre por opciones/categorías en las especies no-cereza — mismo patrón ya usado para calibre de cereza.
4. Agregar `inputMode` numérico correcto a todos los campos numéricos — cambio mínimo, impacto directo en velocidad de tipeo.
5. Autocalcular tamaño de muestra sugerido a partir de `cajasTotales` del lote, dejándolo editable.
6. Guardado local automático de formulario en progreso (borrador de navegador) para no perder datos por corte de señal.
7. Agregar folio/N° de reporte legible, tipo de inspección (origen/packing) y campo de temperatura de pulpa en recepción — campos baratos de agregar al schema con alto valor de trazabilidad.
8. Evaluar, si el tiempo alcanza dentro del plazo del MVP, separar inspección de Materia Prima vs. Producto Terminado como dos tipos con tolerancias distintas — es el desajuste de mayor impacto de negocio, pero también el de mayor esfuerzo de esta lista.
