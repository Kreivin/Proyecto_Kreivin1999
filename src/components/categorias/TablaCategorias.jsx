import React, { useState } from "react";
import { Modal, Button, Form } from 'react-bootstrap';

const ModalRegistroCategoria = ({
    mostrarModal,
    setMostrarmodal,
    nuevaCategoria,
    manejoCambioInput,
    agregarCategoria,
}) => {
    const [deshabilitado, setDesabilitado] = useState(false);

    const handleregistrar = async () => {
        if (deshabilitado) return;
        setDesabilitado(true);
        await agregarCategoria();
        setDesabilitado(false);
    };


    return (
        <Modal
            show={mostrarModal}
            onHide={() => setMostrarmodal(false)}
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>Agregar Categoria</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombre_categoria"
                            value={nuevaCategoria.nombre_categoria}
                            onChange={manejoCambioInput}
                            placeholder="Ingrese el nombre"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="descripcion_categoria"
                            value={nuevaCategoria.descripcion_categoria}
                            onChange={manejoCambioInput}
                            placeholder="Ingrese la descripción"
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setMostrarmodal(false)}>
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    onClick={handleregistrar}
                    disabled={nuevaCategoria.nombre_categoria.trim() === "" || deshabilitado}
                >
                    Guardar
                </Button>
            </Modal.Footer>
        </Modal>
    )

};

export default ModalRegistroCategoria;