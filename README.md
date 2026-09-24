 ---logi-ject---

Sistema de Gestão de Estoque e Operações Logísticas

O logi-ject é uma aplicação Full Stack desenvolvida para simular um sistema corporativo de gestão de estoque e operações logísticas.

O projeto permite gerenciar produtos, categorias, fornecedores, armazéns, pedidos e inventários, além de acompanhar informações operacionais por meio de dashboard e relatórios.

A aplicação foi desenvolvida utilizando React + TypeScript no frontend, Node.js + Express + TypeScript no backend e PostgreSQL + Prisma ORM para persistência dos dados.

-- Preview:

Dashboard




O dashboard apresenta uma visão geral da operação, permitindo acompanhar os principais indicadores do sistema de forma centralizada.

📦 Produtos




Tela responsável pelo gerenciamento dos produtos cadastrados no sistema.

Entre as informações trabalhadas estão:

Produto
SKU
Código de barras
Categoria
Fornecedor
Unidade
Estoque mínimo
Estoque máximo
Preços
Status

Também são utilizados recursos de pesquisa, filtros e paginação.

🗂️ Categorias




Gerenciamento das categorias utilizadas para organizar os produtos.

🚚 Fornecedores




Cadastro e gerenciamento dos fornecedores relacionados aos produtos.

🏭 Armazéns




Gerenciamento dos armazéns utilizados pela operação logística.

A estrutura permite trabalhar com diferentes locais de armazenamento e organizar o estoque por unidade.

📋 Pedidos




Tela de gerenciamento dos pedidos logísticos.

O sistema trabalha com diferentes etapas do fluxo operacional, permitindo acompanhar o estado dos pedidos ao longo do processo.

📦 Inventário




Módulo destinado ao controle de inventário e conferência do estoque.

O processo permite comparar a quantidade registrada no sistema com a quantidade encontrada durante a contagem física.

📊 Relatórios




Área destinada à consulta e análise das informações da operação.

Os dados podem ser filtrados e exportados para utilização fora da aplicação.

-- Objetivo

O objetivo do projeto é demonstrar, na prática, o desenvolvimento de uma aplicação Full Stack com características encontradas em sistemas corporativos.

Mais do que um CRUD simples, o logi-ject reúne diferentes módulos relacionados ao processo logístico:

                    ┌──────────────┐
                    │    Usuários  │
                    └──────┬───────┘
                           │
                           ▼
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│  Produtos   │─────▶│   Estoque   │◀─────│  Armazéns    │
└──────┬──────┘      └──────┬───────┘      └──────────────┘
       │                     │
       ▼                     ▼
┌─────────────┐      ┌──────────────┐
│ Fornecedores│      │ Movimentações│
└─────────────┘      └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │    Pedidos   │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Inventário  │
                     └──────────────┘

 Funcionalidades:

Autenticação
Login
Logout
JWT
Refresh Token
Cookies HttpOnly
Hash de senha
Controle de sessão
Proteção de rotas
Perfis

O estoque é relacionado a:

Produto
   +
Armazém
   +
Localização

Isso permite representar produtos armazenados em diferentes locais dentro da operação.

-- Movimentações

O sistema suporta diferentes tipos de movimentação:

Entrada
IN

Entrada de produtos no estoque.

Saída
OUT

Saída de produtos do estoque.

Transferência
TRANSFER

Movimentação de produtos entre localizações.

Ajuste
ADJUSTMENT

Correção de estoque, normalmente relacionada a divergências ou ajustes operacionais.

-- Pedidos

O sistema permite trabalhar com pedidos de entrada e saída.

Fluxo operacional:

Pedido
   ↓
Separação
   ↓
Conferência
   ↓
Expedição

Status utilizados:

PENDING
SEPARATION
CONFERENCE
SHIPPED
CANCELLED

-- Inventário

O módulo de inventário permite realizar a conferência física do estoque.

Fluxo:

Estoque registrado
       ↓
Contagem física
       ↓
Comparação
       ↓
Identificação da diferença
       ↓
Ajuste

Isso permite representar um processo comum em operações de armazenagem.

-- Dashboard e relatórios

O sistema possui uma área de acompanhamento operacional com:

Indicadores
Movimentações
Estoque
Pedidos
Inventários
Dados recentes
Relatórios
Filtros
Exportação

-- Arquitetura
┌───────────────────────────────────────┐
│               FRONTEND                │
│                                       │
│        React + TypeScript + Vite      │
│                                       │
└──────────────────┬────────────────────┘
                   │
                   │ HTTP / REST
                   ▼
┌───────────────────────────────────────┐
│                BACKEND                │
│                                       │
│       Node.js + Express + TypeScript  │
│                                       │
│ Routes → Controllers → Services       │
│                 │                     │
│                 ▼                     │
│              Prisma                   │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│              PostgreSQL               │
└───────────────────────────────────────┘

-- Stacks --

Frontend:

React:
TypeScript
Vite
React 

Backend:
Node.js
Express
TypeScript
Prisma
Zod
JWT
bcrypt
Banco de dados
PostgreSQL
Infraestrutura
Docker
Docker Compose
Nginx
GitHub Actions

 Banco de dados

