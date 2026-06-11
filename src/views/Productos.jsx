import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import TablaProductos from "../components/productos/TablaProductos";
import TarjetaProducto from "../components/productos/TarjetasProductos";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import Paginacion from "../components/Ordenamiento/Paginacion";
import ModalQRProducto from "../components/productos/ModalQRProducto";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

  const [mostrarModalQR, setMostrarModalQR] = useState(false);
const [productoQR, setProductoQR] = useState(null);

const generarQRImagen = (producto) => {
  if (!producto?.url_imagen) {
    setToast({
      mostrar: true,
      mensaje: "Este producto no tiene imagen asociada",
      tipo: "advertencia"
    });
    return;
  }

  setProductoQR(producto);
  setMostrarModalQR(true);
};

const generarPDFProducto = (producto) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Reporte de Producto", 14, 20);
  doc.line(14, 25, 195, 25);

  doc.setFontSize(12);
  autoTable(doc, {
    startY: 35,
    head: [["Campo", "Valor"]],
    body: [
      ["ID", producto.id_producto],
      ["Nombre", producto.nombre_producto],
      ["Descripción", producto.descripcion_producto || ""],
      ["Categoría", producto.categoria_producto],
      ["Precio", `C$ ${parseFloat(producto.precio_venta || 0).toFixed(2)}`],
    ],
  });

  doc.save(`producto_${producto.id_producto}.pdf`);
};

  // Estados para Eliminación y Paginación
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [productosPaginados, setProductosPaginados] = useState([]);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(5);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    archivo: null,
  });

  const [productoEditar, setProductoEditar] = useState(null);

  // Manejador de Inputs de texto
  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  // Manejador exclusivo para Archivos (Imágenes)
  const manejoCambioArchivo = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setNuevoProducto((prev) => ({ ...prev, archivo }));
    } else {
      alert("Selecciona una imagen válida (JPG, PNG, etc.)");
    }
  };

  // Manejo de Inputs Edición
  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setProductoEditar((prev) => ({ ...prev, [name]: value }));
  };

  // Manejo de la nueva imagen Edición
  const manejoCambioArchivoActualizar = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setProductoEditar((prev) => ({ ...prev, archivo }));
    } else {
      alert("Selecciona una imagen válida (JPG, PNG, etc.)");
    }
  };

  // Buscador
  const manejarBusqueda = (valor) => {
    const texto = typeof valor === 'string' ? valor : (valor?.target?.value || '');
    setTextoBusqueda(texto);
    setPaginaActual(1); // Reinicia a la página 1 al buscar
  };

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setProductosFiltrados(productos);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();
      const filtrados = productos.filter((prod) => {
        const nombre =
          prod.nombre_producto?.toLowerCase() || "";

        const descripcion =
          prod.descripcion_producto?.toLowerCase() || "";

        const precio =
          prod.precio_venta?.toString() || "";
        return (
          nombre.includes(textoLower) ||
          descripcion.includes(textoLower) ||
          precio.includes(textoLower)
        );
      });
      setProductosFiltrados(filtrados);
    }
  }, [textoBusqueda, productos]);

  // Función para el cálculo de las páginas a mostrar
  const calcularPaginacion = () => {
    const indiceUltimoRegistro = paginaActual * registrosPorPagina;
    const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
    const registrosActuales = productosFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);
    setProductosPaginados(registrosActuales);
  };

  useEffect(() => {
    calcularPaginacion();
  }, [productosFiltrados, paginaActual, registrosPorPagina]);

  // Carga inicial de categorías (para el select del Modal)
  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("id_categoria", { ascending: true });
      if (error) throw error;

      const categoriasMapeadas = (data || []).map((cat) => ({
        ...cat,
        id_categoria: cat.id_categoria,
        nombre: cat.nombre,
      }));
      setCategorias(categoriasMapeadas);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  // Carga inicial de productos
  const cargarProductos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("id_producto", { ascending: true });
      if (error) throw error;

      // Mapear los datos de la base de datos a lo que esperan los componentes
      const productosMapeados = (data || []).map((prod) => ({
        ...prod,
        id_producto: prod.id_producto,
        nombre_producto: prod.nombre_producto,
        descripcion_producto:
          prod.descripcion_producto,
        precio_venta: prod.precio_venta,
        categoria_producto:
          prod.categoria_producto,
        url_imagen: prod.url_imagen,
      }));
      setProductos(productosMapeados);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
    cargarProductos();
  }, []);

  // Función principal: Agregar y Subir a Storage
  const agregarProducto = async () => {
    try {
      // 1. Validar campos obligatorios
      if (
        !nuevoProducto.nombre_producto.trim() ||
        !nuevoProducto.categoria_producto ||
        !nuevoProducto.precio_venta ||
        !nuevoProducto.archivo
      ) {
        setToast({
          mostrar: true,
          mensaje: "Completa los campos obligatorios (nombre, categoría, precio e imagen)",
          tipo: "advertencia",
        });
        return;
      }

      setMostrarModal(false);

      // 2. Subir imagen a Supabase Storage
      const nombreArchivo = `${Date.now()}_${nuevoProducto.archivo.name}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes_productos")
        .upload(nombreArchivo, nuevoProducto.archivo);

      if (uploadError) throw uploadError;

      // 3. Obtener la URL pública de la imagen
      const { data: urlData } = supabase.storage
        .from("imagenes_productos")
        .getPublicUrl(nombreArchivo);

      const urlPublica = urlData.publicUrl;

      // 4. Guardar todo en la base de datos (Tabla productos)
      const { error: errorInsert } = await supabase
        .from("productos")
        .insert([
          {
            nombre_producto: nuevoProducto.nombre_producto,
            precio_venta: parseFloat(nuevoProducto.precio_venta),
            categoria_producto: parseInt(nuevoProducto.categoria_producto),
            descripcion_producto:
              nuevoProducto.descripcion_producto || null,
            url_imagen: urlPublica,
          },
        ]);

      if (errorInsert) throw errorInsert;

      // 5. Limpiar el formulario
      setNuevoProducto({
        nombre_producto: "",
        descripcion_producto: "",
        categoria_producto: "",
        precio_venta: "",
        archivo: null,
      });

      setToast({ mostrar: true, mensaje: "Producto registrado correctamente", tipo: "exito" });

    } catch (err) {
      console.error("Error al agregar producto:", err);
      setToast({ mostrar: true, mensaje: "Error al registrar producto", tipo: "error" });
    }
  };

  // Función Principal de Actualización
  const actualizarProducto = async () => {
    try {
      // 1. Validar campos obligatorios
      if (
        !productoEditar ||
        !productoEditar.nombre_producto?.trim() ||
        !productoEditar.categoria_producto ||
        !productoEditar.precio_venta
      ) {
        setToast({
          mostrar: true,
          mensaje: "Completa los campos obligatorios",
          tipo: "advertencia",
        });
        return;
      }

      setMostrarModalEdicion(false);

      // 2. Preparar los datos actualizados (ajustando a los nombres de la base de datos)
      let datosActualizados = {
        nombre_producto: productoEditar.nombre_producto,
        precio_venta: parseFloat(productoEditar.precio_venta),
        categoria_producto: parseInt(
          productoEditar.categoria_producto
        ),
        descripcion_producto:
          productoEditar.descripcion_producto || null,
      };

      // 3. Si se selecciona una nueva imagen, se sube al bucket 'imagenes_productos'
      if (productoEditar.archivo) {
        const nombreArchivo = `${Date.now()}_${productoEditar.archivo.name}`;

        const { error: uploadError } = await supabase.storage
          .from("imagenes_productos")
          .upload(nombreArchivo, productoEditar.archivo);

        if (uploadError) throw uploadError;

        // 4. Se obtiene la URL pública de la nueva imagen
        const { data: urlData } = supabase.storage
          .from("imagenes_productos")
          .getPublicUrl(nombreArchivo);

        datosActualizados.url_imagen = urlData.publicUrl;

        // 5. Se elimina la imagen anterior del bucket
        if (productoEditar.url_imagen) {
          const nombreAnterior = productoEditar.url_imagen.split("/").pop().split("?")[0];
          await supabase.storage.from("imagenes_productos").remove([nombreAnterior]).catch(() => { });
        }
      }

      // 6. Finalmente, se actualizan los datos en la tabla 'Productos'
      const { error } = await supabase
        .from("productos")
        .update(datosActualizados)
        .eq("id_producto", productoEditar.id_producto);

      if (error) throw error;

      // Recargar productos
      await cargarProductos();

      // Limpiar estado
      setProductoEditar(null);

      // Cerrar modal
      setMostrarModalEdicion(false);

      // Notificación
      setToast({
        mostrar: true,
        mensaje: "Producto actualizado correctamente",
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error al actualizar:", err);
      setToast({ mostrar: true, mensaje: "Error al actualizar producto", tipo: "error" });
    }
  };

  // Métodos para abrir los Modales desde la Tabla / Tarjeta
  const abrirModalEdicion = (producto) => {
    setProductoEditar({
      id_producto: producto.id_producto,
      nombre_producto: producto.nombre_producto,
      descripcion_producto:
        producto.descripcion_producto || "",
      categoria_producto:
        producto.categoria_producto,
      precio_venta:
        producto.precio_venta,
      url_imagen:
        producto.url_imagen || "",
      archivo: null,
    });

    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModalEliminacion(true);
  };

  // Método para Eliminar Producto
  const eliminarProducto = async () => {
    try {
      if (productoAEliminar.url_imagen) {
        const nombreAnterior = productoAEliminar.url_imagen.split("/").pop().split("?")[0];
        await supabase.storage.from("imagenes_productos").remove([nombreAnterior]).catch(() => { });
      }
      const { error } = await supabase.from("Productos").delete().eq("id_producto", productoAEliminar.id_producto);
      if (error) throw error;
      await cargarProductos();
      setMostrarModalEliminacion(false);
      setToast({ mostrar: true, mensaje: "Producto eliminado exitosamente.", tipo: "exito" });
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al eliminar producto.", tipo: "error" });
    }
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-bag-heart-fill me-2"></i> Productos
          </h3>
        </Col>

        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md">
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Producto</span>
          </Button>
        </Col>
      </Row>

      <hr />

      <Row className="mb-4">
        <Col md={6} lg={5}>
          {/* Asegúrate de que el componente CuadroBusquedas exista en esa ruta */}
          <CuadroBusquedas
            busqueda={textoBusqueda}
            setBusqueda={manejarBusqueda}
          />
        </Col>
      </Row>

      {/* Mensajes y estados de carga */}
      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 text-muted">Cargando productos...</p>
          </Col>
        </Row>
      )}

      {productosFiltrados.length === 0 && !cargando && (
        <Alert variant="info" className="text-center">
          No se encontraron productos coincidentes.
        </Alert>
      )}

      {/* 📱 VISTA MÓVIL: Tarjetas */}
      {!cargando && productosPaginados.length > 0 && (
        <Row className="d-lg-none">
          <Col xs={12}>
            <TarjetaProducto productos={productosPaginados} categorias={categorias} abrirModalEdicion={abrirModalEdicion} abrirModalEliminacion={abrirModalEliminacion} generarQRImagen={generarQRImagen} generarPDFProducto={generarPDFProducto} />
          </Col>
        </Row>
      )}

      {/* 💻 VISTA ESCRITORIO: Tabla */}
      {!cargando && productosPaginados.length > 0 && (
        <Row className="d-none d-lg-block">
          <Col lg={12}>
            <TablaProductos productos={productosPaginados} categorias={categorias} abrirModalEdicion={abrirModalEdicion} abrirModalEliminacion={abrirModalEliminacion} generarQRImagen={generarQRImagen} generarPDFProducto={generarPDFProducto} />
          </Col>
        </Row>
      )}

      {/* Paginación Dinámica */}
      {!cargando && productosFiltrados.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina} totalRegistros={productosFiltrados.length}
          paginaActual={paginaActual} establecerPaginaActual={setPaginaActual}
          establecerRegistrosPorPagina={setRegistrosPorPagina}
        />
      )}

      {/* Modales */}
      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        manejoCambioInput={manejoCambioInput}
        manejoCambioArchivo={manejoCambioArchivo}
        agregarProducto={agregarProducto}
        categorias={categorias}
      />

      <ModalEdicionProducto
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        productoEditar={productoEditar}
        setProductoEditar={setProductoEditar}
        actualizarProducto={actualizarProducto}
        categorias={categorias}
      />

      <ModalEliminacionProducto
        mostrarModalEliminar={mostrarModalEliminacion}
        setMostrarModalEliminar={setMostrarModalEliminacion}
        eliminarProducto={eliminarProducto}
        productoEliminar={productoAEliminar}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />

      <ModalQRProducto
        mostrar={mostrarModalQR}
        onHide={() => setMostrarModalQR(false)}
        producto={productoQR}
      />
      
    </Container>
  );
};

export default Productos;