import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/Ordenamiento/Paginacion";
import TablaVentas from "../components/ventas/TablaVentas";
import TarjetaVenta from "../components/ventas/TarjetaVenta";
import FormularioVenta from "../components/ventas/FormularioVenta";

const Ventas = () => {
  const COLUMNA_METODO_PAGO = "método_pago";

  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: ""
  });

  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ventaAEditar, setVentaAEditar] = useState(null);

  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [productos, setProductos] = useState([]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [detalles, setDetalles] = useState([]);
  const [totalGeneral, setTotalGeneral] = useState(0);

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(8);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  const normalizarId = (valor) => {
    if (valor === null || valor === undefined) return "";
    return String(valor);
  };

  const obtenerMetodoPago = (venta) => {
    return venta?.[COLUMNA_METODO_PAGO] || venta?.metodo_pago || "efectivo";
  };

  const fechaNicaragua = () => {
    return new Date()
      .toLocaleString("sv-SE", {
        timeZone: "America/Managua"
      })
      .replace(" ", "T");
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [
        respuestaClientes,
        respuestaEmpleados,
        respuestaProductos,
        respuestaVentas,
        respuestaDetalles
      ] = await Promise.all([
        supabase.from("clientes").select("*"),
        supabase.from("empleados").select("*"),
        supabase.from("productos").select("*"),

        // IMPORTANTE:
        // Aquí ya NO usamos select("*") en ventas
        supabase
          .from("ventas")
          .select(`
            id_venta,
            id_cliente,
            id_empleado,
            fecha_venta,
            "método_pago",
            total
          `)
          .order("fecha_venta", { ascending: false }),

        supabase.from("detalles_ventas").select("*")
      ]);

      if (respuestaClientes.error) throw respuestaClientes.error;
      if (respuestaEmpleados.error) throw respuestaEmpleados.error;
      if (respuestaProductos.error) throw respuestaProductos.error;
      if (respuestaVentas.error) throw respuestaVentas.error;
      if (respuestaDetalles.error) throw respuestaDetalles.error;

      const clientesData = respuestaClientes.data || [];
      const empleadosData = respuestaEmpleados.data || [];
      const productosData = respuestaProductos.data || [];
      const ventasData = respuestaVentas.data || [];
      const detallesData = respuestaDetalles.data || [];

      const mapaClientes = new Map(
        clientesData.map((cliente) => [
          normalizarId(cliente.id_cliente),
          cliente
        ])
      );

      const mapaEmpleados = new Map(
        empleadosData.map((empleado) => [
          normalizarId(empleado.id_empleado),
          empleado
        ])
      );

      const mapaProductos = new Map(
        productosData.map((producto) => [
          normalizarId(producto.id_producto),
          producto
        ])
      );

      const detallesAgrupadosPorVenta = detallesData.reduce((acc, detalle) => {
        const idVenta = normalizarId(detalle.id_venta);

        if (!acc[idVenta]) {
          acc[idVenta] = [];
        }

        acc[idVenta].push({
          ...detalle,
          productos:
            mapaProductos.get(normalizarId(detalle.id_producto)) || null
        });

        return acc;
      }, {});

      const ventasFormateadas = ventasData.map((venta) => ({
        ...venta,

        // Esto permite usar venta.metodo_pago en la tabla,
        // aunque en Supabase la columna sea "método_pago"
        metodo_pago: obtenerMetodoPago(venta),

        clientes:
          mapaClientes.get(normalizarId(venta.id_cliente)) || null,

        empleados:
          mapaEmpleados.get(normalizarId(venta.id_empleado)) || null,

        detalles_ventas:
          detallesAgrupadosPorVenta[normalizarId(venta.id_venta)] || []
      }));

      setClientes(clientesData);
      setEmpleados(empleadosData);
      setProductos(productosData);
      setVentas(ventasFormateadas);
      setVentasFiltradas(ventasFormateadas);
    } catch (err) {
      console.error("Error cargando datos:", err);

      setToast({
        mostrar: true,
        mensaje:
          err?.message ||
          "Error al cargar los datos de ventas. Revise la consola.",
        tipo: "error"
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (ventaAEditar) {
      const cliente = clientes.find(
        (c) =>
          normalizarId(c.id_cliente) ===
          normalizarId(ventaAEditar.id_cliente)
      );

      const empleado = empleados.find(
        (e) =>
          normalizarId(e.id_empleado) ===
          normalizarId(ventaAEditar.id_empleado)
      );

      setClienteSeleccionado(cliente || null);
      setEmpleadoSeleccionado(empleado || null);
      setMetodoPago(obtenerMetodoPago(ventaAEditar));

      if (ventaAEditar.detalles_ventas?.length > 0) {
        const detallesFormateados = ventaAEditar.detalles_ventas.map(
          (detalle) => ({
            id_producto: detalle.id_producto,
            nombre_producto:
              detalle.productos?.nombre_producto || "Producto",
            precio: Number(detalle.precio_unitario || 0),
            cantidad: Number(detalle.cantidad || 1)
          })
        );

        setDetalles(detallesFormateados);
      } else {
        setDetalles([]);
      }
    }
  }, [ventaAEditar, clientes, empleados]);

  useEffect(() => {
    const total = detalles.reduce((sum, det) => {
      return sum + Number(det.cantidad || 0) * Number(det.precio || 0);
    }, 0);

    setTotalGeneral(total);
  }, [detalles]);

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setVentasFiltradas(ventas);
      establecerPaginaActual(1);
      return;
    }

    const textoLower = textoBusqueda.toLowerCase();

    const filtradas = ventas.filter((venta) => {
      const cliente = `${venta.clientes?.nombre_cliente || ""} ${
        venta.clientes?.apellido_cliente || ""
      }`.toLowerCase();

      const empleado = `${venta.empleados?.nombre_empleado || ""} ${
        venta.empleados?.apellido_empleado || ""
      }`.toLowerCase();

      const pago = `${venta.metodo_pago || ""}`.toLowerCase();

      return (
        cliente.includes(textoLower) ||
        empleado.includes(textoLower) ||
        pago.includes(textoLower) ||
        normalizarId(venta.id_venta).includes(textoLower)
      );
    });

    setVentasFiltradas(filtradas);
    establecerPaginaActual(1);
  }, [textoBusqueda, ventas]);

  const resetFormulario = () => {
    setClienteSeleccionado(null);
    setEmpleadoSeleccionado(null);
    setMetodoPago("efectivo");
    setDetalles([]);
    setVentaAEditar(null);
  };

  const abrirNuevaVenta = () => {
    resetFormulario();
    setMostrarFormulario(true);
  };

  const abrirEdicion = (venta) => {
    setVentaAEditar(venta);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    resetFormulario();
  };

  const agregarDetalle = (producto, cantidad) => {
    if (!producto || !cantidad) return;

    const cantidadNumerica = Number(cantidad);

    if (cantidadNumerica < 1) return;

    setDetalles((prev) => {
      const existe = prev.find(
        (detalle) =>
          normalizarId(detalle.id_producto) ===
          normalizarId(producto.id_producto)
      );

      if (existe) {
        return prev.map((detalle) =>
          normalizarId(detalle.id_producto) ===
          normalizarId(producto.id_producto)
            ? {
                ...detalle,
                cantidad:
                  Number(detalle.cantidad || 0) + cantidadNumerica
              }
            : detalle
        );
      }

      return [
        ...prev,
        {
          id_producto: producto.id_producto,
          nombre_producto: producto.nombre_producto,
          precio: Number(producto.precio_venta || 0),
          cantidad: cantidadNumerica
        }
      ];
    });
  };

  const eliminarDetalle = (id_producto) => {
    setDetalles((prev) =>
      prev.filter(
        (detalle) =>
          normalizarId(detalle.id_producto) !== normalizarId(id_producto)
      )
    );
  };

  const actualizarCantidad = (id_producto, nuevaCantidad) => {
    const cantidadNumerica = Number(nuevaCantidad);

    if (cantidadNumerica < 1) return;

    setDetalles((prev) =>
      prev.map((detalle) =>
        normalizarId(detalle.id_producto) === normalizarId(id_producto)
          ? {
              ...detalle,
              cantidad: cantidadNumerica
            }
          : detalle
      )
    );
  };

  const guardarVenta = async () => {
    if (
      !clienteSeleccionado ||
      !empleadoSeleccionado ||
      detalles.length === 0
    ) {
      setToast({
        mostrar: true,
        mensaje: "Faltan datos obligatorios",
        tipo: "advertencia"
      });
      return;
    }

    try {
      const datosVenta = {
        id_cliente: clienteSeleccionado.id_cliente,
        id_empleado: empleadoSeleccionado.id_empleado,
        fecha_venta: ventaAEditar
          ? ventaAEditar.fecha_venta
          : fechaNicaragua(),
        metodoPago,
        total: Number(totalGeneral || 0)
      };

      if (ventaAEditar) {
        const { error: errorActualizarVenta } = await supabase
          .from("ventas")
          .update({
            id_cliente: datosVenta.id_cliente,
            id_empleado: datosVenta.id_empleado,
            metodoPago,
            total: datosVenta.total
          })
          .eq("id_venta", ventaAEditar.id_venta);

        if (errorActualizarVenta) {
          console.error("Error actualizando venta:", errorActualizarVenta);
          throw errorActualizarVenta;
        }

        const { error: errorEliminarDetalles } = await supabase
          .from("detalles_ventas")
          .delete()
          .eq("id_venta", ventaAEditar.id_venta);

        if (errorEliminarDetalles) {
          console.error(
            "Error eliminando detalles anteriores:",
            errorEliminarDetalles
          );
          throw errorEliminarDetalles;
        }

        const detallesInsert = detalles.map((detalle) => ({
          id_venta: ventaAEditar.id_venta,
          id_producto: detalle.id_producto,
          cantidad: Number(detalle.cantidad || 0),
          precio_unitario: Number(detalle.precio || 0),
          subtotal:
            Number(detalle.cantidad || 0) * Number(detalle.precio || 0)
        }));

        const { error: errorInsertarDetalles } = await supabase
          .from("detalles_ventas")
          .insert(detallesInsert);

        if (errorInsertarDetalles) {
          console.error(
            "Error insertando detalles actualizados:",
            errorInsertarDetalles
          );
          throw errorInsertarDetalles;
        }

        setToast({
          mostrar: true,
          mensaje: "Venta actualizada exitosamente",
          tipo: "exito"
        });
      } else {
        const { data: ventaData, error: errorInsertarVenta } =
          await supabase
            .from("ventas")
            .insert([datosVenta])
            .select(`
              id_venta,
              id_cliente,
              id_empleado,
              fecha_venta,
              "método_pago",
              total
            `)
            .single();

        if (errorInsertarVenta) {
          console.error("Error insertando venta:", errorInsertarVenta);
          throw errorInsertarVenta;
        }

        if (!ventaData) {
          throw new Error("No se recibió la venta registrada.");
        }

        const detallesInsert = detalles.map((detalle) => ({
          id_venta: ventaData.id_venta,
          id_producto: detalle.id_producto,
          cantidad: Number(detalle.cantidad || 0),
          precio_unitario: Number(detalle.precio || 0),
          subtotal:
            Number(detalle.cantidad || 0) * Number(detalle.precio || 0)
        }));

        const { error: errorInsertarDetalles } = await supabase
          .from("detalles_ventas")
          .insert(detallesInsert);

        if (errorInsertarDetalles) {
          console.error(
            "Error insertando detalles de venta:",
            errorInsertarDetalles
          );
          throw errorInsertarDetalles;
        }

        setToast({
          mostrar: true,
          mensaje: "Venta registrada exitosamente",
          tipo: "exito"
        });
      }

      resetFormulario();
      setMostrarFormulario(false);
      await cargarDatos();
    } catch (err) {
      console.error("Error al guardar venta:", err);

      setToast({
        mostrar: true,
        mensaje:
          err?.message ||
          "Error al guardar la venta. Revise la consola.",
        tipo: "error"
      });
    }
  };

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={8} lg={8}>
          <h3 className="mb-0">
            <i className="bi bi-receipt-cutoff me-2"></i>
            Ventas
          </h3>
        </Col>

        <Col xs={4} lg={4} className="text-end">
          <Button onClick={abrirNuevaVenta} size="md">
            <i className="bi bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">
              Nueva Venta
            </span>
          </Button>
        </Col>
      </Row>

      <hr />

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por cliente, empleado, pago o ID..."
          />
        </Col>
      </Row>

      {cargando ? (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando ventas...</p>
          </Col>
        </Row>
      ) : ventasFiltradas.length === 0 ? (
        <Row className="text-center my-5">
          <Col>
            <i className="bi bi-receipt fs-1 text-muted"></i>
            <p className="mt-3 text-muted">
              No hay ventas registradas.
            </p>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col xs={12} className="d-lg-none">
            <TarjetaVenta
              ventas={ventasPaginadas}
              abrirEdicion={abrirEdicion}
            />
          </Col>

          <Col lg={12} className="d-none d-lg-block">
            <TablaVentas
              ventas={ventasPaginadas}
              abrirEdicion={abrirEdicion}
            />
          </Col>
        </Row>
      )}

      {ventasFiltradas.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={ventasFiltradas.length}
          paginaActual={paginaActual}
          establecerPaginaActual={establecerPaginaActual}
          establecerRegistrosPorPagina={establecerRegistrosPorPagina}
        />
      )}

      <FormularioVenta
        mostrar={mostrarFormulario}
        setMostrar={setMostrarFormulario}
        cerrarFormulario={cerrarFormulario}
        clientes={clientes}
        empleados={empleados}
        productos={productos}
        clienteSeleccionado={clienteSeleccionado}
        setClienteSeleccionado={setClienteSeleccionado}
        empleadoSeleccionado={empleadoSeleccionado}
        setEmpleadoSeleccionado={setEmpleadoSeleccionado}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        detalles={detalles}
        totalGeneral={totalGeneral}
        agregarDetalle={agregarDetalle}
        eliminarDetalle={eliminarDetalle}
        actualizarCantidad={actualizarCantidad}
        guardarVenta={guardarVenta}
        ventaAEditar={ventaAEditar}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() =>
          setToast({
            ...toast,
            mostrar: false
          })
        }
      />
    </Container>
  );
};

export default Ventas;