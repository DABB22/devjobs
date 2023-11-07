const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const usuariosSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    nombre: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    }, 
    token: String,
    expira: Date, 
    imagen: String
});

// Método para hashear los passwords
usuariosSchema.pre('save', async function(next) { //esto es algo de mongoose, antes de que se guarde se realiza esta acción
    // si el password ya esta hasheado
    if(!this.isModified('password')) { // .isModified también es un metodo de mongooose
        return next(); // deten la ejecución
    }
    // si no esta hasheado
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
});

// Envia alerta cuando un usuario ya esta registrado - funciona con el unique que se le asigno al campo de email y se usa con post('save') porque es donde se corre ese unique 
usuariosSchema.post('save', function(error, doc, next) { // este metodo evita o previene que se inserte un registro con alguna condición ej correo unico no pueden haber dos usuarios con el mismo correo.
    if(error.name === 'MongoError' && error.code === 11000 ){
        next('Correo ya registrado'); // pasamos un error a next indicando el mensaje que queremos presentar al usuario.
    } else {
        next(error); // caso contrario pasamos el resto de errores que puedan ocurrir y que se ejecuten los siguientes middleware sin que se pierdan el resto de errores que puedan ocurrir
    }
});

// Autenticar Usuarios  // funciones que se van a ejecutar junto a este schema
usuariosSchema.methods = {
    compararPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Usuarios', usuariosSchema);