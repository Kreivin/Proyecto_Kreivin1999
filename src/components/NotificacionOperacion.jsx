import { UseEffect, UseSate } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const NotificacionOperacion = ({ mostrar, mensaje, tipo, onCerrar }) => {
    const [Visible, setVisible] = UseSate(mostrar);

    UseEffect(() => {
        setVisible(mostrar);
    }, [mostrar]);

    const fechaLocal = () => {
        const f = new Date();
        const fecha = new Date(f);
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        return '${dia}-${mes}-${anio} ${fecha.toTimeString().slice(0, 5)}';
    }
    return (
        <ToastContainer position="top-center" className="p-2">
            <Toast
                onClose={() => {
                    setVisible(false);
                    onCerrar();
                }}
                show={Visible}
                delay={2500}
                autohide
                bg={tipo === 'exito' ? 'success' : tipo === 'advetencia' ? 'warning' : 'danger'}
            >
                <Toast.Header>
                    <Strong className="me-auto">{tipo === 'exito' ? 'Exito' : tipo === 'advertencia' ? 'Advertencia' : 'Error'}</Strong>
                    <small>{fechaLocal()}</small>
                </Toast.Header>
                <Toast.Body className={tipo === 'exito' || tipo === 'error' ? 'text-white' : ''}>
                    {mensaje}
                </Toast.Body>
            </Toast>
        </ToastContainer>
    );
}

export default NotificacionOperacion;