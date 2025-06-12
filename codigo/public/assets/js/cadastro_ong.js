
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


        const addressString = `${formDataObject.rua}, ${formDataObject.numero}, ${formDataObject.bairro}, ${formDataObject.cidade}, ${formDataObject.estado}, ${formDataObject.cep}`;

        const coordinates = await geocodeAddress(addressString);


        fetch("http://localhost:3001/ongs")
            .then(response => response.json())
            .then(async data => {
                formDataObject.id = data.length + 1; 

                formDataObject.endereco = {
                    rua: formDataObject.rua,
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


                formDataObject.familias_ajudadas = 0;
                formDataObject.colaboradores_mensais = 0;
                formDataObject.voluntarios = [];
                formDataObject.data_ultima_ajuda = null;

                fetch("http://localhost:3001/ongs", {
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
    });  
});