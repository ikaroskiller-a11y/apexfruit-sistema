# Apex Fruit — Sistema de inspección y control de calidad

Aplicación web interna para registrar y consultar inspecciones de calidad de
fruta de exportación (manzana, uva de mesa, cereza, arándano, entre otras) —
Apex Fruit SPA, Curicó/Teno, Región del Maule.

Es una base funcional pensada para iterar rápido, no un producto terminado.
El diseño visual "pulido" lo define otro workstream (`docs/design`); acá la
prioridad fue que **funcione de punta a punta** con datos reales de Prisma.

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
│   │   ├── inspecciones/    # Listado (con filtros), detalle, formulario "nueva"
│   │   ├── lotes/           # Listado y detalle de lotes/partidas
│   │   ├── clientes/        # Listado y detalle de clientes/exportadoras
│   │   └── login/           # Login (email + password) y logout
│   ├── components/          # Sidebar, TopBar, gráficos, UI genérica
│   ├── proxy.ts             # Protege rutas: sin sesión válida, redirige a /login
│   └── lib/
│       ├── auth.ts          # Sesión, login/logout, validación de credenciales
│       ├── session.ts       # Firma/verificación del JWT de sesión (usa `jose`)
│       ├── prisma.ts        # Cliente Prisma singleton
│       ├── queries.ts       # Agregaciones para el dashboard
│       └── labels.ts        # Traducciones/labels de los enums de Prisma
└── public/uploads/          # Fotos subidas desde el formulario de inspección
```

## Modelo de datos (resumen)

- **Usuario**: inspector o administrador (rol). Login real con
  `passwordHash` (bcrypt) — ver "Cómo loguearse en local" arriba.
- **Cliente**: exportadora/comprador de la fruta.
- **Lote**: partida de fruta — especie, variedad, productor, packing,
  temporada, cliente asociado.
- **Inspección**: evaluación de un lote — calibre, color, firmeza, °Brix,
  % de rechazo, resultado, observaciones. Asociada a un inspector.
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
   — típicamente lo primero que pide un cliente exportador.
5. **Creación/edición de Lotes y Clientes desde la UI** — hoy solo se pueden
   ver (se crean por seed o directo en la base). El formulario de nueva
   inspección asume que el lote ya existe.
6. **Edición y eliminación de inspecciones** (hoy solo se crean y consultan).
7. **Roles y permisos** — hoy `Usuario.rol` solo restringe a quién puede
   figurar como inspector en una inspección nueva (un INSPECTOR solo puede
   registrarla a su propio nombre). Cuando exista UI de crear/editar
   clientes o lotes, restringirla a ADMINISTRADOR con el mismo patrón
   (`esAdmin()` en `src/lib/auth.ts`).
8. **Validación de formularios** más robusta (hoy es mínima, del lado
   servidor) — considerar `zod` para los server actions.
9. **Paginación** en los listados (inspecciones/lotes) cuando el volumen de
   datos crezca — hoy el listado de inspecciones trae hasta 200 filas.
10. **Tests** — no hay tests todavía.

## Paleta de marca

Definida como tokens de Tailwind en `src/app/globals.css`:

| Token             | Hex       | Uso                          |
| ------------------ | --------- | ----------------------------- |
| `brand-950`         | `#0f2a20` | Sidebar, fondos oscuros       |
| `brand-800`         | `#164735` | Hover, textos destacados      |
| `brand-700`         | `#1f6b49` | Botones primarios, acentos    |
| `brand-500`         | `#3e9b63` | Elementos secundarios         |
| `brand-leaf`        | `#a6c84f` | Acento activo/positivo        |
| `brand-gold`        | `#e7a93d` | Acento de advertencia/dorado  |
| `cream`             | `#f6f1e5` | Fondo general de la app       |
| `paper`             | `#fffdf8` | Tarjetas, superficies         |
| `ink`               | `#15211b` | Texto principal               |

Cuando el otro workstream (`docs/design`) entregue el sistema de diseño
definitivo, estos tokens son el punto de partida para reemplazar/ajustar.
