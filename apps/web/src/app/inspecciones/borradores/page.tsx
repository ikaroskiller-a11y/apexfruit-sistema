import TopBar from "@/components/TopBar";
import BorradoresPendientes from "./BorradoresPendientes";

export default function BorradoresPendientesPage() {
  return (
    <>
      <TopBar title="Borradores pendientes" />
      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-sm text-fg-muted">
            Inspecciones cargadas sin conexión que quedaron guardadas en este
            dispositivo. Se pueden reintentar apenas vuelva la señal.
          </p>
          <BorradoresPendientes />
        </div>
      </main>
    </>
  );
}
