document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOMContentLoaded event triggered for homepage.js');

    const carouselInner = document.querySelector('#ongsCarousel .carousel-inner');
    if (!carouselInner) {
        console.error("Carousel inner element not found.");
        return;
    }

    const row = carouselInner.querySelector('.row');
    if (!row) {
        console.error("Carousel row element (.carousel-inner > .row) not found.");
        return;
    }
    row.style.flexWrap = 'nowrap';

    const prevButton = document.querySelector('#ongsCarousel .carousel-control-prev');
    const nextButton = document.querySelector('#ongsCarousel .carousel-control-next');

    if (!prevButton || !nextButton) {
        console.error("Carousel control buttons not found.");
        return;
    }

    function createOngCard(ong) {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3 text-center';

        const img = document.createElement('img');
        img.src = ong.imagem || 'assets/images/placeholder.png';
        img.alt = ong.name;
        img.style.width = '100px';
        img.style.height = '100px';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        img.style.marginBottom = '10px';
        img.style.display = 'block';
        img.style.marginLeft = 'auto';
        img.style.marginRight = 'auto';

        const nameElement = document.createElement('p');
        nameElement.textContent = ong.name;
        nameElement.style.fontWeight = 'bold';

        col.appendChild(img);
        col.appendChild(nameElement);
        return col;
    }

    try {
        const response = await fetch('assets/js/adição_ONGs.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, ao buscar adição_ONGs.json`);
        }
        const ongsArray = await response.json();

        let processedOngs = ongsArray;
        if (ongsArray && ongsArray.length > 6) {
            for (let i = ongsArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [ongsArray[i], ongsArray[j]] = [ongsArray[j], ongsArray[i]];
            }
            processedOngs = ongsArray.slice(0, 6);
        }

        if (processedOngs && processedOngs.length > 0) {
            row.innerHTML = '';
            processedOngs.forEach(ong => {
                if (ong.name && ong.imagem) {
                    const cardElement = createOngCard(ong);
                    row.appendChild(cardElement);
                } else {
                    console.warn('Dados da ONG incompletos (nome ou imagem faltando), pulando card:', ong);
                }
            });
        } else {
            row.innerHTML = '<p class="text-center col-12">Nenhuma ONG participante encontrada.</p>';
        }
    } catch (error) {
        console.error("Erro ao carregar ou processar ONGs para o carrossel:", error);
        row.innerHTML = '<p class="text-center col-12">Não foi possível carregar as ONGs no momento.</p>';
        prevButton.disabled = true;
        nextButton.disabled = true;
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        return;
    }

    let items = Array.from(row.children);

    if (items.length === 0 || row.querySelector('p.text-center')) {
        console.warn("Nenhum item válido no carrossel ou mensagem de erro exibida. Desabilitando controles.");
        prevButton.disabled = true;
        nextButton.disabled = true;
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        return;
    }

    let itemWidth = items[0].offsetWidth;
    const transitionDuration = 500; // ms
    let isAnimating = false;
    const numVisibleItems = 3;

    window.addEventListener('resize', () => {
        if (items.length > 0 && items[0]) {
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
            void row.offsetWidth; // Force reflow
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

        void row.offsetWidth; // Force reflow

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
    } else {
        prevButton.disabled = false;
        nextButton.disabled = false;
        prevButton.style.display = '';
        nextButton.style.display = '';
    }
});