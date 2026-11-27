import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import ProductFormPage from "./pages/ProductFormPage";
import { ToastProvider } from "./context/ToastContext";

export default function App() {
  return (
    <ToastProvider>
      <div className="app-container">
        <header className="banner_admin_product header-banner">
          <span className="banner_admin_product__text">OfficeMart Admin</span>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<AdminDashboard />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />
        </Routes>
      </div>
    </ToastProvider>
  );
}
