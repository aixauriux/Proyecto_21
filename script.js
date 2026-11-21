
const reloj = document.getElementById("reloj");
const tipo = document.getElementById("tipo");
const sesiones = document.getElementById("sesiones");
const mensaje = document.getElementById("mensaje");

const botones = {
    trabajo: document.getElementById("trabajo"),
    corto: document.getElementById("corto"),
    largo: document.getElementById("largo")
};

const tiempos = {
    trabajo: 25,
    corto: 5,
    largo: 15
};

const nombres = {
    trabajo: "Tiempo de trabajo",
    corto: "Descanso corto",
    largo: "Descanso largo"
};

let sesionActual = "trabajo";
let restante = tiempos.trabajo * 60;
let completadas = 0;
let intervalo = null;
let finalizaEn = 0;

// Mostrar el tiempo en pantalla
function mostrarTiempo() {
    const minutos = Math.floor(restante / 60);
    const segundos = restante % 60;

    reloj.textContent =
        String(minutos).padStart(2, "0") + ":" +
        String(segundos).padStart(2, "0");
}

// Detener el reloj
function detener() {
    clearInterval(intervalo);
    intervalo = null;
}

// Cambiar el tipo de sesión
function cambiarSesion(nuevaSesion) {
    detener();

    sesionActual = nuevaSesion;
    restante = tiempos[nuevaSesion] * 60;
    tipo.textContent = nombres[nuevaSesion];

    for (let nombre in botones) {
        botones[nombre].classList.toggle(
            "activo", nombre === nuevaSesion
        );
    }

    mostrarTiempo();
}

// Sonido de finalización
function reproducirSonido() {
    try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        const audio = new Audio();
        const oscilador = audio.createOscillator();
        const volumen = audio.createGain();

        oscilador.connect(volumen);
        volumen.connect(audio.destination);

        oscilador.frequency.value = 750;
        volumen.gain.value = 0.15;

        oscilador.start();
        oscilador.stop(audio.currentTime + 0.4);
        oscilador.onended = () => audio.close();
    } catch (error) {
        console.log("No se pudo reproducir el sonido");
    }
}

// Finalizar una sesión
function finalizarSesion() {
    detener();
    reproducirSonido();

    if (sesionActual === "trabajo") {
        completadas++;
        sesiones.textContent = completadas;

        if (completadas % 4 === 0) {
            cambiarSesion("largo");
        } else {
            cambiarSesion("corto");
        }
    } else {
        cambiarSesion("trabajo");
    }

    mensaje.textContent = "¡Sesión terminada! Puedes iniciar la siguiente.";
}

// Iniciar o reanudar
function iniciar() {
    if (intervalo !== null) return;

    mensaje.textContent = "";
    finalizaEn = Date.now() + restante * 1000;

    intervalo = setInterval(() => {
        restante = Math.max(
            0,
            Math.ceil((finalizaEn - Date.now()) / 1000)
        );

        mostrarTiempo();

        if (restante === 0) {
            finalizarSesion();
        }
    }, 250);
}

// Pausar
function pausar() {
    if (intervalo === null) return;

    restante = Math.max(
        0,
        Math.ceil((finalizaEn - Date.now()) / 1000)
    );

    detener();
    mostrarTiempo();
}

// Reiniciar la sesión actual
function reiniciar() {
    cambiarSesion(sesionActual);
    mensaje.textContent = "";
}

// Guardar tiempos personalizados
function guardarConfiguracion() {
    const trabajo = Number(document.getElementById("tiempoTrabajo").value);
    const corto = Number(document.getElementById("tiempoCorto").value);
    const largo = Number(document.getElementById("tiempoLargo").value);

    const valores = [trabajo, corto, largo];

    if (valores.some(valor =>
        !Number.isInteger(valor) || valor < 1 || valor > 180
    )) {
        mensaje.textContent = "Ingresa tiempos entre 1 y 180 minutos.";
        return;
    }

    tiempos.trabajo = trabajo;
    tiempos.corto = corto;
    tiempos.largo = largo;

    cambiarSesion(sesionActual);
    mensaje.textContent = "Configuración guardada correctamente.";
}

// Eventos de los botones
document.getElementById("iniciar").addEventListener("click", iniciar);
document.getElementById("pausar").addEventListener("click", pausar);
document.getElementById("reiniciar").addEventListener("click", reiniciar);
document.getElementById("guardar").addEventListener("click", guardarConfiguracion);

botones.trabajo.addEventListener("click", () => cambiarSesion("trabajo"));
botones.corto.addEventListener("click", () => cambiarSesion("corto"));
botones.largo.addEventListener("click", () => cambiarSesion("largo"));

mostrarTiempo();
