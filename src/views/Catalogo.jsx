import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col, Spinner, Alert, Form } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import TarjetaCatalogo from "../components/catalogo/TarjetaCatalogo";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";

const Catalogo = () => {
  // Variables de estado
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Método para cargar datos
  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resProductos, resCategorias] = await Promise.all([
        supabase.from("productos").select("*").order("nombre_producto", { ascending: true }),
        supabase.from("categorias").select("id_categoria, nombre_categoria").order("nombre_categoria")
      ]);

      if (resProductos.error) throw resProductos.error;
      if (resCategorias.error) throw resCategorias.error;

      setProductos(resProductos.data || []);
      setCategorias(resCategorias.data || []);
    } catch (err) {
      console.error("Error al cargar catálogo:", err);
      setError("No se pudieron cargar los productos. Intenta más tarde.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Lógica de filtrado y búsqueda
  const productosFiltrados = useMemo(() => {
    let filtrados = productos;

    if (categoriaSeleccionada !== "todas") {
      filtrados = filtrados.filter(producto =>
        producto.categoria_producto === parseInt(categoriaSeleccionada)
      );
    }

    if (textoBusqueda.trim()) {
      const textoLower = textoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter(producto => {
        const nombre = producto.nombre_producto?.toLowerCase() || "";
        const descripcion = producto.descripcion_producto?.toLowerCase() || "";
        const precioTexto = producto.precio_venta?.toString() || "";

        return nombre.includes(textoLower) ||
          descripcion.includes(textoLower) ||
          precioTexto.includes(textoLower);
      });
    }
    return filtrados;
  }, [productos, categoriaSeleccionada, textoBusqueda]);

  // Manejadores de eventos
  const manejarCambioCategoria = (e) => setCategoriaSeleccionada(e.target.value);
  const manejarCambioBusqueda = (e) => setTextoBusqueda(e.target.value);

  const obtenerNombreCategoria = (idCategoria) => {
    const cat = categorias.find(c => c.id_categoria === idCategoria);
    return cat ? cat.nombre_categoria : "Sin categoría";
  };

  return (
    <div className="mt-3 px-1">
      <Row className="text-center mb-4">
        <Col>
          <p className="lead text-muted">Nuestros productos</p>
        </Col>
      </Row>

      {/* Selectores de búsqueda y filtro */}
      <Row className="mb-4 align-items-end">
        <Col md={4} className="mb-2">
          <Form.Group controlId="filtroCategoria">
            <Form.Select
              value={categoriaSeleccionada}
              onChange={manejarCambioCategoria}
              className="shadow-sm"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre_categoria}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6} className="mb-2">
          <Form.Group controlId="busquedaProducto">
            <CuadroBusquedas
              busqueda={textoBusqueda}
              setBusqueda={manejarCambioBusqueda}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Estados de carga y resultados */}
      {cargando ? (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" />
            <p className="mt-3 text-muted">Cargando productos...</p>
          </Col>
        </Row>
      ) : productosFiltrados.length === 0 ? (
        <Alert variant="info" className="text-center">
          <i className="bi bi-info-circle me-2"></i>
          No se encontraron productos que coincidan con tu búsqueda.
        </Alert>
      ) : (
        <Row className="g-3">
          {productosFiltrados.map(producto => (
            <Col xs={12} sm={6} md={4} lg={3} key={producto.id_producto}>
              <TarjetaCatalogo
                producto={producto}
                nombreCategoria={obtenerNombreCategoria(producto.categoria_producto)}
              />
            </Col>
          ))}
        </Row>
      )}

      {error && (
        <Alert variant="danger" className="mt-3 text-center">
          {error}
        </Alert>
      )}
    </div>
  );
};

export default Catalogo;