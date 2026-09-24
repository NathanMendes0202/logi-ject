import { useEffect, useState } from "react";
import api from "../services/api";

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [counts, setCounts] = useState<Record<string,string>>({});
  const load = async () => { const r = await api.get("/inventories"); setItems(r.data.items); };
  useEffect(() => { load(); api.get("/warehouses").then(r => setWarehouses(r.data.items)); }, []);
  const create = async () => { if (!warehouseId) return; await api.post("/inventories", { warehouseId }); setWarehouseId(""); load(); };
  const open = async (id: string) => { const r = await api.get(`/inventories/${id}`); setSelected(r.data.item); };
  const count = async (itemId: string) => { await api.patch(`/inventories/${selected.id}/items/${itemId}/count`, { countedQuantity: Number(counts[itemId] ?? 0) }); open(selected.id); };
  const close = async () => { await api.post(`/inventories/${selected.id}/close`); setSelected(null); load(); };
  return <section><h1>Inventário</h1><div className="card"><select value={warehouseId} onChange={e=>setWarehouseId(e.target.value)}><option value="">Selecione o armazém</option>{warehouses.map(w=><option key={w.id} value={w.id}>{w.code} - {w.name}</option>)}</select><button onClick={create}>Iniciar inventário</button></div><div className="card"><table><thead><tr><th>Código</th><th>Armazém</th><th>Status</th><th>Itens</th><th></th></tr></thead><tbody>{items.map(i=><tr key={i.id}><td>{i.code}</td><td>{i.warehouse.name}</td><td>{i.status}</td><td>{i._count.items}</td><td><button onClick={()=>open(i.id)}>Abrir</button></td></tr>)}</tbody></table></div>{selected&&<div className="card"><h2>{selected.code}</h2><table><thead><tr><th>Produto</th><th>Local</th><th>Sistema</th><th>Contagem</th><th>Diferença</th><th></th></tr></thead><tbody>{selected.items.map((i:any)=><tr key={i.id}><td>{i.product.sku} - {i.product.name}</td><td>{i.location?.code ?? "-"}</td><td>{i.systemQuantity}</td><td><input type="number" min="0" value={counts[i.id] ?? i.countedQuantity ?? ""} onChange={e=>setCounts({...counts,[i.id]:e.target.value})}/></td><td>{i.difference ?? "-"}</td><td><button onClick={()=>count(i.id)}>Salvar</button></td></tr>)}</tbody></table>{["OPEN","COUNTING"].includes(selected.status)&&<button onClick={close}>Finalizar inventário</button>}</div>}</section>;
}
