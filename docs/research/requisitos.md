# Requisitos del Sistema Interno de Gestión de Calidad e Inspección de Fruta — Apex Fruit SPA

**Fecha de investigación:** 2026-09-07
**Alcance:** Sistema interno (no el sitio web público). Centraliza archivos de inspección, calidad de fruta y gráficos/reportes.
**Plazo:** 1 mes para tener un MVP funcionando.
**Empresa:** Apex Fruit SPA — Curicó y Teno, Región del Maule, Chile.
**Fundadores:** Alamiro Ignacio Farias Moreno, Maicol Esteban Barrios Sepulveda.
**Servicios actuales:** control de calidad en packing, inspección de fruta en origen, reportes técnicos, seguimiento por temporada.
**Proceso actual con clientes:** Contacto (WhatsApp) → Coordinación → Inspección → Reporte.

---

## 1. Modelo de datos típico de una inspección de calidad frutícola

Basado en formularios de inspección usados por empresas de control de calidad frutícola (QCInspec, QCForms, Clarifresh) y en la práctica de packing/origen en Chile, una inspección típica registra tres bloques de información: **contexto del lote**, **datos de muestreo/medición**, y **evidencia fotográfica + estado del reporte**.

### 1.1 Contexto del lote / partida

- **N° de inspección / folio** (correlativo interno)
- **Fecha y hora de inspección**
- **Tipo de inspección**: en origen (huerto/predio) o en packing
- **Cliente / exportadora** (quién solicita el servicio)
- **Productor / predio / cuartel** (nombre del campo, ubicación, productor)
- **Packing** (nombre y ubicación, si aplica)
- **Especie / fruta**: manzana, uva de mesa, cereza, arándano, ciruela, kiwi, etc.
- **Variedad** (ej. Gala, Fuji para manzana; Crimson, Thompson, Red Globe para uva; Santina, Lapins, Regina para cereza; Duke, Legacy para arándano)
- **N° de lote / partida / guía de despacho**
- **N° de bins o cajas involucradas / volumen total (kg o cajas)**
- **Destino de mercado** (si se conoce: EE.UU., China, Europa, etc. — porque cambia la tolerancia aplicable)
- **Inspector responsable** (usuario del sistema)
- **Estado del reporte**: borrador / en revisión / aprobado / enviado al cliente

### 1.2 Muestreo y mediciones de calidad

- **Tamaño de muestra** (n° de unidades inspeccionadas, criterio de muestreo aleatorio por bin/caja)
- **Calibre** (tamaño/conteo por caja, ej. manzana 100-198, uva en gramos por racimo, cereza en mm/fila)
- **Color** (escala o categoría según variedad, % de cobertura de color)
- **Firmeza** (medida en kg/cm² o lb, con penetrómetro)
- **°Brix** (sólidos solubles, refractómetro — clave en uva, cereza, arándano)
- **Acidez** (cuando aplica, ej. relación sólidos/acidez en uva)
- **Peso de racimo** (uva) / **peso de baya** (arándano, cereza)
- **Presión pedicelo / estado de pedicelo** (cereza, uva)
- **Temperatura de pulpa** (control de cadena de frío)
- **Firmeza de pulpa / turgencia**
- **Defectos y daños** — lista de conteo por tipo de defecto, con severidad (leve/grave) y % sobre la muestra (ver 1.3 por especie)
- **% de rechazo / % de descarte** (calculado o ingresado, por defecto crítico vs. tolerable)
- **Clasificación resultante**: aprobado / aprobado con observaciones / rechazado
- **Observaciones / comentarios técnicos del inspector**

### 1.3 Defectos comunes por especie (referencia práctica, típicos en fruta del Maule)

| Fruta | Defectos/daños típicos a registrar |
|---|---|
| **Manzana** | Russeting (manchas ásperas), manchas por sol/quemadura, deformación, magulladuras (bruising), punción/daño mecánico, oídio, bitter pit, deshidratación, color insuficiente, defectos de pedúnculo |
| **Uva de mesa** | Lenticelas, bayas abiertas/partidas, bayas "aguadas" o nubladas, deshidratación de raquis, pudrición (Botrytis), daño por SO2 (blanqueado), desgrane, falta de color, cicatrices por roce |
| **Cereza** | Pitting (picado por manipulación), partidura (cracking), pedicelo seco/oscuro, deshidratación, pudrición, doble fruto, deformación, magulladuras, falta de firmeza |
| **Arándano** | Daño por insectos, bayas blandas, deshidratación, decoloración/manchas, "bloom" ausente (no es defecto en sí pero se registra), pudrición, cicatrices de cosecha, calibre disparejo |

