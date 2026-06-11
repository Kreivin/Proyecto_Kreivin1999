import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  Card,
  Row,
  Col,
  Spinner,
  Button,
  Image,
} from "react-bootstrap";

import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetasProductos = ({
  productos,
  abrirModalEdicion,
  abrirModalEliminacion,
  generarPDFProducto,
}) => {

  const [cargando, setCargando] =
    useState(true);

  const [idTarjetaActiva, setIdTarjetaActiva] =
    useState(null);

  useEffect(() => {

    setCargando(
      !(productos && productos.length > 0)
    );

  }, [productos]);

  const manejarTeclaEscape =
    useCallback((evento) => {

      if (evento.key === "Escape") {

        setIdTarjetaActiva(null);

      }

    }, []);

  useEffect(() => {

    window.addEventListener(
      "keydown",
      manejarTeclaEscape
    );

    return () =>
      window.removeEventListener(
        "keydown",
        manejarTeclaEscape
      );

  }, [manejarTeclaEscape]);

  const alternarTarjetaActiva = (id) => {

    setIdTarjetaActiva(
      (anterior) =>
        anterior === id
          ? null
          : id
    );

  };

  return (
    <>
      {cargando ? (

        <div className="text-center my-5">

          <h5>
            Cargando productos...
          </h5>

          <Spinner
            animation="border"
            variant="success"
            role="status"
          />

        </div>

      ) : (

        <div>

          {productos.map(
            (producto) => {

              const tarjetaActiva =
                idTarjetaActiva ===
                producto.id_producto;

              return (

                <Card
                  key={
                    producto.id_producto
                  }
                  className="mb-3 border-0 rounded-3 shadow-sm w-100 tarjeta-producto-contenedor"
                  onClick={() =>
                    alternarTarjetaActiva(
                      producto.id_producto
                    )
                  }
                  tabIndex={0}
                  onKeyDown={(
                    evento
                  ) => {

                    if (
                      evento.key ===
                        "Enter" ||
                      evento.key === " "
                    ) {

                      evento.preventDefault();

                      alternarTarjetaActiva(
                        producto.id_producto
                      );

                    }

                  }}
                  aria-label={`Producto ${producto.nombre_producto}`}
                >

                  <Card.Body
                    className={`p-2 tarjeta-producto-cuerpo ${
                      tarjetaActiva
                        ? "tarjeta-producto-cuerpo-activa"
                        : "tarjeta-producto-cuerpo-inactiva"
                    }`}
                  >

                    <Row className="align-items-center gx-3">

                      {/* IMAGEN */}

                      <Col
                        xs={3}
                        className="px-2"
                      >

                        <div className="bg-light d-flex align-items-center justify-content-center rounded overflow-hidden tarjeta-producto-placeholder-imagen">

                          <Image
                            src={
                              producto.url_imagen
                            }
                            alt="Producto"
                            fluid
                            style={{
                              width:
                                "70px",
                              height:
                                "70px",
                              objectFit:
                                "cover",
                            }}
                          />

                        </div>

                      </Col>

                      {/* INFORMACIÓN */}

                      <Col
                        xs={5}
                        className="text-start"
                      >

                        <div className="fw-semibold text-truncate">

                          {
                            producto.nombre_producto
                          }

                        </div>

                        <div className="small text-muted text-truncate">

                          {
                            producto.descripcion_producto
                          }

                        </div>

                        <div className="small fw-semibold">

                          C$
                          {parseFloat(
                            producto.precio_venta ||
                              0
                          ).toFixed(
                            2
                          )}

                        </div>

                      </Col>

                      {/* CATEGORÍA */}

                      <Col
                        xs={4}
                        className="d-flex flex-column align-items-end justify-content-center text-end"
                      >

                        <div className="fw-semibold small">

                          {
                            producto.categoria_producto
                          }

                        </div>

                      </Col>

                    </Row>

                  </Card.Body>

                  {/* BOTONES */}

                  {tarjetaActiva && (

                    <div
                      role="dialog"
                      aria-modal="true"
                      onClick={(
                        e
                      ) => {

                        e.stopPropagation();

                        setIdTarjetaActiva(
                          null
                        );

                      }}
                      className="tarjeta-producto-capa"
                    >

                      <div
                        className="d-flex gap-2 tarjeta-producto-botones-capa"
                        onClick={(
                          e
                        ) =>
                          e.stopPropagation()
                        }
                      >

                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => {

                            abrirModalEdicion(
                              producto
                            );

                            setIdTarjetaActiva(
                              null
                            );

                          }}
                        >

                          <i className="bi bi-pencil"></i>

                        </Button>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {

                            abrirModalEliminacion(
                              producto
                            );

                            setIdTarjetaActiva(
                              null
                            );

                          }}
                        >

                          <i className="bi bi-trash"></i>

                        </Button>

                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {

                            generarPDFProducto(
                              producto
                            );

                            setIdTarjetaActiva(
                              null
                            );

                          }}
                        >

                          <i className="bi bi-file-earmark-pdf"></i>

                        </Button>

                      </div>

                    </div>

                  )}

                </Card>

              );

            }
          )}

        </div>

      )}
    </>
  );
};

export default TarjetasProductos;