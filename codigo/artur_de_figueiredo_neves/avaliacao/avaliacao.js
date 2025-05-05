let currentSlide = 0;
const visibleItems = 3;
let data = [];


fetch('avaliacao.json')
  .then(res => res.json())
  .then(json => {
    data = json;
    renderCarousel();
    window.addEventListener('resize', updateCarousel);
  })
  .catch(err => console.error(err));

function renderCarousel() {
  const inner = document.getElementById('carouselInner');
  inner.innerHTML = '';
  data.forEach(ong => {
    let stars = '';
    for (let i = 1; i <= 5; i++) stars += (i <= ong.rating ? '★' : '☆');
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.innerHTML = `
      <img src="${ong.logo}" alt="${ong.nome}" />
      <h2>${ong.nome}</h2>
      <p>${ong.sede}</p>
      <div class="stars">${stars}</div>
    `;
    inner.appendChild(item);
  });
  updateCarousel();
}

function updateCarousel() {
  const inner = document.getElementById('carouselInner');
  if (!inner.children.length) return;
  const itemWidth = inner.children[0].getBoundingClientRect().width + 20;
  inner.style.transform = `translateX(${-currentSlide * itemWidth}px)`;
}

function nextSlide() {
  currentSlide = (currentSlide < data.length - visibleItems) ? currentSlide + 1 : 0;
  updateCarousel();
}

function prevSlide() {
  currentSlide = (currentSlide > 0) ? currentSlide - 1 : data.length - visibleItems;
  updateCarousel();
}

function preencherSelect() {
    const select = document.getElementById('ongSelect');
    data.forEach(ong => {
      const option = document.createElement('option');
      option.value = ong.nome;
      option.textContent = ong.nome;
      select.appendChild(option);
    });
  }
  
  document.getElementById('avaliacaoForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const ongSelecionada = document.getElementById('ongSelect').value;
    const estrelas = document.getElementById('estrelaSelect').value;
  
   
    document.getElementById('mensagemAvaliacao').textContent =
      `Obrigado! Sua avaliação de ${estrelas} estrela(s) para "${ongSelecionada}" foi registrada.`;
  });
  
  
  fetch('avaliacao.json')
    .then(res => res.json())
    .then(json => {
      data = json;
      renderCarousel();
      preencherSelect();
      window.addEventListener('resize', updateCarousel);
    })
    .catch(err => console.error(err));
  