// perfil.js

const params = new URLSearchParams(window.location.search);
const ongId = params.get('id') || 1; // fallback para ID 1

fetch(`http://localhost:3000/ongs/${ongId}`)
  .then(response => response.json())
  .then(data => {
    document.getElementById('nomeONG').textContent = data.nome;
    document.getElementById('nomeONGCard').textContent = data.nome;
    document.getElementById('entrouEm').textContent = data.entrouEm || '2025';
    document.getElementById('cnpj').textContent = data.cnpj;
    document.getElementById('contato').textContent = data.contato || data.telefone;
    document.getElementById('fundadaEm').textContent = data.data_fundacao || data.fundadaEm;
    document.getElementById('familiasAjudadas').textContent = data.familiasAjudadas || 'N/A';
    document.getElementById('voluntarios').textContent = data.voluntarios || 'N/A';
    document.getElementById('colaboradoresMensais').textContent = data.colaboradoresMensais || 'N/A';
    document.getElementById('descricao').textContent = data.descricao;
    document.getElementById('cidade').textContent = data.cidade;
    document.getElementById('telefone').textContent = data.telefone;
    document.getElementById('email').textContent = data.email;
  })
  .catch(error => {
    console.error("Erro ao carregar dados da ONG:", error);
    alert("Erro ao carregar dados da ONG.");
  });

  