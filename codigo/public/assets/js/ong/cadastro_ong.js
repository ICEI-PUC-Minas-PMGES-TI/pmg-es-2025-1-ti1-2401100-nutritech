document.addEventListener("DOMContentLoaded", function () {  
    const backButton = document.getElementById("back");  
    const form = document.querySelector("form");  
    const API_KEY = '5c44b3606f0c4083a694018d9e277792';
    async function geocodeAddress(addressString) {
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressString)}&apiKey=${API_KEY}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.features && data.features.length > 0) {
                const { lat, lon } = data.features[0].properties;
                return { lat, lng: lon };
            } else {
                console.warn("Não foi possível geocodificar o endereço:", addressString, data);
                return null;
            }
        } catch (error) {
            console.error("Erro ao geocodificar endereço:", error);
            return null;
        }
    }
    form.addEventListener("submit", async function (event) { 
        event.preventDefault();
        const formData = new FormData(form);  
        let formDataObject = {};  
        formData.forEach((value, key) => {  
            formDataObject[key] = value;  
        });  
        const imagemInput = form.imagem;
        const processOngCadastro = async (imagemBase64 = null) => {
            const addressString = `${formDataObject.rua}, ${formDataObject.numero}, ${formDataObject.bairro}, ${formDataObject.cidade}, ${formDataObject.estado}, ${formDataObject.cep}`;
            const coordinates = await geocodeAddress(addressString);
            fetch(window.getApiUrl("ongs"))
                .then(response => response.json())
                .then(async data => {
                    formDataObject.id = data.length > 0 ? Math.max(...data.map(ong => ong.id)) + 1 : 1;
                    formDataObject.endereco = {
                        logradouro: formDataObject.rua,
                        numero: formDataObject.numero,
                        cidade: formDataObject.cidade,
                        bairro: formDataObject.bairro,
                        estado: formDataObject.estado,
                        cep: formDataObject.cep,
                        lat: coordinates ? coordinates.lat : null,
                        lng: coordinates ? coordinates.lng : null 
                    };
                    delete formDataObject.rua;
                    delete formDataObject.numero;
                    delete formDataObject.cidade;
                    delete formDataObject.bairro;
                    delete formDataObject.estado;
                    delete formDataObject.cep;
                    formDataObject.contato = {
                        telefone: formDataObject.telefone,
                        email: formDataObject.email,
                        website: formDataObject.website
                    };
                    delete formDataObject.telefone;
                    delete formDataObject.email;
                    delete formDataObject.website;
                    const tiposDoacao = [];
                    const alimentosCheckbox = document.getElementById("tipo_doacao_alimentos");
                    const dinheiroCheckbox = document.getElementById("tipo_doacao_dinheiro");
                    if (alimentosCheckbox && alimentosCheckbox.checked) {
                        tiposDoacao.push(alimentosCheckbox.value);
                    }
                    if (dinheiroCheckbox && dinheiroCheckbox.checked) {
                        tiposDoacao.push(dinheiroCheckbox.value);
                    }
                    formDataObject.tipos_doacao_aceitos = tiposDoacao;
                    formDataObject.imagem = imagemBase64;
                    formDataObject.data_entrada = new Date().toISOString().split('T')[0];
                    formDataObject.familias_ajudadas = 0;
                    formDataObject.colaboradores_mensais = 0;
                    formDataObject.voluntarios = [];
                    formDataObject.data_ultima_ajuda = null;
                    fetch(window.getApiUrl("ongs"), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(formDataObject)
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(text => { throw new Error('Erro ao cadastrar ONG: ' + text); });
                        }
                        return response.json();
                    })
                    .then(data => {
                        alert("Cadastro realizado com sucesso!");
                        form.reset();
                    })
                    .catch(error => {
                        alert("Erro ao cadastrar ONG: " + error.message);
                        console.error(error);
                    });
                })
                .catch(error => { 
                    alert("Erro ao obter dados das ONGs para definir o ID: " + error.message);
                    console.error(error);
                });
        };
        if (imagemInput && imagemInput.files && imagemInput.files[0]) {
            const file = imagemInput.files[0];
            const reader = new FileReader();
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 400;
                let width = image.width;
                let height = image.height;
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
                processOngCadastro(dataUrl);
                URL.revokeObjectURL(image.src);
            };
            image.onerror = () => {
                console.error('Erro ao carregar a imagem da ONG para redimensionamento.');
                alert('Erro ao processar a imagem da ONG. Tentando cadastrar sem imagem.');
                processOngCadastro();
                URL.revokeObjectURL(image.src);
            };
            image.src = URL.createObjectURL(file);
        } else {
            processOngCadastro();
        }
    });  
    // Formatações de campos
    // Formatação do CNPJ
    document.getElementById('cnpj').addEventListener('input', function () {
        let val = this.value.replace(/\D/g, '');
        val = val.slice(0, 14);
        
        val = val.replace(/(\d{2})(\d)/, '$1.$2');
        val = val.replace(/(\d{3})(\d)/, '$1.$2');
        val = val.replace(/(\d{3})(\d)/, '$1/$2');
        val = val.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
        
        this.value = val;
    });

    // Formatação do telefone
    document.getElementById('telefone').addEventListener('input', function () {
        let val = this.value.replace(/\D/g, '');
        val = val.slice(0, 11);
        
        if (val.length <= 10) {
            // Telefone fixo: (XX) XXXX-XXXX
            val = val.replace(/(\d{2})(\d)/, '($1) $2');
            val = val.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            // Celular: (XX) XXXXX-XXXX
            val = val.replace(/(\d{2})(\d)/, '($1) $2');
            val = val.replace(/(\d{5})(\d)/, '$1-$2');
        }
        
        this.value = val;
    });

    // Formatação do CEP
    document.getElementById('cep').addEventListener('input', function () {
        let val = this.value.replace(/\D/g, '');
        val = val.slice(0, 8);
        
        val = val.replace(/(\d{5})(\d)/, '$1-$2');
        
        this.value = val;
    });
});