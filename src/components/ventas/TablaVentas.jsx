import React from "react";
import { Table, Button } from "react-bootstrap";

const TablaVentas = ({ ventas, abrirEdicion }) => {
  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const fechaObjeto = new Date(fecha);

    if (isNaN(fechaObjeto.getTime())) {
      return "Fecha inválida";
    }

    return fechaObjeto.toLocaleString("es-NI");
  };

  return (
    <Table striped hover responsive size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha</th>
          <th>Cliente</th>
          <th>Empleado</th>
          <th>Pago</th>
          <th className="text-end">Total</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>

      <tbody>
        {ventas.map((venta) => (
          <tr key={venta.id_venta}>
            <td>#{venta.id_venta}</td>

            <td>{formatearFecha(venta.fecha_venta)}</td>

            <td>
              {venta.clientes
                ? `${venta.clientes.nombre_cliente || ""} ${
                    venta.clientes.apellido_cliente || ""
                  }`
                : "Cliente no encontrado"}
            </td>

            <td>
              {venta.empleados
                ? `${venta.empleados.nombre_empleado || ""} ${
                    venta.empleados.apellido_empleado || ""
                  }`
                : "Empleado no encontrado"}
            </td>

            <td>
              <span className="badge bg-info">
                {venta.metodo_pago || "efectivo"}
              </span>
            </td>

            <td className="text-end fw-bold">
              C$ {Number(venta.total || 0).toFixed(2)}
            </td>

            <td className="text-center">
              <Button
                variant="outline-warning"
                size="sm"
                onClick={() => abrirEdicion(venta)}
              >
                <i className="bi bi-pencil"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaVentas;