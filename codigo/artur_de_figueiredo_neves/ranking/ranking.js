function getBadge(valor) {
  if (valor >= 100) {
    return '<img src="imgs/elogrande1.png" alt="Anjo da Esperança" title="Anjo da Esperança" width="20">';
  } else if (valor >= 70) {
    return '<img src="imgs/elogrande3.png" alt="Herói da Comunidade" title="Herói da Comunidade" width="20">';
  } else if (valor >= 50) {
    return '<img src="imgs/elogrande2.png" alt="Coração Generoso" title="Coração Generoso" width="20">';
  } else if (valor >= 20) {
    return '<img src="imgs/elogrande4.png" alt="Semente Solidária" title="Semente Solidária" width="20">';
  } else {
    return '';
  }
}

fetch('http://localhost:3000/usuarios')
  .then(response => response.json())
  .then(usuarios => {
    const lista = document.getElementById('ranking-list');
    const ranking = {};

    usuarios.forEach(usuario => {
      const nome = usuario.nome;
      const doacoes = usuario.doacoes || [];

      doacoes.forEach(doacao => {
        const valor = parseFloat(doacao.valor) || 0;

        if (!ranking[nome]) {
          ranking[nome] = 0;
        }

        ranking[nome] += valor;
      });
    });

    const rankingOrdenado = Object.entries(ranking)
      .sort((a, b) => b[1] - a[1]);

    rankingOrdenado.forEach(([nome, valor], index) => {
      const li = document.createElement('li');
      const badge = getBadge(valor);
      li.innerHTML = `<strong>${index + 1}º</strong> ${nome} ${badge} <span>R$ ${valor.toFixed(2).replace('.', ',')}</span>`;
      lista.appendChild(li);
    });
  })
  .catch(error => {
    console.error('Erro ao carregar o ranking:', error);
  });
