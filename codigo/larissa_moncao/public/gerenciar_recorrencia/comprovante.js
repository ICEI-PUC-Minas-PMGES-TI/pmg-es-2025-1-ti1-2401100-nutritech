 const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      document.getElementById('comprovante').innerHTML = '<h2>ID da doação não fornecido.</h2>';
    } else {
      fetch(`http://localhost:3000/doacoes/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Não encontrado');
          return res.json();
        })
        .then(item => {
          document.getElementById('comprovante').innerHTML = `
            <h2>Comprovante de Doação</h2>
            <div class="linha"><strong>Instituição:</strong> ${item.instituicao}</div>
            <div class="linha"><strong>Descrição:</strong> ${item.descricao}</div>
            <div class="linha"><strong>Categoria:</strong> ${item.categoria}</div>
            <div class="linha"><strong>Valor:</strong> R$ ${parseFloat(item.valor).toFixed(2)}</div>
            <div class="linha"><strong>Data:</strong> ${item.data}</div>
            <div class="linha"><strong>Doador:</strong> ${item.nome}</div>
            <div class="linha"><strong>CPF:</strong> ${item.CPF}</div>
          `;
        })
        .catch(erro => {
          console.error(erro);
          document.getElementById('comprovante').innerHTML = '<h2>Erro ao carregar o comprovante.</h2>';
        });
    }