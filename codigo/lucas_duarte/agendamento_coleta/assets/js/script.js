document.addEventListener('DOMContentLoaded', function() {
    fetch('assets/database/agendamento.json')
        .then(res => {
            if (!res.ok) {
                throw new Error('Erro ao carregar o JSON: ' + res.statusText);
            }
            return res.json();
        })
        .then(json => {
            let agendamentos = [];
            if (Array.isArray(json)) {
                agendamentos = json.flatMap(v => v.Agendamento.map(a => ({...a, voluntario: v})));
            } else {
                agendamentos = (json.Agendamento || []).map(a => ({...a, voluntario: json}));
            }

            const datasDisponiveis = agendamentos.map(a => {
                const [dia, mes, ano] = a.Data.split('/');
                return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
            });

            console.log('Datas disponíveis (formato YYYY-MM-DD):', datasDisponiveis);

            flatpickr('#dataColeta', {
                dateFormat: 'Y-m-d',
                enable: datasDisponiveis,
                allowInput: true,
                clickOpens: true,
                onChange: function(selectedDates, dateStr, instance) {
                    console.log('Data selecionada:', dateStr);

                    // Atualizar o campo de alimento com base na data selecionada
                    const agendamento = agendamentos.find(a => {
                        const [dia, mes, ano] = a.Data.split('/');
                        const dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                        return dataFormatada === dateStr;
                    });

                    if (agendamento) {
                        document.getElementById('alimento').value = agendamento.Alimento;
                    } else {
                        document.getElementById('alimento').value = '';
                    }
                },
                onDayCreate: function(dObj, dStr, fp, dayElem) {
                    const date = dayElem.dateObj.toISOString().split('T')[0];
                    if (datasDisponiveis.includes(date)) {
                        dayElem.classList.add('available-date');
                    }
                }
            });
        })
        .catch(err => {
            console.error('Erro:', err);
        });

    document.getElementById('agendamentoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Coleta agendada com sucesso!');
    });
});