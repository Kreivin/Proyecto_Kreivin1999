import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Alert, Pagination } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
import NotificacionOperacion from "../components/NotificationOperation";
import TablaCategorias from "../components/categorias/TablaCategorias";
import TarjetaCategoria from "../components/categorias/TarjetaCategoria";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";

const Categorias = () => {

    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

    const [categoriaEditar, setCategoriaEditar] = useState({
        nombre_categoria: "",
        descripcion_categoria: ""
    });

    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

    const [categoriaAEliminar, setCategoriaAEliminar] = useState({
        id_categoria: "",
    });

    const [toast, setToast] = useState({ mostrar: false, message: "", tipo: "" });
    const [mostrarModal, setMostrarModal] = useState(false);

    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre_categoria: "",
        descripcion_categoria: "",
    });

    // ##################### BUSQUEDA ####################
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);

    const manejarBusqueda = (e) => {
        setTextoBusqueda(e.target.value);
    };

    useEffect(() => {
        if (!textoBusqueda.trim()) {
            setCategoriasFiltradas(categorias);
        } else {
            const textoLower = textoBusqueda.toLowerCase().trim();
            const filtradas = categorias.filter(
                (cat) =>
                    cat.nombre_categoria.toLowerCase().includes(textoLower) ||
                    cat.descripcion_categoria && cat.descripcion_categoria.toLowerCase().includes(textoLower)
            );
            setCategoriasFiltradas(filtradas);
        }
    }, [textoBusqueda, categorias]);
    // ####################################################



    // ############################Paginación###################
    const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
    const [paginaActual, establcerPaginaActual] = useState(1);

    const categoriasPaginadas = categoriasFiltradas.slice(
        (paginaActual - 1) * registrosPorPagina,
        paginaActual * registrosPorPagina
    );


    //###########################################################
    const manejoCambioInput = (e) => {
        const { name, value } = e.target;
        setNuevaCategoria((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const abrirModalEdicion = (categoria) => {
        setCategoriaEditar({
            id_categoria: categoria.id_categoria, // Asegúrate que coincida con el nombre en DB
            nombre_categoria: categoria.nombre_categoria,
            descripcion_categoria: categoria.descripcion_categoria,
        });
        setMostrarModalEdicion(true); // Ahora sí abrimos el modal
    };

    const abrirModalEliminacion = (categoria) => {
        setCategoriaAEliminar(categoria);
        setMostrarModalEliminacion(true); // Ahora sí abrimos el modal
    };

    const manejoCambioInputEdicion = (e) => {
        const { name, value } = e.target;
        setCategoriaEditar((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 2. Función para traer los datos
    const cargarCategorias = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from("categorias")
                .select("*")
                .order("id_categoria", { ascending: true }); // Usando el nombre correcto

            if (error) throw error;
            setCategorias(data || []);
        } catch (err) {
            console.error("Error:", err.message);
        } finally {
            setCargando(false); // ¡Esto hace que la tabla aparezca!
        }
    };

    const actualizarCategoria = async () => {
        try {
            if (
                !categoriaEditar.nombre_categoria.trim() ||
                !categoriaEditar.descripcion_categoria.trim()
            ) {
                setToast({
                    mostrar: true,
                    message: "Se debe de rellenar todos los campos.",
                    tipo: "advertencia",
                });
                return;
            }

            setMostrarModalEdicion(false);

            const { error } = await supabase
                .from("categorias")
                .update({
                    nombre_categoria: categoriaEditar.nombre_categoria,
                    descripcion_categoria: categoriaEditar.descripcion_categoria,
                })
                .eq("id_categoria", categoriaEditar.id_categoria);

            if (error) {
                console.error("Error al actualizar categorías: ", error.message);
                setToast({
                    mostrar: true,
                    message: `Error al actualizar la categoría: ${categoriaEditar.nombre_categoria}.`,
                    tipo: "error",
                });
                return;
            }

            await cargarCategorias();

            setToast({
                mostrar: true,
                message: `La categoría ${categoriaEditar.nombre_categoria} actualizada exitosamente.`,
                tipo: "exito",
            });

        } catch (err) {
            setToast({
                mostrar: true,
                message: "Error inesperado al actualizar la categoría.",
                tipo: "error",
            });
            console.error("Excepción al actualizar la categoría: ", err.message);
        }
    };

    // 3. Ejecutar al cargar la página
    useEffect(() => {
        cargarCategorias();
    }, []);

    const agregarCategoria = async () => {
        try {
            if (
                !nuevaCategoria.nombre_categoria.trim() ||
                !nuevaCategoria.descripcion_categoria.trim()
            ) {
                setToast({
                    mostrar: true,
                    message: "Debe llenar todos los campos.",
                    tipo: "advertencia",
                });
                return;
            }

            const { error } = await supabase.from("categorias").insert([
                {
                    nombre_categoria: nuevaCategoria.nombre_categoria,
                    descripcion_categoria: nuevaCategoria.descripcion_categoria,
                },
            ]);

            if (error) {
                console.error("Error al agregar categoría:", error.message);
                setToast({
                    mostrar: true,
                    message: "Error al registrar categoría.",
                    tipo: "error",
                });
                return;
            }

            // Éxito
            setToast({
                mostrar: true,
                message: `Categoria "${nuevaCategoria.nombre_categoria}" registrada exitosamente.`,
                tipo: "exito",
            });

            // Limpiar formulario y cerrar modal
            await cargarCategorias(); // Recargar categorías para mostrar la nueva
            setNuevaCategoria({ nombre_categoria: "", descripcion_categoria: "" });
            setMostrarModal(false);

        } catch (err) {
            console.error("Excepción al agregar categoría:", err.message);
            setToast({
                mostrar: true,
                message: "Error inesperado al registrar categoría.",
                tipo: "error",
            });
        }
    };


    const eliminarCategoria = async () => {
        if (!categoriaAEliminar) return;

        try {
            setMostrarModalEliminacion(false);

            const { error } = await supabase
                .from("categorias")
                .delete()
                .eq("id_categoria", categoriaAEliminar.id_categoria);

            if (error) {
                console.error("Error al eliminar categoria: ", error.message);
                setToast({
                    mostrar: true,
                    message: `Error al eliminar la categoría ${categoriaAEliminar.nombre_categoria}.`,
                    tipo: "error",
                });
                return;
            }

            await cargarCategorias();
            setToast({
                mostrar: true,
                message: `Categoría ${categoriaAEliminar.nombre_categoria} eliminada exiosamente.`,
                tipo: "exito",
            });
        } catch (err) {
            setToast({
                mostrar: true,
                message: "Error inesperado al eliminar categoría.",
                tipo: "error",
            });
            console.error("Excepción al eliminar categoría: ", err.message);
        }
    };

    return (
        <Container className="mt-3">

            {/* Título y botón Nueva Categoría */}
            <Row className="align-items-center mb-3">
                <Col xs={9} sm={7} md={7} lg={7} className="d-flex align-items-center">
                    <h3 className="mb-0">
                        <i className="bi-bookmark-plus-fill me-2"></i> Categorías
                    </h3>
                </Col>
                <Col xs={3} sm={5} md={5} lg={5} className="text-end">
                    <Button
                        onClick={() => setMostrarModal(true)}
                        size="md"
                    >
                        <i className="bi-plus-lg"></i>
                        <span className="d-none d-sm-inline ms-2">Nueva Categoría</span>
                    </Button>
                </Col>
            </Row>

            <hr />

            {/* #################################################### */}

            {/* Cuadro de búsqueda debajo de la línea divisora*/}
            <Row className="mb-4">
                <Col md={6} lg={5}>
                    <CuadroBusquedas
                        textoBusqueda={textoBusqueda}
                        manejarCambioBusqueda={manejarBusqueda}
                        placeholder="Buscar por nombre o descripción..."
                    />
                </Col>
            </Row>

            {/* Mensaje de no coincidencias solo cuando hay búsqueda y no hay resultados */}
            {!cargando && textoBusqueda.trim() && categoriasFiltradas.length === 0 && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="info" className="text-center">
                            <i className="bi bi-info-circle me-2"></i>
                            No se encontraron categorías que coincidan con "{textoBusqueda}".
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Modal de Registro */}
            <ModalRegistroCategoria
                mostrarModal={mostrarModal}
                setMostrarModal={setMostrarModal}
                nuevaCategoria={nuevaCategoria}
                manejoCambioInput={manejoCambioInput}
                agregarCategoria={agregarCategoria}
            />

            {/* Modal de edición de categoría */}
            <ModalEdicionCategoria
                mostrarModalEdicion={mostrarModalEdicion}
                SetMostrarModalEdicion={setMostrarModalEdicion}
                categoriaEditar={categoriaEditar}
                manejoCambioInputEdicion={manejoCambioInputEdicion}
                actualizarCategoria={actualizarCategoria}
            />

            <ModalEliminacionCategoria
                mostrarModalEliminacion={mostrarModalEliminacion}
                setMostrarModalEliminacion={setMostrarModalEliminacion}
                eliminarCategoria={eliminarCategoria}
                categoria={categoriaAEliminar}
            />

            {/* Sin registros */}
            {!cargando && categorias.length === 0 && (
                <Row className="text-center my-5">
                    <Col>
                        <p className="text-muted fs-5">No hay categorías registradas todavía.</p>
                    </Col>
                </Row>
            )}

            {/* Notificación */}
            <NotificacionOperacion
                mostrar={toast.mostrar}
                message={toast.message}
                tipo={toast.tipo}
                onClose={() => setToast({ ...toast, mostrar: false })}
            />


            {/* Lista de categorías filtratarjetas-categorias */}
            {!cargando && categoriasFiltradas.length > 0 && (
                <>
                    <Row>
                        <Col xs={12} sm={12} md={12} className="d-lg-none">
                            <TarjetaCategoria
                                categorias={categoriasPaginadas}
                                abrirModalEdicion={abrirModalEdicion}
                                abrirModalEliminacion={abrirModalEliminacion}
                            />
                        </Col>
                        <Col lg={12} className="d-none d-lg-block">
                            <TablaCategorias
                                categorias={categoriasPaginadas}
                                abrirModalEdicion={abrirModalEdicion}
                                abrirModalEliminacion={abrirModalEliminacion}
                            />
                        </Col>
                    </Row>

                    <Paginacion
                        registrosPorPagina={registrosPorPagina}
                        totalRegistros={categoriasFiltradas.length}
                        paginaActual={paginaActual}
                        establcerPaginaActual={establcerPaginaActual}
                        establecerRegistrosPorPagina={establecerRegistrosPorPagina}
                    />
                </>
            )}
        </Container>
    );
};
export default Categorias;