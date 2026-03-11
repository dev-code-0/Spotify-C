const slider = document.querySelector('.galeria-2');
const originalCards = Array.from(document.querySelectorAll('.card'));
const dots = document.querySelectorAll('.pagination span');
const numCards = originalCards.length;

// --- 1. CLONACIÓN PARA EL SCROLL INFINITO ---
originalCards.forEach((card, index) => {
    card.dataset.index = index;
});

// Clonamos al final y al principio
originalCards.forEach(card => slider.appendChild(card.cloneNode(true)));
originalCards.slice().reverse().forEach(card => slider.insertBefore(card.cloneNode(true), slider.firstChild));

const allCards = Array.from(document.querySelectorAll('.card'));

// Variables de control
let isDown = false;
let startX;
let scrollLeft;
let scrollTimeout;
let blockWidth = 0;
let snapTimeout;

slider.addEventListener('dragstart', (e) => e.preventDefault());

// --- 2. INICIALIZACIÓN ---
window.addEventListener('load', () => {
    // Calculamos el ancho exacto del bloque de tarjetas originales
    blockWidth = allCards[numCards].offsetLeft - allCards[0].offsetLeft;
    
    setTimeout(() => {
        teleportTo(numCards); 
        updateActiveCard();
    }, 500);
});

// --- 3. FUNCIONES DE ACTUALIZACIÓN VISUAL Y TELETRANSPORTE ---
function updateActiveCard() {
    const rectSlider = slider.getBoundingClientRect();
    const containerCenter = rectSlider.left + rectSlider.width / 2;
    
    let activeCard = null;
    let minDistance = Infinity;

    // Buscamos cuál está en el centro
    allCards.forEach((card) => {
        const rectCard = card.getBoundingClientRect();
        const cardCenter = rectCard.left + rectCard.width / 2;
        const distance = Math.abs(containerCenter - cardCenter);

        if (distance < minDistance) {
            minDistance = distance;
            activeCard = card;
        }
    });

    if (activeCard) {
        // Obtenemos la posición (índice) de la tarjeta ganadora en nuestro array
        const activeIdx = allCards.indexOf(activeCard);

        allCards.forEach((c, i) => {
            // 1. Limpiamos TODAS las clases de posición de la tarjeta
            c.classList.remove('active', 'prev-1', 'next-1', 'prev-2', 'next-2');
            
            // 2. Asignamos clases nuevas dependiendo de qué tan lejos estén del centro
            if (i === activeIdx) {
                c.classList.add('active'); // La del centro
            } else if (i === activeIdx - 1) {
                c.classList.add('prev-1'); // Vecino izquierdo
            } else if (i === activeIdx + 1) {
                c.classList.add('next-1'); // Vecino derecho
            } else if (i === activeIdx - 2) {
                c.classList.add('prev-2'); // Segundo a la izquierda
            } else if (i === activeIdx + 2) {
                c.classList.add('next-2'); // Segundo a la derecha
            }
        });
        
        // --- Lógica de la paginación (Puntitos) ---
        dots.forEach(d => d.classList.remove('active'));
        const originalIndex = activeCard.dataset.index;
        if (dots[originalIndex]) {
            dots[originalIndex].classList.add('active');
        }
    }
}

function checkBoundary() {
    const activeCard = document.querySelector('.card.active');
    if (!activeCard) return;

    const currentIndex = allCards.indexOf(activeCard);

    if (currentIndex < numCards) {
        teleportTo(currentIndex + numCards);
    } else if (currentIndex >= numCards * 2) {
        teleportTo(currentIndex - numCards);
    }
}

function teleportTo(targetCardIndex) {
    slider.classList.remove('smooth-scroll');
    slider.classList.add('no-snap'); 
    
    const targetCard = allCards[targetCardIndex];
    const targetOffset = targetCard.offsetLeft - (slider.clientWidth / 2) + (targetCard.clientWidth / 2);
    
    slider.scrollLeft = targetOffset;
    
    setTimeout(() => {
        slider.classList.remove('no-snap');
    }, 50);
}

// --- 4. LÓGICA UNIFICADA DE ARRASTRE (PC Y MÓVIL) ---

// Traductor: Detecta si es un clic (PC) o un dedo (Móvil)
const getPositionX = (e) => {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
};

const startDrag = (e) => {
    isDown = true;
    
    // EL PARCHE: Si el usuario vuelve a tocar antes de que termine la animación, cancelamos el reloj viejo.
    clearTimeout(snapTimeout); 
    
    slider.classList.add('is-dragging'); 
    slider.classList.remove('smooth-scroll'); // Nos aseguramos de apagar la suavidad al agarrar
    startX = getPositionX(e) - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
};

const moveDrag = (e) => {
    if (!isDown) return;
    
    // Evita que la pantalla del celular haga scroll hacia abajo mientras deslizas el carrusel
    if (e.cancelable && e.type.includes('touch')) {
        e.preventDefault();
    }

    const x = getPositionX(e) - slider.offsetLeft;
    const walk = (x - startX) * 1.5;
    let newScrollLeft = scrollLeft - walk;

    // Arrastre infinito sin chocar con los bordes
    if (newScrollLeft <= 0) {
        newScrollLeft += blockWidth;
        scrollLeft += blockWidth; 
    } else if (newScrollLeft >= slider.scrollWidth - slider.clientWidth) {
        newScrollLeft -= blockWidth;
        scrollLeft -= blockWidth; 
    }

    slider.scrollLeft = newScrollLeft;
};

const endDrag = () => {
    if (!isDown) return;
    isDown = false;
    
    const rectSlider = slider.getBoundingClientRect();
    const containerCenter = rectSlider.left + rectSlider.width / 2;
    let closestCard = null;
    let minDistance = Infinity;

    allCards.forEach((card) => {
        const rectCard = card.getBoundingClientRect();
        const cardCenter = rectCard.left + rectCard.width / 2;
        const distance = Math.abs(containerCenter - cardCenter);

        if (distance < minDistance) {
            minDistance = distance;
            closestCard = card;
        }
    });

    if (closestCard) {
        slider.classList.add('smooth-scroll');
        const targetOffset = closestCard.offsetLeft - (slider.clientWidth / 2) + (closestCard.clientWidth / 2);
        slider.scrollLeft = targetOffset;

        // EL PARCHE: Guardamos este temporizador en la variable snapTimeout
        snapTimeout = setTimeout(() => {
            slider.classList.remove('smooth-scroll');
            slider.classList.remove('is-dragging'); 
            checkBoundary();
            updateActiveCard();
        }, 400); 
    }
};

// Eventos para PC (Mouse)
slider.addEventListener('mousedown', startDrag);
slider.addEventListener('mousemove', moveDrag);
slider.addEventListener('mouseup', endDrag);
slider.addEventListener('mouseleave', endDrag);

// Eventos para Celular (Touch)
slider.addEventListener('touchstart', startDrag, { passive: false });
slider.addEventListener('touchmove', moveDrag, { passive: false });
slider.addEventListener('touchend', endDrag);

// --- 5. EVENTOS ADICIONALES ---
slider.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateActiveCard);
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (!isDown) checkBoundary();
    }, 150);
});

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        const targetCard = allCards[numCards + index]; 
        if (!targetCard) return; 
        
        slider.classList.add('smooth-scroll'); 
        const targetOffset = targetCard.offsetLeft - (slider.clientWidth / 2) + (targetCard.clientWidth / 2);
        slider.scrollLeft = targetOffset;
        
        setTimeout(() => {
            slider.classList.remove('smooth-scroll');
        }, 500);
    });
});




