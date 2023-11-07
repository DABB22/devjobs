import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

     // Limpiar las alertas
     let alertas = document.querySelector('.alertas');

     if(alertas) {
         limpiarAlertas();
     }

    if(skills) {
        skills.addEventListener('click', agregarSkills); // escucha por el evento de click en el formulario de crear vacante y la agrega al set de skills
        
        // una vez que estamos en editar, llamar la función que lee las skilss que ya tiene registrada una vacante
        skillsSeleccionados();
    }

    // seleccionamos el bloque de panel de administración donde tenemos agrupadas todas las vacantes
    const vacantesListado = document.querySelector('.panel-administracion');
    // si hay vacantes validaremos acciones con el click para la eliminación, edición o ver candidatos
    if(vacantesListado){
        vacantesListado.addEventListener('click', accionesListado);
    }

})

const skills = new Set(); // set para agrupar las skills que se seleccionen en el formulario

const agregarSkills = e => {

    if(e.target.tagName === 'LI'){
        if(e.target.classList.contains('activo')){
            // quitarlo del set y quitar la clase
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        } else {
            // agregarlo al set y agregar la clase
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
            console.log(skills);
        }
    } 

    const skillsArray = [...skills] // haciendo uso del objectLitera hacemos una copia del Set de skills para convertirla arreglo
    document.querySelector('#skills').value = skillsArray;
}

const skillsSeleccionados = () => {
    // document.querySelectorAll('.lista-conocimientos .activo') // esto nos arroja el grupo de datos pero como nodeList
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo') ); // con este código lo convertimos en un arreglo para que sea manejable la información 
    console.log(document.querySelectorAll('.lista-conocimientos .activo'));
    

    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent);
    })

    // inyectarlo en el hidden
    const skillsArray = [...skills]; // haciendo uso del objectLitera hacemos una copia del Set de skills para convertirla arreglo
    document.querySelector('#skills').value = skillsArray;
}

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas'); // seleccionamos el div de alertas
    const interval = setInterval(() => { // asignamos un set interval para que cada 2seg se elimine una alerta
        if(alertas.children.length > 0 ) { // revisamos si tiene hijos este div
            alertas.removeChild(alertas.children[0]); // en caso de que sí vamos eliminando cada hijo
        } else if (alertas.children.length === 0 ) { // si el div de alertas ya no tiene hijos
            alertas.parentElement.removeChild(alertas); // seleccionamos el elemento padre del div de alertar y eliminamos el div de alertas
            clearInterval(interval); // limpiamos el interval para que se deje de ejecutar
        }
    }, 2000);
}

// Eliminar vacantes
const accionesListado = e => {
    e.preventDefault();

    if(e.target.dataset.eliminar){
        // eliminar por axios
        Swal.fire({
            title: '¿Confirmar Eliminación?',
            text: "Una vez eliminada, no se puede recuperar",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, Eliminar',
            cancelButtonText : 'No, Cancelar'
          }).then((result) => {
            
            if (result.value) {

                // enviar la petición con axios
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

                // Axios para eliminar el registro
                axios.delete(url, { params: {url} }) // pasamos la url, parametros que queremos enviar en este caso la url también
                    .then(function(respuesta) { // en caso de que haya una respuesta 
                        // console.log(respuesta)
                        if(respuesta.status === 200) {
                            Swal.fire(
                                'Eliminado',
                                respuesta.data,
                                'success'
                            );

                            //Eliminar del DOM
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            type:'error',
                            title: 'Hubo un error',
                            text: 'No Se pudo eliminar'
                        })
                    })
            }
          })
    }  else if(e.target.tagName === 'A') { // si el click es sobre la etiqueta anchor 'a' enlace de candidatos y editar, se debe redirigir a la ruta que apunta cada enlace
        window.location.href = e.target.href;
    }
}