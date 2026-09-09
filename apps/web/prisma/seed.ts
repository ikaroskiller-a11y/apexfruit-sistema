/**
 * Datos de ejemplo para desarrollo local.
 * Corre con: npm run db:seed  (o automáticamente en `prisma migrate reset`)
 *
 * Pensado para que el dashboard y los listados no se vean vacíos apenas se
 * clona el proyecto. Los nombres de productores/clientes son ficticios.
 *
 * La lógica de tolerancia de cereza (evaluarResultadoCerezaSeed) refleja
 * los mismos umbrales que src/lib/normas.ts (suma de condición > 12% o
 * pudrición húmeda > 1% => Objetado). Se duplica aquí en vez de importarse
 * para que este script siga siendo independiente de la resolución de
 * path aliases de la app bajo `tsx`.
 */
import {
  PrismaClient,
  EspecieFruta,
  ResultadoInspeccion,
  TipoDefecto,
  RolUsuario,
  MercadoDestino,
  FirmezaUnidad,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Password de demostración para TODOS los usuarios del seed (ver
// README.md, sección "Cómo loguearse en local"). Nunca usar este valor
// fuera de desarrollo local.
const DEMO_PASSWORD = "ApexFruit2026!";

// Cuenta admin/admin extra, solo para pruebas rápidas en local (pedido
// explícito del dueño mientras el sistema está en desarrollo interno) —
// separada de la cuenta con nombre real de abajo para no mezclar datos de
// demo "presentables" con una credencial obviamente de prueba.
const ADMIN_TEST_EMAIL = "admin@apexfruit.cl";
const ADMIN_TEST_PASSWORD = "admin";

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randFloat(min: number, max: number, decimals = 1) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// Catálogo real de defectos de cereza (ver docs/research/material-existente.md
// §2.1/2.2 y src/lib/normas.ts)
// ---------------------------------------------------------------------------

const cerezaDefectosCalidad: TipoDefecto[] = [
  TipoDefecto.RUSSET,
  TipoDefecto.FUERA_DE_COLOR,
  TipoDefecto.AUSENCIA_PEDICELO,
  TipoDefecto.DEFORME,
  TipoDefecto.MANCHA,
];

const cerezaDefectosCondicion: TipoDefecto[] = [
  TipoDefecto.SOBREMADURO,
  TipoDefecto.PARTIDURA_CRACKING,
  TipoDefecto.HERIDA_ABIERTA,
  TipoDefecto.PUDRICION_HUMEDA,
  TipoDefecto.PUDRICION_SECA,
  TipoDefecto.PITTING,
  TipoDefecto.MAGULLADURA,
  TipoDefecto.PEDICELO_SECO,
  TipoDefecto.MEDIALUNA,
  TipoDefecto.QUEMADURA_SOL,
];

const cerezaDefectosTodos: TipoDefecto[] = [
  ...cerezaDefectosCalidad,
  ...cerezaDefectosCondicion,
];

const calibresCerezaSeed = ["Pre", "L", "XL", "J", "2J", "3J", "4J"] as const;

/** Misma tolerancia de 3 niveles de src/lib/normas.ts#evaluarResultadoCereza. */
function evaluarResultadoCerezaSeed(
  defectos: { tipo: TipoDefecto; porcentaje: number }[]
): ResultadoInspeccion {
  const sumaCondicion = defectos
    .filter((d) => cerezaDefectosCondicion.includes(d.tipo))
    .reduce((acc, d) => acc + d.porcentaje, 0);
  const pudricionHumeda = defectos
    .filter((d) => d.tipo === TipoDefecto.PUDRICION_HUMEDA)
    .reduce((acc, d) => acc + d.porcentaje, 0);

  if (pudricionHumeda > 1 || sumaCondicion > 12) return ResultadoInspeccion.OBJETADO;
  if (sumaCondicion > 6) return ResultadoInspeccion.CATEGORIA_2;
  return ResultadoInspeccion.CATEGORIA_1;
}

async function main() {
  console.log("Limpiando datos existentes...");
  await prisma.foto.deleteMany();
  await prisma.defecto.deleteMany();
  await prisma.inspeccion.deleteMany();
  await prisma.lote.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.usuario.deleteMany();

  console.log("Creando usuarios...");
  const demoPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const admin = await prisma.usuario.create({
    data: {
      nombre: "Francisca Rojas",
      email: "francisca.rojas@apexfruit.cl",
      passwordHash: demoPasswordHash,
      rol: RolUsuario.ADMINISTRADOR,
    },
  });

  await prisma.usuario.create({
    data: {
      nombre: "Administrador",
      email: ADMIN_TEST_EMAIL,
      passwordHash: await bcrypt.hash(ADMIN_TEST_PASSWORD, 10),
      rol: RolUsuario.ADMINISTRADOR,
    },
  });

  const inspectores = await Promise.all(
    [
      "Matías Fuentes",
      "Camila Sepúlveda",
      "Ignacio Muñoz",
      "Valentina Torres",
    ].map((nombre, i) =>
      prisma.usuario.create({
        data: {
          nombre,
          email: `inspector${i + 1}@apexfruit.cl`,
          passwordHash: demoPasswordHash,
          rol: RolUsuario.INSPECTOR,
        },
      })
    )
  );

  console.log("Creando clientes...");
  const clientesData = [
    { nombre: "Exportadora Los Aromos", rut: "76.111.222-3" },
    { nombre: "Comercial Valle Fértil", rut: "76.222.333-4" },
    { nombre: "Agroindustrial Maule Sur", rut: "76.333.444-5" },
    { nombre: "Frutícola Rincón del Sol", rut: "76.444.555-6" },
    { nombre: "Exportadora Los Boldos", rut: "76.555.666-7" },
  ];
  const clientes = await Promise.all(
    clientesData.map((c) =>
      prisma.cliente.create({
        data: {
          nombre: c.nombre,
          rut: c.rut,
          contacto: "Encargado de Calidad",
          email: `calidad@${c.nombre.toLowerCase().replace(/[^a-z]+/g, "")}.com`,
          telefono: "+56 9 " + randInt(10000000, 99999999),
          direccion: "Curicó, Región del Maule, Chile",
        },
      })
    )
  );

  const especiesConVariedades: Record<EspecieFruta, string[]> = {
    [EspecieFruta.MANZANA]: ["Gala", "Fuji", "Granny Smith", "Pink Lady"],
    [EspecieFruta.UVA_DE_MESA]: ["Thompson Seedless", "Crimson Seedless", "Red Globe"],
    [EspecieFruta.CEREZA]: ["Lapins", "Santina", "Regina", "Bing"],
    [EspecieFruta.ARANDANO]: ["Duke", "Legacy", "Brigitta"],
    [EspecieFruta.PERA]: ["Packham's Triumph", "Abate Fetel"],
    [EspecieFruta.KIWI]: ["Hayward"],
    [EspecieFruta.CIRUELA]: ["Angeleno", "Larry Ann"],
    [EspecieFruta.OTRO]: ["Sin especificar"],
  };

  const especiesActivas: EspecieFruta[] = [
    EspecieFruta.MANZANA,
    EspecieFruta.PERA,
    EspecieFruta.KIWI,
    EspecieFruta.CEREZA,
  ];

  const productores = [
    "Agrícola Los Boldos",
    "Fundo Santa Elena",
    "Agrícola El Peumo",
    "Huerto San Ignacio",
    "Agrícola Tres Robles",
    "Fundo La Esperanza",
  ];

  const packings = [
    "Packing Curicó Centro",
    "Packing Teno Norte",
    "Packing Molina",
    "Packing Sagrada Familia",
  ];

  const temporadas = ["2024-2025", "2025-2026"];
  const mercadosDestino = Object.values(MercadoDestino);

  const defectosPorEspecie: Record<EspecieFruta, TipoDefecto[]> = {
    [EspecieFruta.MANZANA]: [
      TipoDefecto.RUSSET,
      TipoDefecto.MAGULLADURA,
      TipoDefecto.QUEMADURA_SOL,
      TipoDefecto.DEFORME,
    ],
    [EspecieFruta.UVA_DE_MESA]: [
      TipoDefecto.DESGRANE,
      TipoDefecto.PEDICELO_SECO,
      TipoDefecto.PUDRICION_HUMEDA,
      TipoDefecto.PARTIDURA_CRACKING,
    ],
    // Catálogo real completo (5 calidad + 10 condición) — ver
    // docs/research/material-existente.md §2.1/2.2.
    [EspecieFruta.CEREZA]: cerezaDefectosTodos,
    [EspecieFruta.ARANDANO]: [
      TipoDefecto.BLANDURA,
      TipoDefecto.PUDRICION_HUMEDA,
      TipoDefecto.INMADURO,
      TipoDefecto.MANCHA,
    ],
    [EspecieFruta.PERA]: [TipoDefecto.RUSSET, TipoDefecto.DEFORME],
    [EspecieFruta.KIWI]: [TipoDefecto.BLANDURA, TipoDefecto.INMADURO],
    [EspecieFruta.CIRUELA]: [TipoDefecto.MAGULLADURA, TipoDefecto.PARTIDURA_CRACKING],
    [EspecieFruta.OTRO]: [TipoDefecto.OTRO],
  };

  console.log("Creando lotes e inspecciones...");
  let codigoSeq = 1;
  let primerCerezaObjetadaCreada = false;

  for (const temporada of temporadas) {
    const [anioInicio] = temporada.split("-").map(Number);

    for (const especie of especiesActivas) {
      // 3-4 lotes por especie por temporada
      const nLotes = randInt(3, 4);

      for (let i = 0; i < nLotes; i++) {
        const variedad = rand(especiesConVariedades[especie]);
        const cliente = rand(clientes);
        const mesCosecha =
          especie === EspecieFruta.CEREZA
            ? randInt(10, 12) // oct-dic
            : especie === EspecieFruta.KIWI
              ? randInt(4, 5) // abr-may
              : randInt(2, 4); // manzana/pera feb-abr
          const anioCosecha =
            mesCosecha >= 10 ? anioInicio : anioInicio + 1;

        const fechaCosecha = new Date(anioCosecha, mesCosecha - 1, randInt(1, 27));
        const codigo = `AF-${temporada.slice(2, 4)}${temporada.slice(7, 9)}-${String(
          codigoSeq++
        ).padStart(4, "0")}`;

        const lote = await prisma.lote.create({
          data: {
            codigo,
            especie,
            variedad,
            productor: rand(productores),
            ubicacionPacking: rand(packings),
            temporada,
            fechaCosecha,
            fechaIngreso: new Date(
              fechaCosecha.getTime() + 1000 * 60 * 60 * 24 * randInt(1, 3)
            ),
            cajasTotales: randInt(500, 6000),
            kgTotales: randFloat(5000, 60000, 0),
            calibrePredominante:
              especie === EspecieFruta.MANZANA
                ? rand(["70-75mm", "75-80mm", "80-85mm"])
                : especie === EspecieFruta.PERA
                  ? rand(["60-65mm", "65-70mm", "70-75mm"])
                  : especie === EspecieFruta.CEREZA
                    ? rand(calibresCerezaSeed)
                    : rand(["25", "27", "30", "33", "36"]), // kiwi: conteo por bandeja
            mercadoDestino: rand(mercadosDestino),
            clienteId: cliente.id,
          },
        });

        // 2-4 inspecciones por lote, espaciadas en el tiempo
        const nInspecciones = randInt(2, 4);
        for (let j = 0; j < nInspecciones; j++) {
          const inspector = rand(inspectores);
          const fecha = new Date(
            fechaCosecha.getTime() +
              1000 * 60 * 60 * 24 * (j * randInt(3, 6) + randInt(0, 2))
          );

          const muestraUnidades = randInt(50, 200);
          const muestraCajas = randInt(3, 12);

          // --- Defectos: se generan ANTES de crear la inspección para
          // poder calcular el resultado de cereza con la tolerancia real
          // de 3 niveles a partir de los defectos efectivamente creados. ---
          const defectosDisponibles = defectosPorEspecie[especie];
          const nDefectosLocal = randInt(1, 3);
          const usados = new Set<TipoDefecto>();
          const defectosData: { tipo: TipoDefecto; porcentaje: number }[] = [];
          for (let k = 0; k < nDefectosLocal; k++) {
            const tipo = rand(defectosDisponibles);
            if (usados.has(tipo)) continue;
            usados.add(tipo);
            defectosData.push({ tipo, porcentaje: randFloat(0.3, 6) });
          }

          // Garantiza al menos un ejemplo determinístico de cereza objetada
          // (para poder verificar en /inspecciones/[id]/reporte que la
          // banda roja y el texto de criterio de objeción se muestran bien).
          if (especie === EspecieFruta.CEREZA && !primerCerezaObjetadaCreada) {
            defectosData.length = 0;
            defectosData.push(
              { tipo: TipoDefecto.PUDRICION_HUMEDA, porcentaje: 1.8 },
              { tipo: TipoDefecto.PARTIDURA_CRACKING, porcentaje: 3.2 },
              { tipo: TipoDefecto.RUSSET, porcentaje: 2.0 }
            );
            primerCerezaObjetadaCreada = true;
          }

          let resultado: ResultadoInspeccion;
          let porcentajeRechazo: number;
          if (especie === EspecieFruta.CEREZA) {
            resultado = evaluarResultadoCerezaSeed(defectosData);
            porcentajeRechazo = Number(
              defectosData.reduce((acc, d) => acc + d.porcentaje, 0).toFixed(1)
            );
          } else {
            porcentajeRechazo = randFloat(1.5, 18, 1);
            resultado =
              porcentajeRechazo > 12
                ? ResultadoInspeccion.OBJETADO
                : porcentajeRechazo > 6
                  ? ResultadoInspeccion.CATEGORIA_2
                  : ResultadoInspeccion.CATEGORIA_1;
          }

          // Color Dark/Light (solo cereza) — Light es el complemento de Dark.
          const colorDark =
            especie === EspecieFruta.CEREZA ? randInt(60, 90) : undefined;
          const colorLight =
            colorDark !== undefined ? 100 - colorDark : undefined;

          // Control de hidroenfriado (solo cereza). ~20% de las inspecciones
          // queda deliberadamente fuera de tolerancia, para que el demo no
          // se vea "todo perfecto".
          const hidrocoolerFueraDeRango =
            especie === EspecieFruta.CEREZA && Math.random() < 0.2;

          const inspeccion = await prisma.inspeccion.create({
            data: {
              fecha,
              calibre: lote.calibrePredominante,
              color:
                especie === EspecieFruta.MANZANA
                  ? `${randInt(40, 90)}% cubrimiento color`
                  : especie === EspecieFruta.PERA
                    ? rand(["Verde intenso", "Verde amarillento", "Bronceado (russet)"])
                    : especie === EspecieFruta.KIWI
                      ? rand(["Piel parda uniforme", "Piel parda con vello escaso"])
                      : rand(["Rojo intenso", "Rojo brillante", "Rojo oscuro"]), // cereza
              colorPorcentajeDark: colorDark,
              colorPorcentajeLight: colorLight,
              firmeza:
                especie === EspecieFruta.MANZANA
                  ? randFloat(5.5, 8.5)
                  : especie === EspecieFruta.PERA
                    ? randFloat(5.0, 8.0)
                    : especie === EspecieFruta.CEREZA
                      ? randFloat(58, 88, 1) // grados Durofel (UD)
                      : randFloat(4, 14, 1), // kiwi: libras
              firmezaUnidad:
                especie === EspecieFruta.MANZANA || especie === EspecieFruta.PERA
                  ? FirmezaUnidad.KGF
                  : especie === EspecieFruta.CEREZA
                    ? FirmezaUnidad.UD_DUROFEL
                    : especie === EspecieFruta.KIWI
                      ? FirmezaUnidad.LBS
                      : undefined,
              brixGrados:
                especie === EspecieFruta.CEREZA
                  ? randFloat(17, 24)
                  : especie === EspecieFruta.KIWI
                    ? randFloat(9, 14)
                    : randFloat(11, 15), // manzana/pera
              pesoMuestraKg: randFloat(5, 20),
              muestraCajas,
              muestraUnidades,
              hidrocoolerTempAguaC:
                especie === EspecieFruta.CEREZA
                  ? hidrocoolerFueraDeRango
                    ? randFloat(2.5, 4, 1)
                    : randFloat(0, 2, 1)
                  : undefined,
              hidrocoolerCloroLibrePpm:
                especie === EspecieFruta.CEREZA
                  ? hidrocoolerFueraDeRango
                    ? randFloat(60, 90, 0)
                    : randFloat(100, 120, 0)
                  : undefined,
              hidrocoolerTiempoExposicionMin:
                especie === EspecieFruta.CEREZA
                  ? hidrocoolerFueraDeRango
                    ? randFloat(5.5, 7, 1)
                    : randFloat(3, 5, 1)
                  : undefined,
              hidrocoolerTempPulpaPostC:
                especie === EspecieFruta.CEREZA ? randFloat(0, 4, 1) : undefined,
              hidrocoolerEsperaMasDeUnaHora:
                especie === EspecieFruta.CEREZA ? Math.random() < 0.15 : undefined,
              porcentajeRechazo,
              resultado,
              observaciones:
                resultado === ResultadoInspeccion.OBJETADO
                  ? "Lote no cumple estándar de exportación, se recomienda reproceso."
                  : resultado === ResultadoInspeccion.CATEGORIA_2
                    ? "Categoría 2: monitorear evolución de defectos en próxima inspección."
                    : "Cumple estándar de exportación (Categoría 1).",
              loteId: lote.id,
              inspectorId: inspector.id,
            },
          });

          if (defectosData.length > 0) {
            await prisma.defecto.createMany({
              data: defectosData.map((d) => ({
                tipo: d.tipo,
                porcentaje: d.porcentaje,
                cantidad: Math.round((muestraUnidades * d.porcentaje) / 100),
                esCritico: d.tipo === TipoDefecto.PUDRICION_HUMEDA,
                inspeccionId: inspeccion.id,
              })),
            });
          }
        }
      }
    }
  }

  const totalLotes = await prisma.lote.count();
  const totalInspecciones = await prisma.inspeccion.count();
  console.log(
    `Listo: usuario admin ${admin.email} (password: ${DEMO_PASSWORD}) / ${ADMIN_TEST_EMAIL} (password: ${ADMIN_TEST_PASSWORD}), ${clientes.length} clientes, ${totalLotes} lotes, ${totalInspecciones} inspecciones.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
