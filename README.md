# ![Logo](src/img/logo.png)
Bem-vindo ao backend do Nino, uma API REST construída com Node.js + TypeScript + Express + MongoDB (Mongoose).  
Implementando operações CRUD e arquitetura modular para gerenciamento de dados da aplicação Nino.  
A arquitetura do projeto segue um padrão MVC, estruturado em camadas  
<p align="center"> <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" /> <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" /> <img src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=white" /> <img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white" /> <img src="https://img.shields.io/badge/Mongoose-880000?logo=mongoose&logoColor=white" /> </p>

## Estrutura  
**`src/`**  
├─ **`controllers/`** → Lógica das rotas + processamento das requisições  
├─ **`models/`** → Schemas e Models do Mongoose  
├─ **`routes/`** → Declaração das rotas e endpoints  
├─ **`config/`** → Conexão com o MongoDB e variáveis de ambiente  
├─ **`middlewares/`** → Middleware de erros, autenticação, validações etc  
├─ **`app.ts`** → Configuração do Express (middlewares, rotas, etc)  
└─ **`server.ts`** → Inicialização do servidor  
