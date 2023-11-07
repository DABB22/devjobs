
//! otra forma de importar el modelo de vacante
// const Vavante = require('../models/Vacantes')

const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre : req.user.nombre,
        imagen : req.user.imagen
    })
}

// agrega las vacantes a la base de datos
exports.agregarVacante = async (req, res) => {
    // console.log(req.body)
    const vacante = new Vacante(req.body);

    // usuario autor de la vacante
    vacante.autor = req.user._id;

    // crear arreglo de habilidades (skills)
    vacante.skills = req.body.skills.split(',');

    // almacenarlo en la base de datos
    const nuevaVacante = await vacante.save()

    // redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);

}

// muestra una vacante
exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor');
    
    // si no hay resultados:
    if(!vacante) return next(); // pasamos al siguiente middleware

    // Si sí hay resultados mostramos la vista de la vacante
    res.render('vacante', {
        vacante: vacante.toJSON(),
        nombrePagina : vacante.titulo,
        barra: true
    })
}

// muestra formulario para editar vacante
exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url});

    if(!vacante) return next();

    res.render('editar-vacante', {
        vacante: vacante.toJSON(),
        nombrePagina : `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre : req.user.nombre,
        imagen : req.user.imagen
    })
}

// ejecuta el POST para el envio de la información para actualizar los datos de la vacante.
exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(','); // lo convertimos a un arreglo ya que viene como una cadena de texto separadas por comas

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {
        new: true, // nos trae la vacante con los ultimos datos 
        runValidators: true // para que todo lo que colocamos en el modelo lo tome
    } ); // 1erParam: el dato con que vamos a buscar la vacante, 2doParam: con qué datos se va actualizar, 3erParam: objeto de opciones de configuración que podemos pasar

    res.redirect(`/vacantes/${vacante.url}`);
}

// Validar y Sanitizar los campos de las nuevas vacantes
exports.validarVacante = async (req, res, next) => {
    // vamos a utilizar de nueva cuenta express-validator
    // sanitizar los campos
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();

    // validar
    req.checkBody('titulo', 'Agrega un Titulo a la Vacante').notEmpty();
    req.checkBody('empresa', 'Agrega una Empresa').notEmpty();
    req.checkBody('ubicacion', 'Agrega una Ubicación').notEmpty();
    req.checkBody('contrato', 'Selecciona el Tipo de Contrato').notEmpty();
    req.checkBody('skills', 'Agrega al menos una habilidad').notEmpty();

    const errores = req.validationErrors();

    if(errores) {
        // Recargar la vista con los errores
        req.flash('error', errores.map(error => error.msg));
        // console.log(req.flash())
        const vacante = await Vacante.findOne({ url: req.params.url});
        if(!vacante){
            res.render('nueva-vacante', {
                nombrePagina: 'Nueva Vacante',
                tagline: 'Llena el formulario y publica tu vacante',
                cerrarSesion: true,
                nombre : req.user.nombre,
                mensajes: req.flash()
            })
        }else{
            res.render('editar-vacante', {
                vacante: req.body,
                nombrePagina : `Editar - ${vacante.titulo}`,
                cerrarSesion: true,
                nombre : req.user.nombre,
                mensajes: req.flash(),
                imagen : req.user.imagen
            })
        }

        return;
    }

    next(); // siguiente middleware
}

exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;
    console.log(id)
    const vacante = await Vacante.findById(id);

    // verificamos que el autor sea el mismo que está intentando eliminar la vacante
    if(verificarAutor(vacante, req.user)){
        //- Todo bien, si es el usuario, eliminar
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');
    } else {
        // no permitido
        res.status(403).send('Error')
    }
}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor.equals(usuario._id)) { // usamos un metodo de mongoose
        return false
    } 
    return true;
}


// Subir archivos en PDF
exports.subirCV  =  (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 100kb');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('back'); // los regresa a la misma pagina donde están 
            return;
        } else {
            return next();
        }
    });
}


// Opciones de Multer
const configuracionMulter = {
    limits : { fileSize : 100000 },
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv');
        },
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'application/pdf' ) {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato No Válido')); // esta es una forma de generar errores con express, y algo a tener en cuenta es que para acceder a estos errores personalizados se debe hacer uso de error.message
        }
    }
}

const upload = multer(configuracionMulter).single('cv');

// almacenar los candidatos en la BD - POST formularioCandidatos
exports.contactar = async (req, res, next) => {

    const vacante = await Vacante.findOne({ url : req.params.url});

    // sino existe la vacante pasar al siguiente middleware
    if(!vacante) return next();

    //- si todo está bien, construir el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv : req.file.filename
    }

    // almacenar la vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    // mensaje flash y redireccion
    req.flash('correcto', 'Se envió tu Curriculum Correctamente');
    res.redirect('/');
}

exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id);

    if(vacante.autor != req.user._id.toString()){
        return next();
    } 

    if(!vacante) return next();

    res.render('candidatos', {
        nombrePagina : `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion : true,
        nombre : req.user.nombre,
        imagen : req.user.imagen,
        candidatos : vacante.candidatos.map(candidato => candidato.toJSON())
    })
}

// Buscador de Vacantes
exports.buscarVacantes = async (req, res) => {
    const vacantes = await Vacante.find({
        $text : {
            $search : req.body.q
        }
    });
    // $text y $search es lo que se conoce como agregadores en MongoDB y podemos hacer uso de ellos, al final mongoose es el ORM pero todo lo que ya tienes en MongoDB puede ser utilizado sin necesidad de mongoose en este caso.

    // mostrar las vacantes
    res.render('home', {
        nombrePagina : `Resultados para la búsqueda : ${req.body.q}`, 
        barra: true,
        vacantes: vacantes.map( vacante => vacante.toJSON())
    })
}