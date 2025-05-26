function formatarDataParaISO(data) {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

function atualizarAlimentoEVoluntario(agendamentosData, idx = 0) {
    const alimentoInput = document.getElementById('alimento');
    const voluntarioInfoDiv = document.getElementById('voluntarioInfo');
    if (agendamentosData.length === 1) {
        alimentoInput.value = agendamentosData[0].Alimento;
        voluntarioInfoDiv.innerHTML = `<b>Voluntário:</b> ${agendamentosData[0].voluntario.nome}<br><b>Telefone:</b> ${agendamentosData[0].voluntario.telefone}`;
        voluntarioInfoDiv.dataset.selectedIndex = 0;
    } else if (agendamentosData.length > 1) {
        let selectHtml = '<label for="voluntarioSelect"><b>Escolha o voluntário:</b></label><select id="voluntarioSelect" class="form-select mt-2 mb-2">';
        agendamentosData.forEach((a, idx) => {
            selectHtml += `<option value="${idx}">${a.voluntario.nome} - ${a.voluntario.telefone}</option>`;
        });
        selectHtml += '</select>';
        voluntarioInfoDiv.innerHTML = selectHtml + `<div id="voluntarioDetails"></div>`;
        alimentoInput.value = agendamentosData[0].Alimento;
        document.getElementById('voluntarioDetails').innerHTML = `<b>Voluntário:</b> ${agendamentosData[0].voluntario.nome}<br><b>Telefone:</b> ${agendamentosData[0].voluntario.telefone}`;
        voluntarioInfoDiv.dataset.selectedIndex = 0;
        document.getElementById('voluntarioSelect').addEventListener('change', function() {
            const idx = parseInt(this.value);
            atualizarAlimentoEVoluntario(agendamentosData, idx);
        });
    } else {
        alimentoInput.value = '';
        voluntarioInfoDiv.innerHTML = '';
        delete voluntarioInfoDiv.dataset.selectedIndex;
    }
}

function marcarDiasDisponiveis(datasDisponiveis) {
    setTimeout(() => {
        document.querySelectorAll('.flatpickr-day').forEach(dayElem => {
            if (!dayElem.dateObj) return;
            const date = dayElem.dateObj.toISOString().split('T')[0];
            dayElem.classList.remove('available-date');
            if (datasDisponiveis.includes(date)) {
                dayElem.classList.add('available-date');
            }
        });
    }, 10);
}

function atualizarCalendario(fp, datasDisponiveis) {
    fp.set('enable', datasDisponiveis);
    fp.clear();
    fp.redraw();
    marcarDiasDisponiveis(datasDisponiveis);
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('assets/database/agendamento.json')
        .then(res => {
            if (!res.ok) throw new Error('Erro ao carregar o JSON: ' + res.statusText);
            return res.json();
        })
        .then(json => {
            let agendamentos = Array.isArray(json)
                ? json.flatMap(v => v.Agendamento.map(a => ({...a, voluntario: v})))
                : (json.Agendamento || []).map(a => ({...a, voluntario: json}));
            let datasDisponiveis = agendamentos.map(a => formatarDataParaISO(a.Data));
            const fp = flatpickr('#dataColeta', {
                dateFormat: 'Y-m-d',
                enable: datasDisponiveis,
                allowInput: false,
                clickOpens: true,
                onChange: function(selectedDates, dateStr) {
                    const agendamentosData = agendamentos.filter(a => formatarDataParaISO(a.Data) === dateStr);
                    atualizarAlimentoEVoluntario(agendamentosData);
                },
                onDayCreate: function(dObj, dStr, fpInstance, dayElem) {
                    const date = dayElem.dateObj.toISOString().split('T')[0];
                    dayElem.classList.remove('available-date');
                    if (fpInstance.config.enable.includes(date)) {
                        dayElem.classList.add('available-date');
                    }
                },
                onOpen: function() {
                    marcarDiasDisponiveis(datasDisponiveis);
                }
            });
            setTimeout(() => { fp.open(); fp.close(); }, 50);
            document.getElementById('agendamentoForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const dataSelecionada = document.getElementById('dataColeta').value;
                if (!dataSelecionada) {
                    alert('Selecione uma data!');
                    return;
                }
                let dataFormatada = dataSelecionada;
                if (dataSelecionada.includes('/')) {
                    dataFormatada = formatarDataParaISO(dataSelecionada);
                }
                const voluntarioInfoDiv = document.getElementById('voluntarioInfo');
                let idxSelecionado = 0;
                if (voluntarioInfoDiv && voluntarioInfoDiv.dataset.selectedIndex) {
                    idxSelecionado = parseInt(voluntarioInfoDiv.dataset.selectedIndex);
                }
                const agendamentosData = agendamentos.filter(a => formatarDataParaISO(a.Data) === dataFormatada);
                if (agendamentosData.length > 1) {
                    const agendamentoSelecionado = agendamentosData[idxSelecionado];
                    agendamentos = agendamentos.filter(a => !(formatarDataParaISO(a.Data) === dataFormatada && a.voluntario.nome === agendamentoSelecionado.voluntario.nome));
                    const aindaTemAgendamento = agendamentos.some(a => formatarDataParaISO(a.Data) === dataFormatada);
                    if (!aindaTemAgendamento) {
                        datasDisponiveis = datasDisponiveis.filter(d => d !== dataFormatada);
                    }
                } else {
                    agendamentos = agendamentos.filter(a => formatarDataParaISO(a.Data) !== dataFormatada);
                    datasDisponiveis = datasDisponiveis.filter(d => d !== dataFormatada);
                }
                atualizarCalendario(fp, datasDisponiveis);
                document.getElementById('dataColeta').value = '';
                document.getElementById('alimento').value = '';
                document.getElementById('voluntarioInfo').innerHTML = '';
                alert('Coleta agendada com sucesso!');
            });
        })
        .catch(err => { console.error('Erro:', err); });
});