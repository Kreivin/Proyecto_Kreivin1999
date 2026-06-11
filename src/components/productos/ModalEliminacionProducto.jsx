import React, { useState } from "react";

import { Modal, Button } from "react-bootstrap";

const ModalEliminarProducto = ({
  mostrarModalEliminar,
  setMostrarModalEliminar,
  productoEliminar,
  eliminarProducto,
}) => {

  const [deshabilitado, setDeshabilitado] =
    useState(false);

  //================ ELIMINAR ================//

  const handleEliminar = async () => {

    if (deshabilitado) return;

    setDeshabilitado(true);

    await eliminarProducto();

    setDeshabilitado(false);

  };

  return (

    <Modal
      show={mostrarModalEliminar}
      onHide={() =>
        setMostrarModalEliminar(false)
      }
      backdrop="static"
      keyboard={false}
      centered
    >

      <Modal.Header closeButton>

        <Modal.Title>
          Confirmar Eliminación
        </Modal.Title>

      </Modal.Header>

      <Modal.Body>

        ¿Estás seguro de eliminar el producto{" "}
        
        <strong>
          {productoEliminar?.nombre_producto}
        </strong>
        ?

      </Modal.Body>

      <Modal.Footer>

        <Button
          variant="secondary"
          onClick={() =>
            setMostrarModalEliminar(false)
          }
        >
          Cancelar
        </Button>

        <Button
          variant="danger"
          onClick={handleEliminar}
          disabled={deshabilitado}
        >
          Eliminar
        </Button>

      </Modal.Footer>

    </Modal>
  );
};

export default ModalEliminarProducto;