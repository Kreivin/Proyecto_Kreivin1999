import React from "react";
import { Table, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaCategorias = ({
    categorias,
    abrirModalEdicion,
    abrirModalEliminacion,
    copiarCategoria,
    generarPDFCategoria,
}) => {
    return (
        <Table striped borderless hover responsive size="sm">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th className="d-none d-md-table-cell">Descripción</th>
                    <th className="text-center">Acciones</th>
                </tr>
            </thead>

            <tbody>
                {categorias.map((categoria) => (
                    <tr key={categoria.id_categoria}>
                        <td>{categoria.id_categoria}</td>
                        <td>{categoria.nombre_categoria}</td>
                        <td className="d-none d-md-table-cell">
                            {categoria.descripcion_categoria}
                        </td>

                        <td className="text-center">
                            <Button
                                variant="outline-warning"
                                size="sm"
                                className="m-1"
                                onClick={() => abrirModalEdicion(categoria)}
                                title="Editar"
                            >
                                <i className="bi bi-pencil"></i>
                            </Button>

                            <Button
                                variant="outline-danger"
                                size="sm"
                                className="m-1"
                                onClick={() => abrirModalEliminacion(categoria)}
                                title="Eliminar"
                            >
                                <i className="bi bi-trash"></i>
                            </Button>

                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="m-1"
                                onClick={() => generarPDFCategoria(categoria)}
                                title="Generar PDF"
                            >
                                <i className="bi bi-file-earmark-pdf"></i>
                            </Button>

                            <Button
                                variant="outline-success"
                                size="sm"
                                className="m-1"
                                onClick={() => copiarCategoria(categoria)}
                                title="Copiar"
                            >
                                <i className="bi bi-clipboard"></i>
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default TablaCategorias;