> Nota: estos son campos de referencia operativa, no una copia de norma alguna. Cada norma/comprador puede exigir una lista de defectos específica — el sistema debería permitir **catálogos de defectos configurables por especie y por cliente**, no una lista fija y cerrada.

### 1.4 Evidencia y cierre

- **Fotos** (múltiples por inspección: fruta, defectos específicos, etiquetado de caja, condición de bins/cámara)
- **Firma o validación del inspector** (aprobación digital simple)
- **Adjuntos adicionales** (PDF de norma del cliente, guía de despacho, certificado fitosanitario si aplica)
- **Historial de cambios** (quién editó qué y cuándo, útil para trazabilidad y para resolver disputas con clientes)

---

## 2. Estándares de referencia usados en control de calidad frutícola de exportación

Resumen práctico de qué existe y para qué sirve (sin reproducir texto de las normas):

- **USDA Grade Standards (Agricultural Marketing Service, EE.UU.)**: normas voluntarias que definen grados de calidad (ej. U.S. Extra Fancy, U.S. Fancy, U.S. No.1 para manzana; U.S. No.1 y U.S. Commercial para cereza) y tolerancias de tamaño y defectos por lote. Sirven como "lenguaje común" de calidad entre exportador e importador, especialmente para el mercado de EE.UU. Existen normas específicas publicadas por USDA-AMS para manzana, uva, cereza dulce y arándano, cada una con su propia tabla de calibres y tolerancias de defecto/daño serio.
- **Calibres de exportación**: cada especie tiene sus propias tablas de calibre (por conteo de piezas por caja en manzana, por gramos de racimo o mm de baya en uva/cereza, por diámetro en arándano). Los calibres exigidos varían según mercado de destino y comprador, por lo que conviene que el sistema permita definir **tablas de calibre configurables** en vez de hardcodear una sola tabla.
- **Tolerancias de defectos**: las normas típicamente fijan un % máximo de fruta con defectos "tolerables" y un % mucho menor (o cero) para defectos "serios" o pudrición, calculado sobre el tamaño de la muestra inspeccionada. Este concepto (tolerancia % + severidad) es el que debe modelarse en el sistema, no los números exactos de una norma particular (que cambian por temporada/comprador).
- **GlobalG.A.P.**: estándar de certificación de buenas prácticas agrícolas, ampliamente exigido por retailers europeos; no es un estándar de "defectos de fruta" en sí, pero exige trazabilidad de campo a packing — relevante si Apex Fruit quiere ofrecer reportes compatibles con auditorías GlobalG.A.P a futuro.
- **Especificaciones propias del cliente/exportadora**: en la práctica chilena, cada exportadora suele tener su propia guía de calidad (ej. las guías publicadas por comités de ASOEX como el Comité de Cerezas) que combina y adapta las normas base según el mercado de destino. Esto refuerza que el sistema **debe permitir plantillas de inspección distintas por cliente**, no una única plantilla rígida.

Conclusión práctica: el sistema no debe "implementar" una norma específica como regla fija, sino modelar **catálogos configurables** (especie → variedad → calibres válidos → defectos válidos → tolerancias) que el administrador pueda ajustar por cliente/temporada, ya que las exigencias cambian según exportadora y mercado de destino.

---

## 3. Funcionalidades del MVP (ordenadas por prioridad)

Objetivo: reemplazar WhatsApp/Excel/papel dispersos por un sistema central, en 1 mes, sin sobre-diseñar.

### Prioridad 1 — Núcleo indispensable
1. **Autenticación y roles de usuario**: Inspector (crea/edita sus inspecciones) vs. Administrador (ve todo, gestiona clientes/catálogos, aprueba reportes).
2. **Gestión de clientes/exportadoras**: alta simple de cliente (nombre, contacto, packing asociado).
3. **Gestión de lotes/partidas**: crear un lote asociado a cliente + productor + especie + variedad.
4. **Registro de inspecciones**: formulario con los campos descritos en la sección 1 (contexto + muestreo + defectos), con catálogo de defectos configurable por especie.
5. **Carga de fotos** desde celular/tablet directo a la inspección (multi-foto, asociadas a defectos específicos si es posible).

