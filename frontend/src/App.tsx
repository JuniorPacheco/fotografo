import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Facturas from "./pages/Facturas";
import Pagos from "./pages/Pagos";
import Paquetes from "./pages/Paquetes";
import Recordatorios from "./pages/Recordatorios";
import Login from "./pages/Login";
import GoogleCallback from "./pages/GoogleCallback";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/google/callback" element={<GoogleCallback />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <Layout>
              <Clientes />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/facturas"
        element={
          <ProtectedRoute>
            <Layout>
              <Facturas />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pagos"
        element={
          <ProtectedRoute>
            <Layout>
              <Pagos />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/paquetes"
        element={
          <ProtectedRoute>
            <Layout>
              <Paquetes />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recordatorios"
        element={
          <ProtectedRoute>
            <Layout>
              <Recordatorios />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
