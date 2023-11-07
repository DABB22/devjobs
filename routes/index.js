const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');



module.exports = () => {

    router.get('/', homeController.mostrarTrabajos);

    //* Crear Vacantes
    router.get('/vacantes/nueva',  
        authController.verificarUsuario, //* protegemos la ruta verificando que el usuario esté autenticado
        vacantesController.formularioNuevaVacante
    );
    router.post('/vacantes/nueva', 
        authController.verificarUsuario, //* protegemos la ruta verificando que el usuario esté autenticado
        vacantesController.validarVacante, 
        vacantesController.agregarVacante
    );

    //* Mostrar Vacante (singular)
    router.get('/vacantes/:url',vacantesController.mostrarVacante );

    //* Editar Vacante
    router.get('/vacantes/editar/:url', 
        authController.verificarUsuario, //* protegemos la ruta verificando que el usuario esté autenticado
        vacantesController.formEditarVacante
    );
    router.post('/vacantes/editar/:url', 
        authController.verificarUsuario, //* protegemos la ruta verificando que el usuario esté autenticado
        vacantesController.validarVacante,
        vacantesController.editarVacante
    );

    //* Eliminar Vacantes
    router.delete('/vacantes/eliminar/:id', 
        vacantesController.eliminarVacante
    );

    //* Crear Cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', 
        usuariosController.validarRegistro,
        usuariosController.crearUsuario
    );

    //* Autenticar Usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    
    //* cerrar sesion
    router.get('/cerrar-sesion',
        authController.verificarUsuario,
        authController.cerrarSesion
    );

    // Resetear password (emails)
    router.get('/reestablecer-password', authController.formReestablecerPassword);
    router.post('/reestablecer-password', authController.enviarToken);

    // Resetear Password ( Almacenar en la BD )
    router.get('/reestablecer-password/:token', authController.reestablecerPassword);
    router.post('/reestablecer-password/:token', authController.guardarPassword);


    //* Panel de administración
    router.get('/administracion',
        authController.verificarUsuario, //* protegemos la ruta verificando que el usuario esté autenticado
        authController.mostrarPanel
    );

    //* Editar Perfil
    router.get('/editar-perfil', 
        authController.verificarUsuario, //* protegemos la ruta verificando que el usuario esté autenticado
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil', 
        authController.verificarUsuario, //* protegemos la ruta verificando que el usuario esté autenticado
        // usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfil
    )

    // Recibir Mensajes de Candidatos
    router.post('/vacantes/:url', 
        vacantesController.subirCV,
        vacantesController.contactar
    );

    // Muestra los candidatos por vacante
    router.get('/candidatos/:id', 
        authController.verificarUsuario, //* protegemos la ruta verificando que el usuario esté autenticado
        vacantesController.mostrarCandidatos
    )

    // Buscador de Vacantes
    router.post('/buscador', vacantesController.buscarVacantes);


    return router;
}