### Prioridad 2 — Cierre del ciclo con el cliente
6. **Generación de reportes exportables (PDF)**: reporte con logo de Apex Fruit, datos del lote, resultados de muestreo, fotos, % de rechazo, firma del inspector — listo para enviar por WhatsApp/correo al cliente (mantiene el flujo actual pero centralizado).
7. **Estados de reporte** (borrador → revisión → aprobado → enviado) para que el administrador controle qué sale a nombre de la empresa.
8. **Historial y búsqueda de inspecciones**: filtrar por cliente, fecha, especie, packing, inspector.

### Prioridad 3 — Valor agregado (dashboard)
9. **Dashboard con gráficos de calidad**:
   - % de rechazo por lote / por cliente
   - Evolución de calidad por temporada (línea de tiempo)
   - Comparativa por variedad (ej. qué variedad tiene más defectos)
   - Comparativa por packing/productor
   - Ranking de defectos más frecuentes por especie
10. **Exportación de datos** (Excel/CSV) para análisis externo o respaldo.

### Consideración de alcance para 1 mes
Dado el plazo, se recomienda **NO** intentar en el MVP: multi-idioma, integraciones con básculas/refractómetros conectados, firma digital avanzada, notificaciones push complejas, ni módulos de facturación. Esas son mejoras post-MVP.

---

## 4. Funcionalidades futuras (Fase 2+, roadmap — no diseñar aún)

- **Reconocimiento de fruta por foto (IA / visión computacional)** para autocompletar calibre y detectar defectos automáticamente a partir de fotos tomadas en la inspección. Enfoques técnicos viables a evaluar más adelante:
  1. **Modelos de visión ya entrenados / servicios cloud (transfer learning ligero)**: partir de modelos pre-entrenados de detección de objetos (ej. arquitecturas tipo YOLO) y re-entrenarlos con fotos propias de Apex Fruit (cientos/miles de fotos etiquetadas por especie) — camino más rápido y barato al inicio.
  2. **APIs de visión por computador de terceros / modelos multimodales generales (ej. modelos de lenguaje con visión)** para clasificación rápida sin entrenar nada propio — útil como prueba de concepto o para volúmenes bajos, pero con menor precisión específica en defectos finos (pitting, russeting, etc.).
  3. **Modelo propio entrenado desde cero o especializado por especie**, usando dataset propio construido con las fotos que el sistema ya habrá acumulado durante la Fase 1 — el camino de mayor precisión a largo plazo, pero requiere volumen de datos etiquetados y tiempo de desarrollo/validación considerable.
  - **Nota clave**: la Fase 1 (MVP) debe diseñarse pensando en que las fotos queden bien estructuradas (asociadas a especie, variedad, defecto reportado por el inspector) desde el día uno, porque ese seteo es lo que permitirá entrenar un modelo propio en el futuro sin tener que re-recolectar datos.
- Integración directa con instrumentos de medición (penetrómetro, refractómetro Bluetooth) para evitar tipeo manual.
- Notificaciones automáticas a clientes cuando un reporte se aprueba/envía.
- Portal de cliente (que la exportadora vea sus propios reportes sin pedirlos por WhatsApp).
- Certificaciones/auditoría GlobalG.A.P u otras normas específicas por cliente.

---

## 5. Ejemplos de software similar existente en el mercado

Referencias de la industria (packing/QC/trazabilidad agrícola), útiles para comparar qué funcionalidades son "estándar":

- **Clarifresh** (clarifresh.com): software de control de calidad para fruta fresca (cerezas, uvas, arándanos, etc.), con app móvil, **modo offline** (permite inspeccionar sin conexión y sincronizar después), integración con instrumentos de medición (ej. refractómetro ATAGO para Brix), y calificación de atributos por escala simple (Bueno/Regular/Malo). Es quizás la referencia más cercana al caso de uso de Apex Fruit.
- **QCForms** (qcforms.com): plataforma y app para control de calidad y puntos críticos en fruticultura — cubre inspección en huerto, packing, planta de proceso, recepción de fruta y monitoreo de calidad, con dashboard gráfico para ver muchos lotes a la vez, conectado a una base de datos analítica propia.
- **QCInspec** (qcinspec.com): servicio/software de inspección de calidad en origen y en destino, enfocado en verificar que la fruta que llega cumple los requisitos y estándares del cliente.
- **PackingApp** (packingapp.cl): software chileno de gestión de packing y campo — control de calidad, trazabilidad (de qué cuartel viene la fruta, cuándo se cosechó, en qué packing se procesó, en qué cámara estuvo, a qué cliente se despachó), cumplimiento de normativas como GlobalG.A.P y FSMA.
- **Agrocheck** (agrocheck.cl): trazabilidad de bins desde el campo hasta la planta.
- **Im Packing / global ID (Pack ID)**: software de trazabilidad y gestión de embalajes usado en la región (Argentina/LatAm), con enfoque similar de control por caja/lote.

