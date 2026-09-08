# Apex Fruit — Sistema de inspección y control de calidad

Aplicación web interna para registrar y consultar inspecciones de calidad de
fruta de exportación (manzana, uva de mesa, cereza, arándano, entre otras) —
Apex Fruit SPA, Curicó/Teno, Región del Maule.

Es una base funcional pensada para iterar rápido, no un producto terminado.
El diseño visual sigue `docs/design/guia-diseno.md`; acá la prioridad fue
que **funcione de punta a punta** con datos reales de Prisma.

**Dos cosas a leer antes de tocar código:**

- **Next.js 16 es muy reciente y rompe compatibilidad** con bastante de lo
  que la mayoría de la gente (y los modelos de lenguaje) da por sentado de
  versiones anteriores. Antes de escribir rutas, middleware o App Router
  nuevo, revisar `apps/web/AGENTS.md` y `node_modules/next/dist/docs/`.
- **No hay tests todavía** (ver punto 10 de "Qué falta por hacer"). Si vas a
  modificar lógica existente (server actions, `src/lib/normas.ts`,
  `src/lib/validation.ts`), probar a mano el flujo antes de dar por buena
  una refactorización.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (paleta de marca de Apex Fruit como tokens en
  `src/app/globals.css`)
- **Prisma 6** + **SQLite** para desarrollo local (sin dependencias externas,
  el archivo de base de datos vive en `prisma/dev.db`)
- **Recharts** para los gráficos del dashboard

## Cómo instalar y correr

