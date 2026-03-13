// Selecciona el contenedor principal del slider (donde se encuentran las tarjetas)
const slider = document.querySelector('.galeria-2');

// Obtiene todas las tarjetas originales del slider y las convierte en un array
const originalCards = Array.from(document.querySelectorAll('.card'));

// Selecciona los puntos de paginación (los puntitos debajo del slider)
const dots = document.querySelectorAll('.pagination span');

// Guarda cuántas tarjetas originales existen
const numCards = originalCards.length;



// -----------------------------------------------------
// 1. CLONACIÓN PARA CREAR EL EFECTO DE SCROLL INFINITO
// -----------------------------------------------------

// A cada tarjeta original se le asigna un índice usando dataset
// Esto permite saber cuál tarjeta original representa cada clon
originalCards.forEach((card, index) => {
    card.dataset.index = index;
});

// Clonamos todas las tarjetas originales y las agregamos al FINAL
// cloneNode(true) clona todo el contenido interno también
originalCards.forEach(card => slider.appendChild(card.cloneNode(true)));

// Clonamos nuevamente las tarjetas pero las insertamos al PRINCIPIO
// reverse() invierte el orden para mantener la secuencia correcta
originalCards.slice().reverse().forEach(card => slider.insertBefore(card.cloneNode(true), slider.firstChild));

// Volvemos a seleccionar todas las tarjetas (originales + clones)
const allCards = Array.from(document.querySelectorAll('.card'));



// -----------------------------------------------------
// VARIABLES DE CONTROL DEL SLIDER
// -----------------------------------------------------

// Indica si el usuario está presionando el mouse o tocando la pantalla
let isDown = false;

// Guarda la posición inicial del cursor o dedo
let startX;

// Guarda la posición inicial del scroll horizontal
let scrollLeft;

// Temporizador usado para detectar cuando se detiene el scroll
let scrollTimeout;

// Guarda el ancho total del bloque de tarjetas originales
let blockWidth = 0;

// Temporizador usado para controlar el snap del slider
let snapTimeout;



// Evita que el navegador intente arrastrar imágenes o elementos
slider.addEventListener('dragstart', (e) => e.preventDefault());



// -----------------------------------------------------
// 2. INICIALIZACIÓN DEL SLIDER
// -----------------------------------------------------

// Cuando toda la página haya cargado
window.addEventListener('load', () => {

    // Calculamos el ancho total del bloque original de tarjetas
    // Esto se usa para saber cuánto movernos cuando hacemos el efecto infinito
    blockWidth = allCards[numCards].offsetLeft - allCards[0].offsetLeft;
    
    // Esperamos medio segundo para asegurar que todo esté renderizado
    setTimeout(() => {

        // Teletransportamos el slider al bloque central
        teleportTo(numCards);

        // Actualizamos cuál tarjeta está activa
        updateActiveCard();

    }, 500);
});



// -----------------------------------------------------
// 3. FUNCIÓN QUE DETECTA LA TARJETA ACTIVA
// -----------------------------------------------------

