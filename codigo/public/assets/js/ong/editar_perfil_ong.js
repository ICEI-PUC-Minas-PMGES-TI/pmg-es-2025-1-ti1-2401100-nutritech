document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('edit-ong-form');
    const ongId = new URLSearchParams(window.location.search).get('id');
    const cancelButton = document.getElementById('cancelButton');
    const imageInput = document.getElementById('imagem');
    const imagePreview = document.getElementById('image-preview');
    const pageTitle = document.querySelector('.card-header h1');

    if (!ongId) {
        alert('ID da ONG não encontrado.');
        window.location.href = '../ong/ongs.html';
        return;
    }

    function formatarCNPJ(cnpj) {
        if (!cnpj) return '';
        const cnpjLimpo = String(cnpj).replace(/\D/g, '');
        if (cnpjLimpo.length !== 14) return cnpj;
        return cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    fetch(`http://localhost:3001/ongs/${ongId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao carregar dados da ONG');
            }
            return response.json();
        })
        .then(ong => {
            document.getElementById('nome').value = ong.nome || '';
            document.getElementById('cnpj').value = formatarCNPJ(ong.cnpj) || '';
            document.getElementById('descricao').value = ong.descricao || '';
            
            if (pageTitle && ong.nome) {
                pageTitle.textContent = `Editar Perfil de ${ong.nome}`;
            }

            if (ong.imagem) {
                imagePreview.src = ong.imagem;
                imagePreview.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Erro ao carregar dados da ONG:', error);
            alert('Não foi possível carregar os dados da ONG. Tente novamente.');
        });

    const cnpjInput = document.getElementById('cnpj');
    cnpjInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{2})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
        e.target.value = value;
    });

    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const file = imageInput.files[0];
        const nome = document.getElementById('nome').value;
        const cnpj = document.getElementById('cnpj').value.replace(/\D/g, '');
        const descricao = document.getElementById('descricao').value;

        let imageData = null;
        if (file) {
            try {
                imageData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(file);
                });
            } catch (error) {
                console.error('Erro ao ler o arquivo de imagem:', error);
                alert('Não foi possível ler o arquivo de imagem.');
                return;
            }
        }

        const updatedData = {
            nome: nome,
            cnpj: cnpj,
            descricao: descricao
        };

        if (imageData) {
            updatedData.imagem = imageData;
        }

        try {
            const response = await fetch(`http://localhost:3001/ongs/${ongId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert('Perfil atualizado com sucesso!');
                window.location.href = `perfildaong.html?id=${ongId}`;
            } else {
                const errorText = await response.text();
                throw new Error(`Falha na atualização: ${response.status} ${response.statusText} - ${errorText}`);
            }
        } catch (error) {
            console.error('Erro ao atualizar o perfil:', error);
            alert('Ocorreu um erro ao atualizar o perfil. Verifique o console para mais detalhes.');
        }
    });

    cancelButton.addEventListener('click', function(event) {
        event.preventDefault();
        window.location.href = `perfildaong.html?id=${ongId}`;
    });
});
