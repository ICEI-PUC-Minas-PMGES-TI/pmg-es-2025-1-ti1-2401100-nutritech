document.addEventListener("DOMContentLoaded", async function () {
    const ongNameTitle = document.getElementById("ong-name-title");
    const totalDinheiroEl = document.getElementById("total-dinheiro");
    const totalAlimentosEl = document.getElementById("total-alimentos");
    const quantidadeChartCanvas = document.getElementById("quantidadeChart").getContext('2d');
    const valorChartCanvas = document.getElementById("valorChart").getContext('2d');
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const filterButton = document.getElementById("filterButton");

    let quantidadeChart, valorChart;

    startDateInput.addEventListener('change', function() {
        endDateInput.min = this.value;
        if (endDateInput.value && new Date(endDateInput.value) < new Date(this.value)) {
            endDateInput.value = '';
        }
    });

    const params = new URLSearchParams(window.location.search);
    const ongId = params.get('id');

    if (!ongId) {
        ongNameTitle.textContent = "ID da ONG não fornecido.";
        return;
    }

    const API_URL = window.getApiUrl(`ongs/${ongId}`);

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Não foi possível carregar os dados da ONG.');
        }
        const ong = await response.json();

        ongNameTitle.textContent = `Dashboard da ${ong.nome || 'ONG'}`;

        function updateDashboard(startDate, endDate) {
            if (quantidadeChart) {
                quantidadeChart.destroy();
            }
            if (valorChart) {
                valorChart.destroy();
            }

            let totalDinheiro = 0;
            let totalAlimentosValor = 0;
            let countDoacoesDinheiro = 0;
            let countDoacoesAlimentos = 0;

            const doacoesFiltradas = ong.doacoes.filter(doacao => {
                if (!startDate || !endDate) return true;
                const doacaoDate = new Date(doacao.data);
                return doacaoDate >= new Date(startDate) && doacaoDate <= new Date(endDate);
            });

            if (doacoesFiltradas && doacoesFiltradas.length > 0) {
                doacoesFiltradas.forEach(doacao => {
                    if (doacao.descricao && doacao.descricao.toLowerCase() === 'dinheiro') {
                        totalDinheiro += doacao.valor || 0;
                        countDoacoesDinheiro++;
                    } else {
                        totalAlimentosValor += doacao.valor || 0;
                        countDoacoesAlimentos++;
                    }
                });
            }

            totalDinheiroEl.textContent = totalDinheiro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            totalAlimentosEl.textContent = countDoacoesAlimentos;

            quantidadeChart = new Chart(quantidadeChartCanvas, {
                type: 'pie',
                data: {
                    labels: ['Doações de Alimentos', 'Doações em Dinheiro'],
                    datasets: [{
                        label: 'Quantidade de Doações',
                        data: [countDoacoesAlimentos, countDoacoesDinheiro],
                        backgroundColor: [
                            'rgba(130, 177, 255, 0.7)',
                            'rgba(167, 255, 235, 0.7)'
                        ],
                        borderColor: [
                            'rgba(130, 177, 255, 1)',
                            'rgba(167, 255, 235, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Distribuição por Quantidade de Doações'
                        }
                    }
                }
            });

            valorChart = new Chart(valorChartCanvas, {
                type: 'pie',
                data: {
                    labels: ['Valor de Alimentos (R$)', 'Valor em Dinheiro (R$'],
                    datasets: [{
                        label: 'Valor das Doações (R$)',
                        data: [totalAlimentosValor, totalDinheiro],
                        backgroundColor: [
                            'rgba(255, 138, 128, 0.7)',
                            'rgba(255, 209, 128, 0.7)' 
                        ],
                        borderColor: [
                            'rgba(255, 138, 128, 1)',
                            'rgba(255, 209, 128, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Distribuição por Valor das Doações (R$)'
                        }
                    }
                }
            });
        }

        filterButton.addEventListener("click", () => {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;

            if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
                alert("A data de fim deve ser maior ou igual à data de início.");
                return;
            }

            updateDashboard(startDate, endDate);
        });

        updateDashboard();

    } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        ongNameTitle.textContent = "Erro ao carregar dados.";
    }
});
