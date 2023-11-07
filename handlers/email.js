const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util'); // va a ser necesario para loq ue viene siendo como el callback una vez que se envie el correo

let transport = nodemailer.createTransport({
    host : emailConfig.host,
    port : emailConfig.port,
    auth: {
        user : emailConfig.user,
        pass: emailConfig.pass
    }
});

// Utilizar templates de Handlebars
transport.use('compile', hbs({
    viewEngine: {
        extName: '.handlebars',
        partialsDir: __dirname+'/../views/emails',
        layoutsDir: __dirname+'/../views/emails',
        defaultLayout: 'reset.handlebars',
      },
    viewPath: __dirname+'/../views/emails',
    extName: '.handlebars'
}));

exports.enviar = async (opciones) => {

    const opcionesEmail = {
        from:'devJobs <noreply@devjobs.com',
        to: opciones.usuario.email,
        subject : opciones.subject, 
        template: opciones.archivo,
        context: { // aqui definimos las variables que le vamos a pasar al archivo
            resetUrl : opciones.resetUrl
        },
    };

    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, opcionesEmail);
}

