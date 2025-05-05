fetch('rankingtemp.json')
  .then(response => response.json())
  .then(data => {
    const lista = document.getElementById('ranking-list');

    
    const ranking = {};

    data.doacoes_alimentos.forEach(doacao => {
      const nome = doacao.doador.nome;
      const valor = doacao.valor;

      if (!ranking[nome]) {
        ranking[nome] = 0;
      }
      ranking[nome] += valor;
    });

    
    const rankingOrdenado = Object.entries(ranking)
      .sort((a, b) => b[1] - a[1]);

   
    rankingOrdenado.forEach(([nome, valor], index) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${index + 1}º</strong> ${nome} <span>R$ ${valor.toFixed(2).replace('.', ',')}</span>`;
      lista.appendChild(li);
    });
  })
  .catch(error => {
    console.error('Erro ao carregar o ranking:', error);
  });