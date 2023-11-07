const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const multer = require('multer');
const shortid = require('shortid');

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) { // metodo que llamaremos upload para subir la imagen, es una función que debemos escribir nosotros y se debe comunicar con multer.
        if(error) { // si hay un error vamor a ir filtrando los errores
            // console.log(error)
            if(error instanceof multer.MulterError) { // errores de multer - si se presenta un error vamos a tener una instancia de error de multer y lo va almacenar
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 100kb ');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                // console.log(error.message)
                req.flash('error', error.message);
            }
            res.redirect('/administracion');
            return; //  
        }  else {
            return next(); // en caso de que no haya errores se ejecuta este código para que se vaya al siguiente middleware
        }
    });
    // next();
}

// Opciones de Multer
const configuracionMulter = {
    limits : { fileSize : 100000 }, // limite de las imagenes, formato en bites 1mb -> 1.000.000 bites
    storage: fileStorage = multer.diskStorage({ // esto es donde se van almacenar los archivos, en este caso se indica que se guardaran en el servidor.
        destination : (req, file, cb) => { // destino/ruta donde se va a guardar
            // console.log(__dirname)
            cb(null, __dirname+'../../public/uploads/perfiles');
        }, 
        filename : (req, file, cb) => { // nombre de como se va a llamar el archivo
            // console.log(file)
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) { // 
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            // cb(null,false);
            cb(new Error('Formato No Válido'));
        }
    }
}

// definiendo la función upload --  multer toma algunos parametros/opciones -- .single('nombredelcampoaleer')
const upload = multer(configuracionMulter).single('imagen');

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
    })
}

exports.validarRegistro = (req, res, next) => {

    // sanitizar
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();

    // validar
    req.checkBody('nombre', 'El Nombre es Obligatorio').notEmpty();
    req.checkBody('email', 'El email debe ser valido').isEmail();
    req.checkBody('password', 'El password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'Confirmar password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);

    const errores = req.validationErrors();

    if(errores){
        // si hay errores
        req.flash('error', errores.map(error => error.msg)); // recorremos el array de errores y lo asignamos a flash.error

        res.render('crear-cuenta', {
            nombrePagina: 'Crea tu cuenta en devJobs',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
            mensajes: req.flash()
        });
        return;
    }

    // Si toda la validación es correcta
    next();
}

exports.crearUsuario = async (req, res, next) => {

    // crear el usuario
    const usuario = new Usuarios(req.body);
    // const nuevoUsuario = await usuario.save();
    // if(!nuevoUsuario) return next();
    // res.redirect('/iniciar-sesion');

    // podemos manejar los errores de Node de muchas formas una es con un trycatch
    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error)
        res.redirect('/crear-cuenta');
        // res.render('crear-cuenta', {
        //     nombrePagina: 'Crea tu cuenta en devJobs',
        //     tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
        //     mensajes: req.flash()
        // })
    }
}

// formulario para iniciar sesión
exports.formIniciarSesion = (req, res ) => {
    res.render('iniciar-sesion', {
        nombrePagina : 'Iniciar Sesión devJobs'
    })
}

// Form editar el Perfil
exports.formEditarPerfil = (req, res) => {
    const usuario = req.user.toJSON();
    res.render('editar-perfil', {
        nombrePagina : 'Edita tu perfil en devJobs',
        usuario,
        cerrarSesion: true,
        nombre : req.user.nombre,
        imagen : req.user.imagen
    })
}
// Guardar cambios editar perfil
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password) {
        usuario.password = req.body.password
    }

    if(req.file) {
        usuario.imagen = req.file.filename;
    }

    await usuario.save();

    req.flash('correcto', 'Cambios Guardados Correctamente');
    // redirect
    res.redirect('/administracion');
}

// sanitizar y validar el formulario de editar perfiles
exports.validarPerfil = (req, res, next) => {
    // sanitizar
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    if(req.body.password){
        req.sanitizeBody('password').escape();
    }
    // validar
    req.checkBody('nombre', 'El nombre no puede ir vacio').notEmpty();
    req.checkBody('email', 'El correo no puede ir vacio').notEmpty();

    const errores = req.validationErrors();

    if(errores) {
        req.flash('error', errores.map(error => error.msg));

        res.render('editar-perfil', {
            nombrePagina : 'Edita tu perfil en devJobs',
            usuario: req.user.toJSON(),
            cerrarSesion: true,
            nombre : req.user.nombre,
            imagen : req.user.imagen,
            mensajes : req.flash()
        });
        return
    }
    next(); // todo bien, siguiente middleware!
}
