fetch('rankingtemp.json')
  .then(response => response.json())
  .then(data => {
    const lista = document.getElementById('ranking-list');

    data.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${item.posicao}º</strong> ${item.nome} <span>R$ ${item.valor.toFixed(2).replace('.', ',')}</span>`;
      lista.appendChild(li);
    });
  })
  .catch(error => {
    console.error('Erro ao carregar o ranking:', error);
  });