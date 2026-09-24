import { FormEvent, useEffect, useState } from "react";
import { api } from "../services/api";

type Category = { id: string; name: string; active: boolean };
type Supplier = { id: string; name: string; active: boolean };
type Product = { id: string; sku: string; barcode?: string | null; name: string; unit: string; minimumStock: string | number; costPrice: string | number; salePrice?: string | number | null; status: "ACTIVE" | "INACTIVE"; category: Category; supplier?: Supplier | null };

type Form = { sku: string; barcode: string; name: string; unit: string; minimumStock: string; maximumStock: string; costPrice: string; salePrice: string; categoryId: string; supplierId: string };
const empty: Form = { sku: "", barcode: "", name: "", unit: "UN", minimumStock: "0", maximumStock: "", costPrice: "0", salePrice: "", categoryId: "", supplierId: "" };

export default function Products() {
  const [items, setItems] = useState<Product[]>([]); const [categories, setCategories] = useState<Category[]>([]); const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState<Form>(empty); const [editing, setEditing] = useState<string | null>(null); const [search, setSearch] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");

  async function load() { setLoading(true); try { const [p, c, s] = await Promise.all([api.get("/products", { params: { limit: 50, search: search || undefined } }), api.get("/categories", { params: { limit: 100, active: "true" } }), api.get("/suppliers", { params: { limit: 100, active: "true" } })]); setItems(p.data.items); setCategories(c.data.items); setSuppliers(s.data.items); } catch (e: any) { setError(e?.response?.data?.message ?? "Erro ao carregar produtos."); } finally { setLoading(false); } }
  useEffect(() => { load(); }, [search]);

  function set<K extends keyof Form>(key: K, value: Form[K]) { setForm(f => ({ ...f, [key]: value })); }
  async function submit(e: FormEvent) { e.preventDefault(); setError(""); try { const data = { ...form, barcode: form.barcode || null, maximumStock: form.maximumStock ? Number(form.maximumStock) : null, salePrice: form.salePrice ? Number(form.salePrice) : null, minimumStock: Number(form.minimumStock), costPrice: Number(form.costPrice), supplierId: form.supplierId || null, categoryId: form.categoryId, sku: form.sku, name: form.name, unit: form.unit }; if (editing) await api.put(`/products/${editing}`, data); else await api.post("/products", data); setForm(empty); setEditing(null); await load(); } catch (e: any) { setError(e?.response?.data?.message ?? "Não foi possível salvar o produto."); } }
  function edit(p: Product) { setEditing(p.id); setForm({ sku: p.sku, barcode: p.barcode ?? "", name: p.name, unit: p.unit, minimumStock: String(p.minimumStock), maximumStock: "", costPrice: String(p.costPrice), salePrice: p.salePrice == null ? "" : String(p.salePrice), categoryId: p.category.id, supplierId: p.supplier?.id ?? "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  async function remove(id: string) { if (!confirm("Desativar este produto?")) return; try { await api.delete(`/products/${id}`); await load(); } catch (e: any) { setError(e?.response?.data?.message ?? "Não foi possível desativar o produto."); } }

  return <main className="page"><header className="page-header"><div><h1>Produtos</h1><p>Cadastre e mantenha os produtos do estoque.</p></div><button className="secondary" onClick={() => { setEditing(null); setForm(empty); }}>Novo produto</button></header>
    {error && <div className="error">{error}</div>}
    <section className="form-card"><h2>{editing ? "Editar produto" : "Novo produto"}</h2><form className="grid-form" onSubmit={submit}>
      <label>SKU<input required value={form.sku} onChange={e => set("sku", e.target.value)} /></label><label>Código de barras<input value={form.barcode} onChange={e => set("barcode", e.target.value)} /></label><label>Nome<input required value={form.name} onChange={e => set("name", e.target.value)} /></label><label>Unidade<input required value={form.unit} onChange={e => set("unit", e.target.value)} /></label>
      <label>Estoque mínimo<input type="number" min="0" step="0.001" value={form.minimumStock} onChange={e => set("minimumStock", e.target.value)} /></label><label>Estoque máximo<input type="number" min="0" step="0.001" value={form.maximumStock} onChange={e => set("maximumStock", e.target.value)} /></label><label>Custo<input type="number" min="0" step="0.01" value={form.costPrice} onChange={e => set("costPrice", e.target.value)} /></label><label>Preço de venda<input type="number" min="0" step="0.01" value={form.salePrice} onChange={e => set("salePrice", e.target.value)} /></label>
      <label>Categoria<select required value={form.categoryId} onChange={e => set("categoryId", e.target.value)}><option value="">Selecione</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Fornecedor<select value={form.supplierId} onChange={e => set("supplierId", e.target.value)}><option value="">Nenhum</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <div className="form-actions"><button type="submit">{editing ? "Salvar alterações" : "Cadastrar produto"}</button>{editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setForm(empty); }}>Cancelar</button>}</div>
    </form></section>
    <section className="table-card"><div className="table-toolbar"><h2>Produtos cadastrados</h2><input placeholder="Buscar por nome, SKU ou código..." value={search} onChange={e => setSearch(e.target.value)} /></div>{loading ? <p>Carregando...</p> : <div className="table-wrap"><table><thead><tr><th>SKU</th><th>Produto</th><th>Categoria</th><th>Fornecedor</th><th>Custo</th><th>Status</th><th>Ações</th></tr></thead><tbody>{items.map(p => <tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td>{p.category.name}</td><td>{p.supplier?.name ?? "—"}</td><td>R$ {Number(p.costPrice).toFixed(2)}</td><td><span className={`badge ${p.status === "ACTIVE" ? "success" : "muted"}`}>{p.status === "ACTIVE" ? "Ativo" : "Inativo"}</span></td><td><button className="link-button" onClick={() => edit(p)}>Editar</button>{p.status === "ACTIVE" && <button className="link-button danger" onClick={() => remove(p.id)}>Desativar</button>}</td></tr>)}{items.length === 0 && <tr><td colSpan={7}>Nenhum produto encontrado.</td></tr>}</tbody></table></div>}</section>
  </main>;
}
