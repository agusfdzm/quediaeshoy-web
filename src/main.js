// elementos del html
const fechaActualElement = document.getElementById('fecha-actual');
const eventoHistoricoElement = document.getElementById('evento-historico');
const cargandoElement = document.getElementById('cargando');
const contadorElement = document.getElementById('contador');
const actualElement = document.getElementById('actual');
const totalElement = document.getElementById('total');
const btnAnterior = document.getElementById('btn-anterior');
const btnSiguiente = document.getElementById('btn-siguiente');
const selectMes = document.getElementById('select-mes');
const selectDia = document.getElementById('select-dia');
const btnHoy = document.getElementById('btn-hoy');

// variables globales
let efemerides = [];
let indiceActual = 0;
const maxEfemerides = 5;
let fechaSeleccionada = new Date();

// generar año aleatorio
function generarAnoAleatorio() {
    return Math.floor(Math.random() * 100) + 1900; // años entre 1900 y 1999
}

// formatear fecha en español
function formatearFechaActual(fecha = new Date()) {
    const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return fecha.toLocaleDateString('es-ES', opciones);
}

// generar número aleatorio basado en fecha
function obtenerAleatorioConSemilla(fecha) {
    const semilla = (fecha.getMonth() + 1) * 100 + fecha.getDate();
    const x = Math.sin(semilla) * 10000;
    return x - Math.floor(x);
}

// animación de fade out
function fadeOut(elemento, callback) {
    elemento.classList.add('fade-out');
    setTimeout(() => {
        callback();
        elemento.classList.remove('fade-out');
    }, 300);
}

// animación de fade in
function fadeIn(elemento) {
    elemento.classList.add('fade-in');
    setTimeout(() => {
        elemento.classList.remove('fade-in');
    }, 300);
}

// traducir texto a español
async function traducirAEspanol(texto) {
    try {
        console.log('intentando traducir:', texto);
        
        const respuesta = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(texto)}`);
        
        if (respuesta.ok) {
            const datos = await respuesta.json();
            const traduccion = datos[0][0][0];
            
            if (traduccion) {
                console.log('traducción exitosa:', traduccion);
                return traduccion;
            }
        }
        
        console.log('error en traducción, usando texto original');
        return texto;
        
    } catch (error) {
        console.error('error al traducir:', error);
        return texto;
    }
}

// mostrar efeméride actual con animación
function mostrarEfemerideActual() {
    if (efemerides.length === 0) return;
    
    // animación de fade out
    fadeOut(eventoHistoricoElement, () => {
        const efemeride = efemerides[indiceActual];
        eventoHistoricoElement.innerHTML = `
            <span class="ano-evento">${efemeride.year}</span>
            <div class="texto-evento">${efemeride.textoTraducido}</div>
        `;
        
        actualElement.textContent = indiceActual + 1;
        totalElement.textContent = efemerides.length;
        
        // ocultar botón anterior si es la primera efeméride
        btnAnterior.style.display = indiceActual === 0 ? 'none' : 'inline-block';
        // ocultar botón siguiente si es la última efeméride
        btnSiguiente.style.display = indiceActual === efemerides.length - 1 ? 'none' : 'inline-block';
        
        // animación de fade in
        fadeIn(eventoHistoricoElement);
    });
}

// siguiente efeméride
function siguienteEfemeride() {
    if (indiceActual < efemerides.length - 1) {
        indiceActual++;
        mostrarEfemerideActual();
    }
}

// anterior efeméride
function anteriorEfemeride() {
    if (indiceActual > 0) {
        indiceActual--;
        mostrarEfemerideActual();
    }
}

// obtener múltiples efemérides
async function obtenerEventosHistoricos(fecha = new Date()) {
    try {
        const mes = fecha.getMonth() + 1;
        const dia = fecha.getDate();
        
        console.log('buscando efemérides para:', dia, '/', mes);
        
        cargandoElement.style.display = 'flex';
        eventoHistoricoElement.style.display = 'none';
        contadorElement.style.display = 'none';
        
        const respuesta = await fetch(`http://history.muffinlabs.com/date/${mes}/${dia}`);
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const datos = await respuesta.json();
        
        const eventos = datos.data.Events || [];
        if (eventos.length === 0) {
            throw new Error('No hay eventos históricos para esta fecha');
        }
        
        console.log('eventos encontrados:', eventos.length);
        
        // seleccionar hasta 5 eventos únicos
        efemerides = [];
        const eventosSeleccionados = new Set();
        
        for (let i = 0; i < Math.min(maxEfemerides, eventos.length); i++) {
            const semilla = (fecha.getMonth() + 1) * 100 + fecha.getDate() + i;
            const x = Math.sin(semilla) * 10000;
            const indiceAleatorio = Math.floor((x - Math.floor(x)) * eventos.length);
            
            if (!eventosSeleccionados.has(indiceAleatorio)) {
                eventosSeleccionados.add(indiceAleatorio);
                const evento = eventos[indiceAleatorio];
                
                console.log('traduciendo evento:', evento.text);
                const textoTraducido = await traducirAEspanol(evento.text);
                console.log('traducción:', textoTraducido);
                
                efemerides.push({
                    year: evento.year,
                    textoTraducido: textoTraducido
                });
            }
        }
        
        console.log('efemérides seleccionadas:', efemerides.length);
        
        indiceActual = 0;
        
        cargandoElement.style.display = 'none';
        eventoHistoricoElement.style.display = 'block';
        contadorElement.style.display = 'block';
        
        // mostrar primera efeméride con animación
        mostrarEfemerideActual();
        
    } catch (error) {
        console.error('error al obtener eventos:', error);
        
        eventoHistoricoElement.innerHTML = `
            <div class="texto-evento">
                Oops, no pudimos cargar las efemérides de esta fecha. 
                ¡Inténtalo de nuevo en un rato!
            </div>
        `;
        
        cargandoElement.style.display = 'none';
        eventoHistoricoElement.style.display = 'block';
    }
}

