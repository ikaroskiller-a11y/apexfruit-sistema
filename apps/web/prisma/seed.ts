/**
 * Datos de ejemplo para desarrollo local.
 * Corre con: npm run db:seed  (o automáticamente en `prisma migrate reset`)
 *
 * Pensado para que el dashboard y los listados no se vean vacíos apenas se
 * clona el proyecto. Los nombres de productores/clientes son ficticios.
 */
import {
  PrismaClient,
  EspecieFruta,
  ResultadoInspeccion,
  TipoDefecto,
  RolUsuario,
} from "@prisma/client";

const prisma = new PrismaClient();

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randFloat(min: number, max: number, decimals = 1) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
  const admin = await prisma.usuario.create({
    data: {
      nombre: "Francisca Rojas",
      email: "francisca.rojas@apexfruit.cl",
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
          rol: RolUsuario.INSPECTOR,
        },
      })
    )
  );

  console.log("Creando clientes...");
  const clientesData = [
    { nombre: "Del Monte Fresh Produce", rut: "76.111.222-3" },
    { nombre: "Unifrutti Traders", rut: "76.222.333-4" },
    { nombre: "Subsole S.A.", rut: "76.333.444-5" },
    { nombre: "Frutas de Chile Export", rut: "76.444.555-6" },
    { nombre: "Copefrut", rut: "76.555.666-7" },
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
    EspecieFruta.UVA_DE_MESA,
    EspecieFruta.CEREZA,
    EspecieFruta.ARANDANO,
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
  const destinos = ["Estados Unidos", "Unión Europea", "China", "Brasil", "Reino Unido"];

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
      TipoDefecto.PUDRICION,
      TipoDefecto.PARTIDURA_CRACKING,
    ],
    [EspecieFruta.CEREZA]: [
      TipoDefecto.PARTIDURA_CRACKING,
      TipoDefecto.BLANDURA,
      TipoDefecto.PUDRICION,
      TipoDefecto.PEDICELO_SECO,
    ],
    [EspecieFruta.ARANDANO]: [
      TipoDefecto.BLANDURA,
      TipoDefecto.PUDRICION,
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
            : especie === EspecieFruta.ARANDANO
              ? randInt(11, 12)
              : especie === EspecieFruta.UVA_DE_MESA
                ? randInt(1, 3)
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
                : especie === EspecieFruta.UVA_DE_MESA
                  ? rand(["JJ", "J", "XJ"])
                  : especie === EspecieFruta.CEREZA
                    ? rand(["26-28mm", "28-30mm", "30-32mm"])
                    : rand(["Small", "Medium", "Large"]),
            destino: rand(destinos),
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

          const porcentajeRechazo = randFloat(1.5, 18, 1);
          const resultado: ResultadoInspeccion =
            porcentajeRechazo > 12
              ? ResultadoInspeccion.RECHAZADO
              : porcentajeRechazo > 6
                ? ResultadoInspeccion.APROBADO_CON_OBSERVACIONES
                : ResultadoInspeccion.APROBADO;

          const inspeccion = await prisma.inspeccion.create({
            data: {
              fecha,
              calibre: lote.calibrePredominante,
              color:
                especie === EspecieFruta.MANZANA
                  ? `${randInt(40, 90)}% cubrimiento color`
                  : especie === EspecieFruta.UVA_DE_MESA
                    ? rand(["Ámbar claro", "Ámbar", "Dorado"])
                    : rand(["Rojo intenso", "Rojo brillante", "Rojo oscuro"]),
              firmezaKgF:
                especie === EspecieFruta.MANZANA
                  ? randFloat(5.5, 8.5)
                  : especie === EspecieFruta.CEREZA
                    ? randFloat(250, 400, 0)
                    : randFloat(1.2, 2.8),
              brixGrados:
                especie === EspecieFruta.UVA_DE_MESA
                  ? randFloat(16, 22)
                  : especie === EspecieFruta.CEREZA
                    ? randFloat(17, 24)
                    : especie === EspecieFruta.ARANDANO
                      ? randFloat(10, 15)
                      : randFloat(11, 15),
              pesoMuestraKg: randFloat(5, 20),
              muestraCajas: randInt(3, 12),
              muestraUnidades: randInt(50, 200),
              porcentajeRechazo,
              resultado,
              observaciones:
                resultado === ResultadoInspeccion.RECHAZADO
                  ? "Lote no cumple estándar de exportación, se recomienda reproceso."
                  : resultado === ResultadoInspeccion.APROBADO_CON_OBSERVACIONES
                    ? "Aprobado, monitorear evolución de defectos en próxima inspección."
                    : "Cumple estándar de exportación.",
              loteId: lote.id,
              inspectorId: inspector.id,
            },
          });

          const defectosDisponibles = defectosPorEspecie[especie];
          const nDefectos = randInt(1, 3);
          const usados = new Set<TipoDefecto>();
          for (let k = 0; k < nDefectos; k++) {
            const tipo = rand(defectosDisponibles);
            if (usados.has(tipo)) continue;
            usados.add(tipo);
            const porcentaje = randFloat(0.3, porcentajeRechazo / nDefectos + 2);
            await prisma.defecto.create({
              data: {
                tipo,
                porcentaje,
                cantidad: Math.round(
                  ((inspeccion.muestraUnidades ?? 100) * porcentaje) / 100
                ),
                esCritico: tipo === TipoDefecto.PUDRICION,
                inspeccionId: inspeccion.id,
              },
            });
          }
        }
      }
    }
  }

  const totalLotes = await prisma.lote.count();
  const totalInspecciones = await prisma.inspeccion.count();
  console.log(
    `Listo: usuario admin ${admin.email}, ${clientes.length} clientes, ${totalLotes} lotes, ${totalInspecciones} inspecciones.`
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
