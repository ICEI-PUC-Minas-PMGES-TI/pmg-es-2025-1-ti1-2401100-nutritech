// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function () {
    // Seleciona o formulário
    const form = document.querySelector('form');

    // Adiciona o evento de submit
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        // Coleta os dados do formulário
        const date = document.getElementById('date').value;
        const service = document.getElementById('service').value;

        // Verifica se os campos foram preenchidos
        if (date && service) {
            alert('Voluntariado confirmado com sucesso!');
        } else {
            alert('Por favor, preencha todos os campos antes de confirmar.');
        }
    });
});
