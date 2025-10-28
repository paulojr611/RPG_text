Organiza+
Organiza+ é uma plataforma web simples e gratuita para gerenciamento de tarefas, metas e calendário. O objetivo é oferecer uma experiência intuitiva e eficiente, permitindo que os usuários organizem seu dia em menos de um minuto.

Funcionalidades
Gerenciamento de tarefas com marcação de conclusão

Visualização de calendário semanal/mensal

Criação e acompanhamento de metas

Interface responsiva com tema claro/escuro

Notificações via Web Push para lembretes

Tecnologias Utilizadas
Laravel 10.48.25

Vue 3.5.13

Vite 5.4.11

axios 1.7.9

laravel-vite-plugin 1.1.1

Tailwind CSS

Instalação
Pré-requisitos
PHP 8.3.6

Composer

Node.js (versão compatível com Vite 5.4.11)

MySQL ou outro banco de dados compatível
Cubos Academy

Passos
Clone o repositório:
DEV Community
+11
DIO
+11
Alura
+11

bash
Copiar
Editar
git clone https://github.com/seu-usuario/organiza-plus.git
cd organiza-plus/backend
Instale as dependências do backend:

bash
Copiar
Editar
composer install
Copie o arquivo .env.example para .env e configure as variáveis de ambiente:

bash
Copiar
Editar
cp .env.example .env
Gere a chave da aplicação:

bash
Copiar
Editar
php artisan key:generate
Configure o banco de dados no arquivo .env e execute as migrações:

bash
Copiar
Editar
php artisan migrate
Instale as dependências do frontend:

bash
Copiar
Editar
cd frontend
npm install
Compile os assets com o Vite:

bash
Copiar
Editar
npm run dev
Inicie o servidor de desenvolvimento do Laravel:

bash
Copiar
Editar
php artisan serve
🛠️ Estrutura do Projeto
bash
Copiar
Editar
organiza-plus/
├── backend/             # Projeto Laravel
│   ├── app/
│   ├── routes/
│   ├── resources/
│   └── ...
├── frontend/            # Projeto Vue 3
│   ├── src/
│   ├── public/
│   └── ...
├── docs/                # Documentação e diagramas
└── README.md