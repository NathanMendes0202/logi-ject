import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Warehouses from "./pages/Warehouses";
import Stock from "./pages/Stock";
import Layout from "./components/Layout";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import type { ReactNode } from "react";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Carregando...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Carregando...</div>;
  return user ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route index element={<Dashboard />} />
      <Route path="products" element={<Products />} />
      <Route path="categories" element={<Categories />} />
      <Route path="suppliers" element={<Suppliers />} />
      <Route path="warehouses" element={<Warehouses />} />
      <Route path="stock" element={<Stock />} />
      <Route path="orders" element={<Orders />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="reports" element={<Reports />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default function App() { return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>; }
