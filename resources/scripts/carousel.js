/**
 * Sets behaviours of carousel (dragging, scrolling and other mouse interactions).
 * Behaviours are set based on JS events involving mouse interations in the carousel element and it's elements.
 * @param {String} carouselId Identification for the carousel element in the HTML.
 */
function controlCarousel(carouselId) {
    // Aquire carousel element.
    const carouselContainer = document.querySelector(carouselId);
    //
    let isDragging = false;
    let startX;
    let scrollLeft;

    // If mouse clicks on carousel.
    carouselContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        //
        startX = e.pageX - carouselContainer.offsetLeft;
        scrollLeft = carouselContainer.scrollLeft;
        carouselContainer.style.cursor = 'grabbing';
    });
    // If mouse "unclicks".
    carouselContainer.addEventListener('mouseup', () => {
        isDragging = false;
        carouselContainer.style.cursor = 'grab';
    });
    // If mouse leaves carousel - user won't be able to grab and keep grabbing if mouse leaves carousel.
    carouselContainer.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            carouselContainer.style.cursor = 'grab';
        }
    });
    // If user click and drag mouse .
    carouselContainer.addEventListener('mousemove', (e) => {
        //
        if (!isDragging) return;
        e.preventDefault();
        //
        const x = e.pageX - carouselContainer.offsetLeft;
        const walk = (x - startX) * 3;
        carouselContainer.scrollLeft = scrollLeft - walk;
    });
    // controls mouse scroll movement in carousel.
    carouselContainer.addEventListener('wheel', (event) => {
        event.preventDefault();
        // 
        carouselContainer.scrollLeft += event.deltaY * 6;
    });
}

// Scrolling and dragging in WebKit based browsers (google chrome, firefox, MS Edge) is quite slow/clunky,
// as for Gecko based (firefox), is smoother.