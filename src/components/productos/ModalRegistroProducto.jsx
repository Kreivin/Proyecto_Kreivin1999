import React, { useState } from "react";

import {
    Modal,
    Form,
    Button
} from "react-bootstrap";

const ModalRegistroProducto = ({
    mostrarModal,
    setMostrarModal,
    nuevoProducto,
    manejoCambioInput,
    manejoCambioArchivo,
    agregarProducto,
    categorias,
}) => {

    //================ ESTADO ================//

    const [deshabilitado, setDeshabilitado] =
        useState(false);

    //================ REGISTRAR ================//

    const handleRegistrar = async () => {

        if (deshabilitado) return;

        setDeshabilitado(true);

        await agregarProducto();

        setDeshabilitado(false);

    };

    return (

        <Modal
            show={mostrarModal}
            onHide={() =>
                setMostrarModal(false)
            }
            backdrop="static"
            keyboard={false}
            centered
        >

            <Modal.Header closeButton>

                <Modal.Title>
                    Agregar Producto
                </Modal.Title>

            </Modal.Header>

            <Modal.Body>

                <Form>

                    {/* NOMBRE */}

                    <Form.Group className="mb-3">

                        <Form.Label>
                            Nombre
                        </Form.Label>

                        <Form.Control
                            type="text"
                            name="nombre_producto"
                            value={
                                nuevoProducto.nombre_producto
                            }
                            onChange={manejoCambioInput}
                            placeholder="Ingresa el nombre"
                        />

                    </Form.Group>

                    {/* DESCRIPCION */}

                    <Form.Group className="mb-3">

                        <Form.Label>
                            Descripción
                        </Form.Label>

                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="descripcion_producto"
                            value={
                                nuevoProducto.descripcion_producto
                            }
                            onChange={manejoCambioInput}
                            placeholder="Ingresa la descripción"
                        />

                    </Form.Group>

                    {/* CATEGORIA */}

                    <Form.Group className="mb-3">

                        <Form.Label>
                            Categoría
                        </Form.Label>

                        <Form.Select
                            name="categoria_producto"
                            value={
                                nuevoProducto.categoria_producto
                            }
                            onChange={manejoCambioInput}
                        >

                            <option value="">
                                Selecciona una categoría
                            </option>

                            {categorias.map((categoria) => (

                                <option
                                    key={categoria.id_categoria}
                                    value={categoria.id_categoria}
                                >
                                    {categoria.nombre_categoria}
                                </option>

                            ))}

                        </Form.Select>

                    </Form.Group>

                    {/* PRECIO */}

                    <Form.Group className="mb-3">

                        <Form.Label>
                            Precio
                        </Form.Label>

                        <Form.Control
                            type="number"
                            step="0.01"
                            name="precio_venta"
                            value={
                                nuevoProducto.precio_venta
                            }
                            onChange={manejoCambioInput}
                            placeholder="Ingresa el precio"
                        />

                    </Form.Group>

                    {/* IMAGEN */}

                    <Form.Group className="mb-3">

                        <Form.Label>
                            Imagen
                        </Form.Label>

                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={manejoCambioArchivo}
                        />

                    </Form.Group>

                </Form>

            </Modal.Body>

            <Modal.Footer>

                <Button
                    variant="secondary"
                    onClick={() =>
                        setMostrarModal(false)
                    }
                >
                    Cancelar
                </Button>

                <Button
                    variant="primary"
                    onClick={handleRegistrar}
                    disabled={
                        deshabilitado ||
                        !nuevoProducto.nombre_producto.trim() ||
                        !nuevoProducto.categoria_producto ||
                        !nuevoProducto.precio_venta ||
                        !nuevoProducto.archivo
                    }
                >
                    Guardar
                </Button>

            </Modal.Footer>

        </Modal>
    );
};

export default ModalRegistroProducto;