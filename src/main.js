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
const progresoActualElement = document.getElementById('progreso-actual');
const puntosIndicadoresElement = document.getElementById('puntos-indicadores');

// variables globales
let efemerides = [];
let indiceActual = 0;
const maxEfemerides = 5;
let fechaSeleccionada = new Date();

// iconos para diferentes tipos de eventos
const iconosEventos = {
    guerra: '⚔️',
    politica: '🏛️',
    ciencia: '🔬',
    tecnologia: '💻',
    arte: '🎨',
    musica: '🎵',
    deporte: '⚽',
    espacio: '🚀',
    medicina: '🏥',
    educacion: '📚',
    transporte: '🚗',
    comunicacion: '📱',
    economia: '💰',
    religion: '⛪',
    exploracion: '🗺️',
    invencion: '💡',
    descubrimiento: '🔍',
    independencia: '🏁',
    revolucion: '🔥',
    paz: '🕊️',
    default: '📅'
};

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

// determinar icono según el tipo de evento
function determinarIconoEvento(texto) {
    const textoLower = texto.toLowerCase();
    
    if (textoLower.includes('war') || textoLower.includes('battle') || textoLower.includes('conflict')) {
        return iconosEventos.guerra;
    } else if (textoLower.includes('president') || textoLower.includes('government') || textoLower.includes('election')) {
        return iconosEventos.politica;
    } else if (textoLower.includes('scientist') || textoLower.includes('discovery') || textoLower.includes('research')) {
        return iconosEventos.ciencia;
    } else if (textoLower.includes('computer') || textoLower.includes('technology') || textoLower.includes('software')) {
        return iconosEventos.tecnologia;
    } else if (textoLower.includes('artist') || textoLower.includes('painting') || textoLower.includes('art')) {
        return iconosEventos.arte;
    } else if (textoLower.includes('music') || textoLower.includes('song') || textoLower.includes('concert')) {
        return iconosEventos.musica;
    } else if (textoLower.includes('sport') || textoLower.includes('game') || textoLower.includes('championship')) {
        return iconosEventos.deporte;
    } else if (textoLower.includes('space') || textoLower.includes('moon') || textoLower.includes('satellite')) {
        return iconosEventos.espacio;
    } else if (textoLower.includes('medical') || textoLower.includes('hospital') || textoLower.includes('doctor')) {
        return iconosEventos.medicina;
    } else if (textoLower.includes('university') || textoLower.includes('school') || textoLower.includes('education')) {
        return iconosEventos.educacion;
    } else if (textoLower.includes('car') || textoLower.includes('train') || textoLower.includes('transport')) {
        return iconosEventos.transporte;
    } else if (textoLower.includes('phone') || textoLower.includes('communication') || textoLower.includes('internet')) {
        return iconosEventos.comunicacion;
    } else if (textoLower.includes('economy') || textoLower.includes('money') || textoLower.includes('bank')) {
        return iconosEventos.economia;
    } else if (textoLower.includes('church') || textoLower.includes('religion') || textoLower.includes('pope')) {
        return iconosEventos.religion;
    } else if (textoLower.includes('explorer') || textoLower.includes('expedition') || textoLower.includes('map')) {
        return iconosEventos.exploracion;
    } else if (textoLower.includes('invent') || textoLower.includes('patent') || textoLower.includes('innovation')) {
        return iconosEventos.invencion;
    } else if (textoLower.includes('independence') || textoLower.includes('freedom') || textoLower.includes('liberation')) {
        return iconosEventos.independencia;
    } else if (textoLower.includes('revolution') || textoLower.includes('rebellion') || textoLower.includes('uprising')) {
        return iconosEventos.revolucion;
    } else if (textoLower.includes('peace') || textoLower.includes('treaty') || textoLower.includes('agreement')) {
        return iconosEventos.paz;
    }
    
    return iconosEventos.default;
}

// actualizar barra de progreso
function actualizarBarraProgreso() {
    if (efemerides.length === 0) return;
    
    const porcentaje = ((indiceActual + 1) / efemerides.length) * 100;
    progresoActualElement.style.width = `${porcentaje}%`;
}

// crear puntos indicadores
function crearPuntosIndicadores() {
    puntosIndicadoresElement.innerHTML = '';
    
    for (let i = 0; i < efemerides.length; i++) {
        const punto = document.createElement('div');
        punto.className = 'punto-indicador';
        punto.dataset.index = i;
        
        if (i === indiceActual) {
            punto.classList.add('activo');
        } else if (i < indiceActual) {
            punto.classList.add('completado');
        }
        
        punto.addEventListener('click', () => {
            irAEfemeride(i);
        });
        
        puntosIndicadoresElement.appendChild(punto);
    }
}

// ir a una efeméride específica
function irAEfemeride(indice) {
    if (indice >= 0 && indice < efemerides.length) {
        indiceActual = indice;
        mostrarEfemerideActual();
        actualizarBarraProgreso();
        actualizarPuntosIndicadores();
    }
}

// actualizar puntos indicadores
function actualizarPuntosIndicadores() {
    const puntos = puntosIndicadoresElement.querySelectorAll('.punto-indicador');
    
    puntos.forEach((punto, index) => {
        punto.classList.remove('activo', 'completado');
        
        if (index === indiceActual) {
            punto.classList.add('activo');
        } else if (index < indiceActual) {
            punto.classList.add('completado');
        }
    });
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
        const icono = determinarIconoEvento(efemeride.textoTraducido);
        
        eventoHistoricoElement.innerHTML = `
            <div class="encabezado-evento">
                <div class="icono-evento">${icono}</div>
                <span class="ano-evento">${efemeride.year}</span>
            </div>
            <div class="texto-evento">${efemeride.textoTraducido}</div>
        `;
        
        actualElement.textContent = indiceActual + 1;
        totalElement.textContent = efemerides.length;
        
        // ocultar botón anterior si es la primera efeméride
        btnAnterior.style.display = indiceActual === 0 ? 'none' : 'inline-block';
        // ocultar botón siguiente si es la última efeméride
        btnSiguiente.style.display = indiceActual === efemerides.length - 1 ? 'none' : 'inline-block';
        
        // actualizar indicadores
        actualizarBarraProgreso();
        actualizarPuntosIndicadores();
        
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
        progresoActualElement.style.width = '0%';
        puntosIndicadoresElement.innerHTML = '';
        
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
        
        // crear puntos indicadores
        crearPuntosIndicadores();
        
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
