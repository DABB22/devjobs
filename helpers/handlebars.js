module.exports = {
    seleccionarSkills : (seleccionadas = [], opciones) => { // parametros que se pasan por default al helper de handlebars

        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress', 'Nest'];

        let html = '';
        skills.forEach(skill => {
            html += `
                <li ${seleccionadas.includes(skill) ? ' class="activo"' : ''}>${skill}</li> 
            `; // el .include() revisa si un dato existe en un arreglo y devuelve true o false
        });

        return opciones.fn().html = html;
    },

    tipoContrato: (seleccionado, opciones) => { // parametros que se pasan por default al helper de handlebars
        return opciones.fn(this).replace(
            new RegExp(` value="${seleccionado}"`), '$& selected="selected"' // el signo de $& significa que va a inyectar un string
        ); // este código recorre las opciones y cuando encuentre la condición indicada se va a seleccionar 
    },

    mostrarAlertas: (errores = {}, alertas ) => {
        const categoria = Object.keys(errores); // nos permite traernos la llave de los objetos
        
        let html = '';
        if(categoria.length) {
            errores[categoria].forEach(error => {
                html += `<div class="${categoria} alerta">
                    ${error}
                </div>`;
            })
        }
        return alertas.fn().html = html;
    }

}