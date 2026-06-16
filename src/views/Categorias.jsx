import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
import TablaCategorias from "../components/categorias/TablaCategorias";
import TarjetaCategoria from "../components/categorias/TarjetaCategoria";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/Ordenamiento/Paginacion";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import ModalEnvioCorreoCategorias from "../components/categorias/ModalEnvioCorreoCategorias";
import emailjs from "@emailjs/browser";

const Categorias = () => {
    const NOMBRE_TABLA = "Categorias";

    const [toast, setToast] = useState({
        mostrar: false,
        mensaje: "",
        tipo: "",
    });

    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalCorreo, setMostrarModalCorreo] = useState(false);
    const [emailDestino, setEmailDestino] = useState("");
    const [enviandoCorreo, setEnviandoCorreo] = useState(false);

    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre_categoria: "",
        descripcion_categoria: "",
    });

    const [categorias, setCategorias] = useState([]);
    const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);

    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);

    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

    const [categoriaEditar, setCategoriaEditar] = useState({
        id_categoria: "",
        nombre_categoria: "",
        descripcion_categoria: "",
    });

    const [paginaActual, setPaginaActual] = useState(1);
    const [registrosPorPagina, setRegistrosPorPagina] = useState(5);

    // ================= PDF =================
    const generarPDFCategoria = (categoria) => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Reporte de Categoría", 14, 20);
        doc.line(14, 25, 195, 25);

        autoTable(doc, {
            startY: 35,
            head: [["Campo", "Valor"]],
            body: [
                ["ID", categoria.id_categoria],
                ["Nombre", categoria.nombre_categoria],
                [
                    "Descripción",
                    categoria.descripcion_categoria || "Sin descripción",
                ],
            ],
        });

        doc.save(`categoria_${categoria.id_categoria}.pdf`);
    };

    // ================= BUSQUEDA =================
    const manejarBusqueda = (e) => {
        setTextoBusqueda(e.target.value);
        setPaginaActual(1);
    };

    useEffect(() => {
        if (!textoBusqueda.trim()) {
            setCategoriasFiltradas(categorias);
            return;
        }

        const textoLower = textoBusqueda.toLowerCase().trim();

        const filtradas = categorias.filter((cat) => {
            const nombre = cat.nombre_categoria || "";
            const descripcion = cat.descripcion_categoria || "";

            return (
                nombre.toLowerCase().includes(textoLower) ||
                descripcion.toLowerCase().includes(textoLower)
            );
        });

        setCategoriasFiltradas(filtradas);
    }, [textoBusqueda, categorias]);

    const datosMostrar = textoBusqueda.trim() ? categoriasFiltradas : categorias;

    // ================= PAGINACION =================
    const indiceUltimo = paginaActual * registrosPorPagina;
    const indicePrimero = indiceUltimo - registrosPorPagina;
    const categoriasPaginadas = datosMostrar.slice(indicePrimero, indiceUltimo);

    const establecerPaginaActual = (numeroPagina) => {
        setPaginaActual(numeroPagina);
    };

    const establecerRegistrosPorPagina = (cantidad) => {
        setRegistrosPorPagina(cantidad);
        setPaginaActual(1);
    };

    // ================= CARGAR CATEGORIAS =================
    const cargarCategorias = async () => {
        try {
            setCargando(true);

            const { data, error } = await supabase
                .from(NOMBRE_TABLA)
                .select("*")
                .order("id_categoria", { ascending: true });

            if (error) {
                console.error("Error al cargar categorías:", error);

                setToast({
                    mostrar: true,
                    mensaje: "Error al cargar categorías.",
                    tipo: "error",
                });

                return;
            }

            setCategorias(data || []);
        } catch (error) {
            console.error("Error inesperado al cargar categorías:", error);

            setToast({
                mostrar: true,
                mensaje: "Error inesperado al cargar categorías.",
                tipo: "error",
            });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    // ================= AGREGAR =================
    const agregarCategoria = async () => {
        if (
            !nuevaCategoria.nombre_categoria.trim() ||
            !nuevaCategoria.descripcion_categoria.trim()
        ) {
            setToast({
                mostrar: true,
                mensaje: "Debe llenar todos los campos.",
                tipo: "advertencia",
            });
            return;
        }

        const categoriaParaInsertar = {
            nombre_categoria: nuevaCategoria.nombre_categoria.trim(),
            descripcion_categoria: nuevaCategoria.descripcion_categoria.trim(),
        };

        const { error } = await supabase
            .from(NOMBRE_TABLA)
            .insert([categoriaParaInsertar]);

        if (error) {
            console.error("Error al registrar categoría:", error);

            setToast({
                mostrar: true,
                mensaje: "Error al registrar categoría.",
                tipo: "error",
            });

            return;
        }

        await cargarCategorias();

        setNuevaCategoria({
            nombre_categoria: "",
            descripcion_categoria: "",
        });

        setMostrarModal(false);

        setToast({
            mostrar: true,
            mensaje: "Categoría registrada correctamente.",
            tipo: "exito",
        });
    };

    // ================= ACTUALIZAR =================
    const actualizarCategoria = async () => {
        if (
            !categoriaEditar.nombre_categoria.trim() ||
            !categoriaEditar.descripcion_categoria.trim()
        ) {
            setToast({
                mostrar: true,
                mensaje: "Debe llenar todos los campos.",
                tipo: "advertencia",
            });
            return;
        }

        const categoriaParaActualizar = {
            nombre_categoria: categoriaEditar.nombre_categoria.trim(),
            descripcion_categoria: categoriaEditar.descripcion_categoria.trim(),
        };

        const { error } = await supabase
            .from(NOMBRE_TABLA)
            .update(categoriaParaActualizar)
            .eq("id_categoria", categoriaEditar.id_categoria);

        if (error) {
            console.error("Error al actualizar categoría:", error);

            setToast({
                mostrar: true,
                mensaje: "Error al actualizar categoría.",
                tipo: "error",
            });

            return;
        }

        setMostrarModalEdicion(false);
        await cargarCategorias();

        setToast({
            mostrar: true,
            mensaje: "Categoría actualizada correctamente.",
            tipo: "exito",
        });
    };

    // ================= ELIMINAR =================
    const eliminarCategoria = async () => {
        if (!categoriaAEliminar) {
            setToast({
                mostrar: true,
                mensaje: "No se seleccionó ninguna categoría.",
                tipo: "advertencia",
            });
            return;
        }

        const { error } = await supabase
            .from(NOMBRE_TABLA)
            .delete()
            .eq("id_categoria", categoriaAEliminar.id_categoria);

        if (error) {
            console.error("Error al eliminar categoría:", error);

            setToast({
                mostrar: true,
                mensaje: "Error al eliminar categoría.",
                tipo: "error",
            });

            return;
        }

        setMostrarModalEliminacion(false);
        setCategoriaAEliminar(null);

        await cargarCategorias();

        setToast({
            mostrar: true,
            mensaje: "Categoría eliminada correctamente.",
            tipo: "exito",
        });
    };

    // ================= ABRIR MODALES =================
    const abrirModalEdicion = (categoria) => {
        setCategoriaEditar({
            id_categoria: categoria.id_categoria,
            nombre_categoria: categoria.nombre_categoria || "",
            descripcion_categoria: categoria.descripcion_categoria || "",
        });

        setMostrarModalEdicion(true);
    };

    const abrirModalEliminacion = (categoria) => {
        setCategoriaAEliminar(categoria);
        setMostrarModalEliminacion(true);
    };

    // ================= CAMBIOS INPUT =================
    const manejoCambioInput = (e) => {
        const { name, value } = e.target;

        setNuevaCategoria((prev) => ({
            ...prev,
            value,
        }));
    };

    const manejoCambioInputEdicion = (e) => {
        const { name, value } = e.target;

        setCategoriaEditar((prev) => ({
            ...prev,
            value,
        }));
    };

    // ================= EMAILJS =================
    useEffect(() => {
        if (import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
            emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
        }
    }, []);

    const abrirModalCorreo = () => {
        setEmailDestino("");
        setMostrarModalCorreo(true);
    };

    const formatearCategoriasParaCorreo = () => {
        if (categorias.length === 0) {
            return "No hay categorías registradas.";
        }

        let texto = "LISTADO DE CATEGORÍAS\n\n";
        texto += `Fecha: ${new Date().toLocaleDateString("es-NI")}\n`;
        texto += `Total de categorías: ${categorias.length}\n\n`;

        categorias.forEach((cat, index) => {
            texto += `${index + 1}. ${cat.nombre_categoria}\n`;

            if (cat.descripcion_categoria) {
                texto += `   Descripción: ${cat.descripcion_categoria}\n`;
            } else {
                texto += "   Descripción: Sin descripción\n";
            }

            texto += "\n";
        });

        return texto;
    };

    const enviarCorreoCategorias = () => {
        if (!emailDestino.trim()) {
            setToast({
                mostrar: true,
                mensaje: "Por favor ingresa un correo destino.",
                tipo: "advertencia",
            });
            return;
        }

        setEnviandoCorreo(true);

        const mensaje = formatearCategoriasParaCorreo();

        const templateParams = {
            to_name: "Administrador",
            user_email: emailDestino,
            message: mensaje,
            fecha_envio: new Date().toLocaleDateString("es-NI"),
        };

        emailjs
            .send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                templateParams
            )
            .then(() => {
                setToast({
                    mostrar: true,
                    mensaje: "Correo enviado correctamente.",
                    tipo: "exito",
                });

                setMostrarModalCorreo(false);
                setEmailDestino("");
            })
            .catch((error) => {
                console.error("Error EmailJS:", error);

                setToast({
                    mostrar: true,
                    mensaje: "Error al enviar el correo.",
                    tipo: "error",
                });
            })
            .finally(() => {
                setEnviandoCorreo(false);
            });
    };

    // ================= COPIAR =================
    const copiarCategoria = async (categoria) => {
        if (!categoria) return;

        const texto = `ID: ${categoria.id_categoria}
Categoría: ${categoria.nombre_categoria}
Descripción: ${categoria.descripcion_categoria || "Sin descripción"}`;

        try {
            await navigator.clipboard.writeText(texto);

            setToast({
                mostrar: true,
                mensaje: `Categoría "${categoria.nombre_categoria}" copiada al portapapeles.`,
                tipo: "exito",
            });
        } catch (error) {
            console.error("Error al copiar:", error);

            setToast({
                mostrar: true,
                mensaje: "No se pudo copiar al portapapeles.",
                tipo: "error",
            });
        }
    };

    return (
        <Container className="mt-3">
            <Row className="align-items-center mb-3">
                <Col
                    xs={8}
                    sm={8}
                    md={8}
                    lg={8}
                    className="d-flex align-items-center"
                >
                    <h3 className="mb-0">
                        <i className="bi bi-bookmark-plus-fill me-2"></i>
                        Categorías
                    </h3>
                </Col>

                <Col xs={2} sm={2} md={2} lg={2} className="text-end">
                    <Button
                        variant="primary"
                        onClick={abrirModalCorreo}
                        size="md"
                    >
                        <i className="bi bi-envelope"></i>
                        <span className="d-none d-lg-inline ms-2">
                            Enviar por Correo
                        </span>
                    </Button>
                </Col>

                <Col xs={2} sm={2} md={2} lg={2} className="text-end">
                    <Button onClick={() => setMostrarModal(true)} size="md">
                        <i className="bi bi-plus-lg"></i>
                        <span className="d-none d-lg-inline ms-2">
                            Nueva Categoría
                        </span>
                    </Button>
                </Col>
            </Row>

            <hr />

            <Row className="mb-4">
                <Col md={6}>
                    <CuadroBusquedas
                        textoBusqueda={textoBusqueda}
                        manejarCambioBusqueda={manejarBusqueda}
                        placeholder="Buscar categoría..."
                    />
                </Col>
            </Row>

            {!cargando && textoBusqueda && datosMostrar.length === 0 && (
                <Alert variant="info">No se encontraron resultados.</Alert>
            )}

            {!cargando && !textoBusqueda && datosMostrar.length === 0 && (
                <Alert variant="warning">No hay categorías registradas.</Alert>
            )}

            {cargando && <Spinner animation="border" />}

            {!cargando && datosMostrar.length > 0 && (
                <Row>
                    <Col className="d-lg-none">
                        <TarjetaCategoria
                            categorias={categoriasPaginadas}
                            abrirModalEdicion={abrirModalEdicion}
                            abrirModalEliminacion={abrirModalEliminacion}
                            copiarCategoria={copiarCategoria}
                            generarPDFCategoria={generarPDFCategoria}
                        />
                    </Col>

                    <Col className="d-none d-lg-block">
                        <TablaCategorias
                            categorias={categoriasPaginadas}
                            abrirModalEdicion={abrirModalEdicion}
                            abrirModalEliminacion={abrirModalEliminacion}
                            copiarCategoria={copiarCategoria}
                            generarPDFCategoria={generarPDFCategoria}
                        />
                    </Col>
                </Row>
            )}

            {!cargando && datosMostrar.length > 0 && (
                <Paginacion
                    registrosPorPagina={registrosPorPagina}
                    totalRegistros={datosMostrar.length}
                    paginaActual={paginaActual}
                    establecerPaginaActual={establecerPaginaActual}
                    establecerRegistrosPorPagina={establecerRegistrosPorPagina}
                />
            )}

            <ModalRegistroCategoria
                mostrarModal={mostrarModal}
                setMostrarModal={setMostrarModal}
                nuevaCategoria={nuevaCategoria}
                manejoCambioInput={manejoCambioInput}
                agregarCategoria={agregarCategoria}
            />

            <ModalEdicionCategoria
                mostrarModalEdicion={mostrarModalEdicion}
                setMostrarModalEdicion={setMostrarModalEdicion}
                categoriaEditar={categoriaEditar}
                manejoCambioInputEdicion={manejoCambioInputEdicion}
                actualizarCategoria={actualizarCategoria}
            />

            <ModalEliminacionCategoria
                mostrarModalEliminacion={mostrarModalEliminacion}
                setMostrarModalEliminacion={setMostrarModalEliminacion}
                categoriaAEliminar={categoriaAEliminar}
                eliminarCategoria={eliminarCategoria}
            />

            <ModalEnvioCorreoCategorias
                mostrarModalCorreo={mostrarModalCorreo}
                setMostrarModalCorreo={setMostrarModalCorreo}
                emailDestino={emailDestino}
                setEmailDestino={setEmailDestino}
                enviandoCorreo={enviandoCorreo}
                enviarCorreoCategorias={enviarCorreoCategorias}
                totalCategorias={categorias.length}
            />

            <NotificacionOperacion
                mostrar={toast.mostrar}
                mensaje={toast.mensaje}
                tipo={toast.tipo}
                onCerrar={() =>
                    setToast({
                        ...toast,
                        mostrar: false,
                    })
                }
            />
        </Container>
    );
};

export default Categorias;