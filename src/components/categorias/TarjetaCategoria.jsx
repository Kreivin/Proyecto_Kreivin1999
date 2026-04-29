import React, {useState, useEffect, useCallback} from "react";
import {Card, Row, Col, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootostrap-icons.css"; // en esta parte nofunciona revisar despues
import Categorias from "../../views/Categorias";


const [cargando, setCargando] = useState(true);
const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

useEffect(() => {
setCargando(!(categorias && categorias. length > 0));
}, [categorias]);

const manejarTeclaEscape = useCallback((evento) => {
if (evento.key === "Escape") setIdTarjetaActiva(null);
}, []);

useEffect(() => {
window.addEventListener("keydown", manejarTeclaEscape);
return () => window. removeEventListener("keydown", manejarTeclaEscape);
}, [manejarTeclaEscape]);

const alternarTarjetaActiva = (id) => {
setIdTarjetaActiva((anterior) => (anterior === id ? null : id) );
};

const TarjetaCategoria = ({
    Categorias,
    abrirModalEdicion,
    abrirModalEliminacion
}) => {
    return (
        <>
        {cargando ? (
            <div className="text-center my-5">
                <h5>Cargando categorias...</h5>
                <Spinner animation="border" veriant="success" role="status"/>
                </div>
                {categorias.map((categoria))}
        )

        }
        </>
    );
};

export default TarjetaCategoria;