// cambiar fecha seleccionada
function cambiarFecha(fecha) {
    // verificar que la fecha sea válida
    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
        console.error('fecha inválida:', fecha);
        return;
    }
    
    fechaSeleccionada = fecha;
    fechaActualElement.textContent = formatearFechaActual(fecha);
    
    obtenerEventosHistoricos(fecha);
}

// actualizar selects con fecha actual
function actualizarSelects(fecha) {
    selectMes.value = fecha.getMonth() + 1;
    selectDia.value = fecha.getDate();
}

// volver a hoy
function volverAHoy() {
    const hoy = new Date();
    actualizarSelects(hoy);
    cambiarFecha(hoy);
}

// inicializar aplicación
function inicializarAplicacion() {
    const hoy = new Date();
    actualizarSelects(hoy);
    cambiarFecha(hoy);
}

// eventos de navegación
btnSiguiente.addEventListener('click', siguienteEfemeride);
btnAnterior.addEventListener('click', anteriorEfemeride);
btnHoy.addEventListener('click', volverAHoy);

// evento de cambio de fecha
selectMes.addEventListener('change', cambiarFechaSeleccionada);
selectDia.addEventListener('change', cambiarFechaSeleccionada);

function cambiarFechaSeleccionada() {
    const mes = parseInt(selectMes.value);
    const dia = parseInt(selectDia.value);
    const ano = generarAnoAleatorio();
    
    console.log('fecha seleccionada:', dia, '/', mes, '/', ano);
    
    const nuevaFecha = new Date(ano, mes - 1, dia);
    console.log('fecha creada:', nuevaFecha);
    
    // verificar que la fecha sea válida
    if (nuevaFecha.getMonth() === mes - 1 && nuevaFecha.getDate() === dia) {
        console.log('fecha válida, cambiando...');
        cambiarFecha(nuevaFecha);
    } else {
        console.error('fecha inválida:', nuevaFecha);
    }
}

// empezar cuando la página esté lista
document.addEventListener('DOMContentLoaded', inicializarAplicacion);

// actualizar cada día a medianoche
function programarSiguienteActualizacion() {
    const ahora = new Date();
    const manana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
    const tiempoHastaMedianoche = manana - ahora;
    
    setTimeout(() => {
        volverAHoy();
        programarSiguienteActualizacion();
    }, tiempoHastaMedianoche);
}

// programar actualizaciones diarias
programarSiguienteActualizacion();
