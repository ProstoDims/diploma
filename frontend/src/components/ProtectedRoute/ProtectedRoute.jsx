import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Проверка авторизации (временно используем localStorage)
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
