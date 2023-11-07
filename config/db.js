const mongoose = require('mongoose'); // importamos mongoose
require('dotenv').config({path: 'variables.env'}); // importamos dotenv

mongoose.connect(process.env.DATABASE, {useNewUrlParser:true, useUnifiedTopology:true}); // conectar la base de datos, el metodo .connect toma dos parametros, uno es la uri(uri de la BD de mongo con toda la info) y el segundo son las opciones
//se recomienda como opciones pasarle {useNewUrlParser:true, useUnifiedTopology:true}

mongoose.connection.on('error', (error) => { //en caso de algun error de conexión podemos debuguear el error con este código
    console.log(error);
})
// importar los modelos // para que se agregen a la colección de la base de datos
require('../models/Usuarios');
require('../models/Vacantes');