import React, { useState } from "react";
import {
  Modal,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup
} from "react-bootstrap";

const FormularioVenta = ({
  mostrar,
  setMostrar,
  cerrarFormulario,
  clientes,
  empleados,
  productos,
  clienteSeleccionado,
  setClienteSeleccionado,
  empleadoSeleccionado,
  setEmpleadoSeleccionado,
  metodoPago,
  setMetodoPago,
  detalles,
  totalGeneral,
  agregarDetalle,
  eliminarDetalle,
  actualizarCantidad,
  guardarVenta,
  ventaAEditar
}) => {
  const [productoSeleccionado, setProductoSeleccionado] =
    useState(null);
  const [cantidad, setCantidad] = useState(1);

  const normalizarId = (valor) => {
    if (valor === null || valor === undefined) return "";
    return String(valor);
  };

  const handleAgregar = () => {
    if (productoSeleccionado && Number(cantidad) > 0) {
      agregarDetalle(productoSeleccionado, Number(cantidad));
      setCantidad(1);
      setProductoSeleccionado(null);
    }
  };

  const manejarCierre = () => {
    if (cerrarFormulario) {
      cerrarFormulario();
    } else {
      setMostrar(false);
    }
  };

  return (
    <Modal
      show={mostrar}
      onHide={manejarCierre}
      backdrop="static"
      size="xl"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {ventaAEditar ? "Editar Venta" : "Nueva Venta"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row>
          <Col lg={7} md={6}>
            <h5>Datos de la Venta</h5>

            <Form.Group className="mb-3">
              <Form.Label>Cliente *</Form.Label>

              <Form.Select
                value={clienteSeleccionado?.id_cliente || ""}
                onChange={(e) => {
                  const cliente = clientes.find(
                    (c) =>
                      normalizarId(c.id_cliente) === e.target.value
                  );

                  setClienteSeleccionado(cliente || null);
                }}
              >
                <option value="">Seleccionar cliente...</option>

                {clientes.map((cliente) => (
                  <option
                    key={cliente.id_cliente}
                    value={cliente.id_cliente}
                  >
                    {cliente.nombre_cliente}{" "}
                    {cliente.apellido_cliente}{" "}
                    {cliente.celular
                      ? `- ${cliente.celular}`
                      : ""}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Empleado / Mesero *</Form.Label>

              <Form.Select
                value={empleadoSeleccionado?.id_empleado || ""}
                onChange={(e) => {
                  const empleado = empleados.find(
                    (emp) =>
                      normalizarId(emp.id_empleado) === e.target.value
                  );

                  setEmpleadoSeleccionado(empleado || null);
                }}
              >
                <option value="">Seleccionar empleado...</option>

                {empleados.map((empleado) => (
                  <option
                    key={empleado.id_empleado}
                    value={empleado.id_empleado}
                  >
                    {empleado.nombre_empleado}{" "}
                    {empleado.apellido_empleado}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Método de Pago</Form.Label>

              <Form.Select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">
                  Transferencia
                </option>
              </Form.Select>
            </Form.Group>

            <hr />

            <h5>Agregar Producto</h5>

            <Row className="align-items-end">
              <Col sm={6}>
                <Form.Label>Producto</Form.Label>

                <Form.Select
                  value={productoSeleccionado?.id_producto || ""}
                  onChange={(e) => {
                    const producto = productos.find(
                      (p) =>
                        normalizarId(p.id_producto) ===
                        e.target.value
                    );

                    setProductoSeleccionado(producto || null);
                  }}
                >
                  <option value="">Seleccionar producto...</option>

                  {productos.map((producto) => (
                    <option
                      key={producto.id_producto}
                      value={producto.id_producto}
                    >
                      {producto.nombre_producto} - C$
                      {Number(
                        producto.precio_venta || 0
                      ).toFixed(2)}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col sm={3}>
                <Form.Label>Cantidad</Form.Label>

                <Form.Control
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) =>
                    setCantidad(
                      Math.max(
                        1,
                        parseInt(e.target.value, 10) || 1
                      )
                    )
                  }
                />
              </Col>

              <Col sm={3}>
                <Button
                  variant="success"
                  className="w-100"
                  onClick={handleAgregar}
                  disabled={!productoSeleccionado}
                >
                  Agregar
                </Button>
              </Col>
            </Row>
          </Col>

          <Col lg={5} md={6}>
            <Card className="h-100">
              <Card.Header>
                <strong>Productos en esta venta</strong>
              </Card.Header>

              <Card.Body
                className="p-0"
                style={{
                  maxHeight: "400px",
                  overflowY: "auto"
                }}
              >
                {detalles.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-cart-x fs-1"></i>
                    <p>No hay productos agregados aún</p>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {detalles.map((detalle) => (
                      <ListGroup.Item
                        key={detalle.id_producto}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div className="w-50">
                          <div>{detalle.nombre_producto}</div>

                          <small className="text-muted">
                            C${" "}
                            {Number(
                              detalle.precio || 0
                            ).toFixed(2)}
                          </small>

                          <div className="mt-2">
                            <Form.Control
                              type="number"
                              min="1"
                              size="sm"
                              value={detalle.cantidad}
                              onChange={(e) =>
                                actualizarCantidad(
                                  detalle.id_producto,
                                  Number(e.target.value || 1)
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="text-end">
                          <div className="fw-bold">
                            C${" "}
                            {(
                              Number(detalle.cantidad || 0) *
                              Number(detalle.precio || 0)
                            ).toFixed(2)}
                          </div>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="mt-1"
                            onClick={() =>
                              eliminarDetalle(detalle.id_producto)
                            }
                          >
                            Eliminar
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>

              <Card.Footer className="bg-light">
                <div className="d-flex justify-content-between align-items-center fs-4 fw-bold">
                  <span>Total:</span>
                  <span className="text-success">
                    C$ {Number(totalGeneral || 0).toFixed(2)}
                  </span>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={manejarCierre}>
          Cancelar
        </Button>

        <Button
          variant="primary"
          onClick={guardarVenta}
          disabled={
            !clienteSeleccionado ||
            !empleadoSeleccionado ||
            detalles.length === 0
          }
        >
          {ventaAEditar ? "Actualizar Venta" : "Registrar Venta"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FormularioVenta;