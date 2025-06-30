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

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const ongId = params.get('ongId');
    const doacaoIdFromUrl = params.get('doacaoId');
    const usuarioCorrente = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser'));

    if (!ongId) {
        alert('ONG não especificada! Você será redirecionado para a página de ONGs.');
        window.location.href = '../ong/ongs.html';
        return;
    }

    if (!usuarioCorrente || !usuarioCorrente.id) {
        alert('Você precisa estar logado para agendar uma coleta. Você será redirecionado para a página de login.');
        window.location.href = '../login/login.html';
        return;
    }

    const ongNomeEl = document.getElementById('ong-nome-agendamento');
    const alimentoSelectEl = document.getElementById('alimentoSelect');
    const dataColetaEl = document.getElementById('dataColeta');
    const voluntarioInfoEl = document.getElementById('voluntarioInfo');
    const agendamentoForm = document.getElementById('agendamentoForm');

    let ongData = {};
    let fp;

    try {
        const [ongResponse, userAlimentosResponse, allAlimentosResponse] = await Promise.all([
            fetch(window.getApiUrl(`ongs/${ongId}`)),
            fetch(window.getApiUrl(`alimentos?usuarioId=${usuarioCorrente.id}`)),
            fetch(window.getApiUrl(`alimentos?status=Agendado`))
        ]);

        if (!ongResponse.ok) throw new Error(`Falha ao carregar dados da ONG. Status: ${ongResponse.status}`);
        if (!userAlimentosResponse.ok) throw new Error(`Falha ao carregar seus dados de alimentos. Status: ${userAlimentosResponse.status}`);
        if (!allAlimentosResponse.ok) throw new Error(`Falha ao carregar dados de agendamentos. Status: ${allAlimentosResponse.status}`);

        ongData = await ongResponse.json();
        const userAlimentos = await userAlimentosResponse.json();
        const todosAgendamentos = await allAlimentosResponse.json();


        const alimentosParaEstaOng = userAlimentos.filter(d => (d.recipientOngId || d.ongId) == ongId);

        ongNomeEl.textContent = `Agendando coleta para a ONG: ${ongData.nome}`;


        let doacoesAlimento;
        if (doacaoIdFromUrl) {

            doacoesAlimento = alimentosParaEstaOng.filter(d => d.status !== 'Coletado');
        } else {

            doacoesAlimento = alimentosParaEstaOng.filter(d => !d.status || d.status === 'Pendente');
        }

        alimentoSelectEl.innerHTML = '<option value="">Selecione uma doação para agendar/reagendar</option>';
        if (doacoesAlimento.length > 0) {
            doacoesAlimento.forEach(doacao => {
                const option = document.createElement('option');
                option.value = doacao.id;
                const statusText = doacao.status || 'Pendente';
                option.textContent = `${doacao.descricao} (Qtde: ${doacao.quantidade || 'N/A'}) - Status: ${statusText}`;
                alimentoSelectEl.appendChild(option);
            });


            if (doacaoIdFromUrl) {
                alimentoSelectEl.value = doacaoIdFromUrl;
            }

        } else {
            alimentoSelectEl.innerHTML = '<option value="">Você não tem doações de alimentos pendentes para agendar.</option>';
            alimentoSelectEl.disabled = true;
            agendamentoForm.querySelector('button[type="submit"]').disabled = true;
        }

        const doacaoParaAgendar = doacoesAlimento.find(d => d.id == doacaoIdFromUrl);

        const voluntarios = (ongData.voluntarios || []).map(v => {
            if (!v.dias_disponiveis || !Array.isArray(v.dias_disponiveis)) {
                return { ...v, dias_disponiveis: [] };
            }
            return {
                ...v,
                dias_disponiveis: v.dias_disponiveis.map(data => {
                    try {

                        if (!data) return null;
                        return formatarDataParaISO(data);
                    } catch (e) {
                        console.warn(`Data inválida encontrada para voluntário ${v.id}: ${data}`);
                        return null;
                    }
                }).filter(Boolean)
            };
        });

        const allAvailableDates = [...new Set(voluntarios.flatMap(v => v.dias_disponiveis))];

        const enabledDates = allAvailableDates.filter(dateStr => {
            const volunteersForDate = voluntarios.filter(v => (v.dias_disponiveis || []).includes(dateStr));
            const hasAvailability = volunteersForDate.some(voluntario => {
                const collectionsOnDate = todosAgendamentos.filter(agendamento =>
                    agendamento.agendamento.dataColeta === dateStr &&
                    agendamento.agendamento.voluntarioId == voluntario.id
                ).length;
                return collectionsOnDate < 3;
            });
            return hasAvailability;
        });


        fp = flatpickr(dataColetaEl, {
            dateFormat: 'Y-m-d',
            enable: enabledDates,
            onChange: function(selectedDates, dateStr) {
                const voluntariosDisponiveisNoDia = voluntarios.filter(v => (v.dias_disponiveis || []).includes(dateStr));
                const voluntariosComVaga = voluntariosDisponiveisNoDia.filter(voluntario => {
                    const coletasDoVoluntarioNoDia = todosAgendamentos.filter(agendamento =>
                        agendamento.agendamento.dataColeta === dateStr &&
                        agendamento.agendamento.voluntarioId == voluntario.id
                    ).length;
                    return coletasDoVoluntarioNoDia < 3;
                });

                voluntarioInfoEl.innerHTML = '';
                if (voluntariosComVaga.length > 0) {
                    let selectHtml = '<label for="voluntarioSelect" class="form-label mt-3"><b>Escolha o voluntário para a coleta:</b></label><select id="voluntarioSelect" class="form-select" required>';
                    voluntariosComVaga.forEach(voluntario => {
                        selectHtml += `<option value="${voluntario.id}">${voluntario.nome}</option>`;
                    });
                    selectHtml += '</select>';
                    voluntarioInfoEl.innerHTML = selectHtml + `<div id="voluntarioDetails" class="mt-2 p-2 border rounded"></div>`;

                    const voluntarioSelect = document.getElementById('voluntarioSelect');

                    function showVoluntarioDetails() {
                        const selectedVoluntarioId = voluntarioSelect.value;
                        const voluntarioSelecionado = voluntariosComVaga.find(v => v.id == selectedVoluntarioId);
                        if (voluntarioSelecionado) {
                            document.getElementById('voluntarioDetails').innerHTML = `<b>Telefone do Voluntário:</b> ${voluntarioSelecionado.telefone || 'Não informado'}`;
                        }
                    }

                    voluntarioSelect.addEventListener('change', showVoluntarioDetails);
                    showVoluntarioDetails();
                } else {
                    voluntarioInfoEl.innerHTML = '<p class="text-danger">Nenhum voluntário disponível nesta data. Por favor, escolha outra.</p>';
                }
            }
        });
        if (doacaoParaAgendar && doacaoParaAgendar.agendamento) {
            const agendamentoExistente = doacaoParaAgendar.agendamento;
            const submitButton = agendamentoForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Reagendar Coleta';

            fp.setDate(agendamentoExistente.dataColeta, true);


            setTimeout(() => {
                const voluntarioSelect = document.getElementById('voluntarioSelect');
                if (voluntarioSelect) {
                    voluntarioSelect.value = agendamentoExistente.voluntarioId;

                    voluntarioSelect.dispatchEvent(new Event('change'));
                }
            }, 500);
        }

    } catch (error) {
        console.error('Erro ao inicializar a página de agendamento:', error);
        ongNomeEl.textContent = 'Ocorreu um erro ao carregar a página. Tente novamente.';
        ongNomeEl.classList.add('text-danger');
    }

    agendamentoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const doacaoId = alimentoSelectEl.value;
        const dataSelecionada = dataColetaEl.value;
        const voluntarioSelect = document.getElementById('voluntarioSelect');
        const voluntarioId = voluntarioSelect ? voluntarioSelect.value : null;

        if (!doacaoId || !dataSelecionada || !voluntarioId) {
            alert('Por favor, preencha todos os campos: doação, data e voluntário.');
            return;
        }
        
        const voluntarioSelecionado = (ongData.voluntarios || []).find(v => v.id == voluntarioId);
        if (!voluntarioSelecionado) {
            alert('Voluntário selecionado não encontrado. Por favor, tente novamente.');
            return;
        }

        try {
            const doacaoResponse = await fetch(window.getApiUrl(`alimentos/${doacaoId}`));
            if (!doacaoResponse.ok) {
                throw new Error('Falha ao buscar os dados da doação para atualização.');
            }
            const doacaoParaAtualizar = await doacaoResponse.json();

            doacaoParaAtualizar.status = 'Agendado';
            doacaoParaAtualizar.agendamento = {
                dataColeta: dataSelecionada,
                voluntarioId: voluntarioId,
                voluntarioNome: voluntarioSelecionado.nome,
                ongId: ongId,
                ongNome: ongData.nome
            };

            const updateResponse = await fetch(window.getApiUrl(`alimentos/${doacaoId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(doacaoParaAtualizar)
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json().catch(() => ({}));
                throw new Error(`Falha ao salvar o agendamento no servidor. Status: ${updateResponse.status}. Detalhes: ${JSON.stringify(errorData)}`);
            }

            alert('Coleta agendada com sucesso!');
            window.location.href = 'perfil_usuario.html';

        } catch (error) {
            console.error('Erro ao salvar agendamento:', error);
            alert(`Não foi possível salvar o agendamento. Tente novamente. Erro: ${error.message}`);
        }
    });
});