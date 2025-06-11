
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded event triggered');

    const carouselInner = document.querySelector('#ongsCarousel .carousel-inner');
    if (!carouselInner) {
        console.error("Carousel inner element not found.");
        return;
    }
    const row = carouselInner.querySelector('.row');
    if (!row) {
        console.error("Carousel row element not found.");
        return;
    }
    const prevButton = document.querySelector('#ongsCarousel .carousel-control-prev');
    const nextButton = document.querySelector('#ongsCarousel .carousel-control-next');

    if (!prevButton || !nextButton) {
        console.error("Carousel control buttons not found.");
        return;
    }

    let items = Array.from(row.children); 
    
    if (items.length === 0) {
        console.error("No items found in carousel row.");
        return;
    }

    let itemWidth = items[0].offsetWidth; 
    const transitionDuration = 500;
    let isAnimating = false;
    const numVisibleItems = 3; 


    window.addEventListener('resize', () => {
        if (items.length > 0) {
            itemWidth = items[0].offsetWidth;
        }
    });
    
    row.style.transition = `transform ${transitionDuration / 1000}s ease-in-out`;

    function slideNext() {
        if (isAnimating || items.length <= numVisibleItems) return;
        isAnimating = true;

        row.style.transform = `translateX(-${itemWidth}px)`;

        setTimeout(() => {
            const firstItem = items.shift(); 
            items.push(firstItem);          
            row.appendChild(firstItem);     
            
            row.style.transition = 'none';  
            row.style.transform = 'translateX(0px)'; 
            void row.offsetWidth;
            row.style.transition = `transform ${transitionDuration / 1000}s ease-in-out`; 
            isAnimating = false;
        }, transitionDuration);
    }

    function slidePrev() {
        if (isAnimating || items.length <= numVisibleItems) return;
        isAnimating = true;

        const lastItem = items.pop();   
        items.unshift(lastItem);        
        row.insertBefore(lastItem, row.firstChild); 

        row.style.transition = 'none';
        row.style.transform = `translateX(-${itemWidth}px)`;
        
        void row.offsetWidth;

        requestAnimationFrame(() => {
            row.style.transition = `transform ${transitionDuration / 1000}s ease-in-out`;
            row.style.transform = 'translateX(0px)';
        });
        
        setTimeout(() => {
            isAnimating = false;
        }, transitionDuration);
    }

    prevButton.addEventListener('click', slidePrev);
    nextButton.addEventListener('click', slideNext);
    
    if (items.length <= numVisibleItems) {
        prevButton.disabled = true;
        nextButton.disabled = true;
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
    }
});