function updateActiveCard() {

    // Obtiene el tamaño y posición del contenedor del slider
    const rectSlider = slider.getBoundingClientRect();

    // Calcula el centro horizontal del slider
    const containerCenter = rectSlider.left + rectSlider.width / 2;
    
    // Variable donde guardaremos la tarjeta más cercana al centro
    let activeCard = null;

    // Distancia mínima encontrada
    let minDistance = Infinity;

    // Recorremos todas las tarjetas
    allCards.forEach((card) => {

        // Obtenemos posición y tamaño de la tarjeta
        const rectCard = card.getBoundingClientRect();

        // Calculamos el centro de la tarjeta
        const cardCenter = rectCard.left + rectCard.width / 2;

        // Calculamos qué tan lejos está del centro del slider
        const distance = Math.abs(containerCenter - cardCenter);

        // Si esta tarjeta está más cerca que la anterior
        if (distance < minDistance) {

            // Guardamos esta tarjeta como la activa
            minDistance = distance;
            activeCard = card;

        }
    });

    // Si encontramos una tarjeta activa
    if (activeCard) {

        // Obtenemos su índice dentro del array de todas las tarjetas
        const activeIdx = allCards.indexOf(activeCard);

        // Recorremos todas las tarjetas
        allCards.forEach((c, i) => {

            // Primero eliminamos todas las clases de posición
            c.classList.remove('active', 'prev-1', 'next-1', 'prev-2', 'next-2');
            
            // Si es la tarjeta del centro
            if (i === activeIdx) {

                c.classList.add('active');

            }
            // Tarjeta inmediatamente a la izquierda
            else if (i === activeIdx - 1) {

                c.classList.add('prev-1');

            }
            // Tarjeta inmediatamente a la derecha
            else if (i === activeIdx + 1) {

                c.classList.add('next-1');

            }
            // Segunda tarjeta a la izquierda
            else if (i === activeIdx - 2) {

                c.classList.add('prev-2');

            }
            // Segunda tarjeta a la derecha
            else if (i === activeIdx + 2) {

                c.classList.add('next-2');

            }
        });
        
        // -------------------------------------------------
        // ACTUALIZACIÓN DE LOS PUNTOS DE PAGINACIÓN
        // -------------------------------------------------

        // Quitamos la clase active de todos los puntos
        dots.forEach(d => d.classList.remove('active'));

        // Obtenemos el índice original de la tarjeta activa
        const originalIndex = activeCard.dataset.index;

        // Activamos el punto correspondiente
        if (dots[originalIndex]) {

            dots[originalIndex].classList.add('active');

        }
    }
}



// -----------------------------------------------------
// FUNCIÓN QUE CONTROLA LOS LÍMITES DEL SCROLL INFINITO
// -----------------------------------------------------

function checkBoundary() {

    // Buscamos la tarjeta que actualmente está activa
    const activeCard = document.querySelector('.card.active');

    if (!activeCard) return;

    // Obtenemos su índice dentro del array
    const currentIndex = allCards.indexOf(activeCard);

    // Si estamos en el bloque de clones del inicio
    if (currentIndex < numCards) {

        // Nos teletransportamos al bloque central
        teleportTo(currentIndex + numCards);

    }

    // Si estamos en el bloque de clones del final
    else if (currentIndex >= numCards * 2) {

        // Nos teletransportamos al bloque central
        teleportTo(currentIndex - numCards);

    }
}



// -----------------------------------------------------
// FUNCIÓN QUE MUEVE EL SLIDER A UNA TARJETA ESPECÍFICA
// -----------------------------------------------------

function teleportTo(targetCardIndex) {

    // Quitamos el scroll suave para evitar animaciones visibles
    slider.classList.remove('smooth-scroll');

    // Desactivamos temporalmente el snap
    slider.classList.add('no-snap'); 
    
    // Obtenemos la tarjeta objetivo
    const targetCard = allCards[targetCardIndex];

    // Calculamos cuánto debemos mover el scroll
    const targetOffset = targetCard.offsetLeft - (slider.clientWidth / 2) + (targetCard.clientWidth / 2);
    
    // Movemos el scroll directamente
    slider.scrollLeft = targetOffset;
    
    // Reactivamos el snap después de un pequeño delay
    setTimeout(() => {

        slider.classList.remove('no-snap');

    }, 50);
}



// -----------------------------------------------------
// 4. LÓGICA DE ARRASTRE (PC Y MÓVIL)
// -----------------------------------------------------

// Detecta si el evento viene de mouse o touch
const getPositionX = (e) => {

    return e.type.includes('mouse')
        ? e.pageX
        : e.touches[0].pageX;

};



// -----------------------------------------------------
// CUANDO EL USUARIO EMPIEZA A ARRASTRAR
// -----------------------------------------------------

const startDrag = (e) => {

    // Activamos el modo arrastre
    isDown = true;
    
    // Cancelamos cualquier animación anterior
    clearTimeout(snapTimeout); 
    
    // Agregamos clase para estilos de arrastre
    slider.classList.add('is-dragging'); 
    
    // Quitamos el scroll suave
    slider.classList.remove('smooth-scroll');

    // Guardamos posición inicial del cursor
    startX = getPositionX(e) - slider.offsetLeft;

    // Guardamos posición inicial del scroll
    scrollLeft = slider.scrollLeft;

};



// -----------------------------------------------------
// CUANDO EL USUARIO MUEVE EL CURSOR O DEDO
// -----------------------------------------------------

