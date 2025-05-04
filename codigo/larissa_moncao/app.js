// Define o CPF do doador (enquanto ainda não tenho um sistema de login)
const CPF = '123.456.789-00';

fetch('doacoes.json')
  .then(response => response.json())
  .then(dados => {
    const lista = document.getElementById('lista-doacoes');
    const info = document.getElementById('info-doador');

    lista.innerHTML = '';
    info.innerHTML = '';

    // Filtra as doações pelo CPF
    const doacoesFiltradas = dados.doacoes_alimentos.filter(item => item.doacao.CPF === CPF);

    if (doacoesFiltradas.length === 0) {
      lista.innerHTML = '<p>Nenhuma doação encontrada para este doador.</p>';
      info.innerHTML = '<p>Dados pessoais não encontrados.</p>';
    } else {
        // Exibe os dados pessoais do doador e as doações
        const dadosPessoais = doacoesFiltradas[0].doacao;

      info.innerHTML = `
        <div class="card-pessoal">
          <strong>Nome:</strong> ${dadosPessoais.nome}<br>
          <strong>Email:</strong> ${dadosPessoais.email}<br>
          <strong>Cidade:</strong> ${dadosPessoais.cidade}<br>
          <strong>Estado:</strong> ${dadosPessoais.estado}<br>
          <strong>Telefone:</strong> ${dadosPessoais.telefone}<br>
          <strong>CPF:</strong> ${dadosPessoais.CPF}
        </div>
      `;

      doacoesFiltradas.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('doacao');
        div.innerHTML = `
          <strong>Data:</strong> ${item.data}<br>
          <strong>Instituição:</strong> ${item.instituicao}<br>
          <strong>Descrição:</strong> ${item.descricao}<br>
          <strong>Categoria:</strong> ${item.categoria}<br>
          <strong>Quantidade:</strong> ${item.quantidade}<br>
          <strong>Valor:</strong> R$ ${parseFloat(item.valor).toFixed(2)}
          <strong>entrega:</strong> ${item.entrega}<br>
          <strong>status:</strong> ${item.status}<br>
          <strong>Comprovante:</strong> <a href="${item.comprovante}" target="_blank">Ver Comprovante</a><br>
        `;
        lista.appendChild(div);
      });
    }
  })
  .catch(error => {
    document.getElementById('lista-doacoes').innerHTML = 'Erro ao carregar as doações.';
    console.error('Erro ao carregar JSON:', error);
  });
