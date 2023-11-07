
const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars'); // es una convención usar exphbs (exp de express y hbs de handlebars)
const path = require('path');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
// const MongoStore = require('connect-mongo')(session); // pasamos los valores de session al paquete connect-mongo
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator'); // para validaciones 
const flash = require('connect-flash'); // para capturar los mensajes de alertas y errores
const createError = require('http-errors'); // libreria para generar mensajes de error
const passport = require('./config/passport');

require('dotenv').config({ path : 'variables.env'});

const app = express(); // creamos la aplicación

//* validación de campos con express-validator
app.use(expressValidator());

//* habilitar body-parser para la lectura de formulario y de archivos que se suben
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//* habilitar handlebars como view
app.engine('handlebars', 
    exphbs({ // variable que va contener todos los metodos express-handlebars
        defaultLayout: 'layout', // siempre tienes que definirle un layout a handlebars
        helpers: require('./helpers/handlebars') // ubicación de los helpers de handlebars que vamos a estar creando para su uso con el templateEngine
    })
);
app.set('view engine', 'handlebars');

//* static files // archivos estaticos donde debe buscarlos 
app.use(express.static(path.join(__dirname, 'public')));

//* almacenar la conexión de mongo a una sesión para no estar nos autenticando todo el tiempo
//* para ello vamos a crear una sesión
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl : process.env.DATABASE })
}));



// inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//* Alertas y flash messages
app.use(flash());


//* Crear nuestro middleware que va almacenar los mensajes y qué usuario está autenticado
app.use((req, res, next) => {
    res.locals.mensajes = req.flash(); // res.locals.mensajes -> variables locales y asi los almacenamos // cuando haya un flash(alerta/mensaje) que enviar se manda a llamar el metodo y se almacenan en las variables locales.
    next();
});



app.use('/', router());

// 404 pagina no existente
app.use((req, res, next) => {
    return next(createError(404, 'No Encontrado')); // toma 3parametros, 1ro el código a implementar, 2do mensaje de error, 3ro no es tan importante y juan casi nunca lo ha usado
})

// Administración de los errores
app.use((error, req, res, next) => { // muy importante: cuando se genera un error el error es lo primero que se pasa.
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
});

// Dejamos que nuestro hosting nos asigne el puerto
const host = '0.0.0.0';
const port = process.env.PORT;
app.listen(port, host, () => {
    console.log('El servidor está corriendo ')
});

// asignación local del puerto en nuestro entorno de desarrollo
// app.listen(process.env.PUERTO);