const moveDrag = (e) => {

    if (!isDown) return;
    
    // Evita que el celular haga scroll vertical
    if (e.cancelable && e.type.includes('touch')) {

        e.preventDefault();

    }

    // Calculamos posición actual
    const x = getPositionX(e) - slider.offsetLeft;

    // Distancia que se movió el cursor
    const walk = (x - startX) * 1.5;

    // Nueva posición del scroll
    let newScrollLeft = scrollLeft - walk;

    // Efecto infinito al llegar al inicio
    if (newScrollLeft <= 0) {

        newScrollLeft += blockWidth;
        scrollLeft += blockWidth; 

    }

    // Efecto infinito al llegar al final
    else if (newScrollLeft >= slider.scrollWidth - slider.clientWidth) {

        newScrollLeft -= blockWidth;
        scrollLeft -= blockWidth; 

    }

    // Aplicamos el nuevo scroll
    slider.scrollLeft = newScrollLeft;

};



// -----------------------------------------------------
// CUANDO EL USUARIO SUELTA EL MOUSE O EL DEDO
// -----------------------------------------------------

const endDrag = () => {

    if (!isDown) return;

    isDown = false;
    
    const rectSlider = slider.getBoundingClientRect();
    const containerCenter = rectSlider.left + rectSlider.width / 2;

    let closestCard = null;
    let minDistance = Infinity;

    // Buscamos la tarjeta más cercana al centro
    allCards.forEach((card) => {

        const rectCard = card.getBoundingClientRect();
        const cardCenter = rectCard.left + rectCard.width / 2;
        const distance = Math.abs(containerCenter - cardCenter);

        if (distance < minDistance) {

            minDistance = distance;
            closestCard = card;

        }

    });

    // Si encontramos una tarjeta
    if (closestCard) {

        // Activamos scroll suave
        slider.classList.add('smooth-scroll');

        // Calculamos posición objetivo
        const targetOffset = closestCard.offsetLeft - (slider.clientWidth / 2) + (closestCard.clientWidth / 2);

        // Movemos el slider
        slider.scrollLeft = targetOffset;

        // Temporizador para finalizar animación
        snapTimeout = setTimeout(() => {

            slider.classList.remove('smooth-scroll');
            slider.classList.remove('is-dragging'); 

            checkBoundary();
            updateActiveCard();

        }, 400); 

    }
};



// -----------------------------------------------------
// EVENTOS PARA PC
// -----------------------------------------------------

slider.addEventListener('mousedown', startDrag);
slider.addEventListener('mousemove', moveDrag);
slider.addEventListener('mouseup', endDrag);
slider.addEventListener('mouseleave', endDrag);



// -----------------------------------------------------
// EVENTOS PARA CELULAR
// -----------------------------------------------------

slider.addEventListener('touchstart', startDrag, { passive: false });
slider.addEventListener('touchmove', moveDrag, { passive: false });
slider.addEventListener('touchend', endDrag);



// -----------------------------------------------------
// 5. EVENTOS ADICIONALES
// -----------------------------------------------------

// Evento que se ejecuta cada vez que el slider se mueve
slider.addEventListener('scroll', () => {

    // Actualiza la tarjeta activa en el siguiente frame
    window.requestAnimationFrame(updateActiveCard);
    
    // Reinicia el temporizador de scroll
    clearTimeout(scrollTimeout);

    // Si el usuario deja de mover el slider
    scrollTimeout = setTimeout(() => {

        if (!isDown) checkBoundary();

    }, 150);
});



// -----------------------------------------------------
// EVENTOS DE LOS PUNTOS DE PAGINACIÓN
// -----------------------------------------------------

dots.forEach((dot, index) => {

    dot.addEventListener('click', () => {

        // Obtenemos la tarjeta correspondiente en el bloque central
        const targetCard = allCards[numCards + index]; 

        if (!targetCard) return; 
        
        // Activamos animación suave
        slider.classList.add('smooth-scroll'); 

        // Calculamos la posición objetivo
        const targetOffset = targetCard.offsetLeft - (slider.clientWidth / 2) + (targetCard.clientWidth / 2);

        // Movemos el slider
        slider.scrollLeft = targetOffset;
        
        // Quitamos la animación después
        setTimeout(() => {

            slider.classList.remove('smooth-scroll');

        }, 500);
    });

});