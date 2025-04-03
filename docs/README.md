# Introdução

Informações básicas do projeto.

* **Projeto:** [Alimento para todos]
* **Repositório GitHub:** [Repositorio](https://github.com/ICEI-PUC-Minas-PMGES-TI/pmg-es-2025-1-ti1-2401100-nutritech)
* **Membros da equipe:**

  * [Artur Neves](https://github.com/Nevez6)
  * [Arthur Vieira](https://github.com/arthurvieiralopes)
  * [Guilherme Pereira](https://github.com/GuilhermePBittencourt)
  * [Kathleen Lorrayne](https://github.com/KathleenLorrayne01)
  * [Larissa Monção](https://github.com/LarissaMoncao)
  * [Matheus Figueiredo](https://github.com/matheusfigueiredo12)
  * [Lucas Duarte](https://github.com/caslulu)
  * [Raphael Thierry](https://github.com/Thierry07)

A documentação do projeto é estruturada da seguinte forma:

1. Introdução
2. Contexto
3. Product Discovery
4. Product Design
5. Metodologia
6. Solução
7. Referências Bibliográficas

✅ [Documentação de Design Thinking (MIRO)](files/processo-dt.pdf)

# Contexto

Detalhes sobre o espaço de problema, os objetivos do projeto, sua justificativa e público-alvo.

## Problema

**A insegurança alimentar afeta muitas comunidades em Belo Horizonte, e a distribuição de alimentos pelas ONGs enfrenta desafios logísticos. Além disso, a complexidade do processo de doação desmotiva muitas pessoas a contribuírem, reduzindo o alcance das iniciativas de ajuda.A insegurança alimentar presente em muitas comunidades de Belo Horizonte, a dificuldade em relação a distribuição de alimentos das ONGs e a dificuldade para realizar as Doações, que faz com que muitas pessoas desistam de ajudar o proximo.**

## Objetivos

**Objetivo Geral**: Desenvolver uma aplicação que facilite a conexão entre doadores e ONGs, tornando o processo de doação mais acessível e eficiente para reduzir a insegurança alimentar em comunidades de Belo Horizonte.

**Objetivos Específicos:**

* Criar uma funcionalidade que exiba ONGs confiáveis próximas ao doador, incentivando doações.

* Desenvolver um sistema de geolocalização que permita que pessoas em situação de vulnerabilidade encontrem facilmente ONGs próximas para buscar auxílio.

* Aumentar a quantidade de doações realizadas, contribuindo para minimizar a insegurança alimentar na região.


## Justificativa

**A insegurança alimentar é uma realidade para muitas comunidades de Belo Horizonte, e embora existam ONGs dedicadas a minimizar esse problema, as mesmas possuem problemas em relação a distribuição de alimentos. Além disso, muitas pessoas que desejam doar encontram dificuldades para localizar instituições confiáveis, o que acaba desmotivando.  \
Diante disso, este projeto busca desenvolver uma aplicação que simplifique essa conexão, permitindo que doadores encontrem ONGs próximas e que pessoas em situação de vulnerabilidade localizem pontos de apoio. Utilizando geolocalização e dados reais, a proposta visa tornar o processo mais acessível, eficiente e com maior impacto na luta contra a fome.**

## Público-Alvo

 **O Publico-Alvo da aplicação são:**  
 * **Doadores:** Pessoas que desejam contribuir com doações de alimentos, mas enfrentam dificuldades no processo, seja por falta de tempo, desconhecimento sobre ONGs confiáveis ou insegurança quanto ao impacto de suas doações.
 * **ONGs:** ONGs que buscam otimizar a captação de doações, ampliar seu alcance e melhorar a logística da distribuição de alimentos para atender mais pessoas em situação de vulnerabilidade.
 * **Necessitados:** Pessoas que necessitam de doações de alimentos e precisam de uma maneira mais acessível e rápida de encontrar ONGs próximas que possam oferecer assistência.

# Product Discovery

## Etapa de Entendimento

**![Matriz de alinhamento e Stakeholders](images/matriz-stake.jpg)**
**![Entrevista e Highlight](images/entrevista-highlight.jpg)**


## Etapa de Definição

### Personas

**![Persona](images/persona.jpg)**

# Product Design

Nesse momento, vamos transformar os insights e validações obtidos em soluções tangíveis e utilizáveis. Essa fase envolve a definição de uma proposta de valor, detalhando a prioridade de cada ideia e a consequente criação de wireframes, mockups e protótipos de alta fidelidade, que detalham a interface e a experiência do usuário.

## Histórias de Usuários

Com base na análise das personas foram identificadas as seguintes histórias de usuários:

**![Historia de Usuarios](images/historia-usuarios.jpg)**


## Proposta de Valor

![Proposta de valor](images/proposta-de-valor.jpg)


## Requisitos

As tabelas que se seguem apresentam os requisitos funcionais e não funcionais que detalham o escopo do projeto.

### Requisitos Funcionais

| ID      | Requisitos Funcionais                                | Prioridade |
|---------|------------------------------------------------------|------------|
| RF-001  | O sistema deve cadastrar os Doadores               | Alta       |
| RF-002  | O sistema deve cadastrar as Ongs                   | Alta       |
| RF-003  | O sistema deve ter um Feed para a Ong              | Média      |
| RF-004  | O sistema deve permitir filtrar pesquisas          | Média      |
| RF-005  | O Sistema deve ter um mapa com as Ongs de BH       | Alta       |
| RF-006  | Deve ter um sistema de Avaliação de ONGs           | Média      |
| RF-007  | Deve ter uma opção de receber emails               | Baixa      |
| RF-008  | O sistema deve cadastrar as Pessoas Necessitadas   | Baixa      |
| RF-009  | O sistema tem que ter uma opção de Doação Recorrente | Baixa   |
| RF-010  | O sistema deve ter Dashboard para ONGs             | Baixa      |

### Requisitos não Funcionais

| ID      | Requisitos Não Funcionais                                          | Prioridade |
|---------|--------------------------------------------------------------------|------------|
| RNF-001 | O Layout do sistema deve ser responsivo, principalmente para mobile | Alta       |
| RNF-002 | O sistema deve processar Requests de maneira rápida               | Média      |
| RNF-003 | O sistema tem que garantir a segurança de dados dos usuários      | Alta       |
| RNF-004 | O sistema tem que ser fácil de escalar                            | Média      |
| RNF-005 | O sistema tem que ter uma interface fácil de compreender          | Alta       |

### Restrições do Projeto  

| ID    | Restrições do Projeto                                      | Categoria    |
|-------|------------------------------------------------------------|-------------|
| R-001 | O processo deve utilizar HTML, CSS, JavaScript para desenvolvimento | Linguagens  |
| R-002 | O sistema deve utilizar Heroku como ambiente              | Ambiente    |

## Projeto de Interface

Artefatos relacionados com a interface e a interacão do usuário na proposta de solução.

### Wireframes

Estes são os protótipos de telas do sistema.

**✳️✳️✳️ COLOQUE AQUI OS PROTÓTIPOS DE TELAS COM TÍTULO E DESCRIÇÃO ✳️✳️✳️**

##### TELA XPTO ⚠️ EXEMPLO ⚠️

Descrição para a tela XPTO

![Exemplo de wireframe](images/exemplo-wireframe.png)

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Wireframes são protótipos das telas da aplicação usados em design de interface para sugerir a estrutura de um site web e seu relacionamentos entre suas páginas. Um wireframe web é uma ilustração semelhante ao layout de elementos fundamentais na interface.
>
> **Orientações**:
>
> - [Ferramentas de Wireframes](https://rockcontent.com/blog/wireframes/)
> - [Figma](https://www.figma.com/)
> - [Adobe XD](https://www.adobe.com/br/products/xd.html#scroll)
> - [MarvelApp](https://marvelapp.com/developers/documentation/tutorials/)

### User Flow

**✳️✳️✳️ COLOQUE AQUI O DIAGRAMA DE FLUXO DE TELAS ✳️✳️✳️**

![Exemplo de fluxo de telas](images/exemplo-userflow.png)

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Fluxo de usuário (User Flow) é uma técnica que permite ao desenvolvedor mapear todo fluxo de telas do site ou app. Essa técnica funciona para alinhar os caminhos e as possíveis ações que o usuário pode fazer junto com os membros de sua equipe.
>
> **Orientações**:
>
> - [User Flow: O Quê É e Como Fazer?](https://medium.com/7bits/fluxo-de-usu%C3%A1rio-user-flow-o-que-%C3%A9-como-fazer-79d965872534)
> - [User Flow vs Site Maps](http://designr.com.br/sitemap-e-user-flow-quais-as-diferencas-e-quando-usar-cada-um/)
> - [Top 25 User Flow Tools &amp; Templates for Smooth](https://www.mockplus.com/blog/post/user-flow-tools)

### Protótipo Interativo

**✳️✳️✳️ COLOQUE AQUI UM IFRAME COM SEU PROTÓTIPO INTERATIVO ✳️✳️✳️**

✅ [Protótipo Interativo (MarvelApp)](https://marvelapp.com/prototype/4hd6091?emb=1&iosapp=false&frameless=false)  ⚠️ EXEMPLO ⚠️

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Um protótipo interativo apresenta o projeto de interfaces e permite ao usuário navegar pelas funcionalidades como se estivesse lidando com o software pronto. Utilize as mesmas ferramentas de construção de wireframes para montagem do seu protótipo interativo. Inclua o link para o protótipo interativo do projeto.

# Metodologia

Detalhes sobre a organização do grupo e o ferramental empregado.

## Ferramentas

Relação de ferramentas empregadas pelo grupo durante o projeto.

| Ambiente                    | Plataforma | Link de acesso                                     |
| --------------------------- | ---------- | -------------------------------------------------- |
| Processo de Design Thinking | Miro       | [Miro](https://miro.com/app/board/uXjVIaSTdXg=/) |
| Repositório de código     | GitHub     | [Github](https://github.com/ICEI-PUC-Minas-PMGES-TI/pmg-es-2025-1-ti1-2401100-nutritech)      |
| Hospedagem do site          | Render     | https://site.render.com/XXXXXXX ⚠️ EXEMPLO ⚠️ |
| Protótipo Interativo       | MarvelApp  | https://marvelapp.com/XXXXXXX ⚠️ EXEMPLO ⚠️   |
|                             |            |                                                    |

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Liste as ferramentas empregadas no desenvolvimento do projeto, justificando a escolha delas, sempre que possível. Inclua itens como: (1) Editor de código, (2) )ferramentas de comunicação, (3) )ferramentas de diagramação, (4) )plataformas de hospedagem, entre outras.

## Gerenciamento do Projeto

Divisão de papéis no grupo e apresentação da estrutura da ferramenta de controle de tarefas (Kanban).

![Exemplo de Kanban](images/exemplo-kanban.png)

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Nesta parte do documento, você deve apresentar  o processo de trabalho baseado nas metodologias ágeis, a divisão de papéis e tarefas, as ferramentas empregadas e como foi realizada a gestão de configuração do projeto via GitHub.
>
> Coloque detalhes sobre o processo de Design Thinking e a implementação do Framework Scrum seguido pelo grupo. O grupo poderá fazer uso de ferramentas on-line para acompanhar o andamento do projeto, a execução das tarefas e o status de desenvolvimento da solução.
>
> **Orientações**:
>
> - [Sobre Projects - GitHub Docs](https://docs.github.com/pt/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)
> - [Gestão de projetos com GitHub | balta.io](https://balta.io/blog/gestao-de-projetos-com-github)
> - [(460) GitHub Projects - YouTube](https://www.youtube.com/playlist?list=PLiO7XHcmTsldZR93nkTFmmWbCEVF_8F5H)
> - [11 Passos Essenciais para Implantar Scrum no seu Projeto](https://mindmaster.com.br/scrum-11-passos/)
> - [Scrum em 9 minutos](https://www.youtube.com/watch?v=XfvQWnRgxG0)

# Solução Implementada

Esta seção apresenta todos os detalhes da solução criada no projeto.

## Vídeo do Projeto

O vídeo a seguir traz uma apresentação do problema que a equipe está tratando e a proposta de solução. ⚠️ EXEMPLO ⚠️

[![Vídeo do projeto](images/video.png)](https://www.youtube.com/embed/70gGoFyGeqQ)

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> O video de apresentação é voltado para que o público externo possa conhecer a solução. O formato é livre, sendo importante que seja apresentado o problema e a solução numa linguagem descomplicada e direta.
>
> Inclua um link para o vídeo do projeto.

## Funcionalidades

Esta seção apresenta as funcionalidades da solução.Info

##### Funcionalidade 1 - Cadastro de Contatos ⚠️ EXEMPLO ⚠️

Permite a inclusão, leitura, alteração e exclusão de contatos para o sistema

* **Estrutura de dados:** [Contatos](#ti_ed_contatos)
* **Instruções de acesso:**
  * Abra o site e efetue o login
  * Acesse o menu principal e escolha a opção Cadastros
  * Em seguida, escolha a opção Contatos
* **Tela da funcionalidade**:

![Tela de Funcionalidade](images/exemplo-funcionalidade.png)

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Apresente cada uma das funcionalidades que a aplicação fornece tanto para os usuários quanto aos administradores da solução.
>
> Inclua, para cada funcionalidade, itens como: (1) titulos e descrição da funcionalidade; (2) Estrutura de dados associada; (3) o detalhe sobre as instruções de acesso e uso.

## Estruturas de Dados

Descrição das estruturas de dados utilizadas na solução com exemplos no formato JSON.Info

##### Estrutura de Dados - Contatos   ⚠️ EXEMPLO ⚠️

Contatos da aplicação

```json
  {
    "id": 1,
    "nome": "Leanne Graham",
    "cidade": "Belo Horizonte",
    "categoria": "amigos",
    "email": "Sincere@april.biz",
    "telefone": "1-770-736-8031",
    "website": "hildegard.org"
  }
  
```

##### Estrutura de Dados - Usuários  ⚠️ EXEMPLO ⚠️

Registro dos usuários do sistema utilizados para login e para o perfil do sistema

```json
  {
    id: "eed55b91-45be-4f2c-81bc-7686135503f9",
    email: "admin@abc.com",
    id: "eed55b91-45be-4f2c-81bc-7686135503f9",
    login: "admin",
    nome: "Administrador do Sistema",
    senha: "123"
  }
```

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Apresente as estruturas de dados utilizadas na solução tanto para dados utilizados na essência da aplicação quanto outras estruturas que foram criadas para algum tipo de configuração
>
> Nomeie a estrutura, coloque uma descrição sucinta e apresente um exemplo em formato JSON.
>
> **Orientações:**
>
> * [JSON Introduction](https://www.w3schools.com/js/js_json_intro.asp)
> * [Trabalhando com JSON - Aprendendo desenvolvimento web | MDN](https://developer.mozilla.org/pt-BR/docs/Learn/JavaScript/Objects/JSON)

## Módulos e APIs

Esta seção apresenta os módulos e APIs utilizados na solução

**Images**:

* Unsplash - [https://unsplash.com/](https://unsplash.com/) ⚠️ EXEMPLO ⚠️

**Fonts:**

* Icons Font Face - [https://fontawesome.com/](https://fontawesome.com/) ⚠️ EXEMPLO ⚠️

**Scripts:**

* jQuery - [http://www.jquery.com/](http://www.jquery.com/) ⚠️ EXEMPLO ⚠️
* Bootstrap 4 - [http://getbootstrap.com/](http://getbootstrap.com/) ⚠️ EXEMPLO ⚠️

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Apresente os módulos e APIs utilizados no desenvolvimento da solução. Inclua itens como: (1) Frameworks, bibliotecas, módulos, etc. utilizados no desenvolvimento da solução; (2) APIs utilizadas para acesso a dados, serviços, etc.

# Referências

As referências utilizadas no trabalho foram:

* SOBRENOME, Nome do autor. Título da obra. 8. ed. Cidade: Editora, 2000. 287 p ⚠️ EXEMPLO ⚠️

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Inclua todas as referências (livros, artigos, sites, etc) utilizados no desenvolvimento do trabalho.
>
> **Orientações**:
>
> - [Formato ABNT](https://www.normastecnicas.com/abnt/trabalhos-academicos/referencias/)
> - [Referências Bibliográficas da ABNT](https://comunidade.rockcontent.com/referencia-bibliografica-abnt/)
