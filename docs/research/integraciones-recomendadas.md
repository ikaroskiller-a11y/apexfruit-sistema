# Integraciones recomendadas — sistema interno Apex Fruit

**Fecha de investigación:** 2026-09-08
**Contexto:** el equipo de desarrollo es una sola persona, con un plazo aproximado de una semana a un mes para el MVP (ver `docs/research/requisitos.md`). Este documento evalúa integraciones externas realistas — no funcionalidades internas del sistema — priorizando lo que agrega valor real para el flujo actual de Apex Fruit (WhatsApp + Excel + papel) sin comprometer el plazo.

No se profundiza aquí en integración con instrumentos de medición (penetrómetro/refractómetro Bluetooth) ni en IA de reconocimiento de fruta por foto: ambas ya están correctamente ubicadas como Fase 2 en `requisitos.md` §4 y no deberían competir por tiempo de desarrollo con el MVP.

---

## Cómo se evaluó cada integración

Para cada una: **qué resuelve**, **factibilidad realista** para un desarrollador part-time en el plazo dado (bajo/medio/alto esfuerzo, con motivo concreto — no una estimación genérica), y **riesgo** de que se convierta en un pozo de tiempo por depender de un tercero (aprobaciones, revisión de cuentas, límites de API).

---

## 1. WhatsApp: mejorar el enlace directo (click-to-chat), no la API de negocio

**Qué resuelve:** WhatsApp es el canal real por el que Apex Fruit ya entrega resultados a sus clientes (`requisitos.md`: "Contacto (WhatsApp) → Coordinación → Inspección → Reporte"). La herramienta real que ya está en uso hoy (`index.html`, descrita en `material-existente.md` §1) ya genera "un botón para enviar un mensaje pre-armado por WhatsApp (🔴 alerta / 🟢 aprobado)" — confirma que este patrón ya funciona en la práctica y solo hay que llevarlo al sistema nuevo.

**Qué NO hacer:** no implementar la **WhatsApp Business Platform (Cloud API) de Meta** para el MVP. Requiere: verificación de Meta Business Manager (identidad de la empresa), un número de teléfono de negocio dedicado, aprobación de plantillas de mensaje por Meta (puede tardar de días a semanas y depende de un tercero, no del desarrollador), y costo por conversación iniciada. Es trabajo real pero de **trámite**, no de código — exactamente el tipo de dependencia externa que no se puede controlar dentro de un plazo de un mes. Queda correctamente para una fase posterior si el volumen de reportes lo justifica.

**Qué sí hacer ahora:** un enlace `https://wa.me/<número>?text=<mensaje>` (o `whatsapp://send?...` en el propio celular) que abra WhatsApp con un mensaje ya redactado — resumen del lote, resultado (🔴/🟢), y un enlace al reporte dentro del sistema (no se puede adjuntar el PDF directamente vía este método, solo texto y enlaces; si el navegador del celular soporta Web Share API con archivos, se puede ofrecer además un botón "Compartir PDF" nativo del sistema operativo, que sí permite elegir WhatsApp como destino con el archivo adjunto).

**Factibilidad:** **baja complejidad, 1–2 días.** Es generar una URL con el texto correcto y un botón; no requiere backend adicional ni cuentas de terceros. Es prácticamente portar la lógica que `index.html` ya demostró que funciona.

**Prioridad: alta — hacer temprano.**

---

## 2. Exportación a Excel/CSV descargable

**Qué resuelve:** el dueño ya piensa en planillas (Excel es parte del flujo actual mencionado explícitamente en el contexto del proyecto), y `requisitos.md` §3 ya lo incluye como prioridad 3, ítem 10 del MVP. Este documento simplemente confirma que es de las integraciones de mejor relación valor/esfuerzo de toda la lista.

**Factibilidad:** **baja complejidad, 1–3 días.** Una librería como `exceljs` o incluso generación de CSV plano desde los datos ya existentes en Prisma cubre el caso de uso central: exportar inspecciones filtradas (por cliente, fecha, especie) a un archivo descargable. No requiere cuenta de terceros, no depende de aprobaciones externas, y el resultado se puede probar de inmediato.

**Prioridad: alta — hacer temprano**, junto con el punto 1, porque ambas dependen solo de datos que el sistema ya tiene.

---

## 3. Código QR por lote para búsqueda rápida en la línea

**Qué resuelve:** en la línea de packing, buscar un lote tipeando su código (`LT-2026-0347`) es más lento y más propenso a error que escanearlo. Un QR impreso y pegado en el bin, pallet o guía de despacho, que al escanearlo con la cámara del celular abra directo el lote (o el formulario de nueva inspección con el lote ya preseleccionado), elimina tipeo exactamente en el momento de mayor apuro.

