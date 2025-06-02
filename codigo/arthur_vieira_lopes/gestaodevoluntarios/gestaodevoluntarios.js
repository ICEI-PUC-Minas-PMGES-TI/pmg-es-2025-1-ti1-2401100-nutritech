document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('voluntarioForm');
  const lista = document.getElementById('listaVoluntarios');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const dia = document.getElementById('dia').value;
    const horario = document.getElementById('horario').value;
    const interesse = document.getElementById('interesse').value;
    const tipo = document.getElementById('tipoVoluntariado').value;

    const item = document.createElement('li');
    item.className = 'list-group-item';
    item.innerHTML = `<strong>${dia}</strong> - ${horario} - ${interesse} - <em>${tipo}</em>`;

    lista.appendChild(item);
    form.reset();
  });
});
