// Ao carregar a página  
document.addEventListener("DOMContentLoaded", function () {  
    // Selecionar o botão "Voltar"  
    const backButton = document.getElementById("back");  
    
    // Adicionar um evento de clique ao botão "Voltar"  
    backButton.addEventListener("click", function (event) {  
        event.preventDefault(); // Previne o comportamento padrão do link  
        alert("Função de voltar ainda não implementada."); // Exibe um alerta (pode ser substituído por ação real)  
    });  

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
        
        // Aqui você pode fazer algo com os dados, como enviar para um servidor  
        console.log("Dados do Formulário:", formDataObject);  
        
        // Exibir uma mensagem de sucesso (apenas um exemplo)  
        alert("Cadastro realizado com sucesso!");  

        // Limpar o formulário após o envio  
        form.reset();  
    });  
});  