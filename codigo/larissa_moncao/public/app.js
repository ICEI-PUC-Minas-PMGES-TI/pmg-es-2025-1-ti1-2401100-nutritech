  // Define o CPF do doador (enquanto ainda não tenho um sistema de login)
  const CPF = '123.456.789-00';

  fetch('http://localhost:3000/db.json')
    .then(response => response.json())
    .then(dados => {
      const lista = document.getElementById('lista-doacoes');
      const info = document.getElementById('info-doador');

      lista.innerHTML = '';
      info.innerHTML = '';

      // Filtra as doações pelo CPF
      const doacoesFiltradas = dados.doacoes.filter(item => item.doacao.CPF === CPF);

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
            <strong>Data de Nascimento:</strong> ${dadosPessoais.dataNascimento}<br>
            <strong>Endereço:</strong> ${dadosPessoais.endereco}<br>
            <strong>Cidade:</strong> ${dadosPessoais.cidade}<br>
            <strong>Estado:</strong> ${dadosPessoais.estado}<br>
            <strong>Telefone:</strong> ${dadosPessoais.telefone}<br>
            <strong>CPF:</strong> ${dadosPessoais.CPF}<br>

          </div>
        `;

        // Exibe as doações
        doacoesFiltradas.forEach(item => {
          const card = document.createElement('div');
          card.className = 'card mb-3 shadow rounded-4';
          const infoDinheiro = `
          <strong>Recorrência:</strong> ${item.recorrencia === true ? 'Sim' : item.recorrencia === false ? 'Não' : 'Não informado'}<br>
          <strong>Comprovante:</strong> <a href="${item.comprovante || '#'}" target="_blank">Ver Comprovante</a><br>
        `;

        // Campos que aparecem apenas quando a categoria for diferente de "Dinheiro"
        const infoOutros = `
          <strong>Quantidade:</strong> ${item.quantidade}<br>
          <strong>Entrega:</strong> ${item.entrega || 'Não informado'}<br>
        `;



  card.innerHTML = `
      <div class="card-body rounded-pill">
        <h5 class="card-title">
          <a href="pagina.html?instituicao=${encodeURIComponent(item.instituicao)}" class="text-decoration-none">
            ${item.instituicao}
          </a>
        </h5>
        <p class="card-text">
          <strong>Data:</strong> ${item.data}<br>
          <strong>Descrição:</strong> ${item.descricao}<br>
          <strong>Categoria:</strong> ${item.categoria}<br>
          <strong>Valor:</strong> R$ ${parseFloat(item.valor).toFixed(2)}<br>
          ${item.categoria === 'Dinheiro' ? infoDinheiro : infoOutros}
          <strong>Status:</strong> ${item.status || 'Concluído'}<br>
        </p>
        <button class="btn btn-doar-novamente btn-verde rounded-pill justify-content-center align-items-center" data-doacao='${JSON.stringify(item)}'>
          Doar novamente
        </button>
      </div>
    `;

    lista.appendChild(card);
  });
      }
    })
    .catch(error => {
      document.getElementById('lista-doacoes').innerHTML = 'Erro ao carregar as doações.';
      console.error('Erro ao carregar JSON:', error);
    });

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-doar-novamente')) {
      const doacao = JSON.parse(e.target.getAttribute('data-doacao'));

      // Mensagem de alerta informando descrição da doação e instituição
      alert(`Você está doando: ${doacao.descricao} para ${doacao.instituicao}`);
      
      // Ideia de levar para um formulário de doação ainda não implementado
    }
  });
      // Botão de gerenciar doações com recorrência. Ideia de levar para uma página de gerenciamento de doações recorrentes
      document.getElementById('gerenciar-recorrencia').addEventListener('click', function () {
        window.location.href = 'recorrencia.html';  
  });