```bash
cd apps/web
npm install

# Variables de entorno: ruta de la BD SQLite local + AUTH_SECRET (clave
# para firmar la cookie de sesión). Genera tu propia clave con:
#   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
cp .env.example .env
# y reemplaza AUTH_SECRET en .env con la clave generada.

# Prepara la base de datos local (crea prisma/dev.db y aplica el schema)
npm run db:migrate

# Carga datos de ejemplo (clientes, lotes, inspecciones ficticias y
# usuarios con password de demo — ver "Cómo loguearse en local" abajo)
npm run db:seed

# Levanta el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) — redirige a `/dashboard`
(o a `/login` si no hay sesión iniciada).

### Cómo loguearse en local

`npm run db:seed` crea usuarios reales con `passwordHash` (bcrypt). Todos
comparten la misma contraseña de demostración:

| Email                             | Rol            | Password         |
| ---------------------------------- | -------------- | ----------------- |
| `francisca.rojas@apexfruit.cl`     | ADMINISTRADOR  | `ApexFruit2026!`  |
| `inspector1@apexfruit.cl` (y 2-4)  | INSPECTOR      | `ApexFruit2026!`  |

Un ADMINISTRADOR puede registrar una inspección a nombre de cualquier
inspector (selector libre); un INSPECTOR solo puede registrarla a su propio
nombre (el campo queda fijo en el formulario, y el server action lo vuelve
a forzar igual del lado del servidor).

### Otros comandos útiles

| Comando               | Qué hace                                              |
| ---------------------- | ------------------------------------------------------ |
| `npm run build`         | Build de producción (falla si hay errores de TS/lint) |
| `npm run lint`          | ESLint                                                 |
| `npm run db:studio`     | Abre Prisma Studio para ver/editar datos a mano        |
| `npm run db:reset`      | Borra la base de datos local y vuelve a migrar+seedear |

## Estructura del proyecto

```
apps/web/
├── prisma/
│   ├── schema.prisma      # Modelo de datos (Lote, Inspección, Defecto, Foto, Cliente, Usuario)
│   └── seed.ts             # Datos de ejemplo para desarrollo
├── src/
│   ├── app/
│   │   ├── dashboard/       # Gráficos: rechazo por lote, evolución, comparativas
│   │   ├── inspecciones/    # Listado paginado (con filtros), detalle, reporte
│   │   │   ├── InspeccionForm.tsx  # Formulario compartido (crear y editar)
│   │   │   ├── nueva/       # Crear inspección
│   │   │   └── [id]/        # Detalle, editar, eliminar, reporte imprimible
│   │   ├── lotes/           # Listado paginado, alta, edición, eliminación
│   │   ├── clientes/        # Listado, alta, edición, eliminación
│   │   └── login/           # Login (email + password) y logout
│   ├── components/          # Sidebar, TopBar, gráficos, UI genérica
│   ├── proxy.ts             # Protege rutas: sin sesión válida, redirige a /login
│   └── lib/
│       ├── auth.ts          # Sesión, login/logout, validación de credenciales, esAdmin()
│       ├── session.ts       # Firma/verificación del JWT de sesión (usa `jose`)
│       ├── prisma.ts        # Cliente Prisma singleton
│       ├── queries.ts       # Agregaciones para el dashboard
│       ├── labels.ts        # Traducciones/labels de los enums de Prisma
│       ├── normas.ts        # Firmeza por especie, catálogo de defectos de cereza
│       └── validation.ts    # Esquemas zod + tipo `FormState` compartido por los server actions
└── public/uploads/          # Fotos subidas desde el formulario de inspección
```

## Modelo de datos (resumen)

- **Usuario**: inspector o administrador (rol). Login real con
  `passwordHash` (bcrypt) — ver "Cómo loguearse en local" arriba.
- **Cliente**: exportadora/comprador de la fruta.
- **Lote**: partida de fruta — especie, variedad, productor, packing,
  temporada, cliente asociado, mercado destino.
- **Inspección**: evaluación de un lote — calibre, color, firmeza (unidad
  según especie: kgF, grados Durofel o libras — ver `firmezaUnidad`), °Brix,
  % de rechazo, resultado (`CATEGORIA_1` / `CATEGORIA_2` / `OBJETADO`),
  parámetros de hidroenfriado para cereza, observaciones. Asociada a un
  inspector; editable/eliminable por su propio inspector o cualquier
  administrador.
- **Defecto**: defectos encontrados en una inspección (pudrición, russet,
  magulladura, desgrane, etc.), con % y cantidad.
- **Foto**: fotos adjuntas a una inspección (se guardan en
  `public/uploads/` en desarrollo).

## Qué falta por hacer

Esto es una base, no el producto final. Próximos pasos sugeridos, más o
menos en orden de prioridad:

1. ~~**Autenticación real.**~~ Hecho: sesión propia con cookie HTTP-only
   firmada (JWT vía `jose`) + `Usuario.passwordHash` (bcrypt), protegida por
   `src/proxy.ts`. Ver "Cómo loguearse en local" arriba. Pendiente real que
   queda: recuperación de contraseña, expiración/renovación configurable
   más allá de los 7 días fijos, y un panel para que un admin cree/edite
   usuarios desde la UI (hoy solo se crean por seed o directo en la base).
2. **Base de datos de producción.** Cambiar el `provider` del datasource en
   `prisma/schema.prisma` de `sqlite` a `postgresql` (o el motor que se
   defina) y correr `prisma migrate deploy` contra la BD real. SQLite es
   solo para desarrollo local.
3. **Almacenamiento de fotos en producción.** Ahora mismo las fotos se
   guardan en el filesystem local (`public/uploads`), lo que no funciona en
   la mayoría de plataformas de hosting sin disco persistente. Migrar a un
   bucket (S3, Cloudflare R2, Vercel Blob, etc.).
4. **Exportar reportes a PDF/Excel** (por lote, por cliente, por temporada)
   — típicamente lo primero que pide un cliente exportador. Hoy existe un
   reporte imprimible (`/inspecciones/[id]/reporte`, vía `window.print()`)
   pensado para el equipo interno, no un export real a PDF/Excel
   descargable — ver recomendación y estimación de esfuerzo en
   `docs/research/integraciones-recomendadas.md`.
5. ~~**Creación/edición de Lotes y Clientes desde la UI.**~~ Hecho: alta,
   edición y eliminación completas (`src/app/lotes/`, `src/app/clientes/`),
   restringidas a ADMINISTRADOR.
6. ~~**Edición y eliminación de inspecciones.**~~ Hecho
   (`src/app/inspecciones/[id]/actions.ts`) — un INSPECTOR solo puede
   editar/eliminar las suyas, un ADMINISTRADOR cualquiera. No existe hoy un
   concepto de inspección "cerrada" que bloquee la edición una vez enviado
   el reporte al cliente — evaluar si hace falta antes de que eso pase en
   producción.
7. ~~**Roles y permisos.**~~ Hecho para todo el CRUD existente (patrón
   `esAdmin()` en `src/lib/auth.ts`, aplicado en lotes/clientes/inspecciones).
8. ~~**Validación de formularios más robusta.**~~ Hecho con `zod`
   (`src/lib/validation.ts`), con mensajes de error en español mostrados en
   la UI, no solo en consola.
9. ~~**Paginación**~~ en inspecciones y lotes. Falta agregarla al listado de
   clientes si el volumen lo llega a justificar (hoy son solo 5).
10. **Tests** — no hay tests todavía.
11. **Modo offline / PWA** para inspección en terreno con conectividad
    intermitente — ver `docs/research/requisitos.md` (recomendación de
    plataforma) y `docs/research/usabilidad-control-calidad.md`.

## Sistema de diseño

Guía completa en `docs/design/guia-diseno.md` (paleta, tipografía IBM Plex,
reglas de formularios largos y navegación mobile) — ya aplicada a `apps/web`,
no es un pendiente. Los tokens viven en `src/app/globals.css` como variables
CSS (`--color-*`), con valores distintos para modo claro y oscuro:

| Grupo                     | Ejemplos de token                                              | Uso                                    |
| -------------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| Marca                      | `--color-brand-950` … `--color-brand-500`, `-leaf`, `-gold`      | Sidebar, botones primarios, acentos     |
| Superficie / texto         | `--color-surface`, `-card`, `-card-alt`, `-fg`, `-fg-muted`, `-border` | Fondos, tarjetas, texto, bordes    |
| Estados semánticos         | `--color-state-success/warning/danger/info` (+ `-bg`)            | Badges, alertas — siempre con ícono + texto, nunca solo color |
| Categórico por variedad    | `--color-variedad-manzana/pera/cereza/kiwi/otro`                 | Series de gráficos, orden fijo entre pantallas |

Cualquier UI nueva debe reusar estos tokens (y los componentes de
`src/components/ui/`) en vez de definir colores sueltos.
