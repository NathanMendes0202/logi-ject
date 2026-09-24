import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
export default function Layout(){const{user,logout}=useAuth();return <div className="app-shell"><aside className="sidebar"><div className="brand">logi-ject<span>LOGÍSTICA</span></div><nav><NavLink to="/">Dashboard</NavLink><NavLink to="/products">Produtos</NavLink><NavLink to="/categories">Categorias</NavLink><NavLink to="/warehouses" className={({isActive}) => isActive ? "active" : ""}>Armazéns</NavLink>
        <NavLink to="/stock" className={({isActive}) => isActive ? "active" : ""}>Estoque</NavLink>
        <NavLink to="/orders" className={({isActive}) => isActive ? "active" : ""}>Pedidos</NavLink><NavLink to="/inventory" className={({isActive}) => isActive ? "active" : ""}>Inventário</NavLink><NavLink to="/reports" className={({isActive}) => isActive ? "active" : ""}>Relatórios</NavLink>
        <NavLink to="/suppliers">Fornecedores</NavLink></nav><div className="sidebar-footer"><small>{user?.name}</small><button onClick={logout}>Sair</button></div></aside><div className="content"><Outlet/></div></div>}