O banco utiliza PostgreSQL com Prisma ORM.

Principais entidades:

User
Category
Supplier
Product
Warehouse
Location
Stock
StockMovement
Order
OrderItem
Inventory
InventoryItem
RefreshToken

Os relacionamentos permitem representar os principais processos da aplicação, como produtos associados a categorias e fornecedores, estoque associado a armazéns e localizações, pedidos com seus respectivos itens e inventários relacionados aos produtos armazenados.

-- Segurança

O projeto possui mecanismos de segurança para autenticação e autorização.

Autenticação
JWT
Access Token
Refresh Token
Cookies HttpOnly
bcrypt
Controle de sessão
Autorização

RBAC baseado nos perfis:

ADMIN
SUPERVISOR
OPERATOR
Validação

Os dados recebidos pela API são validados utilizando Zod.

-- Docker

O projeto possui configuração Docker Compose para os principais serviços.

┌────────────────────┐
│      Frontend      │
│      Nginx         │
│       :8080        │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│      Backend       │
│   Node + Express   │
│       :3333        │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│     PostgreSQL     │
│       :5432        │
└────────────────────┘

Também está configurado o pgAdmin para administração do banco.


-- Instalação

Pré-requisitos:
Node.js
npm
Docker
Docker Compose
Git
Clone
git clone https://github.com/SEU-USUARIO/logi-ject.git

cd logi-ject
Backend
cd backend

npm install

Configure o .env:

PORT=3333

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/logi_ject?schema=public"

JWT_SECRET="change-this-development-secret"

JWT_REFRESH_SECRET="change-this-development-refresh-secret"

JWT_ACCESS_EXPIRES_IN="15m"

JWT_REFRESH_EXPIRES_IN_DAYS=7

FRONTEND_URL="http://localhost:5173"

NODE_ENV="development"

Gere o Prisma Client:

npm run db:generate

Execute as migrations:

npm run db:migrate -- --name init

Execute o seed:

npm run db:seed

Inicie o backend:

npm run dev
Frontend

Em outro terminal:

cd frontend

npm install

npm run dev

A aplicação ficará disponível em:

http://localhost:5173

 Executando com Docker

Na raiz do projeto:

docker compose up --build

Aplicação:

http://localhost:8080

Backend:

http://localhost:3333

pgAdmin:

http://localhost:5050


-- Estrutura:

logi-ject/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── schemas/
│       ├── services/
│       ├── utils/
│       └── server.ts
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── pages/
│       ├── services/
│       ├── assets/
│       ├── App.tsx
│       └── main.tsx
│
├── Screenshots/
│   ├── Dashboard.png
│   ├── Produtos.png
│   ├── Categorias.png
│   ├── Fornecedores.png
│   ├── Armazens.png
│   ├── Pedidos.png
│   ├── Inventario.png
│   └── Relatorios.png
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── .gitignore
└── README.md

-- API

A aplicação utiliza uma API REST organizada por módulos.

Principais recursos:

/api/auth
/api/users
/api/categories
/api/suppliers
/api/products
/api/warehouses
/api/locations
/api/stock
/api/movements
/api/orders
/api/inventory
/api/reports

Exemplos:

POST /api/auth/login

GET /api/products

GET /api/stock

POST /api/movements/in

POST /api/movements/out

POST /api/movements/transfer

GET /api/orders

GET /api/inventory

GET /api/reports

-- Principais fluxos:

Entrada de estoque:

Recebimento
    ↓
Produto
    ↓
Armazém
    ↓
Localização
    ↓
Entrada no estoque

Saída:

Pedido
    ↓
Separação
    ↓
Conferência
    ↓
Expedição
    ↓
Saída do estoque

Transferência:

Localização A
      ↓
   Produto
      ↓
Localização B

Inventário:

Estoque do sistema
        ↓
Contagem física
        ↓
Comparação
        ↓
Divergência
        ↓
Ajuste

-- CI

O projeto possui workflow de integração contínua utilizando GitHub Actions.

O pipeline realiza verificações relacionadas à construção da aplicação e validação do código.

-- Conhecimentos demonstrados

Este projeto demonstra conhecimentos em:

React
TypeScript
Node.js
Express
APIs REST
PostgreSQL
Prisma ORM
Modelagem de banco de dados
JWT
Refresh Token
RBAC
Autenticação
Autorização
Validação de dados
Docker
Docker Compose
Nginx
GitHub Actions
CI
Migrations
Seed
Gestão de estoque
Inventário
Processos logísticos
Relatórios
Exportação de dados

-- Autor

Nathan Mendes

Desenvolvedor Full Stack com foco em aplicações web, APIs, sistemas corporativos e integração entre sistemas.

LinkedIn:
https://www.linkedin.com/in/nathan-mendes-77a288251

GitHub:
https://github.com/NathanMendes0202

⭐ Sobre o projeto

O logi-ject foi desenvolvido como projeto de portfólio para demonstrar a construção de uma aplicação Full Stack com características de um sistema corporativo.

A proposta combina interface web, API REST, autenticação, banco de dados relacional, regras de negócio, gestão de estoque, processos logísticos e infraestrutura utilizando Docker.