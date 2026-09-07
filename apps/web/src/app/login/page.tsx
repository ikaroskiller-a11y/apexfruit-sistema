import { Card } from "@/components/ui/Card";

export default function LoginPage() {
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

        <form className="space-y-4 opacity-60">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.04em] text-brand-800">
              Correo
            </label>
            <input
              type="email"
              disabled
              placeholder="nombre@apexfruit.cl"
              className="w-full rounded-lg border border-brand-950/15 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.04em] text-brand-800">
              Contraseña
            </label>
            <input
              type="password"
              disabled
              placeholder="••••••••"
              className="w-full rounded-lg border border-brand-950/15 bg-white px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-cream"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="mt-6 rounded-lg bg-brand-gold/15 px-3 py-2 text-center text-xs text-amber-900">
          Autenticación real todavía no implementada. Por ahora la app usa un
          usuario de demostración (ver <code>src/lib/auth.ts</code>).
        </p>
      </Card>
    </main>
  );
}