**Factibilidad:** **baja-media complejidad, 2–4 días.**
- Generar el QR es trivial: una librería liviana (`qrcode` en npm) que codifica el código del lote como texto o como URL directa al lote dentro del sistema (`https://.../lotes/<id>`), renderizable como imagen para imprimir o mostrar en pantalla.
- Escanear desde el celular tiene dos caminos: (a) usar la cámara nativa del sistema operativo, que ya reconoce QRs y abre la URL en el navegador — **cero código adicional**, si el QR codifica directamente la URL del lote; o (b) agregar un lector de QR dentro de la propia web app (librería `html5-qrcode` o similar, usando `getUserMedia`) para un flujo más integrado ("Buscar por QR" como botón dentro del sistema). La opción (a) es casi gratis y cubre el 80% del valor; la opción (b) es la mejora natural si sobra tiempo.

**Prioridad: alta — buena relación valor/esfuerzo**, especialmente la variante (a), que no requiere ni siquiera una librería de escaneo.

---

## 4. Firma digital capturada en pantalla

**Qué resuelve:** el reporte real de Apex Fruit deja espacio para firmas (hoy solo una en el reporte del sistema; la plantilla real de cereza pide tres — Inspector, Jefe de Calidad, Representante Exportadora, ver `material-existente.md` §2.1). Una firma capturada en pantalla (dedo o mouse sobre un lienzo) en el momento de cerrar la inspección hace que el reporte se sienta oficial sin depender de imprimir y firmar en papel.

**Factibilidad:** **media complejidad, 2–4 días**, no por la firma en sí (una librería como `signature_pad`, liviana y sin dependencias de servidor, resuelve la captura del trazo en un `<canvas>` y lo exporta como imagen PNG/base64 en pocas líneas) sino porque requiere:
- Un cambio de schema (agregar el campo/tabla para guardar la firma asociada a la inspección o al reporte) — coordinar con quien tenga el control del `schema.prisma` en este momento, ya que hay otros desarrolladores trabajando el código en paralelo.
- Decidir alcance del MVP: partir solo con la firma del inspector (la más simple, un solo firmante, en el propio dispositivo que ya está usando) en vez de intentar las tres firmas de la plantilla real, que implicaría que el jefe de calidad y el representante de la exportadora también firmen en el mismo dispositivo o en dispositivos distintos — eso sí sería sobre-ingeniería para el plazo actual.

**Prioridad: media-alta.** Vale la pena para la firma del inspector únicamente; dejar las tres firmas completas para una iteración posterior.

---

## 5. Reporte diario automático por correo a la lista de contactos del cliente

**Qué resuelve:** esto no es una ocurrencia especulativa — la norma real de un cliente exportador de kiwi (`material-existente.md` §2.3, Exportadora Andes Bhumi) menciona explícitamente que su propio sistema interno genera "un reporte automático a productores, gerente general, gerente de producción, agrónomos y gerente de aseguramiento de calidad". Es decir, al menos un cliente real de Apex Fruit **ya espera** este tipo de flujo. Encaja también con la idea de "reporte diario al exportador" descrita en `material-existente.md` §4 (estado del día, bins recibidos, resumen de defectos vs. tolerancias).

**Factibilidad:** **media complejidad, 3–5 días.** El envío de correo en sí es simple con un servicio como Resend o similar (API simple, sin necesidad de operar un servidor SMTP propio, nivel gratuito suficiente para el volumen de una empresa de este tamaño). Lo que sube el esfuerzo es: (a) definir y programar el envío automático (un cron/tarea programada al cierre del día, no una acción manual), y (b) mantener la lista de destinatarios por cliente editable desde algún lado (aunque sea un campo simple en el registro de `Cliente`, no un módulo de gestión de contactos completo).

**Riesgo a vigilar:** si se usa un dominio propio para enviar los correos, hay que configurar registros DNS (SPF/DKIM) para que no caigan en spam — es una tarea de una sola vez pero depende de acceso al DNS del dominio de Apex Fruit, que puede no estar en manos del desarrollador. Vale la pena confirmarlo temprano si se decide avanzar con esta integración.

**Prioridad: media.** Alto valor porque responde a una expectativa real ya documentada de un cliente, pero conviene hacerla después de los puntos 1–4, que son más baratos y no dependen de configuración de dominio/DNS de terceros.

---

## 6. Sincronización automática a Google Drive

**Qué resuelve:** el dueño puede preferir tener respaldo de reportes/planillas directamente en una carpeta de Drive, sin tener que entrar al sistema a descargarlos manualmente.

