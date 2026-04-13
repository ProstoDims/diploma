import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import LayoutDashboard from "./components/LayoutDashboard/LayoutDashboard";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import MainPage from "./pages/main_page/MainPage";
import LoginPage from "./pages/login_page/LoginPage";
import RegisterPage from "./pages/register_page/RegisterPage";
import DashboardPage from "./pages/dashboard_page/DashboardPage";
import WarehousePage from "./pages/warehouse_page/WarehousePage";
import StorePage from "./pages/store_page/StorePage";
import CategoriesPage from "./pages/categories_page/CategoriesPage";
import ProductsPage from "./pages/product_page/ProductsPage";
import EmployeesPage from "./pages/employees_page/EmployeesPage";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <MainPage />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <LoginPage />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <RegisterPage />
            </Layout>
          }
        />

        {/* Защищённые маршруты */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LayoutDashboard>
                <DashboardPage />
              </LayoutDashboard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses"
          element={
            <ProtectedRoute>
              <LayoutDashboard>
                <WarehousePage />
              </LayoutDashboard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores"
          element={
            <ProtectedRoute>
              <LayoutDashboard>
                <StorePage />
              </LayoutDashboard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <LayoutDashboard>
                <CategoriesPage />
              </LayoutDashboard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <LayoutDashboard>
                <ProductsPage />
              </LayoutDashboard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <LayoutDashboard>
                <EmployeesPage />
              </LayoutDashboard>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
