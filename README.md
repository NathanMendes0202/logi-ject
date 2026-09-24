# 📦 logi-ject

## Sistema Full Stack de Gestão de Estoque e Operações Logísticas

O **logi-ject** é uma aplicação Full Stack de gestão de estoque e operações logísticas, desenvolvida para simular um sistema corporativo utilizado em operações de armazenagem, controle de produtos, movimentação de estoque, pedidos e inventário.

O projeto utiliza **React + TypeScript** no frontend, **Node.js + Express + TypeScript** no backend e **PostgreSQL + Prisma ORM** para persistência. O ambiente também possui configuração com **Docker Compose**.

> **Projeto de portfólio:** desenvolvido para demonstrar conhecimentos em desenvolvimento Full Stack, APIs REST, autenticação, autorização, modelagem relacional, regras de negócio, controle de estoque, Docker e organização de aplicações corporativas.

---

# 🖥️ Screenshots

## Dashboard

![Dashboard](./Screenshots/Dashboard.png)

Visão geral da operação e dos principais indicadores do sistema.

## Produtos

![Produtos](./Screenshots/Produtos.png)

Gerenciamento de produtos, incluindo informações como SKU, código de barras, categoria, fornecedor, estoque mínimo/máximo, preços e status.

## Categorias

![Categorias](./Screenshots/Categorias.png)

Gerenciamento das categorias utilizadas para organizar os produtos.

## Fornecedores

![Fornecedores](./Screenshots/Fornecedores.png)

Cadastro e gerenciamento dos fornecedores relacionados aos produtos.

## Armazéns

![Armazéns](./Screenshots/Armazens.png)

Gerenciamento dos armazéns utilizados pela operação logística e organização física do estoque.

## Pedidos

![Pedidos](./Screenshots/Pedidos.png)

Gerenciamento dos pedidos logísticos e acompanhamento do fluxo operacional.

## Inventário

![Inventário](./Screenshots/Inventario.png)

Conferência física do estoque e identificação de divergências.

## Relatórios

![Relatórios](./Screenshots/Relatorios.png)

Consulta e análise das informações da operação, com filtros e recursos de exportação.

---

# 🎯 Objetivos

O projeto foi desenvolvido para representar uma aplicação mais próxima de um sistema corporativo real, trabalhando não apenas com CRUDs, mas também com relacionamentos e regras de negócio.

Principais objetivos:

- Desenvolver uma aplicação Full Stack completa.
- Criar uma API REST modular.
- Implementar autenticação e autorização.
- Modelar um banco de dados relacional.
- Controlar estoque por produto, armazém e localização.
- Registrar movimentações de estoque.
- Representar processos de pedidos.
- Realizar inventário e controle de divergências.
- Criar dashboard e relatórios.
- Utilizar Docker para padronizar o ambiente.
- Demonstrar separação de responsabilidades e organização de código.

---

# 🚀 Funcionalidades

## 🔐 Autenticação e autorização

- Login
- Logout
- JWT
- Access Token
- Refresh Token
- Cookies HttpOnly
- Hash de senha com bcrypt
- Proteção de rotas
- RBAC

### Perfis

| Perfil | Descrição |
|---|---|
| `ADMIN` | Administração e gerenciamento geral |
| `SUPERVISOR` | Supervisão das operações |
| `OPERATOR` | Execução das operações permitidas |

## 📦 Produtos

- Cadastro e edição
- Pesquisa
- Filtros
- Paginação
- Ativação/desativação
- Categorias
- Fornecedores
- Estoque mínimo e máximo
- Preços

## 🗂️ Categorias

- Cadastro
- Consulta
- Edição
- Ativação/desativação
- Associação com produtos

## 🚚 Fornecedores

- Cadastro
- Edição
- Consulta
- Status
- Associação com produtos

## 🏭 Armazéns e localizações

A estrutura de armazenamento considera:

```text
Armazém
   │
   └── Localização
          │
          └── Produto
```

## 📊 Controle de estoque

O estoque é controlado por:

```text
Produto + Armazém + Localização
```

## 🔄 Movimentações

### Entrada

`IN` — registra a entrada de produtos.

### Saída

`OUT` — registra a retirada de produtos.

### Transferência

`TRANSFER` — movimenta produtos entre localizações.

### Ajuste

`ADJUSTMENT` — corrige quantidades de estoque.

## 📋 Pedidos

O sistema trabalha com pedidos de entrada e saída.

Fluxo:

```text
Pedido
   ↓
Separação
   ↓
Conferência
   ↓
Expedição
```

Status:

```text
PENDING
SEPARATION
CONFERENCE
SHIPPED
CANCELLED
```

## 📦 Inventário

```text
Estoque do sistema
        ↓
Contagem física
        ↓
Comparação
        ↓
Divergência
        ↓
Ajuste
```

## 📈 Dashboard e relatórios

- Indicadores
- Estoque
- Movimentações
- Pedidos
- Inventários
- Dados recentes
- Filtros
- Exportação

---

# 🏗️ Arquitetura

```text
┌───────────────────────────────────────┐
│               FRONTEND                │
│        React + TypeScript + Vite      │
└──────────────────┬────────────────────┘
                   │ HTTP / REST
                   ▼
┌───────────────────────────────────────┐
│                BACKEND                │
│       Node.js + Express + TypeScript  │
│                                       │
│ Routes → Controllers → Services       │
│                 ↓                     │
│              Prisma                   │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│              PostgreSQL               │
└───────────────────────────────────────┘
```

