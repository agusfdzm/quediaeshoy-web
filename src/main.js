// elementos del html
const fechaActualElement = document.getElementById('fecha-actual');
const eventoHistoricoElement = document.getElementById('evento-historico');
const cargandoElement = document.getElementById('cargando');

// formatear fecha en español
function formatearFechaActual() {
    const ahora = new Date();
    const opciones = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    return ahora.toLocaleDateString('es-ES', opciones);
}

// generar número aleatorio basado en fecha
function obtenerAleatorioConSemilla(fecha) {
    const semilla = fecha.getFullYear() * 10000 + (fecha.getMonth() + 1) * 100 + fecha.getDate();
    const x = Math.sin(semilla) * 10000;
    return x - Math.floor(x);
}

// traducir texto a español
async function traducirAEspanol(texto) {
    try {
        const respuesta = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=en|es`);
        const datos = await respuesta.json();
        
        if (datos.responseStatus === 200) {
            return datos.responseData.translatedText;
        } else {
            return texto;
        }
    } catch (error) {
        console.error('error al traducir:', error);
        return texto;
    }
}

// obtener efeméride del día
async function obtenerEventosHistoricos() {
    try {
        const ahora = new Date();
        const mes = ahora.getMonth() + 1;
        const dia = ahora.getDate();
        
        cargandoElement.style.display = 'flex';
        eventoHistoricoElement.style.display = 'none';
        
        const respuesta = await fetch(`https://history.muffinlabs.com/date/${mes}/${dia}`);
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const datos = await respuesta.json();
        
        const eventos = datos.data.Events || [];
        if (eventos.length === 0) {
            throw new Error('No hay eventos históricos para hoy');
        }
        
        const indiceAleatorio = Math.floor(obtenerAleatorioConSemilla(ahora) * eventos.length);
        const eventoDelDia = eventos[indiceAleatorio];
        
        const textoTraducido = await traducirAEspanol(eventoDelDia.text);
        
        eventoHistoricoElement.innerHTML = `
            <span class="ano-evento">${eventoDelDia.year}</span>
            <div class="texto-evento">${textoTraducido}</div>
        `;
        
        cargandoElement.style.display = 'none';
        eventoHistoricoElement.style.display = 'block';
        
    } catch (error) {
        console.error('error al obtener eventos:', error);
        
        eventoHistoricoElement.innerHTML = `
            <div class="texto-evento">
                Oops, no pudimos cargar la efeméride de hoy. 
                ¡Inténtalo de nuevo en un rato!
            </div>
        `;
        
        cargandoElement.style.display = 'none';
        eventoHistoricoElement.style.display = 'block';
    }
}

// inicializar aplicación
function inicializarAplicacion() {
    fechaActualElement.textContent = formatearFechaActual();
    obtenerEventosHistoricos();
}

// empezar cuando la página esté lista
document.addEventListener('DOMContentLoaded', inicializarAplicacion);

// actualizar cada día a medianoche
function programarSiguienteActualizacion() {
    const ahora = new Date();
    const manana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
    const tiempoHastaMedianoche = manana - ahora;
    
    setTimeout(() => {
        inicializarAplicacion();
        programarSiguienteActualizacion();
    }, tiempoHastaMedianoche);
}

// programar actualizaciones diarias
programarSiguienteActualizacion();
