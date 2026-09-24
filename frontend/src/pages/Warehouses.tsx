import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Warehouses() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ code: "", name: "", city: "", state: "" });
  const load = async () => setItems((await api.get("/warehouses")).data.items);
  useEffect(() => { load(); }, []);
  async function submit(e: React.FormEvent) { e.preventDefault(); await api.post("/warehouses", form); setForm({ code: "", name: "", city: "", state: "" }); await load(); }
  return <section className="page"><h2>Armazéns</h2><form onSubmit={submit} className="form-grid"><input placeholder="Código" value={form.code} onChange={e=>setForm({...form,code:e.target.value})} required/><input placeholder="Nome" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/><input placeholder="Cidade" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/><input placeholder="UF" maxLength={2} value={form.state} onChange={e=>setForm({...form,state:e.target.value})}/><button type="submit">Cadastrar</button></form><div className="table-wrap"><table><thead><tr><th>Código</th><th>Nome</th><th>Cidade</th><th>Localizações</th><th>Estoques</th></tr></thead><tbody>{items.map(w=><tr key={w.id}><td>{w.code}</td><td>{w.name}</td><td>{w.city ?? "-"}</td><td>{w._count.locations}</td><td>{w._count.stocks}</td></tr>)}</tbody></table></div></section>;
}
