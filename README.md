# 📖 Mangá do Luquinhas

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)
![Django](https://img.shields.io/badge/Django-4.2-092E20?style=for-the-badge&logo=django)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)
![Licença](https://img.shields.io/badge/licença-MIT-green?style=for-the-badge)

Este é o repositório oficial do "Mangá do Luquinhas", um site pessoal criado com Django para apresentar e compartilhar a história, os personagens e os capítulos de um mangá original. O projeto foi desenvolvido com foco em um design moderno, responsivo e com funcionalidades dinâmicas.

### ✨ [Acesse o Site Ao Vivo](https://seu-link-do-vercel.app) ✨

---


## 🚀 Funcionalidades Principais

* **Homepage Dinâmica:** Apresenta as últimas atualizações do projeto de forma automática.
* **Changelog Automático:** Integrado diretamente com a API do GitHub para buscar e exibir os commits mais recentes do repositório, mantendo os visitantes informados sobre o progresso.
* **Seções de Conteúdo:** Páginas dedicadas para explorar a **História**, os **Personagens** e os **Capítulos** do mangá.
* **Sistema de Comentários:** Uma seção "Sobre" que funciona como um livro de visitas, permitindo que os usuários deixem comentários, com um sistema de paginação para organizar as mensagens.
* **Design Moderno e Responsivo:** Um layout com tema escuro, totalmente personalizado com CSS moderno (Flexbox, Animações, Variáveis CSS), barra de rolagem customizada e efeitos parallax para uma experiência de usuário imersiva.
* **Fundo Dinâmico:** A seção de conteúdo principal pode ter sua imagem de fundo alterada dinamicamente através do backend do Django, sem a necessidade de alterar o código CSS.

## 🛠️ Tecnologias Utilizadas

* **Backend:** Python, Django
* **Frontend:** HTML5, CSS3 (com animações e efeitos avançados)
* **Banco de Dados:** PostgreSQL (hospedado no Supabase)
* **API:** GitHub API
* **Deployment:** Vercel

## 🔧 Como Rodar o Projeto Localmente

Para executar este projeto em sua máquina local, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/Luisinho-PT/Manga-do-Lucas.git](https://github.com/Luisinho-PT/Manga-do-Lucas.git)
    cd Manga-do-Lucas
    ```

2.  **Crie e ative um ambiente virtual:**
    ```bash
    # Windows
    python -m venv .venv
    .\.venv\Scripts\activate

    # macOS / Linux
    python3 -m venv .venv
    source .venv/bin/activate
    ```

3.  **Instale as dependências:**
    *(Primeiro, certifique-se de ter um arquivo `requirements.txt`. Se não tiver, gere um com o comando: `pip freeze > requirements.txt`)*
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure as variáveis de ambiente:**
    * Crie um arquivo chamado `.env` na raiz do projeto.
    * Adicione as seguintes variáveis necessárias:
        ```
        SECRET_KEY='sua_chave_secreta_aqui'
        GITHUB_TOKEN='seu_token_pessoal_do_github_aqui'
        
        # Variáveis do Banco de Dados Supabase
        DB_NAME='postgres'
        DB_USER='postgres'
        DB_PASSWORD='sua_senha_do_banco_aqui'
        DB_HOST='db.id-do-seu-projeto.supabase.co'
        DB_PORT='5432'
        ```

5.  **Aplique as migrações do banco de dados:**
    ```bash
    python manage.py migrate
    ```

6.  **Inicie o servidor de desenvolvimento:**
    ```bash
    python manage.py runserver
    ```

    Agora você pode acessar o site em `http://127.0.0.1:8000`.

## 🔑 Variáveis de Ambiente

Para o funcionamento completo do projeto, as seguintes variáveis de ambiente são necessárias no arquivo `.env`:

* **`SECRET_KEY`**: A chave secreta do Django, usada para segurança criptográfica.
* **`GITHUB_TOKEN`** (Opcional, mas recomendado): Um [token de acesso pessoal do GitHub](https://docs.github.com/pt/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) para aumentar o limite de requisições à API do GitHub.

### Configurações do Supabase
* **`DB_NAME`**: O nome do banco de dados (geralmente `postgres`).
* **`DB_USER`**: O nome do usuário do banco (geralmente `postgres`).
* **`DB_PASSWORD`**: A senha que você definiu para o seu banco de dados no Supabase.
* **`DB_HOST`**: O host do banco de dados, encontrado nas configurações do seu projeto Supabase (em `Project Settings > Database > Connection string`).
* **`DB_PORT`**: A porta do banco de dados (geralmente `5432`).


---

Criado e desenvolvido por **Luís (Luquinhas)**.