**Factibilidad:** **media-alta complejidad, 4–7 días**, principalmente por la fricción de integrarse con una API de Google: requiere crear credenciales OAuth en Google Cloud Console, un flujo de autorización (aunque sea de una sola cuenta, la del dueño, no multi-usuario), y manejo de renovación de tokens. Es factible en el plazo, pero es notoriamente más lento de lo que parece a primera vista para quien no lo ha hecho antes — la parte de código es simple, la parte de configuración de la cuenta de Google Cloud y permisos es la que consume tiempo real.

**Alternativa de menor esfuerzo que cubre la mayoría del valor:** dado que el punto 2 (exportación a Excel/CSV descargable) ya existe, el dueño puede simplemente arrastrar el archivo descargado a su Drive manualmente — un hábito de 5 segundos que no requiere ninguna integración. Recomendación: **no implementar la sincronización automática a Drive en el MVP**; ofrecerla solo si, después de tener la exportación descargable funcionando, el dueño confirma que de verdad la necesita automática y no le basta con subir el archivo él mismo.

**Prioridad: baja — dejar para después del MVP**, y solo si se confirma que la exportación descargable (punto 2) no es suficiente en la práctica.

---

## 7. Calendario de cosecha / clima

**Qué resuelve, en teoría:** contexto adicional sobre cuándo se espera fruta y condiciones climáticas que puedan afectar la calidad (ej. lluvia reciente, que ya aparece como criterio real en la propia plantilla de cereza: "máx. 2,5 min de hidroenfriado si la fruta viene llovida", ver `material-existente.md` §2.1).

**Por qué no priorizarlo:** es la integración de esta lista con **menor valor confirmado** para el flujo diario de control de calidad. El dato de clima por sí solo (ej. vía una API pública gratuita como Open-Meteo, sin necesidad de API key) es técnicamente barato de mostrar en el dashboard (medio día de trabajo), pero no está claro que cambie ninguna decisión operativa salvo que se conecte con algo más específico. El valor real identificado en la investigación no es un "calendario de clima" genérico, sino el **módulo de coordinación de recepción** descrito en `material-existente.md` §4 (el huerto avisa antes de que el camión llegue: variedad, calibre estimado, cantidad de bins, temperatura de pulpa de salida, hora estimada, conductor) — hoy resuelto con Google Forms + planilla compartida. Ese módulo sí es candidato real a construirse dentro del sistema (es esencialmente un formulario simple con una notificación al inspector), pero es una **funcionalidad interna, no una integración externa**, por lo que queda fuera del alcance de este documento — vale la pena registrarlo como idea para `requisitos.md` o como tarea de producto aparte.

**Factibilidad (si se hiciera igual):** baja complejidad técnica, pero baja prioridad de negocio confirmada.

**Prioridad: baja — no incluir en el MVP.** Si sobra tiempo al final, mostrar temperatura/humedad del día en el dashboard como dato contextual (medio día de esfuerzo), no como un calendario completo.

---

## Resumen: orden de implementación por valor/esfuerzo

| Orden | Integración | Esfuerzo | Valor | Motivo del orden |
|---|---|---|---|---|
| 1 | Exportación a Excel/CSV descargable | Bajo (1–3 días) | Alto | Ya es parte del MVP documentado, no depende de terceros, dato ya existe |
| 2 | Enlace WhatsApp click-to-chat con mensaje prellenado | Bajo (1–2 días) | Alto | Continúa un hábito ya validado en `index.html`, sin trámites de Meta |
| 3 | Código QR por lote (variante URL directa) | Bajo-medio (2–4 días) | Alto | Reduce tipeo justo en el momento de mayor apuro en la línea |
| 4 | Firma digital del inspector en pantalla | Medio (2–4 días) | Medio-alto | Requiere cambio de schema; acotar a un solo firmante para el MVP |
| 5 | Reporte diario automático por correo | Medio (3–5 días) | Alto (para al menos un cliente real confirmado) | Depende de configuración de dominio/DNS; hacer después de lo más barato |
| 6 | Sincronización automática a Google Drive | Medio-alto (4–7 días) | Medio | La exportación descargable (punto 1) ya cubre la mayoría del caso de uso |
| 7 | Calendario de cosecha/clima | Bajo (si acotado) | Bajo | Valor real está en el módulo de coordinación de recepción, que es funcionalidad interna, no integración |

**No recomendado dentro del plazo del MVP:** WhatsApp Business API (Cloud API de Meta) — mover a Fase 2 junto con instrumentos de medición Bluetooth e IA de fotos, ya cubiertos en `requisitos.md` §4.
