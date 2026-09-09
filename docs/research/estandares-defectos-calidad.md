# Estándares internacionales, proceso de packing y catálogo de defectos — manzana, pera, kiwi y cereza

Este documento profundiza en tres áreas que en `requisitos.md` y `material-existente.md` están tratadas de forma superficial: (1) el proceso estándar de control de calidad en un packing house de exportación, (2) la metodología de muestreo usada en la industria, y (3) un catálogo detallado de daños y defectos de fruta con sus definiciones oficiales, causas y clasificación CALIDAD/CONDICIÓN. Todas las afirmaciones citan su fuente para que puedan verificarse.

No repite el contenido ya cubierto por `usabilidad-control-calidad.md` (UX/flujo de carga en terreno) ni por `integraciones-recomendadas.md` (integraciones externas). Tampoco repite el material interno de la empresa (plantilla de campo, manual de cereza, norma de kiwi de un cliente) que ya está en `material-existente.md`.

---

## 1. El proceso estándar de control de calidad en un packing house de exportación

El flujo es prácticamente el mismo en toda la industria hortofrutícola de exportación, con variantes menores por especie. Fuentes: FAO, *Good practice in the design, management and operation of a fresh produce packing-house* (https://openknowledge.fao.org/server/api/core/bitstreams/e3d3b1ac-4b3d-4bb5-a225-6569d7256753/content); FAO, *Master Trainers Handbook of Fruits and Vegetable Processing* (https://niftem-t.ac.in/olapp/pmfme/upload/mt_handbook_0.pdf); FAO, *Section 3: Packinghouse operations* (https://www.fao.org/4/x5403e/x5403e05.htm); GQSP Vietnam, SOP de packhouse de mango (https://gqspvietnam.org/images/upload/SOP%20002%20-%20Packhouse%20FINAL-SIAEP-ENG.pdf).

### 1.1 Recepción (receiving)

- Se registra cada entrega: fecha, hora, peso, especie/variedad, huerto/parcela y productor de origen (esto es lo que después permite la trazabilidad "de la parcela a la caja").
- Inspección de recepción: se verifica documentación, se toma una muestra y se revisa la fruta por daño, infestación, decaimiento, materia extraña y madurez.
- Si la fruta no se procesa de inmediato, se mantiene en sombra/frío temporal (sistema FIFO — primero que entra, primero que se procesa) para minimizar el tiempo de espera con calor de campo.
- **Punto crítico para Apex Fruit:** el manual de cereza ya usado por la empresa exige que la espera antes del hidroenfriado no supere 1 hora — esto es consistente con la literatura: cuanto más tiempo pasa la fruta con "calor de campo" antes de enfriarse, mayor es la pérdida de calidad y la susceptibilidad a hongos.

### 1.2 Pre-selección (pre-sorting)

- Objetivo doble: (a) sacar fruta claramente enferma o podrida antes de que contamine el resto de la línea, y (b) sacar fruta que evidentemente no califica para exportación por tamaño, color o daño, para no gastar tiempo/agua/tratamiento en fruta que de todas formas va a mercado local o descarte.

### 1.3 Lavado / limpieza

- Lavado con agua clorada o cepillado en seco, según la especie. El objetivo es sanitizar y remover polvo/residuo sin causar daño (ej. no usar detergentes en mango porque mancha las lenticelas — el equivalente en cereza/manzana es evitar agua demasiado fría o con mala calidad química, que puede favorecer picado o manchas).

### 1.4 Tratamientos postcosecha (cuando aplica)

- Tratamiento fungicida (baño o "flooder") para curar infecciones tempranas invisibles a simple vista.
- Encerado (waxing) en algunas especies (no aplica a cereza; sí es común en manzana/pera para reducir pérdida de humedad y dar brillo).
- Tratamientos térmicos (hot water treatment) en algunas especies para control de enfermedades — no es estándar en manzana/pera/kiwi/cereza chilenas de exportación, pero es común en otras frutas (cítricos, mango).

### 1.5 Enfriamiento (cadena de frío) — ver sección 6 para detalle por especie

- El hidroenfriado (para cereza) o el pre-frío por aire forzado (para manzana, pera, kiwi) ocurre generalmente antes o inmediatamente después de la selección/calibre, dependiendo del layout de la planta.

### 1.6 Selección y clasificación por calidad (sorting/grading)

- Manual, semi-mecanizada o totalmente automatizada (visión artificial: cámaras que evalúan color y tamaño; sistemas NIR que detectan dulzor y daño interno).
- Este es el paso donde se aplica el estándar de calidad (ver secciones 3 y 4): se separa la fruta en categorías Extra / Clase I / Clase II (o el equivalente USDA Fancy/No.1/No.2/Utility), y se descarta lo que no alcanza ni el mínimo de Clase II.

### 1.7 Calibrado (sizing)

- Por diámetro (manzana, pera, kiwi, cereza se miden así) o por peso (kiwi también se clasifica oficialmente por peso en algunos estándares). El calibrado determina el "conteo por caja" que se usa comercialmente (ej. cereza calibre 26mm+, kiwi calibre 33-36, etc. — Apex Fruit ya usa mercadoDestino y probablemente debería usar calibre como campo explícito si no lo tiene).

### 1.8 Empaque (packing)

- Etiquetado (requerido por mercado de destino), embalaje en la caja/formato que exige el cliente, paletizado.
- La uniformidad dentro de un envase es un requisito de los estándares UNECE/USDA: no se puede mezclar calidad ni calibre dentro de una misma caja más allá de las tolerancias.

### 1.9 Documentación de exportación y despacho

- Certificado fitosanitario (en Chile, emitido por el SAG tras inspección — para EE.UU. específicamente hay un Programa de Preembarque SAG/USDA-APHIS/Frutas de Chile).
- Certificado de cadena de frío cuando el comprador lo exige (cada vez más común, especialmente en mercados premium europeos y asiáticos).
- Trazabilidad completa: huerto/parcela → lote → pallet → contenedor → embarque.

Fuente sobre el contexto chileno específico: Zeltask, *Software for fruit packing* (https://zeltask.com/en/industries/fruit-packing/) — confirma que sin certificación SAG la fruta no puede embarcarse, y que ~90% de las cerezas chilenas van a un solo mercado (China), lo que hace crítico que no haya atrasos ni fallas de cadena de frío.

### 1.10 Diagrama de flujo resumido

```
Recepción y pesaje → Pre-selección → Lavado/sanitización → (Tratamiento fungicida) →
Enfriamiento (hidroenfriado o pre-frío aire forzado) → Selección/clasificación por calidad →
Calibrado → Empaque y etiquetado → Paletizado → Cámara de frío / almacenamiento →
Documentación (SAG, fitosanitario, cadena de frío) → Despacho / carga a contenedor
```

**Implicación para el sistema:** el modelo de datos actual de Apex Fruit registra la inspección como un evento más o menos puntual. Si se quiere reflejar el proceso real, cada lote debería poder tener **múltiples inspecciones en distintas etapas** (recepción, pre-selección, post-hidroenfriado, pre-despacho), no solo una. Esto es coherente con lo que ya identificó `usabilidad-control-calidad.md` sobre necesidades de terreno, pero aquí se agrega la razón de negocio: el software comercial de la industria (ver sección 7) modela explícitamente "quality checkpoints" en múltiples etapas, no un único registro.

---

## 2. Metodología de muestreo: cuánta fruta se revisa por lote

### 2.1 Plan de muestreo de EE.UU. (USDA, lote único por atributos)

Fuente: USDA AMS, *Fruit and Vegetable Programs Lot Single Sampling Plan (Attributes)* (https://www.ams.usda.gov/sites/default/files/media/FV-LotSingleSamplingPlan.pdf); 7 CFR § 52.38c (https://www.lexfed.com/cfr/7/b/i/c/52/a/52-38c).

El tamaño de muestra depende del tamaño del lote (número de envases), agrupado en 4-5 "tramos". El estándar más usado (tamaño de unidad de muestra = 6) define:

| N.º de envases en el lote | N.º de unidades de muestra a extraer |
|---|---|
| Lote pequeño | 6 |
| Lote mediano | 13 |
| Lote grande | 21 |
| Lote muy grande | 29 |

Cada "unidad de muestra" son 6 unidades de fruta (o el contenido completo del envase si es más chico), es decir, con 6 unidades de muestra se revisan 36 piezas de fruta como mínimo.

**AQL (Nivel de Calidad Aceptable):** el número máximo de defectos tolerado depende del AQL elegido para cada categoría de defecto (ej. AQL 1.0 para defectos críticos, AQL 2.5 para mayores, AQL 4.0-6.5 para menores). Ejemplo real de la tabla oficial (tamaño de muestra 6):

| AQL | 6 unidades | 13 unidades | 21 unidades | 29 unidades |
|---|---|---|---|---|
| 1.0 (crítico) | 1 | 2 | 3 | 4 |
| 1.5 | 1 | 3 | 4 | 5 |
| 2.5 | 3 | 4 | 6 | 8 |
| 4.0 | 4 | 6 | 9 | 11 |
| 6.5 | 5 | 9 | 13 | 17 |
| 10.0 | 7 | 12 | 19 | 24 |

Es decir: si el lote tiene un tamaño que corresponde a "13 unidades de muestra" y el AQL para defectos mayores es 4.0, el lote se **rechaza** si se encuentran más de 6 defectos mayores en la muestra.

### 2.2 Estándar internacional equivalente: ISO 2859

Fuente: FAO/Codex, *Practical examples of sampling plans* (https://www.fao.org/fileadmin/user_upload/codexalimentarius/committee/docs/INF_CCMAS_ESP_e.pdf).

ISO 2859-1 es el estándar internacional de muestreo por atributos indexado por AQL (equivalente conceptual al método USDA, usado más en contextos de certificación europea/Codex). Define además tres regímenes de inspección: **normal**, **estricta** (tightened — se activa si 2 de los últimos 5 lotes fallaron) y **reducida** (reduced — se activa si 10 lotes consecutivos pasaron bajo inspección normal). Esto es relevante si Apex Fruit alguna vez quiere ofrecer a un cliente un "historial de confiabilidad" que ajuste cuánto se le audita.

### 2.3 Aplicación práctica recomendada para Apex Fruit

El manual real de cereza que ya tiene la empresa probablemente define su propio tamaño de muestra fijo (común en la industria chilena: 1 caja o bandeja por cada X cajas del lote, con un mínimo de fruta absoluta, ej. 100-200 unidades). **Recomendación concreta:** el sistema debería permitir registrar, junto con el tamaño del lote, el tamaño de la muestra tomada — hoy el modelo de datos no parece capturar explícitamente "cuántas unidades se inspeccionaron de cuántas totales", lo cual es necesario para poder calcular un porcentaje de defecto comparable entre lotes de tamaño distinto, y para poder mostrar en el reporte técnico si la muestra cumplió con el criterio AQL aplicable.

---

## 3. Estándares de clasificación por especie: qué exige cada clase

Los tres sistemas de referencia mundial son: **USDA** (EE.UU., 7 CFR Part 51), **UNECE** (estándares FFV usados en Europa y ampliamente adoptados como referencia internacional) y **Codex Alimentarius** (FAO/OMS, base para muchos países sin estándar propio, incluida a menudo la referencia que exportadores chilenos usan para mercados sin norma específica).

### 3.1 Manzana

- USDA: U.S. Standards for Grades of Apples, 7 CFR 51.300-51.319 (https://www.ams.usda.gov/sites/default/files/media/Apple_Standards.pdf). Grados: **Extra Fancy > Fancy > No. 1 (+ No. 1 Hail) > Utility**.
- UNECE: FFV-50 Apples, edición 2023 (https://unece.org/sites/default/files/2024-03/FFV-50_Apples_2023_e.pdf). Clases: **Extra > Clase I > Clase II**.
- Tolerancia de defectos USDA: 10% del lote puede fallar el grado (Extra Fancy/Fancy/No.1), de eso no más de 5% puede ser "daño serio" y de eso no más de 1% por decaimiento/degradación interna.
- Definiciones oficiales USDA de severidad (aplican también, con variantes, a pera y kiwi porque comparten la misma estructura legal):
  - **Injury (lesión leve):** defecto que afecta la apariencia/calidad "más que ligeramente".
  - **Damage (daño):** defecto que afecta "materialmente".
  - **Serious damage (daño serio):** defecto que afecta "seriamente" — saca la fruta de cualquier grado comercial exportable.

### 3.2 Pera

- USDA: dos estándares separados — Summer and Fall Pears y Winter Pears (7 CFR 51.1260 y 51.1300). Grados: **U.S. No. 1 > U.S. No. 2** (en peras de invierno existe además U.S. Extra No. 1 como grado superior).
- UNECE: FFV-51 Pears, 2017/2020 (https://www.readkong.com/page/unece-standard-ffv-51-pears-2017-edition-7680692). Clases: **Extra > Clase I > Clase II**.
- Calibre mínimo UNECE: 60mm (Extra) / 55mm (Clase I y II) para variedades de fruto grande; 55mm/50mm/45mm para otras variedades. Alternativamente por peso: 130g/110g/110g y 110g/100g/75g respectivamente.
- Particularidad relevante para Chile: el "Anjou Cork Spot" (mancha corchosa) se trata como defecto de **calidad** al momento del empaque pero como defecto de **condición** si aparece después de almacenaje o en destino — el mismo criterio "depende de cuándo se detecta" que ya aplica Apex Fruit con el concepto CALIDAD/CONDICIÓN.

### 3.3 Kiwi

- USDA: 7 CFR 51.2330-51.2345 (https://www.ams.usda.gov/sites/default/files/media/Kiwifruit_Standard%5B1%5D.pdf). Grados: **U.S. Fancy > U.S. No. 1 > U.S. No. 2**.
- UNECE: FFV-46 (2017) / Codex CXS 338-2020 (https://www.fao.org/fao-who-codexalimentarius/sh-proxy/ro/?lnk=1&url=...CXS_338e.pdf). Clases: **Extra > Clase I > Clase II**.
- Requisito de madurez mínima (Codex/UNECE, no USDA): al menos **6.2° Brix** o **15% de materia seca promedio** al momento del empaque.
- Calibre por peso: mínimo 90g (Extra) / 70g (Clase I) / 65g (Clase II).
- Criterio de forma cuantitativo poco común en otras especies: razón diámetro mínimo/máximo del corte ecuatorial ≥ 0.8 (Extra) / ≥ 0.7 (Clase I) — esto formaliza "qué tan aplanado" puede estar el kiwi.
- "Hayward mark" (líneas longitudinales características de la variedad Hayward, la más cultivada): se toleran en Clase I si son pequeñas y sin protuberancia; en Clase II se toleran más marcadas.
- Tolerancia especial: hasta 24% de daño acumulado por "fruta muy deformada" (badly misshapen) sigue calificando para exportación bajo ciertas condiciones — ver detalle en la instrucción de inspección USDA (https://www.ams.usda.gov/sites/default/files/media/KiwifruitInspectionInstructions.pdf).

### 3.4 Cereza

- USDA: 7 CFR 51.2646 y siguientes (https://www.ams.usda.gov/sites/default/files/media/Cherry%2C_Sweet_Standard%5B1%5D.pdf). Grados: **U.S. No. 1 > U.S. Commercial**.
- UNECE: FFV-13 Cherries, edición 2023 (https://unece.org/sites/default/files/2023-12/FFV-13_Cherries_2023_e.pdf). Clases: **Extra > Clase I > Clase II**.
- Tamaño mínimo UNECE: 20mm (Extra) / 17mm (Clase I y II).
- Tolerancia USDA No.1: 8% de defectos en total al embarque, de eso máx. 4% daño serio, de eso máx. 0.5% por decaimiento (la tolerancia a decaimiento es la más estricta de las 4 especies, coherente con que la cereza es la fruta más perecible del grupo).
- **Distinción oficial explícita QUALITY vs CONDITION** (la terminología que Apex Fruit ya usa en su sistema viene directamente de acá): la instrucción de inspección USDA de cereza (https://www.ams.usda.gov/sites/default/files/media/Cherries,_Sweet_Inspection_Instructions[1].pdf) define:
  - **Permanent/Quality defects:** forma, cicatrización, daño por granizo/insectos, daño mecánico anterior al embarque — no cambian durante transporte/almacenaje.
  - **Condition defects:** cerezas blandas o decaídas, picado (pitting), marchitamiento, áreas hundidas, decoloración parda, magulladuras que ocurrieron después del empaque — sí cambian/empeoran durante transporte.
- "Doubles no desarrollados" (undeveloped doubles) se puntúan como daño de calidad; "doubles" bien formados (cereza doble madura simétrica) no se consideran defecto de forma.

---

## 4. Catálogo de defectos por tipo, con clasificación CALIDAD/CONDICIÓN

La siguiente tabla consolida los defectos más relevantes para las 4 especies que maneja Apex Fruit, agrupados por tipo de causa. La columna "Q/C" usa la terminología USDA (**Q**uality = permanente, no cambia en tránsito; **C**ondition = puede cambiar/aparecer en tránsito) que es la misma lógica detrás del enum `CALIDAD`/`CONDICIÓN` ya implementado en `src/lib/normas.ts`.

### 4.1 Daño mecánico

| Defecto (ES) | Defecto (EN) | Especies | Causa típica | Q/C |
|---|---|---|---|---|
| Magulladura / golpe | Bruise | Todas | Impacto, compresión, caída durante cosecha o packing | C (si post-empaque) / Q (si pre-empaque y ya cicatrizado) |
| Picado superficial | Pitting | Cereza (principal), también fruta blanda en general | Colapso de células bajo la piel por impacto — muy asociado a cortadoras de racimo (cluster cutters) e hidroenfriadores tipo ducha con altura de caída excesiva | C |
| Corte / herida en la piel | Skin break / cut | Todas | Cosecha descuidada, roce con ramas, herramientas | Q o C según cuándo ocurrió |
| Roce de rama/hoja | Limb rub / leaf rub | Manzana, pera, kiwi | Fricción contra ramas u hojas en el árbol antes de cosecha | Q |
| Grietas de crecimiento | Growth cracks | Kiwi, manzana | Crecimiento irregular del fruto en el árbol | Q |
| Rajadura por lluvia | Rain cracking / splitting | Cereza (muy importante en Chile) | Absorción de agua de lluvia cerca de cosecha, que hincha la piel más rápido que la pulpa | Q |
| "Pebbling" (superficie rugosa) | Pebbling | Cereza | Pérdida de agua de la piel (transpiración + deshidratación osmótica hacia la pulpa); más frecuente en variedades Regina, Santina, Lapins, Sweetheart cosechadas más maduras | C |

Fuente pitting/pebbling: UC Davis Postharvest Center (https://postharvest.ucdavis.edu/disorders/cherry-surface-pitting-bruising) y *Review of international best practice for postharvest management of sweet cherries* (https://www.cherrygrowers.org.au/wp-content/uploads/2024/10/Review-of-international-best-practice-for-the-postharvest-management-of-sweet-cherries.pdf). Dato operacional citado en esa revisión, útil para capacitación: mantener alturas de caída de fruta menores a 25-30cm sobre superficie lisa y menores a 20cm en agua de hidroenfriadores tipo ducha reduce significativamente el picado; la incidencia de picado se duplica si la fruta se maneja en la línea a 2°C en vez de 5°C (aunque procesar más caliente retrasa el enfriamiento — es un trade-off real que el sistema podría documentar como nota operativa).

### 4.2 Daño por plagas/insectos

| Defecto (ES) | Defecto (EN) | Especies | Causa típica | Q/C |
|---|---|---|---|---|
| Picadura de insecto (sana) | Healed insect sting | Manzana, pera, kiwi | Punción superficial de insecto (polilla de la manzana / codling moth es la más común), cicatrizada | Q |
| Perforación de gusano | Worm hole | Manzana, pera, kiwi | Larva que penetra hasta la pulpa (codling moth) | Q — motivo de rechazo total en varios estándares (cero tolerancia en algunos grados) |
| Daño por ácaro de las ampollas | Blister mite injury | Pera | Ácaro que causa depresiones/manchas | Q |
| Daño por escama | Scale damage | Kiwi, manzana | Insecto escama adherido a la piel | Q |

Fuente: USDA Apple Inspection Instructions (https://www.ams.usda.gov/sites/default/files/media/Apple_Inspection_Instructions%5B1%5D.pdf), USDA Pear standard, USDA Kiwifruit Standard.

### 4.3 Enfermedades / pudriciones postcosecha (hongos, principalmente)

| Enfermedad (ES) | Nombre (EN) | Patógeno | Especies | Síntoma clave | Q/C |
|---|---|---|---|---|---|
| Moho azul | Blue mold | *Penicillium expansum* | Manzana, pera (la más importante mundialmente en ambas) | Lesión café clara a oscura, borde muy nítido, tejido blando/acuoso que se separa limpio del sano; esporas verde-azuladas; olor a tierra/moho; puede producir la micotoxina patulina | C |
| Moho gris / pudrición gris | Gray mold | *Botrytis cinerea* | Todas (crítico en cereza y kiwi) | Tejido esponjoso café claro-oscuro que NO se separa limpio del sano (a diferencia del moho azul); micelio blanco-grisáceo con humedad alta; en cereza y kiwi se disemina fruta a fruta por contacto | C |
| Pudrición amarga | Bitter rot | *Colletotrichum* spp. | Manzana | Lesión circular café que se hunde, en forma de V en corte transversal, esporas color crema-salmón en anillos concéntricos | C |
| Pudrición parda / momificado | Brown rot | *Monilinia fructicola* / *Monilinia laxa* | Cereza (muy relevante) | Empieza en el huerto o poscosecha, asociada a fisuras en la piel | C |
| Podredumbre del pedúnculo | Stem-end rot | *Botrytis cinerea* (principal) | Kiwi | Oscurecimiento que avanza desde el pedúnculo con frente definido ("marca de marea"); aparece 3-4 semanas después de entrar a frío; pulpa acuosa y translúcida | C |
| Podredumbre blanda / soft rot | Soft rot | *Botryosphaeria dothidea*, *Phomopsis*, *Alternaria*, *Botrytis* (combinados) | Kiwi | Descomposición perforante hasta pudrir la fruta completa; sin tratamiento eficaz a escala, se debe vender antes del brote | C |
| Podredumbre Mucor | Mucor rot | *Mucor* spp. | Manzana | Muy blanda y jugosa (más que moho azul), micelio gris con esporangios oscuros, olor dulce (vs. olor a tierra del moho azul) | C |

Fuentes: WSU Tree Fruit, *Blue Mold* (https://treefruit.wsu.edu/crop-protection/disease-management/blue-mold) y *Gray Mold* (https://treefruit.wsu.edu/crop-protection/disease-management/gray-mold/); Penn State Extension, *Apple Diseases - Fruit Rots* (https://extension.psu.edu/apple-diseases-fruit-rots-control-at-apple-harvest-and-postharvest); UC Davis, *Cherry* postharvest fact sheet (https://postharvest.ucdavis.edu/produce-facts-sheets/cherry); ISHS, *Botrytis stem-end rot and other storage diseases of kiwifruit* (https://ishs.org/ishs-article/297_71/); ScienceDirect, *Introduction and multiplex management strategies of postharvest fungal diseases of kiwifruit* (https://www.sciencedirect.com/science/article/abs/pii/S1049964422002614).

**Nota práctica para el catálogo de defectos del sistema:** el moho azul y el moho gris se confunden fácilmente a simple vista; la clave de campo es (a) si el tejido podrido se separa limpio del sano (azul: sí: gris: no) y (b) el olor (azul: tierra/moho; gris: sin olor marcado al inicio, luego "a sidra"). Podría valer la pena incluir esta distinción como ayuda visual/checklist en el formulario de carga de defectos si el inspector marca "pudrición" — hoy probablemente solo hay una categoría genérica de pudrición.

### 4.4 Desórdenes fisiológicos (no causados por patógenos ni golpes — factores fisiológicos/nutricionales/ambientales)

| Desorden (ES) | Nombre (EN) | Especie | Causa | Cuándo aparece | Q/C |
|---|---|---|---|---|---|
| Bitter pit (picado amargo) | Bitter pit | Manzana (Honeycrisp, Granny Smith, Braeburn muy susceptibles) | Desbalance de calcio en el fruto (deficiencia de Ca, exceso de N/K/Mg) | Empieza en el árbol, se expresa en los primeros 2 meses de almacenaje | Q (aunque se manifiesta después, el origen es previo a cosecha) |
| Escaldado superficial | Superficial scald | Manzana (Granny Smith, Cortland), Pera (relacionado pero distinto mecanismo) | Oxidación de alfa-farneseno; favorecido por cosecha inmadura, calor previo a cosecha, bajo calcio | Durante frío prolongado, se acentúa 3-7 días después de sacar la fruta del frío | C |
| Corazón acuoso | Watercore | Manzana (Fuji muy susceptible) | Acumulación de sorbitol en espacios intercelulares; fruta muy madura, alta exposición solar | Se desarrolla antes de cosecha, puede desaparecer en frío si es leve; si es severo deriva en quiebre interno | Q, pero con evolución posible a C si severo |
| Mancha de Jonathan | Jonathan spot | Manzana | Fisiológico, menos estudiado que bitter pit pero se puntúa junto con él en USDA | Similar a bitter pit | Q |
| Mancha corchosa de Anjou | Anjou cork spot | Pera (variedad Anjou) | Deficiencia de calcio (causa exacta no establecida con certeza) | Se ve más en el extremo calicino; empeora con la maduración | Q al empaque / C si se detecta en almacenaje |
| Quiebre del corazón | Core breakdown | Pera (Bartlett, Bosc, Comice) | Senescencia por almacenaje excesivo o cosecha tardía; empeora con enfriamiento retrasado | Aparece cerca del fin de la vida de poscosecha | C |
| Escaldado senescente | Senescent scald | Pera (Bartlett, Bosc) | Fruta que superó su vida de poscosecha; asociado a pérdida de capacidad de maduración normal | Fin de vida de poscosecha, empeora rápido a temperatura ambiente | C |
| Daño por frío | Chilling injury | Kiwi (y en general fruta subtropical) | Almacenaje a temperatura inadecuada para la especie | Durante almacenaje refrigerado prolongado | C |
| Ablandamiento / pérdida de firmeza | Softening | Kiwi (particularmente sensible, fruto "blando" es motivo de rechazo directo en todos los estándares) | Proceso natural de maduración acelerado por mal manejo de temperatura/etileno | Progresivo durante almacenaje | C |

Fuentes: University of Maryland Extension, *From the Orchard to Cold Storage: Nine Physiological Disorders in Apples* (https://extension.umd.edu/sites/extension.umd.edu/files/publications/OrchardColdStorage_FS-2022-0640_ada.pdf); UC Davis Postharvest Center, *Apple: Bitter Pit* (https://postharvest.ucdavis.edu/disorders/apple-bitter-pit) y *Apple: Watercore* (https://postharvest.ucdavis.edu/disorders/apple-watercore); UC Davis, *Pear: Core Breakdown* (https://postharvest.ucdavis.edu/disorders/pear-core-breakdown) y *Pear: Senescent Scald* (https://postharvest.ucdavis.edu/disorders/pear-senescent-scald); MDPI, *Advances in Kiwifruit Postharvest Management* (https://www.mdpi.com/1467-3045/48/1/9).

### 4.5 Defectos de forma, color y calibre

| Defecto (ES) | Defecto (EN) | Especies | Detalle | Q/C |
|---|---|---|---|---|
| Russeting (pardeamiento reticulado de la piel) | Russeting | Manzana, pera | Tejido corchoso en la piel; se tolera hasta cierto % de superficie según la clase/grado; algunas variedades (Golden, Bosc) lo tienen como característica varietal aceptada | Q |
| Deformación / mal formada | Misshapen | Todas | Forma anómala por polinización deficiente, condiciones de crecimiento | Q |
| Defecto de color / colorado insuficiente | Color defect | Manzana (crítico — hay tabla de % de superficie coloreada requerido por variedad) | No alcanza el % de color mínimo para el grado/variedad | Q |
| Fruta doble no desarrollada | Undeveloped doubles | Cereza | Una mitad del doble no se desarrolla, queda un espolón duro oscuro pegado al fruto | Q |
| Sutura profunda | Deep suture | Cereza | Origen genético/varietal, agravado por altas temperaturas en diferenciación floral | Q |
| Fruta aplanada (razón diámetro <0.7-0.8) | Flattened fruit | Kiwi | Ver criterio cuantitativo de la sección 3.3 | Q |
| Marchitamiento / arrugamiento | Shriveling | Kiwi, cereza | Pérdida de agua — fruta pierde turgencia | C |

---

## 5. Ejemplo de tabla de clasificación de severidad (formato UNECE, aplicable a kiwi)

Esto ilustra cómo un estándar internacional define tres niveles de severidad para un mismo defecto — útil como referencia de diseño si se quiere hacer más granular el campo "severidad" de un defecto en el sistema (hoy probablemente es binario o de 2-3 niveles fijos). Fuente: 7 CFR § 51.2340, vía Cornell LII (https://www.law.cornell.edu/cfr/text/7/51.2340).

| Defecto | Injury (leve) | Damage (daño) | Serious damage (daño serio) |
|---|---|---|---|
| Magulladura | Indentación de hasta 1.6mm de profundidad | Indentación >3.2mm de profundidad o área >9.5mm de diámetro | Indentación >6.4mm de profundidad o área >12.7mm de diámetro |
| Grietas de crecimiento | No cicatrizada, o más de una, o >3.2mm | No cicatrizada y >6.4mm, o cicatrizada y >9.5-12.7mm | No cicatrizada y >3.2mm, o cicatrizada y >4.8-15.9mm |
| Golpe de sol/calor | Color ligeramente cambiado o indentación presente | Piel ampollada/agrietada o color materialmente cambiado, más de una indentación | Piel ampollada/agrietada/aplanada, decoloración de pulpa, más de dos indentaciones |

Esta lógica de "tres umbrales de severidad por cada tipo de defecto, cada uno con su propia medida cuantitativa" es exactamente lo que separa un catálogo de defectos "de referencia visual" (lo que probablemente tiene hoy Apex Fruit) de uno "auditable" que resistiría una discusión con un cliente exportador sobre por qué se objetó un lote.

---

## 6. Parámetros de cadena de frío por especie (para comparar contra lo ya implementado)

Apex Fruit ya modela parámetros de hidroenfriador para cereza (temperatura de agua, cloro libre, tiempo de exposición, temperatura de pulpa post-enfriado, alerta de espera >1 hora). Los valores de referencia de la industria, para verificar rangos:

| Parámetro | Valor de referencia | Fuente |
|---|---|---|
| Hidroenfriado — pH del agua | 6.5 – 7.5 | Luchsinger, *Manejo de la cadena de frío en frutas de exportación* (https://studylib.es/doc/7061462/sistemas-de-enfriamiento-en-frutas) |
| Hidroenfriado — cloro libre | 80 – 120 ppm | Ídem |
| Hidroenfriado — recambio de agua | Cada 200 bins o diario | Ídem |
| Hidroenfriado — temperatura del agua antes de cargar | 0.5 – 1.0°C | Ídem |
| Hidroenfriado — temperatura de pulpa a la salida (centro del bin) | 0 – 1.5°C | Ídem |
| Hidroenfriado — duración máxima | 60 minutos | Ídem |
| Cereza — temperatura de almacenaje/transporte | -1°C a +1°C | BlueData (https://www.bluedata.cl/blogs/blog-data-loggers-chile/exportacion-fruta-fresca-cadena-frio-trazabilidad-temperatura-chile) |
| Arándano (referencia, no lo maneja Apex Fruit) | 0°C a 2°C | Ídem |
| Palta (referencia) | 5°C a 7°C (verde, madura en destino) | Ídem |
| Pera — almacenaje óptimo | -2°C a -1°C (28-30°F) | UC Davis, *Pear: Core Breakdown* |
| Uva/general — humedad relativa ideal en pre-frío | 90-95% | Repositorio U. de Chile (http://repositorio.uchile.cl/handle/2250/103141) |

**Observación relevante:** el rango de cloro libre (80-120 ppm) y pH (6.5-7.5) del hidroenfriador **no aparece mencionado** en el resumen de memoria del proyecto sobre lo ya modelado — si el campo `parámetros de hidrocooler` de Apex Fruit no incluye pH y ppm de cloro libre como campos explícitos (solo temperatura y tiempo), valdría la pena confirmarlo con el material interno (`material-existente.md`) y agregarlo si falta, porque es un punto de control fitosanitario/de inocuidad, no solo de calidad.

---

## 7. Cómo estructuran los datos los software comerciales de control de calidad para packing houses

Se revisaron cuatro productos comerciales reales para contrastar contra el modelo de datos ya implementado (Usuario, Cliente, Lote, Inspección, Defecto, Foto):

### 7.1 Radfords FreshPack / FreshQuality (Nueva Zelanda/Australia) — https://www.radfords.global/pack

- Separa explícitamente "recepción de bins" de "captura de resultados de calidad" de "validación automática de grado" — es decir, el resultado de la inspección **dispara** una acción (aceptar/segregar) en vez de ser solo un registro pasivo.
- Integra directamente con instrumentos: penetrómetro (firmeza), refractómetro (Brix), balanza — captura automática en vez de tipeo manual. Esto es coherente con lo que ya identificó `usabilidad-control-calidad.md` sobre errores de tipeo; la solución de la industria real no es solo mejorar el formulario sino integrar el instrumento.
- "Holds" de mercado configurables: un lote puede quedar retenido automáticamente si se detecta cierta plaga, no solo por defecto de calidad general.

### 7.2 Farmsoft ProducepakQI — https://producepak.com/ProucepakQI_Fresh_Produce_Quality_Inspection_App.pdf

- Modela "programas de inspección" ilimitados y configurables por el propio usuario (no defectos fijos en código, sino un catálogo editable) — esto es una diferencia de arquitectura importante frente a tener el catálogo de defectos hardcodeado en `src/lib/normas.ts`: los packing houses reales cambian sus criterios por temporada, por cliente o por mercado de destino, y el software se lo permite sin tocar código.
- Cada inspección puede tener "1 o más muestras", con la cantidad de muestras configurable por tipo de inspección — refuerza la recomendación de la sección 2.3 (registrar tamaño de muestra explícitamente).
- Gestión de reclamos de cliente: traza un reclamo hasta el proveedor/origen específico — funcionalidad de "loop cerrado" que hoy no está en el alcance de Apex Fruit pero que sería el paso natural después de tener el historial de inspecciones.

### 7.3 AgriERP Quality App (frutos secos, pero arquitectura generalizable) — https://agrierp.com/quality-app/

- Concepto clave: **"atributos" de calidad como entidad configurable**, con tipo (dropdown, medición numérica con unidad, valor obtenido del sistema), en vez de columnas fijas en una tabla. Cada plantilla de inspección arma su propia lista de atributos, marca cuáles son obligatorios, y define rango mínimo/máximo con acción de bloqueo o solo advertencia si se sale de rango.
- Constructor de fórmulas (ej. % de defecto = suma de defectos / peso de muestra × 100) que se calcula solo mientras el inspector carga datos — evita que cada inspector calcule porcentajes a mano.
- Esto valida una decisión de diseño de fondo: si Apex Fruit proyecta vender el sistema a otras empresas de inspección (no solo usarlo internamente), migrar de "campos fijos por especie en el modelo Prisma" a un esquema de "atributos configurables por tipo de inspección" sería el camino que siguió el software comercial equivalente. Para el plazo de 1 semana esto es probablemente fuera de alcance, pero vale documentarlo como nota de roadmap.

### 7.4 AgriWise Packhouse — https://agriwises.com/packhouse

- Refuerza el concepto de **"checkpoints de calidad en múltiples etapas"**: recepción, empaque y pre-despacho como tres puntos de control distintos, cada uno con sus propios parámetros de calidad — coincide con lo señalado en la sección 1.10 de este documento.
- Calcula automáticamente "tasa de merma/rechazo" por línea de empaque y por etapa, para detectar tendencias (ej. una línea específica generando más daño mecánico que otra) — esto es un caso de uso de analítica que el dashboard actual de Apex Fruit (4 gráficos Recharts) probablemente no cubre todavía, y que sería un valor agregado fácil de vender a un cliente packing house: "¿cuál de mis líneas está dañando más fruta?".

### 7.5 Zeltask (Chile, contexto directamente comparable) — https://zeltask.com/en/industries/fruit-packing/

- Combina mantenimiento de líneas/cámaras de frío + calidad/fitosanitario + trazabilidad en una sola plataforma, explícitamente orientada al contexto chileno (SAG, mercados de destino, cerezas a China).
- Su checklist de inspección cubre "recepción, tamaño, defectos y madurez" con evidencia fotográfica y generación de una "no conformidad" que dispara una acción correctiva — de nuevo el patrón de "la inspección no es un registro pasivo, dispara un flujo".

**Conclusión de la comparación:** el modelo de datos actual de Apex Fruit (Usuario/Cliente/Lote/Inspección/Defecto/Foto) es razonable como base para un MVP, pero le faltan, respecto a lo que hace el software real de la industria: (1) inspección en múltiples etapas del mismo lote en vez de una sola, (2) tamaño de muestra explícito junto al conteo de defectos, (3) un mecanismo de acción/alerta quedisparado automáticamente cuando una inspección falla criterio (hoy probablemente el resultado CATEGORIA_1/CATEGORIA_2/OBJETADO es solo informativo), y (4) analítica de tendencia por línea/turno/inspector, no solo por lote. Ninguno de estos cuatro puntos requiere necesariamente un cambio de arquitectura — se pueden agregar de forma incremental sobre el esquema Prisma existente.

---

## 8. Resumen ejecutivo de brechas accionables (para decidir qué entra en la semana)

1. **Tamaño de muestra explícito por inspección** (cuántas unidades se revisaron de cuántas tiene el lote) — necesario para que el % de defecto sea comparable y auditable. Cambio de esquema pequeño (un campo o dos en Inspección).
2. **pH y cloro libre del hidroenfriador** como campos explícitos, si no están ya — confirmar contra `material-existente.md`.
3. **Distinguir moho azul vs. moho gris** (y en general, dar más detalle a la categoría "pudrición") en el catálogo de defectos, porque tienen manejo y origen distintos y un cliente exportador reconoce la diferencia.
4. **Registrar en qué etapa del proceso ocurrió la inspección** (recepción / post-hidroenfriado / pre-despacho) en vez de asumir una sola inspección por lote — esto es lo más alineado con cómo describe la industria el proceso real (sección 1) y con cómo lo modela el software comercial (sección 7).
5. Nota de roadmap (no para esta semana): catálogo de defectos configurable en vez de hardcodeado, si el negocio migra de "uso interno" a "vender el sistema a otros packing houses".

---

## Fuentes citadas (lista consolidada)

- USDA AMS — Apple Standards: https://www.ams.usda.gov/sites/default/files/media/Apple_Standards.pdf
- USDA AMS — Apple Inspection Instructions: https://www.ams.usda.gov/sites/default/files/media/Apple_Inspection_Instructions%5B1%5D.pdf
- USDA AMS — Pear Inspection Instructions: https://www.ams.usda.gov/sites/default/files/media/Pear_%28including_Summer%2C_Fall_and_Winter_types%29_Inspection_Instructions%5B1%5D.pdf
- USDA AMS — Summer and Fall Pear Standard: https://www.ams.usda.gov/sites/default/files/media/Summer_and_Fall_Pear_Standard%5B1%5D.pdf
- USDA AMS — Kiwifruit Standard: https://www.ams.usda.gov/sites/default/files/media/Kiwifruit_Standard%5B1%5D.pdf
- USDA AMS — Kiwifruit Inspection Instructions: https://www.ams.usda.gov/sites/default/files/media/KiwifruitInspectionInstructions.pdf
- USDA AMS — Sweet Cherry Standard: https://www.ams.usda.gov/sites/default/files/media/Cherry%2C_Sweet_Standard%5B1%5D.pdf
- USDA AMS — Sweet Cherry Inspection Instructions: https://www.ams.usda.gov/sites/default/files/media/Cherries,_Sweet_Inspection_Instructions[1].pdf
- Cornell LII — 7 CFR § 51.2340 (kiwi, tabla de severidad): https://www.law.cornell.edu/cfr/text/7/51.2340
- UNECE FFV Standards index: https://unece.org/trade/wp7/FFV-Standards
- UNECE FFV-50 Apples 2020: https://www.readkong.com/page/unece-standard-ffv-50-apples-2020-edition-united-1505735
- UNECE FFV-51 Pears 2017/2020: https://www.readkong.com/page/unece-standard-ffv-51-pears-2017-edition-7680692
- UNECE FFV-46/Codex Kiwifruit: https://www.fao.org/fao-who-codexalimentarius/sh-proxy/ro/?lnk=1&url=https%3A%2F%2Fworkspace.fao.org%2Fsites%2Fcodex%2FStandards%2FCXS%2B338-2020%2FCXS_338e.pdf
- UNECE FFV-13 Cherries 2023 (índice de descarga): https://unece.org/trade/documents/1962/02/standards/cherries
- OECD/International Standards — Cherries (tabla ilustrada de clasificación): https://vdoc.pub/documents/international-standards-of-fruit-and-vegetables-cherries-646krj9b25k0
- USDA AMS — Lot Single Sampling Plan (attributes): https://www.ams.usda.gov/sites/default/files/media/FV-LotSingleSamplingPlan.pdf
- 7 CFR § 52.38c (tablas AQL completas): https://www.lexfed.com/cfr/7/b/i/c/52/a/52-38c
- FAO/Codex — Practical examples of sampling plans (ISO 2859): https://www.fao.org/fileadmin/user_upload/codexalimentarius/committee/docs/INF_CCMAS_ESP_e.pdf
- FAO — Good practice in the design, management and operation of a fresh produce packing-house: https://openknowledge.fao.org/server/api/core/bitstreams/e3d3b1ac-4b3d-4bb5-a225-6569d7256753/content
- FAO — Master Trainers Handbook of Fruits and Vegetable Processing: https://niftem-t.ac.in/olapp/pmfme/upload/mt_handbook_0.pdf
- FAO — Section 3: Packinghouse operations: https://www.fao.org/4/x5403e/x5403e05.htm
- GQSP Vietnam — SOP Packhouse (mango, flujo de proceso ilustrativo): https://gqspvietnam.org/images/upload/SOP%20002%20-%20Packhouse%20FINAL-SIAEP-ENG.pdf
- WSU Tree Fruit — Blue Mold: https://treefruit.wsu.edu/crop-protection/disease-management/blue-mold
- WSU Tree Fruit — Gray Mold: https://treefruit.wsu.edu/crop-protection/disease-management/gray-mold/
- Penn State Extension — Apple Diseases, Fruit Rots: https://extension.psu.edu/apple-diseases-fruit-rots-control-at-apple-harvest-and-postharvest
- UC Davis Postharvest Center — Cherry: https://postharvest.ucdavis.edu/produce-facts-sheets/cherry
- UC Davis Postharvest Center — Cherry: Surface Pitting & Bruising: https://postharvest.ucdavis.edu/disorders/cherry-surface-pitting-bruising
- Cherry Growers Australia — Review of international best practice for postharvest management of sweet cherries: https://www.cherrygrowers.org.au/wp-content/uploads/2024/10/Review-of-international-best-practice-for-the-postharvest-management-of-sweet-cherries.pdf
- ISHS — Botrytis stem-end rot and other storage diseases of kiwifruit: https://ishs.org/ishs-article/297_71/
- ScienceDirect — Multiplex management strategies of postharvest fungal diseases of kiwifruit: https://www.sciencedirect.com/science/article/abs/pii/S1049964422002614
- MDPI — Advances in Kiwifruit Postharvest Management: https://www.mdpi.com/1467-3045/48/1/9
- University of Maryland Extension — Nine Physiological Disorders in Apples: https://extension.umd.edu/sites/extension.umd.edu/files/publications/OrchardColdStorage_FS-2022-0640_ada.pdf
- UC Davis Postharvest Center — Apple: Bitter Pit: https://postharvest.ucdavis.edu/disorders/apple-bitter-pit
- UC Davis Postharvest Center — Apple: Watercore: https://postharvest.ucdavis.edu/disorders/apple-watercore
- UC Davis Postharvest Center — Pear: Core Breakdown: https://postharvest.ucdavis.edu/disorders/pear-core-breakdown
- UC Davis Postharvest Center — Pear: Senescent Scald: https://postharvest.ucdavis.edu/disorders/pear-senescent-scald
- BlueData — Exportación Fruta Fresca, Cadena de Frío Chile: https://www.bluedata.cl/blogs/blog-data-loggers-chile/exportacion-fruta-fresca-cadena-frio-trazabilidad-temperatura-chile
- Luchsinger — Manejo de la cadena de frío en frutas de exportación (INTA/studylib): https://studylib.es/doc/7061462/sistemas-de-enfriamiento-en-frutas
- Repositorio U. de Chile — Factibilidad del Enfriamiento Rápido Contínuo para Fruta Fresca: http://repositorio.uchile.cl/handle/2250/103141
- Repositorio U. de Concepción — Cámaras y túneles de pre-frío para arándanos: https://repositorio.udec.cl/bitstreams/be2a66bf-a437-414a-93db-73fc9def09f8/download
- Radfords — FreshPack/FreshQuality: https://www.radfords.global/pack
- Farmsoft — ProducepakQI: https://producepak.com/ProucepakQI_Fresh_Produce_Quality_Inspection_App.pdf
- AgriERP — Quality App: https://agrierp.com/quality-app/
- AgriWise — Packhouse: https://agriwises.com/packhouse
- Zeltask — Software for fruit packing (Chile): https://zeltask.com/en/industries/fruit-packing/