**Funcionalidades que se repiten en todos estos productos** (= lo que el mercado considera "estándar" y por tanto conviene incluir tarde o temprano):
- Registro estructurado de inspección con catálogo de defectos por especie
- Modo offline con sincronización posterior
- Fotos asociadas a la inspección
- Dashboard/reportes gráficos por lote y por período
- Trazabilidad de origen (campo → packing → cliente)
- Reportes exportables para el cliente final

---

## 6. Recomendación de plataforma

**Recomendación: Web app responsive (mobile-first) con soporte offline básico (PWA), accesible desde navegador en celular, tablet y notebook — no apps nativas separadas por ahora.**

Justificación:

1. **Un solo desarrollo, múltiples dispositivos**: dado el plazo de 1 mes, desarrollar una app nativa de escritorio + una app nativa móvil + web sería inviable. Una **web app responsive** (que se ve bien tanto en celular como en notebook) permite que el inspector cargue datos desde el packing con su celular y el administrador revise reportes y dashboards desde una notebook, sin duplicar esfuerzo de desarrollo.
2. **El celular ya es el dispositivo natural del inspector en terreno**: el proceso actual (WhatsApp) ya ocurre en celular. Una web app mobile-first respeta ese hábito y permite tomar fotos directo con la cámara del dispositivo.
3. **Conectividad intermitente en campo/packing**: como referencia de la industria (Clarifresh, AgtechApps y similares), lo estándar es dar **modo offline con sincronización posterior** — el formulario de inspección se guarda localmente en el dispositivo y se sube cuando hay señal. Para el MVP en 1 mes esto se puede lograr con una **PWA (Progressive Web App)**: no requiere pasar por App Store/Play Store, se "instala" desde el navegador, y puede guardar datos localmente (IndexedDB/localStorage) para funcionar sin internet en el momento de la inspección, sincronizando después. Si el 100% offline resulta muy complejo para el plazo de un mes, una alternativa mínima viable es permitir guardar el formulario como borrador local del navegador y subirlo apenas haya señal (aunque sea una versión simplificada de "offline").
4. **Evita apps nativas por ahora**: una app nativa (iOS/Android) implica revisión de tiendas, mantenimiento de dos códigos base, y mucho más tiempo — no es realista en 1 mes ni necesario para un equipo pequeño de inspectores. Se puede evaluar una app nativa más adelante si el volumen de uso lo justifica.
5. **Escalable a futuro**: esta misma base web sirve como backend/API para, en el futuro, construir una app nativa o el módulo de IA de fotos (Fase 2) sin rehacer el sistema desde cero.

**En resumen**: Web app responsive, mobile-first, tipo PWA con guardado local, un solo código base, accesible desde celular (inspector en terreno) y notebook/escritorio (administrador en oficina).

---

## Preguntas para el dueño

1. ¿Qué frutas inspeccionan con más frecuencia hoy (manzana, uva, cereza, arándano, otra) y cuáles priorizamos para los catálogos de defectos del MVP?
2. ¿Cuántos inspectores usarán el sistema en esta primera etapa, y todos usan celular o algunos tienen notebook/tablet en el packing?
3. ¿Hoy registran las inspecciones en papel, Excel, o algún otro método? ¿Podemos ver un formulario o reporte real que ya usen, para no perder ningún campo importante?
4. ¿Los reportes que entregan a clientes/exportadoras siguen un formato específico que cada cliente exige, o Apex Fruit define su propio formato de reporte?
5. ¿Cuántos clientes/exportadoras activos manejan aproximadamente por temporada, y esperan que el sistema en el futuro les dé acceso directo a sus propios reportes (portal de cliente), o por ahora basta con seguir enviando el PDF por WhatsApp/correo?
