import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaVenta = ({ ventas, abrirEdicion }) => {
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  const manejarTeclaEscape = useCallback((evento) => {
    if (evento.key === "Escape") {
      setIdTarjetaActiva(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", manejarTeclaEscape);

    return () => {
      window.removeEventListener("keydown", manejarTeclaEscape);
    };
  }, [manejarTeclaEscape]);

  const alternarTarjetaActiva = (id) => {
    setIdTarjetaActiva((anterior) =>
      anterior === id ? null : id
    );
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const fechaObjeto = new Date(fecha);

    if (isNaN(fechaObjeto.getTime())) {
      return "Fecha inválida";
    }

    return fechaObjeto.toLocaleString("es-NI");
  };

  if (!ventas || ventas.length === 0) {
    return (
      <div className="text-center my-5 text-muted">
        <i className="bi bi-receipt fs-1"></i>
        <p>No hay ventas registradas.</p>
      </div>
    );
  }

  return (
    <div>
      {ventas.map((venta) => {
        const tarjetaActiva = idTarjetaActiva === venta.id_venta;

        return (
          <Card
            key={venta.id_venta}
            className="mb-3 border-0 rounded-3 shadow-sm w-100 tarjeta-venta-contenedor"
            onClick={() => alternarTarjetaActiva(venta.id_venta)}
            tabIndex={0}
            onKeyDown={(evento) => {
              if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                alternarTarjetaActiva(venta.id_venta);
              }
            }}
            aria-label={`Venta ${venta.id_venta}`}
          >
            <Card.Body
              className={`p-2 tarjeta-venta-cuerpo ${
                tarjetaActiva
                  ? "tarjeta-venta-cuerpo-activo"
                  : "tarjeta-venta-cuerpo-inactivo"
              }`}
            >
              <Row className="align-items-center gx-3">
                <Col xs={2} className="px-2">
                  <div className="bg-light d-flex align-items-center justify-content-center rounded tarjeta-venta-placeholder-imagen">
                    <i className="bi bi-receipt text-muted fs-3"></i>
                  </div>
                </Col>

                <Col xs={6} className="text-start">
                  <div className="fw-semibold text-truncate">
                    {venta.clientes
                      ? `${venta.clientes.nombre_cliente || ""} ${
                          venta.clientes.apellido_cliente || ""
                        }`
                      : "Cliente no encontrado"}
                  </div>

                  <div className="small text-muted text-truncate">
                    {formatearFecha(venta.fecha_venta)}
                  </div>

                  <div className="small">
                    <span className="badge bg-info">
                      {venta.metodo_pago || "efectivo"}
                    </span>
                  </div>
                </Col>

                <Col xs={4} className="text-end">
                  <div className="fw-bold text-success">
                    C$ {Number(venta.total || 0).toFixed(2)}
                  </div>
                </Col>
              </Row>
            </Card.Body>

            {tarjetaActiva && (
              <div
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                className="tarjeta-venta-capa"
              >
                <div
                  className="d-flex gap-2 tarjeta-venta-botones-capa"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => {
                      abrirEdicion(venta);
                      setIdTarjetaActiva(null);
                    }}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default TarjetaVenta;