
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Autores from "./pages/Autores";
import Livros from "./pages/Livros";
import Leitores from "./pages/Leitores";
import Emprestimos from "./pages/Emprestimos";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/cadastro"
        element={<Cadastro />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            index
            element={<Dashboard />}
          />

          <Route
            path="autores"
            element={<Autores />}
          />

          <Route
            path="livros"
            element={<Livros />}
          />

          <Route
            path="leitores"
            element={<Leitores />}
          />

          <Route
            path="emprestimos"
            element={<Emprestimos />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;