---

# 🛠️ Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- Zod
- JWT
- bcrypt

### Banco

- PostgreSQL 16

### Infraestrutura

- Docker
- Docker Compose
- Nginx
- GitHub Actions

---

# 🗄️ Banco de dados

Principais entidades:

```text
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
```

Principais relacionamentos:

```text
Category
   └── Product
          ├── Stock
          ├── StockMovement
          ├── OrderItem
          └── InventoryItem

Warehouse
   ├── Location
   ├── Stock
   ├── StockMovement
   ├── Order
   └── Inventory

Order
   └── OrderItem

Inventory
   └── InventoryItem

User
   ├── StockMovement
   ├── Order
   ├── Inventory
   └── RefreshToken
```

---

# 🔒 Segurança

- JWT
- Access Token
- Refresh Token
- Cookies HttpOnly
- bcrypt
- RBAC
- Middleware de autenticação
- Middleware de autorização
- Validação com Zod

---

# 🐳 Docker

Serviços disponíveis:

| Serviço | Porta |
|---|---:|
| Frontend | `8080` |
| Backend | `3333` |
| PostgreSQL | `5432` |
| pgAdmin | `5050` |

Execute:

```bash
docker compose up --build
```

Aplicação:

```text
http://localhost:8080
```

API:

```text
http://localhost:3333
```

pgAdmin:

```text
http://localhost:5050
```

---

# ⚙️ Execução local

## Pré-requisitos

- Node.js
- npm
- Docker
- Docker Compose
- Git

## 1. Clonar

```bash
git clone https://github.com/SEU-USUARIO/logi-ject.git
cd logi-ject
```

## 2. Subir PostgreSQL

```bash
docker compose up -d postgres pgadmin
```

## 3. Backend

```bash
cd backend
npm install
```

Crie `.env`:

```env
PORT=3333
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/logi_ject?schema=public"
JWT_SECRET="change-this-development-secret"
JWT_REFRESH_SECRET="change-this-development-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN_DAYS=7
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

Depois:

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

API:

```text
http://localhost:3333
```

## 4. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Aplicação:

```text
http://localhost:5173
```

> **Importante:** nunca publique o `.env` no GitHub. Utilize `.env.example` para documentar as variáveis.

---

# 📁 Estrutura

```text
logi-ject/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
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
```

---

# 🔌 API

Principais grupos:

```text
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
```

Exemplos:

```http
POST /api/auth/login
GET /api/products
GET /api/stock
POST /api/movements/in
POST /api/movements/out
POST /api/movements/transfer
GET /api/orders
GET /api/inventory
GET /api/reports
```

---

# 🔄 Principais fluxos

### Entrada

```text
Recebimento → Produto → Armazém → Localização → Estoque
```

### Saída

```text
Pedido → Separação → Conferência → Expedição → Estoque
```

### Transferência

```text
Localização A → Produto → Localização B
```

### Inventário

```text
Estoque → Contagem física → Comparação → Divergência → Ajuste
```

---

# 🔄 CI

O projeto possui workflow de integração contínua com GitHub Actions para automatizar verificações de build e qualidade durante o desenvolvimento.

---

# 📚 Conhecimentos demonstrados

- React
- TypeScript
- Node.js
- Express
- APIs REST
- PostgreSQL
- Prisma ORM
- Modelagem relacional
- JWT
- Refresh Tokens
- RBAC
- Autenticação
- Autorização
- Zod
- Docker
- Docker Compose
- Nginx
- GitHub Actions
- CI
- Migrations
- Seed
- Gestão de estoque
- Inventário
- Processos logísticos
- Relatórios
- Exportação de dados
- Arquitetura Full Stack

---

# 🔮 Próximas evoluções

- [ ] Swagger / OpenAPI
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes E2E
- [ ] Redis
- [ ] BullMQ
- [ ] Notificações de estoque mínimo
- [ ] Auditoria detalhada
- [ ] Leitura de código de barras
- [ ] Integração com transportadoras
- [ ] Rastreamento de pedidos
- [ ] Deploy em cloud
- [ ] Monitoramento
- [ ] Logs centralizados

---

# 👨‍💻 Autor

## Nathan Mendes

Desenvolvedor Full Stack com foco em aplicações web, APIs, sistemas corporativos e integração entre sistemas.

**Principais tecnologias:**

```text
PHP • Laravel • Node.js • React
TypeScript • JavaScript • .NET
MySQL • PostgreSQL • SQL
Docker • AWS • Git
```

**LinkedIn:**  
https://www.linkedin.com/in/nathan-mendes-77a288251

**GitHub:**  
https://github.com/

---

# ⭐ Sobre o projeto

O **logi-ject** foi desenvolvido como projeto de portfólio para demonstrar a construção de uma aplicação Full Stack com características de um sistema corporativo, combinando interface web, API REST, autenticação, autorização, banco de dados relacional, regras de negócio, gestão de estoque, processos logísticos, inventário, relatórios e infraestrutura com Docker.

## 📸 Imagens

Os screenshots utilizados neste README estão **anexados ao próprio projeto**, dentro da pasta:

```text
Screenshots/
```

As imagens são referenciadas por caminhos relativos (`./Screenshots/...`), portanto serão exibidas automaticamente quando o projeto for publicado no GitHub.
