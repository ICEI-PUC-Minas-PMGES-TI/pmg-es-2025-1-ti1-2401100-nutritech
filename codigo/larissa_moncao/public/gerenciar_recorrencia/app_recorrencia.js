const API_URL = 'http://localhost:3000/doacoes';
const CPF = '123.456.789-00';

const lista = document.getElementById('lista-doacoes');
const info = document.getElementById('info-doador');
const formEditar = document.getElementById('form-editar'); // formulário do modal de doações
const formEditarPessoais = document.getElementById('form-editar-pessoais'); // formulário do modal de dados pessoais

let modalEditar;
let modalEditarPessoais;
let doacoesFiltradas = [];

document.addEventListener('DOMContentLoaded', () => {
  modalEditar = new bootstrap.Modal(document.getElementById('modalEditar'));
  modalEditarPessoais = new bootstrap.Modal(document.getElementById('modalEditarPessoais'));

  function carregarDoacoes() {
    fetch(API_URL)
      .then(res => res.json())
      .then(dados => {
        lista.innerHTML = '';
        info.innerHTML = '';

        doacoesFiltradas = dados.filter(item =>
          item.CPF === CPF &&
          item.recorrencia === true &&
          item.categoria !== "Alimentos"
        );

        if (doacoesFiltradas.length === 0) {
          lista.innerHTML = '<p>Nenhuma doação recorrente encontrada para este doador.</p>';
          info.innerHTML = '<p>Dados pessoais não encontrados.</p>';
          return;
        }

        const dadosPessoais = doacoesFiltradas[0];

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

        doacoesFiltradas.forEach(item => {
          const card = document.createElement('div');
          card.className = 'card mb-3 shadow rounded-4';

          const infoDinheiro = `
            <strong>Recorrência:</strong> Sim<br>
            <strong>Comprovante:</strong> <a href="comprovante.html?id=${item.id}" target="_blank">Ver Comprovante</a><br>
          `;

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
                <strong>Valor:</strong> R$ ${parseFloat(item.valor).toFixed(2)}<br>
                ${item.categoria === 'Dinheiro' ? infoDinheiro : infoOutros}
                <button class="btn btn-doar-novamente btn-verde rounded-pill justify-content-center align-items-center" data-doacao='${JSON.stringify(item)}'>
                  Doar novamente
                </button>
                <button class="btn btn-editar btn-warning rounded-pill" data-id='${item.id}'> Editar </button>
                <button class="btn btn-excluir btn-danger rounded-pill" data-id='${item.id}'> Excluir </button>
              </p>
            </div>
          `;

          lista.appendChild(card);
        });
      })
      .catch(error => {
        lista.innerHTML = 'Erro ao carregar as doações.';
        console.error('Erro ao carregar JSON:', error);
      });
  }

  // Botão "Doar novamente"
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-doar-novamente')) {
      const doacao = JSON.parse(e.target.getAttribute('data-doacao'));
      alert(`Você está doando: ${doacao.descricao} para ${doacao.instituicao}`);
    }
  });

  // Botões editar e excluir de doações
  lista.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-editar')) {
      const id = e.target.getAttribute('data-id');
      const doacao = doacoesFiltradas.find(d => d.id == id);
      if (!doacao) return;

      document.getElementById('edit-id').value = doacao.id;
      document.getElementById('edit-valor').value = doacao.valor;
      document.getElementById('edit-data').value = doacao.data;

      modalEditar.show();
    }

    if (e.target.classList.contains('btn-excluir')) {
      const id = e.target.getAttribute('data-id');
      if (confirm('Tem certeza que deseja excluir esta doação?')) {
        fetch(`${API_URL}/${id}`, {
          method: 'DELETE'
        })
        .then(res => {
          if (res.ok) {
            alert('Doação excluída com sucesso!');
            carregarDoacoes();
          } else {
            alert('Erro ao excluir a doação.');
          }
        });
      }
    }
  });

  // Editar dados pessoais
  document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-editar-pessoais') {
      const dados = doacoesFiltradas[0];
      document.getElementById('edit-id-pessoal').value = dados.id;
      document.getElementById('edit-email').value = dados.email;
      document.getElementById('edit-endereco').value = dados.endereco;
      document.getElementById('edit-cidade').value = dados.cidade;
      document.getElementById('edit-estado').value = dados.estado;
      document.getElementById('edit-telefone').value = dados.telefone;
      modalEditarPessoais.show();
    }
  });

  // Submit do modal de edição de doação
  formEditar.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-id').value;
    const valor = parseFloat(document.getElementById('edit-valor').value).toFixed(2);
    const data = document.getElementById('edit-data').value;

    fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ valor, data })
    })
    .then(res => {
      if (res.ok) {
        alert('Doação atualizada com sucesso!');
        modalEditar.hide();
        carregarDoacoes();
      } else {
        alert('Erro ao atualizar a doação.');
      }
    });
  });

  // Submit do modal de edição dos dados pessoais
  formEditarPessoais.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-id-pessoal').value;
    const email = document.getElementById('edit-email').value;
    const endereco = document.getElementById('edit-endereco').value;
    const cidade = document.getElementById('edit-cidade').value;
    const estado = document.getElementById('edit-estado').value;
    const telefone = document.getElementById('edit-telefone').value;

    fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, endereco, cidade, estado, telefone })
    })
    .then(res => {
      if (res.ok) {
        alert('Dados pessoais atualizados com sucesso!');
        modalEditarPessoais.hide();
        carregarDoacoes();
      } else {
        alert('Erro ao atualizar os dados pessoais.');
      }
    });
  });

  // Inicializa os dados
  carregarDoacoes();
});
