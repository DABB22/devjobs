
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // se coloca este Promise para que todas las respuestas de mongoose sean promises    
const slug = require('slug'); // para que nos genere las url
const shortid = require('shortid'); // para que nos genere id

//* Definimos el schema del modelo
const vacantesSchema =  new mongoose.Schema({
    titulo: {
        type: String, 
        required: 'El nombre de la vacante es obligatorio', // tiene validación ya mongoose, nos apoyaremos de flash para capturar estos mensajes
        // required: true, // tiene validación ya mongoose, nos apoyaremos de flash para capturar estos mensajes
        trim : true // elimina los espacios en blanco
    }, 
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        trim: true,
        required: 'La ubicación es obligatoria'
        // required: true
    },
    salario: {
        type: String,
        default: 0,
        trim: true,
    },
    contrato: {
        type: String,
        trim: true,
    },
    descripcion: {
        type: String,
        trim: true,
    },
    url : {
        type: String,
        lowercase:true
    },
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv : String
    }], 
    autor : {
        type: mongoose.Schema.ObjectId, 
        ref: 'Usuarios', 
        required: 'El autor es obligatorio'
    }
});

// creamos la url con slug antes de guardar la vacante
vacantesSchema.pre('save', function(next) {

    // crear la url
    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`;

    next();
})

// Crear un indice //! Siempre se recomienda crear un indice cuando implementas un buscador.
vacantesSchema.index({ titulo : 'text' });


module.exports = mongoose.model('Vacante', vacantesSchema);