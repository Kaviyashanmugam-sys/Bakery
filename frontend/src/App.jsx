import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import Products from "./pages/Products.jsx";
import Categories from "./pages/Categories.jsx";
import Customers from "./pages/Customers.jsx";
import Reports from "./pages/Reports.jsx";
import WhatsAppLogs from "./pages/WhatsAppLogs.jsx";
import Settings from "./pages/Settings.jsx";
import MetaConfiguration from "./pages/MetaConfiguration.jsx";
import FlowBuilderConfiguration from "./pages/FlowBuilderConfiguration.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="whatsapp-logs" element={<WhatsAppLogs />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/meta" element={<MetaConfiguration />} />
        <Route path="settings/flow-builder" element={<FlowBuilderConfiguration />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
