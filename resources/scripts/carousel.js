/**
 * Sets behaviours of carousel (dragging, scrolling and other mouse interactions).
 * Behaviours are set based on JS events involving mouse interations in the carousel element and it's elements.
 * @param {String} carouselId Identification for the carousel element in the HTML.
 */
function controlCarousel(carouselId) {
    // Aquire carousel element.
    const carouselContainer = document.querySelector(carouselId);
    // boolean to control dragging state.
    let isDragging = false;
    // Initial horizontal position of the mouse relative to the carousel.
    let startX;
    // Current horizontal scroll position of the carousel.
    let scrollLeft;

    // If mouse clicks on carousel - tracks how far the mouse has moved horizontally within the carousel during dragging.
    carouselContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        /**
         * e.pageX is the horizontal coordinate of the mouse pointer relative to the whole document;
         * carouselContainer.offsetLeft - gives the horizontal distance between the left edge of the carousel element 
         * and its offset parent (typically its nearest positioned ancestor element);
         */
        startX = e.pageX - carouselContainer.offsetLeft;
        scrollLeft = carouselContainer.scrollLeft;
        carouselContainer.style.cursor = 'grabbing';
    });
    // If user click and drag mouse in carousel. 
    carouselContainer.addEventListener('mousemove', (e) => {
        //
        if (!isDragging) return;
        e.preventDefault();
        //
        const x = e.pageX - carouselContainer.offsetLeft;
        const walk = (x - startX) * 3;
        carouselContainer.scrollLeft = scrollLeft - walk;
    });
    // If mouse "unclicks" set to not grabbing and change mouse icon.
    carouselContainer.addEventListener('mouseup', () => {
        isDragging = false;
        carouselContainer.style.cursor = 'grab';
    });
    // If mouse leaves carousel - set to not grabbing, user won't be able to grab and keep grabbing if mouse leaves carousel.
    carouselContainer.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            carouselContainer.style.cursor = 'grab';
        }
    });
    // controls mouse wheel scroll movement in carousel.
    carouselContainer.addEventListener('wheel', (event) => {
        // Prevents scrolling vertically when mouse pointer in on carousel.
        event.preventDefault();
        /**
         * event.deltaY - is the vertical coordinate of the mouse pointer relative to the document,
         * multiplying by some value determines how fast it will traverse the carousel.
         */
        carouselContainer.scrollLeft += event.deltaY * 4;
    });
}

// Scrolling and dragging in WebKit based browsers (google chrome, firefox, MS Edge) is quite slow/clunky,
// as for Gecko based (firefox), is smoother.