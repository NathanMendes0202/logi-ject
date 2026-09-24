import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Stock() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { api.get("/stock?limit=100").then(r => setItems(r.data.items)); }, []);
  return <section className="page"><h2>Estoque</h2><div className="table-wrap"><table><thead><tr><th>SKU</th><th>Produto</th><th>Armazém</th><th>Localização</th><th>Quantidade</th><th>Reservado</th><th>Disponível</th></tr></thead><tbody>{items.map(s=><tr key={s.id}><td>{s.product.sku}</td><td>{s.product.name}</td><td>{s.warehouse.code}</td><td>{s.location?.code ?? "-"}</td><td>{Number(s.quantity)}</td><td>{Number(s.reserved)}</td><td>{Number(s.quantity)-Number(s.reserved)}</td></tr>)}</tbody></table></div></section>;
}
