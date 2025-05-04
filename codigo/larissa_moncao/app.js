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
      // Exibe os dados pessoais do doador
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

      // Exibe as doações
      doacoesFiltradas.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('doacao');
        div.innerHTML = `
          <strong>Data:</strong> ${item.data}<br>
          <strong>Instituição:</strong> ${item.instituicao}<br>
          <strong>Descrição:</strong> ${item.descricao}<br>
          <strong>Categoria:</strong> ${item.categoria || 'Alimento'}<br>
          <strong>Quantidade:</strong> ${item.quantidade}<br>
          <strong>Valor:</strong> R$ ${parseFloat(item.valor).toFixed(2)}<br>
          <strong>Entrega:</strong> ${item.entrega || 'Não informado'}<br>
          <strong>Status:</strong> ${item.status || 'Concluído'}<br>
          <strong>Comprovante:</strong> <a href="${item.comprovante || '#'}" target="_blank">Ver Comprovante</a><br><br>
          <button class="btn-doar-novamente" data-doacao='${JSON.stringify(item)}'>Doar novamente</button>
        `;
        lista.appendChild(div);
      });
    }
  })
  .catch(error => {
    document.getElementById('lista-doacoes').innerHTML = 'Erro ao carregar as doações.';
    console.error('Erro ao carregar JSON:', error);
  });

// Aciona o botão por meio do click
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('btn-doar-novamente')) {
    const doacao = JSON.parse(e.target.getAttribute('data-doacao'));

    // Mensagem de alerta informando descrição da doação e instituição
    alert(`Você está doando: ${doacao.descricao} para ${doacao.instituicao}`);
    
    // Ideia de levar para um formulário de doação ainda não implementado
  }
});
    // Botão de gerencia recorrência que deverá levar a uma nova página
    document.getElementById('gerenciar-recorrencia').addEventListener('click', function () {
        window.location.href = 'recorrencia.html';
});


