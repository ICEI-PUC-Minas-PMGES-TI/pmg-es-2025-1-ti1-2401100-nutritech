// Ao carregar a página  
document.addEventListener("DOMContentLoaded", function () {  
    // Selecionar o botão "Voltar"  
    const backButton = document.getElementById("back");  
    
    // Selecionar o formulário  
    const form = document.querySelector("form");  
    
    // Adicionar um evento de envio ao formulário  
    form.addEventListener("submit", function (event) {  
        event.preventDefault(); // Previna o envio do formulário padrão  
        
        // Coletar os dados do formulário  
        const formData = new FormData(form);  
        let formDataObject = {};  
        formData.forEach((value, key) => {  
            formDataObject[key] = value;  
        });  

        // Adiciona o ID da ONG com base na posição
        fetch("http://localhost:3001/ongs")
            .then(response => response.json())
            .then(data => {
                formDataObject.id = data.length + 1; // Define o ID como o próximo número na sequência

                formDataObject.endereco = {
                    rua: formDataObject.rua,
                    numero: formDataObject.numero,
                    cidade: formDataObject.cidade,
                    bairro: formDataObject.bairro,
                    estado: formDataObject.estado,
                    cep: formDataObject.cep
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

                formDataObject.familias_ajudadas = 0;
                formDataObject.colaboradores_mensais = 0;
                formDataObject.voluntarios = [];
                formDataObject.data_ultima_ajuda = null;

                // Envia para o JSON Server
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
            });
    });  
});