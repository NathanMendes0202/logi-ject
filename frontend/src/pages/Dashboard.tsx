import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

type Metrics = { products: number; totalUnits: number; totalValue: number; movementsToday: number; lowStock: number };
type Movement = { id: string; type: string; quantity: number | string; createdAt: string; product: { sku: string; name: string }; warehouse: { name: string } };

const typeLabel: Record<string, string> = { IN: "Entrada", OUT: "Saída", TRANSFER: "Transferência", ADJUSTMENT: "Ajuste" };

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/reports/dashboard"), api.get("/reports/movements")])
      .then(([m, r]) => { setMetrics(m.data.metrics); setMovements(r.data.items); })
      .finally(() => setLoading(false));
  }, []);

  const chart = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - (6 - i));
      return { key: d.toISOString().slice(0,10), label: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "") };
    });
    return days.map(day => {
      const dayRows = movements.filter(m => m.createdAt.slice(0,10) === day.key);
      return { ...day, in: dayRows.filter(m => m.type === "IN").reduce((a,m)=>a+Number(m.quantity),0), out: dayRows.filter(m => m.type === "OUT").reduce((a,m)=>a+Number(m.quantity),0) };
    });
  }, [movements]);
  const max = Math.max(1, ...chart.flatMap(x => [x.in, x.out]));

  if (loading) return <div className="loading">Carregando dashboard...</div>;
  return <section className="page">
    <div className="page-header"><div><h1>Dashboard</h1><p>Visão operacional do estoque, {user?.name}.</p></div><span className="status-dot"><i/> Operação online</span></div>
    <div className="metrics metrics-5">
      <Metric value={metrics?.products ?? 0} label="Produtos ativos" />
      <Metric value={(metrics?.totalUnits ?? 0).toLocaleString("pt-BR")} label="Unidades em estoque" />
      <Metric value={`R$ ${(metrics?.totalValue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} label="Valor do estoque" />
      <Metric value={metrics?.movementsToday ?? 0} label="Movimentações hoje" />
      <Metric value={metrics?.lowStock ?? 0} label="Estoque baixo" warning={Boolean(metrics?.lowStock)} />
    </div>
    <div className="dashboard-grid">
      <div className="card chart-card"><div className="card-title"><div><h2>Movimentações</h2><span>Últimos 7 dias</span></div><div className="legend"><span><i className="legend-in"/> Entradas</span><span><i className="legend-out"/> Saídas</span></div></div><div className="bar-chart">{chart.map(d => <div className="bar-group" key={d.key}><div className="bars"><span className="bar in" style={{height:`${Math.max(4,d.in/max*100)}%`}} title={`Entradas: ${d.in}`}/><span className="bar out" style={{height:`${Math.max(4,d.out/max*100)}%`}} title={`Saídas: ${d.out}`}/></div><small>{d.label}</small></div>)}</div></div>
      <div className="card"><div className="card-title"><div><h2>Últimas movimentações</h2><span>Atividade recente</span></div></div><div className="activity-list">{movements.slice(0,6).map(m=><div className="activity" key={m.id}><span className={`activity-icon ${m.type.toLowerCase()}`}>{m.type === "IN" ? "+" : m.type === "OUT" ? "−" : "↔"}</span><div><strong>{typeLabel[m.type] ?? m.type}</strong><p>{m.product.name} · {m.warehouse.name}</p></div><b>{m.type === "OUT" ? "-" : "+"}{Number(m.quantity)}</b></div>)}</div></div>
    </div>
  </section>;
}
function Metric({ value, label, warning }: { value: string|number; label: string; warning?: boolean }) { return <article className={`metric-card ${warning ? "warning" : ""}`}><strong>{value}</strong><span>{label}</span></article>; }
