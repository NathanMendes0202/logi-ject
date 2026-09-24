import { useEffect, useState } from "react";
import { api } from "../services/api";

type Product = { id:string; sku:string; name:string };
type Warehouse = { id:string; name:string; code:string };
type Location = { id:string; name?:string; code:string; warehouseId:string };
type Order = { id:string; code:string; type:"INBOUND"|"OUTBOUND"; status:string; partnerName?:string; warehouse:{name:string}; items:{quantity:string|number; product:{name:string; sku:string}}[] };
const next: Record<string,string> = { PENDING:"SEPARATION", SEPARATION:"CONFERENCE", CONFERENCE:"SHIPPED" };

export default function Orders(){
  const [orders,setOrders]=useState<Order[]>([]); const [products,setProducts]=useState<Product[]>([]); const [warehouses,setWarehouses]=useState<Warehouse[]>([]); const [locations,setLocations]=useState<Location[]>([]);
  const [form,setForm]=useState({type:"OUTBOUND",warehouseId:"",productId:"",locationId:"",quantity:"1",partnerName:"",document:""});
  const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [error,setError]=useState("");
  async function load(){try{setLoading(true);const [o,p,w]=await Promise.all([api.get("/orders?limit=50"),api.get("/products?limit=100"),api.get("/warehouses?limit=100")]);setOrders(o.data.items);setProducts(p.data.items);setWarehouses(w.data.items)}catch(e:any){setError(e?.response?.data?.message??"Não foi possível carregar os pedidos.")}finally{setLoading(false)}}
  useEffect(()=>{load()},[]);
  useEffect(()=>{if(!form.warehouseId){setLocations([]);return} api.get(`/locations?warehouseId=${form.warehouseId}&limit=100`).then(r=>setLocations(r.data.items)).catch(()=>setLocations([]))},[form.warehouseId]);
  async function create(){try{setSaving(true);setError("");await api.post("/orders",{type:form.type,warehouseId:form.warehouseId,partnerName:form.partnerName||undefined,document:form.document||undefined,items:[{productId:form.productId,quantity:Number(form.quantity),locationId:form.locationId||undefined}]});setForm({...form,productId:"",locationId:"",quantity:"1",partnerName:"",document:""});await load()}catch(e:any){setError(e?.response?.data?.message??"Não foi possível criar o pedido.")}finally{setSaving(false)}}
  async function advance(order:Order){const status=next[order.status]; if(!status)return; try{await api.patch(`/orders/${order.id}/status`,{status});load()}catch(e:any){alert(e?.response?.data?.message??"Não foi possível alterar o pedido.")}}
  async function cancel(order:Order){try{await api.patch(`/orders/${order.id}/status`,{status:"CANCELLED"});load()}catch(e:any){alert(e?.response?.data?.message??"Não foi possível cancelar o pedido.")}}
  return <section className="page"><div className="page-header"><div><h1>Pedidos</h1><p>Entrada e saída de mercadorias.</p></div></div>{error&&<div className="error">{error}</div>}
    <div className="form-card"><h2>Novo pedido</h2><div className="form-grid"><label>Tipo<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="OUTBOUND">Saída</option><option value="INBOUND">Entrada</option></select></label>
    &nbsp;&nbsp;<label>Armazém<select value={form.warehouseId} onChange={e=>setForm({...form,warehouseId:e.target.value,locationId:""})}><option value="">Selecione</option>{warehouses.map(w=><option key={w.id} value={w.id}>{w.code} - {w.name}</option>)}</select></label>
    &nbsp;&nbsp;<label>Produto<select value={form.productId} onChange={e=>setForm({...form,productId:e.target.value})}><option value="">Selecione</option>{products.map(p=><option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}</select></label>
    &nbsp;&nbsp;<label>Localização<select value={form.locationId} onChange={e=>setForm({...form,locationId:e.target.value})}><option value="">Selecione</option>{locations.map(l=><option key={l.id} value={l.id}>{l.code}{l.name?` - ${l.name}`:""}</option>)}</select></label>
    &nbsp;&nbsp;<label>Quantidade<input type="number" min="0.001" step="0.001" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/></label>
    &nbsp;&nbsp;<label>Parceiro<input value={form.partnerName} onChange={e=>setForm({...form,partnerName:e.target.value})} placeholder="Cliente/fornecedor"/></label>
    &nbsp;&nbsp;<label>Documento<input value={form.document} onChange={e=>setForm({...form,document:e.target.value})} placeholder="NF / pedido externo"/></label></div>
    &nbsp;&nbsp;<button disabled={saving||!form.warehouseId||!form.productId||!form.locationId||Number(form.quantity)<=0} onClick={create}>{saving?"Salvando...":"Criar pedido"}</button></div>
    {loading?<div className="loading">Carregando...</div>:<div className="table-card"><table><thead><tr><th>Pedido</th><th>Tipo</th><th>Armazém</th><th>Itens</th><th>Status</th><th>Ações</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><strong>{o.code}</strong><br/><small>{o.partnerName??"Sem parceiro"}</small></td><td>{o.type==="OUTBOUND"?"Saída":"Entrada"}</td><td>{o.warehouse.name}</td><td>{o.items.reduce((s,i)=>s+Number(i.quantity),0)}</td><td><span className={`status status-${o.status.toLowerCase()}`}>{o.status}</span></td><td>{next[o.status]&&<button onClick={()=>advance(o)}>→ {next[o.status]}</button>}{o.status!=="SHIPPED"&&o.status!=="CANCELLED"&&<button onClick={()=>cancel(o)}>Cancelar</button>}</td></tr>)}</tbody></table></div>}
  </section>
}
