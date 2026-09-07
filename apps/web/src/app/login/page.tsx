import { Card } from "@/components/ui/Card";
import { iniciarSesion } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-brand-950 px-4">
      <Card className="w-full max-w-sm !bg-paper">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-leaf text-brand-950 text-lg font-bold">
            AF
          </span>
          <h1 className="text-lg font-semibold text-brand-950">Apex Fruit</h1>
          <p className="text-sm text-ink/60">Control de calidad de fruta</p>
        </div>

        <form action={iniciarSesion} className="space-y-4">
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.04em] text-brand-800">
              Correo
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              autoFocus
              placeholder="nombre@apexfruit.cl"
              className="w-full rounded-lg border border-brand-950/15 bg-white px-3 py-2 text-sm text-ink focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.04em] text-brand-800">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-brand-950/15 bg-white px-3 py-2 text-sm text-ink focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-[#fbe6e3] px-3 py-2 text-center text-xs text-[#b3261e]">
              Correo o contraseña incorrectos.
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-cream hover:bg-brand-800"
          >
            Iniciar sesión
          </button>
        </form>
      </Card>
    </main>
  );
}
