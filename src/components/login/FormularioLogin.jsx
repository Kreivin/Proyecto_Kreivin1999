import react from "react";
import {Form, Button, Card, Alert} from "react-bootstrap";

const formularioLogin = ({usuario, contrasena, error, setUsuario, setContasena, iniciarSesion}) => {
    return(
        <Card style={{minWidth: "320px", maxWidth: "400px", width:"100%"}} className="p-4 shadow-lg">
            <Card.Body>
                <h3 className="text-center mb-4">Iniciar Sesion</h3>

                <Form>
                    <Form.Group className="mb-3" controlId="usuario">
                        <Form.Label>Usuario</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ingrese su usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                        required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="contrasena">
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Ingrese su contraseña"
                            value={contrasena}
                            onChange={(e) => setContasena(e.target.value)}
                        required
                        />
                    </Form.Group>

                    <Button variant="primary" className="w-100" onClick={iniciarSesion}>
                        Iniciar Sesion
                    </Button>
                </Form>
                </Card.Body>
        </Card>
    );

};

export default formularioLogin;