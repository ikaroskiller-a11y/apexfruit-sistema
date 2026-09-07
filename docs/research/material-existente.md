# Material existente de Apex Fruit — hallazgos y recomendaciones

Este documento consolida material real encontrado en el computador del dueño (no inventado): prototipos previos, plantillas de campo, manuales de procedimiento y normas de calidad de un cliente exportador. El objetivo es que el sistema deje de verse "genérico" y refleje los estándares reales con los que Apex Fruit ya trabaja para exportación a India, Europa y China.

## 1. Prototipo "MissionControl" existente

Se encontraron dos cosas distintas bajo el mismo nombre, en `OneDrive\Desktop\Control\`:

- **`ApexFruit_MissionControl_v13.html`** (y sus versiones anteriores v2–v12): **no es un sistema de inspección**. Es una aplicación gamificada tipo RPG de escritorio personal ("RPG personal de preparación para temporada cereza"), con XP, misiones, cofres, jefes y streaks — un tracker de tareas de negocio gamificado para que el dueño no perdiera de vista sus pendientes antes de la temporada. Las "misiones" revelan tareas reales de negocio: completar base de clientes, crear plantilla de inspección, redactar manual de inspección, tener contratos listos, definir tarifas. **No hay nada reutilizable en código** — es solo contexto de qué priorizaba el dueño en su momento. No amerita revisar las versiones intermedias.

- **`index.html`** (en la misma carpeta): **este sí es la herramienta real de control de calidad** que se usa hoy para la recepción de cerezas. Es una página estática (sin backend, sin base de datos — cada inspección es efímera) que:
  - Captura: fecha, código/productor (CSG), variedad (Santina/Lapins/Bing/Regina), cantidad de totes.
  - Calcula automáticamente el tamaño de muestra requerido según totes (1–150 → 1,0 kg; 151–300 → 2,0 kg; 301–500 → 3,0 kg; >500 → 4,0 kg).
  - Captura °Brix y Firmeza Durofel, y **recomienda el tipo de embarque** según firmeza: ≥75 UD → Muy Firme → marítimo mercados lejanos (China, Asia Premium); 70–74,9 → Firme → marítimo mercados cercanos; 65–69,9 → Blanda → aéreo/terrestre; <65 → Muy Blanda → aéreo/terrestre.
  - Registra defectos en dos categorías: **CALIDAD** (Russet, Fuera de Color, Ausencia de Pedicelo — no detienen el lote) y **CONDICIÓN** (Partiduras, Heridas Abiertas, Pudrición Húmeda, Machucón — si la suma de condición > 12% o la pudrición húmeda > 1%, el lote queda **OBJETADO**).
  - Genera el PDF final en el navegador con `jsPDF` + `AutoTable` (sin servidor) y ofrece un botón para enviar un mensaje pre-armado por WhatsApp (🔴 alerta / 🟢 aprobado).
  - **Este código generó exactamente** el archivo `Reporte_QC_csg-05667_20260605.pdf` que está en Downloads — confirma que esta herramienta está en uso real, no es solo una maqueta.

  **Recomendación:** no portar este código (es una versión simplificada, sin persistencia). Sí portar toda su lógica de negocio (tabla de muestreo, umbrales de firmeza/tránsito, criterio de objeción) al sistema actual, que ya la tiene parcialmente — pero el sistema actual debe reemplazarla por el catálogo mucho más completo de la sección 2.

## 2. Estándares reales por especie

### 2.1 Cereza — plantilla de campo real (`Plantilla_Inspeccion_Cerezas_ApexFruit.docx`)

Esta es la plantilla operativa que Apex Fruit ya usa en papel/Word. Es mucho más completa que el formulario actual del sistema. Campos que **faltan hoy** en `apps/web` y deberían agregarse:

- **Identificación**: N° de Reporte, Exportadora (cliente distinto del productor), Fecha de Cosecha, Kilos de Muestra, **Mercado Destino** explícito.
- **Parámetros físicos**: dos instrumentos de firmeza en paralelo — Durofel (UD) y FirmPro (gf/mm) — con clasificación de 4 niveles (Muy Firme >75 UD / Firme 70–75 / Blanda 65–69,9 / Muy Blanda <65). Temperatura de pulpa en recepción (tolerancia ≤25°C).
- **Calibres de cereza**: Pre, L, XL, J, 2J, 3J, 4J (no es un rango libre en mm como está modelado hoy — son categorías estándar de la industria, y 2J/3J/4J son "muy valorado/premium en Asia").
- **Distribución de color**: % Dark / % Light, color dominante — para cereza esto es tan importante como el calibre.
- **Catálogo de defectos real** (mucho más grande que el actual): 5 defectos de CALIDAD (Russet, Fuera de Color, Ausencia de Pedicelo, Frutos Deformes, Manchas) + 10 defectos de CONDICIÓN (Sobremadurez, Partiduras, Heridas Abiertas, Pudrición Húmeda, Pudrición Seca, Pitting, Machucón, Pedicelo Deshidratado, Medialunas, Golpe de Sol) — cada uno con **tolerancia de 3 niveles** (Cat.1 / Cat.2 / Objetado), no un solo umbral binario.
- **Control de hidroenfriado** como sección propia: T° agua (0–2°C), cloro libre (100–120 ppm), tiempo de exposición (3–5 min, o máx. 2,5 min si la fruta viene llovida), T° pulpa post-hidrocooler, tiempo de espera antes del hidrocooler (<1h / >1h).
- **Resultado final en 3 niveles**, no 2: Categoría 1 / Categoría 2 / Objetado (hoy el sistema tiene Aprobado / Aprobado con observaciones / Rechazado — hay que decidir si se renombra o se mapea).
- **3 firmas**: Inspector Apex Fruit, Jefe de Calidad, Representante Exportadora (hoy el reporte solo deja espacio para 1 firma + timbre).

### 2.2 Cereza — manual operativo completo (`Manual_Inspeccion_ApexFruit_FINAL.docx`, 18 secciones)

Este es el SOP (procedimiento estándar) completo de la empresa. Highlights que el sistema debería modelar o al menos documentar:

- **Dos tablas de tolerancia distintas** según etapa: **Materia Prima** (recepción) vs. **Producto Terminado** (antes de despacho) — el producto terminado es mucho más estricto (ej. Pudrición Húmeda: 0–1% tolerado en materia prima, pero **0% tolerancia en producto terminado**, cualquier pudrición es objeción automática). Esto implica que el sistema necesita **dos tipos de inspección por lote**, no una sola.
- **Tolerancias de embalaje** aparte: Descalibre 8%, Bajo Peso 4%, Embalaje/Etiquetado Erróneo 0%, Especie/Variedad Errónea 0%.
- **Control de línea de proceso y paletizaje/despacho**: temperatura de agua con dióxido de cloro, peso de caja con tolerancia por deshidratación, temperatura de sellado, y para despacho: set point de contenedor reefer (-1,0°C o -0,5°C), ventilación en CBM, ubicación de 2 termógrafos por contenedor, diferencia de manejo marítimo vs. aéreo.
- **Tabla semáforo de decisión rápida** (🟢 OK / 🔴 Alerta / acción inmediata) — un patrón de UI directamente aplicable a badges/alertas del dashboard.
- **Set fotográfico requerido**, con nomenclatura de archivo obligatoria: `AAAAMMDD_Productor_Variedad_TipoDeFoto` (ej. `20251201_LasFuentes_Lapins_Firmeza.jpg`). El sistema debería adoptar esta convención al nombrar/organizar fotos subidas, no nombres genéricos.
- **Protocolo ante lote objetado**: reinspección inmediata con el mismo total de kilos → si persiste, avisar a jefe de calidad y comercial de la exportadora → **la exportadora decide, Apex Fruit nunca decide** → registrar hora de detección, hora de aviso, persona contactada y decisión, por escrito. Esto es un flujo de estado que el sistema podría modelar explícitamente (inspección → objetada → reinspeccionada → decisión del cliente registrada).
- Contacto de responsable QC confirmado: Maicol Barrios (+56 9 8221 2519).

### 2.3 Kiwi — norma real de un cliente exportador (`NC-KIW-CE-01`, Exportadora Andes Bhumi, 47 páginas)

Este documento no es de Apex Fruit sino de una **exportadora cliente** (Andes Bhumi) — confirma que **cada cliente puede traer su propia norma**, y el sistema debería permitir asociar un perfil de tolerancias/norma por cliente, no solo uno global. Datos concretos ya utilizables:

- **Certificaciones por mercado, explícitas**: USDA U.S. Nº1 para EE.UU.; GlobalGAP + GRASP obligatorio para Europa.
- **Firmeza mínima por mercado de destino** (dato directamente relevante para el pedido del dueño): USA >6 lbs, Europa >10 lbs, **Japón/Corea/China/India >12 lbs**, Latinoamérica >6 lbs.
- **Color por mercado**: mercados asiáticos (Japón, China) exigen **solo fruta verde**; el resto acepta verde y café pero uniforme por caja.
- **Calibres con valor comercial explícito por mercado**: calibres grandes (2J/3J equivalentes, >28mm) están marcados como "muy valorado en Asia" / "premium Asia" — el mismo patrón que en cereza.
- **Tolerancias de defectos en caja embalada, por bloque de mercado**: una columna para India/Europa/China/UK y otra para USA/LATAM (no son iguales — ej. Russet 5% para India/Europa/China/UK vs. <8% para USA/LATAM). Esto confirma que el modelo de tolerancias debe ser **configurable por mercado de destino**, no un valor fijo por especie.
- **Requisitos logísticos específicos por mercado**: envíos a India/China/Europa/Rusia requieren 100% de los despachos con filtro de permanganato de potasio (control de etileno) y absorbedor de etileno por caja; China exige certificado de inspección SAG en cada pallet; Corea/Taiwán/Filipinas exigen etiquetas de exportación específicas en inglés en las 4 caras del pallet.
- **Clasificación de lote a proceso en 5 niveles** según % de fruta exportable: 1 (>84%, Muy bueno) / 2 (70–84%, Bueno) / 3 (55–69%, Objetado) / 4 (40–54%, Rechazado) / R (<40%, Rechazado).
- Menciona un **"sistema Andes Bhumi"** al que se debe ingresar la información de recepción para generar un **reporte automático a productores, gerente general, gerente de producción, agrónomos y gerente de aseguramiento de calidad** — es decir, el cliente de Apex Fruit ya espera un flujo de reporte automático multi-destinatario, un antecedente directo para la función de "reporte diario" de la sección 4.

Se encontraron además dos tablas de tolerancia de kiwi adicionales, más granulares aún, en fotos sueltas (`WhatsApp Image...5.40.40 PM.jpeg`, "Tabla de Tolerancia Kiwis 2026" con 3 categorías CAT I / CAT 1-2 Plano / CAT II Extrafancy) — señal de que las tolerancias por kiwi varían también por sub-categoría comercial, no solo por mercado.

**No se alcanzó a revisar en profundidad** (quedó pendiente, baja prioridad relativa): `MANUAL PROCESO ARANDANOS 2013-2014 V 1 ss.pdf` (manual de arándano, más antiguo — arándano ya no está en las frutas activas del demo) y `Protocolo QC Cerezas temp 2025-2026.pdf` (probablemente superado por el manual FINAL ya revisado en 2.2). Tampoco se revisaron `Tarifario_ApexFruit_2025-2026.docx`, `Tarifas_ApexFruit_2025-2026.docx` ni `Preguntas_para_mi_socio.docx` — se priorizó lo directamente accionable para el producto. Una foto adicional (`WhatsApp Image...5.32.17 PM.jpeg`) muestra una tabla de codificación de lotes de un cliente de arándano en Perú (Family Farms Peru S.R.L., formato Lote Campo / Variedad / Código Variedad / Código Lote / registro SENASA) — útil como referencia de convención de códigos de lote si en el futuro se retoma arándano o se opera en Perú, pero no urgente ahora.

## 3. Formato real del reporte QC

El reporte que genera `index.html` (y que corresponde exactamente al PDF real `Reporte_QC_csg-05667_20260605.pdf`) tiene esta estructura: encabezado con banda de color de marca + banda de estado (verde/rojo) con el veredicto grande, tabla "Datos de Origen", tabla "Calidad Tecnológica", tabla "Defectos" con fila de suma y resaltado en rojo de las celdas que gatillan objeción, pie de página con fecha de generación y el criterio de objeción en texto plano.

Comparado con el reporte que ya construimos en `apps/web/src/app/inspecciones/[id]/reporte/page.tsx`: la estructura general es equivalente (encabezado, datos del lote, parámetros, tabla de defectos, firmas), pero **le falta**: la banda de estado grande con color (hoy el resultado es una etiqueta chica), resaltar en rojo las celdas específicas que gatillan la objeción (hoy solo se ve el badge "crítico"), y el texto explícito del criterio de objeción aplicado. Vale la pena incorporar estos tres detalles — son baratos de implementar y hacen que el reporte se vea más "real" para quien ya conoce el formato actual.

## 4. Idea de coordinación + reporte diario al exportador

(Resumen de `idea_coordinacion_y_reporte.md`, ya conocido, incluido acá para que quede junto al resto de hallazgos de producto.) Propone dos funcionalidades nuevas, no construidas aún:

- **Módulo de coordinación de recepción**: el huerto avisa antes de que el camión llegue al packing (variedad, calibre estimado, cantidad de bins, temperatura de pulpa de salida, hora estimada de llegada, nombre del conductor). Hoy se hace con Google Forms + planilla compartida — es candidato natural a ser un formulario simple dentro del sistema, con un aviso al inspector.
- **Reporte diario al exportador**: al cierre de turno, un reporte corto en lenguaje de negocio (no técnico): estado del día (verde/rojo), bins recibidos, pallets procesados, temperatura de hidrocooler, resumen de defectos vs. tolerancias, y en días con alerta: hora del desvío, foto con timestamp, acción tomada, y **estimación del impacto financiero en USD** — este último dato es, según el propio documento, "lo que le importa al exportador" y el principio de diseño central del reporte.

Esto encaja como una vista adicional en el dashboard (resumen diario, no solo por inspección) y como un tipo de reporte separado del reporte técnico por inspección que ya existe.

## 5. Capturas de pantalla

**No se alcanzó a revisar la carpeta de capturas** (`OneDrive\Pictures\Screenshots\`, 340 archivos, mayo–septiembre 2026) por límite de tiempo de esta investigación. Dado que ya se encontraron y analizaron en profundidad los dos prototipos reales relevantes (`index.html` y el manual/plantilla), es probable que las capturas más valiosas sean pantallazos de esas mismas herramientas — bajo prioridad hacer ese repaso ahora. Si el dueño recuerda una fecha aproximada de alguna captura puntual que quiera rescatar, conviene pedírsela directamente en vez de revisar las 340 a ciegas.

## 6. Assets de marca

Logo real de Apex Fruit encontrado en `OneDrive\Pictures\apex1.png` / `apex2.png`: una manzana/fruta verde con hojas dentro de un círculo, con el texto "APEXFRUIT" en naranja debajo. Hoy el sistema usa un círculo genérico con las iniciales "AF" como placeholder en el sidebar y en el reporte — debería reemplazarse por este logo real (recortado/exportado sin el fondo de cuadrícula de la herramienta de diseño donde se ve el archivo actual).

## 7. Recomendación concreta y priorizada

En orden de impacto para dejar de verse "genérico" y reflejar los estándares reales de exportación:

1. **Reemplazar el catálogo de defectos y tolerancias genérico por el real de cereza** (sección 2.1/2.2): 5 defectos de calidad + 10 de condición, con tolerancia de 3 niveles (Cat.1/Cat.2/Objetado) en vez de un solo umbral. Es el cambio de mayor impacto porque es lo que un inspector real notaría de inmediato.
2. **Modelar calibre de cereza como categorías reales** (Pre, L, XL, J, 2J, 3J, 4J) en vez de un campo de texto libre, y sumar distribución de color (%Dark/%Light).
3. **Agregar mercado de destino como campo de primera clase**, y condicionar a él la firmeza mínima exigida (USA >6 / Europa >10 / Japón-Corea-China-India >12 lbs) y el tipo de embarque recomendado — esto es exactamente el estándar "exportación a India/Europa/China" que pidió el dueño.
4. **Separar inspección de Materia Prima vs. Producto Terminado** como dos tipos de inspección con tablas de tolerancia distintas (la de producto terminado es más estricta — pudrición 0% tolerancia).
5. **Agregar sección de Control de Hidroenfriado** a la inspección (temperatura de agua, cloro libre, tiempos de exposición) — hoy no existe en el modelo de datos.
6. **Reemplazar el logo placeholder "AF" por el logo real** (sección 6) — cambio rápido y de alto impacto visual para una demo.
7. **Mejorar el reporte PDF** con banda de estado grande de color y resaltado de las celdas que gatillan objeción (sección 3) — barato y hace que el reporte se sienta "igual al de siempre" para quien ya lo conoce.
8. **Considerar un perfil de norma/tolerancias por cliente** (sección 2.3) en vez de un único estándar global — es una pieza más grande de trabajo, pero es la diferencia real entre un sistema genérico y uno que sirve para una empresa mediana/grande con múltiples exportadoras, cada una con su propia norma.
