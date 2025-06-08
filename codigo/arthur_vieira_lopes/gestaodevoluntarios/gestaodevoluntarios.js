document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("voluntarioForm");
  const lista = document.getElementById("listaVoluntarios");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const dia = document.getElementById("dia").value;
    const horario = document.getElementById("horario").value;
    const tipoVoluntariadoSelect = document.getElementById("tipoVoluntariado");
    const tipoVoluntariado = tipoVoluntariadoSelect.options[tipoVoluntariadoSelect.selectedIndex].text;

    // Criando o item da lista
    const li = document.createElement("li");
    li.classList.add("list-group-item");
    li.innerHTML = `
      <strong>Nome:</strong> ${nome} <br>
      <strong>Dia:</strong> ${dia} <br>
      <strong>Horário:</strong> ${horario} <br>
      <strong>Tipo:</strong> ${tipoVoluntariado}
    `;

    lista.appendChild(li);
    form.reset();
  });
});



