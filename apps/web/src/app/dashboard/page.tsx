import TopBar from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import RechazoPorLoteChart from "@/components/charts/RechazoPorLoteChart";
import EvolucionCalidadChart from "@/components/charts/EvolucionCalidadChart";
import ComparativaBarChart from "@/components/charts/ComparativaBarChart";
import {
  getComparativaPorCliente,
  getComparativaPorEspecie,
  getEvolucionPorTemporada,
  getKpisGenerales,
  getRechazoPorLote,
} from "@/lib/queries";
import { formatNumero, formatPorcentaje } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [kpis, rechazoPorLote, evolucion, porEspecie, porCliente] =
    await Promise.all([
      getKpisGenerales(),
      getRechazoPorLote(10),
      getEvolucionPorTemporada(),
      getComparativaPorEspecie(),
      getComparativaPorCliente(),
    ]);

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Lotes registrados" value={formatNumero(kpis.totalLotes, 0)} />
          <StatCard
            label="Inspecciones"
            value={formatNumero(kpis.totalInspecciones, 0)}
          />
          <StatCard label="Clientes" value={formatNumero(kpis.totalClientes, 0)} />
          <StatCard
            label="Rechazo promedio"
            value={formatPorcentaje(kpis.rechazoPromedio)}
            hint="Todas las inspecciones"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardTitle>% de rechazo por lote (top 10)</CardTitle>
            <RechazoPorLoteChart data={rechazoPorLote} />
          </Card>

          <Card>
            <CardTitle>Evolución de calidad por temporada</CardTitle>
            <EvolucionCalidadChart data={evolucion} />
          </Card>

          <Card>
            <CardTitle>Rechazo promedio por especie</CardTitle>
            {/* % de rechazo por especie = severidad, no identidad de
                variedad: usa el hue de estado (guía §1.3), color por
                defecto del componente. */}
            <ComparativaBarChart data={porEspecie} categoryKey="especie" />
          </Card>

          <Card>
            <CardTitle>Rechazo promedio por cliente</CardTitle>
            <ComparativaBarChart
              data={porCliente}
              categoryKey="cliente"
              color="var(--color-brand-gold)"
            />
          </Card>
        </div>
      </main>
    </>
  );
}
