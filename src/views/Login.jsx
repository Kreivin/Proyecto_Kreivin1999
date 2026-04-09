import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from "../components/login/FormularioLogin";
import { supabase } from "../database/supabaseconfig";




const Login = () => {

    const [usuario, setUsuario] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("null");
    const navegar = useNavigate();

    const iniciarSesion = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: usuario,
                password: contrasena,
            });
            if (error) {
                setError("Usuario o contraseña incorrectos");
                return;
            }
            if (data.user) {
                localStorage.setItem("usuario-supabase", usuario);
                navegar("/");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
            console.error("Error en la solicitud", err);
        }
        useEffect(() => {
            const usuarioGuardado = localStorage.getItem("usuario-supabase");
            if (usuarioGuardado) {
                navegar("/");
            }
        }, [navegar]);

        <div style={estiloContenedor}>
            <FormularioLogin
                usuario={usuario}
                contrasena={contrasena}
                error={error}
                setUsuario={setUsuario}
                setContrasena={setContrasena}
                iniciarSesion={iniciarSesion}
            />
        </div>

    };
    return (
        <Container className="mt-3">
            <Row className="align-items-center">
                <Col>
                    <h2><i className="bi-house-fill me-2"></i> Login</h2>
                </Col>
            </Row>
        </Container>
    );

};

export default Login;
