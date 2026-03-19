const slider = document.querySelector('.galeria-2');
const originalCards = Array.from(document.querySelectorAll('.card'));
const dots = document.querySelectorAll('.pagination span');
const numCards = originalCards.length;

// 1. CLONACIÓN EXACTA PARA EL INFINITO
originalCards.forEach((c, i) => c.dataset.index = i);

// ¡LA CURA AL LÍMITE FÍSICO! Clonamos 3 veces para crear un colchón masivo
const CLONE_COUNT = 3; 
for (let i = 0; i < CLONE_COUNT; i++) {
    originalCards.forEach(c => slider.appendChild(c.cloneNode(true)));
    originalCards.slice().reverse().forEach(c => slider.insertBefore(c.cloneNode(true), slider.firstChild));
}

const allCards = Array.from(document.querySelectorAll('.card'));
const centerStart = numCards * CLONE_COUNT; // Aquí empiezan tus 5 tarjetas originales

slider.addEventListener('dragstart', e => e.preventDefault()); // Mata el bug nativo de arrastrar imágenes

// 2. FUNCIÓN PARA ASIGNAR CLASES
const applyClasses = (activeIdx) => {
    if (activeIdx === -1) return;
    
    allCards.forEach((c, i) => {
        c.className = 'card'; // Limpia todo rápido
        if (i === activeIdx) c.classList.add('active');
        else if (i === activeIdx - 1) c.classList.add('prev-1');
        else if (i === activeIdx + 1) c.classList.add('next-1');
        else if (i === activeIdx - 2) c.classList.add('prev-2');
        else if (i === activeIdx + 2) c.classList.add('next-2');
    });

    dots.forEach(d => d.classList.remove('active'));
    const origIdx = parseInt(allCards[activeIdx]?.dataset.index);
    if (!isNaN(origIdx) && dots[origIdx]) dots[origIdx].classList.add('active');
};

// 3. LA TELETRANSPORTACIÓN INVISIBLE
const jump = (offsetAmount, newIdx) => {
    slider.style.scrollSnapType = 'none';
    allCards.forEach(c => c.style.transition = 'none'); 

    applyClasses(newIdx); 

    slider.scrollLeft += offsetAmount;
    void slider.offsetWidth; // Renderizado instantáneo

    allCards.forEach(c => c.style.transition = ''); 
    slider.style.scrollSnapType = '';
};

// 4. EL CEREBRO VISUAL (Animaciones suaves)
const update = () => {
    const center = slider.scrollLeft + slider.clientWidth / 2;
    let min = Infinity;
    let activeIdx = -1;

    allCards.forEach((c, i) => {
        const cCenter = c.offsetLeft + c.offsetWidth / 2;
        const dist = Math.abs(center - cCenter);
        if (dist < min) { min = dist; activeIdx = i; }
    });

    applyClasses(activeIdx);
    return activeIdx;
};

// 5. EL VIGILANTE MATEMÁTICO UNIVERSAL
const checkBoundary = () => {
    const activeIdx = update();
    
    // Si el usuario se sale del bloque central hacia el colchón de clones
    if (activeIdx < centerStart || activeIdx >= centerStart + numCards) {
        // La matemática "%" averigua a qué tarjeta original corresponde, sin importar qué tan lejos estés
        const targetIdx = centerStart + (activeIdx % numCards);
        const offset = allCards[targetIdx].offsetLeft - allCards[activeIdx].offsetLeft;
        
        jump(offset, targetIdx);
    }
};

// 6. EL ARRASTRE RELATIVO PERFECTO
let isDown = false;
let lastX = 0;
let scrollTimeout;

const startDrag = (e) => {
    isDown = true;
    slider.style.scrollSnapType = 'none'; 
    slider.style.cursor = 'grabbing';
    lastX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
    clearTimeout(scrollTimeout); 
};

const moveDrag = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const currentX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
    
    const deltaX = (currentX - lastX) * 1.5; 
    slider.scrollLeft -= deltaX;
    lastX = currentX;
    
    update(); 
};

const endDrag = () => {
    if (!isDown) return;
    isDown = false;
    slider.style.scrollSnapType = ''; 
    slider.style.cursor = 'grab';
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(checkBoundary, 150); // Salta en secreto solo cuando sueltas
};

slider.addEventListener('mousedown', startDrag);
slider.addEventListener('touchstart', startDrag, { passive: false });

window.addEventListener('mousemove', moveDrag, { passive: false });
window.addEventListener('touchmove', moveDrag, { passive: false });
window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);

// 7. EVENTOS NATIVOS
slider.addEventListener('scroll', () => {
    if (!isDown) {
        requestAnimationFrame(update);
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(checkBoundary, 150);
    }
});

// Puntos de Paginación
dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        slider.style.scrollBehavior = 'smooth';
        const target = allCards[centerStart + i]; // Viaja siempre al bloque central
        slider.scrollLeft = target.offsetLeft - slider.clientWidth / 2 + target.offsetWidth / 2;
        setTimeout(() => slider.style.scrollBehavior = 'auto', 500);
    });
});

// 8. ARRANQUE DEL MOTOR
window.addEventListener('load', () => {
    setTimeout(() => {
        // Nos posicionamos directamente en el bloque original (en el centro del colchón masivo)
        const target = allCards[centerStart];
        slider.scrollLeft = target.offsetLeft - slider.clientWidth / 2 + target.offsetWidth / 2;
        update();
    }, 150);
});