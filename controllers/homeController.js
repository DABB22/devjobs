const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.mostrarTrabajos = async (req, res, next) => {

    const vacantes = await Vacante.find();

    if(!vacantes) return next();

/*  //! Note of mongoose and handlebars
    //* The models of Mongoose are classes and the properties are not "own properties" of the parent object.
    //* The cleanest method is to make sure the the handlebars-input is a proper plain javascript object. This can be done in Mongoose, by calling toJSON() or toObject 
*/

    res.render('home', {
        nombrePagina : 'devJobs',
        tagline: 'Encuentra y Pública Trabajos para Desarrolladores Web',
        barra: true,
        boton: true,
        vacantes: vacantes.map(vacante => vacante.toJSON()) 
    })
}