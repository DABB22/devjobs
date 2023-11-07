const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');

passport.use(new LocalStrategy({ //* definimos los campos que va a validar para el inicio de sesión, email y password
    usernameField : 'email',
    passwordField : 'password'
    }, async (email, password, done) => { //* función que va a interactuar con la bd - done(viene siendo como el next)
        const usuario = await Usuarios.findOne({ email });
        if(!usuario) return done(null, false, { //* done toma dos parametros y una configuración: (null es el mensaje de error en caso de que haya, usuarios no porque se supone que no hay usuarios, opciones)
            message: 'Usuario No Existente'
        });

        // el usuario existe, vamos a verificarlo
        const verificarPass = usuario.compararPassword(password); // nos apoyamos del metodo creado en el modelo de usuario .compararPassword
        if(!verificarPass) return done(null, false, {
            message: 'Password Incorrecto'
        });

        // Usuario existe y el password es correcto
        return done(null, usuario);
}));


passport.serializeUser((usuario, done) => done(null, usuario._id));

passport.deserializeUser(async (id, done) => {
    // const usuario = await Usuarios.findById(id);
    const usuario = await Usuarios.findById(id).exec();
    return done(null, usuario);
});

module.exports = passport;