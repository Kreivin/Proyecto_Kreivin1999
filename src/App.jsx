import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Encabezado from "./components/navegacion/Encabezado.jsx";

import Inicio from "./views/Inicio.jsx";
import Categorias from "./views/Categorias.jsx";
import Catalogo from "./views/Catalogo.jsx";
import Productos from "./views/Productos.jsx";
import Clientes from "./views/Clientes.jsx";
import Empleados from "./views/Empleados.jsx";
import Ventas from "./views/Ventas.jsx";
import Login from "./views/Login.jsx";
import RutaProtegida from "./components/rutas/RutaProtegida.jsx";
import Pagina404 from "./views/Pagina404.jsx";

import "./App.css";

const App = () => {
  return (
    <Router>
      <Encabezado />

      <main className="margen-superior-main">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <RutaProtegida>
                <Inicio />
              </RutaProtegida>
            }
          />

          <Route
            path="/categorias"
            element={
              <RutaProtegida>
                <Categorias />
              </RutaProtegida>
            }
          />

          <Route path="/catalogo" element={<Catalogo />} />

          <Route
            path="/productos"
            element={
              <RutaProtegida>
                <Productos />
              </RutaProtegida>
            }
          />

          <Route
            path="/empleados"
            element={
              <RutaProtegida>
                <Empleados />
              </RutaProtegida>
            }
          />

          <Route
            path="/ventas"
            element={
              <RutaProtegida>
                <Ventas />
              </RutaProtegida>
            }
          />

          <Route
            path="/clientes"
            element={
              <RutaProtegida>
                <Clientes />
              </RutaProtegida>
            }
          />

          <Route path="*" element={<Pagina404 />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;