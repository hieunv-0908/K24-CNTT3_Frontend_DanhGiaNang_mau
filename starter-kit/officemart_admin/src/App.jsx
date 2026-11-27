// HOAN_THIEN: dựng bố cục trang và khai báo các route theo đề (Mục 4.1, 4.2, 4.3).
// Xoá đoạn return bên dưới khi bắt đầu làm bài.
import AdminDashboard from "./pages/AdminDashboard";
import { Navigate, Route, Routes } from "react-router-dom";
export default function App() {
  return (
    <div>
      <div className="banner_admin_product">
        <span className="banner_admin_product__text">OfficaMart Admin</span>
      </div>
      <Routes>
        <Route path = "/" element = {<Navigate to='/products' replace></Navigate>}></Route>
        <Route path="/products" element = {<AdminDashboard />}></Route>
      </Routes>
    </div>
  );
}
