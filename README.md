# MediAgend

Sistema web de agendamento de consultas desenvolvido como projeto acadêmico da Universidade Federal de Mato Grosso do Sul (UFMS), na disciplina de **Projeto Integrador de Tecnologia da Informação**.

O MediAgend busca demonstrar como uma solução digital pode contribuir para a organização de agendas médicas, a visualização de horários disponíveis e a prevenção de conflitos de agendamento.

## Sobre o projeto

A proposta surgiu a partir da análise de dificuldades relacionadas ao processo de agendamento de consultas na **USF Mário Dedini I, em Piracicaba/SP**, incluindo filas, atrasos e desafios no gerenciamento de horários.

O projeto evoluiu de uma proposta conceitual para um protótipo web funcional, composto por interface React, API Node.js e banco de dados PostgreSQL.

**Importante:** o MediAgend é um projeto acadêmico demonstrativo. Utiliza dados fictícios e não está implantado em nenhuma unidade de saúde ou integrado aos sistemas do SUS.

## Objetivo

Desenvolver uma aplicação web que permita organizar consultas médicas, consultar horários disponíveis, registrar agendamentos e realizar cancelamentos, aplicando conhecimentos de desenvolvimento web, modelagem de dados, SQL e controle de versão.

## Funcionalidades implementadas

- Listagem de médicos e suas especialidades.
- Cadastro simplificado de pacientes fictícios.
- Calendário interativo com indicação dos dias disponíveis.
- Visualização de horários livres por médico e data.
- Agendamento de consultas.
- Listagem e pesquisa de consultas agendadas.
- Cancelamento de consultas com liberação do horário.
- Prevenção de agendamentos simultâneos para um mesmo horário.
- Persistência das informações no PostgreSQL, inclusive após atualizar a página.
- Interface responsiva com temas claro e escuro.

## Tecnologias utilizadas

**Frontend**

- React
- JavaScript
- HTML e CSS
- Vite

**Backend**

- Node.js
- Express
- Biblioteca `pg` para conexão com PostgreSQL
- CORS
- Dotenv

**Banco de dados**

- PostgreSQL 17
- SQL para definição, consulta e manipulação dos dados
- Chaves primárias, estrangeiras e restrições de integridade

**Desenvolvimento e versionamento**

- Visual Studio Code
- Git
- GitHub
- pgAdmin 4

## Arquitetura da aplicação

O projeto utiliza uma arquitetura composta por três partes:

**React → API Node.js/Express → PostgreSQL**

A interface React realiza requisições HTTP à API. O backend processa essas requisições, executa as operações no PostgreSQL e retorna as respostas para a aplicação.

As credenciais do banco de dados são configuradas exclusivamente no backend, por meio de variáveis de ambiente.

## Modelagem do banco de dados

O banco contém quatro tabelas principais:

| Tabela             | Finalidade                                                            |
| ------------------ | --------------------------------------------------------------------- |
| `pacientes`        | Armazena dados dos pacientes fictícios.                               |
| `medicos`          | Armazena profissionais, especialidades e situação cadastral.          |
| `disponibilidades` | Registra as datas e os horários disponibilizados pelos médicos.       |
| `consultas`        | Registra os agendamentos, relacionando pacientes, médicos e horários. |

A modelagem utiliza chaves primárias e estrangeiras para garantir a integridade dos relacionamentos.

Também existe uma restrição de unicidade para impedir que duas consultas ocupem a mesma disponibilidade simultaneamente, considerando os status que representam horários ocupados.

Os scripts de criação, inserção, manipulação e validação estão disponíveis na pasta `database/`.

## Estrutura do repositório

```text
MediAgend/
├── app/                 # Interface React
├── api/                 # API Node.js e Express
├── database/            # Scripts SQL e modelo do banco
├── diagramas/           # Diagramas e documentação
├── README_Modulo3.md    # Documentação complementar
└── README.md            # Documentação principal
```

## Como executar o projeto

### Pré-requisitos

- Node.js e npm
- PostgreSQL 17
- Git
- pgAdmin 4 ou outro cliente PostgreSQL

### 1. Clonar o repositório

```bash
git clone https://github.com/jotazye/MediAgend.git
cd MediAgend
```

### 2. Preparar o banco de dados

Crie um banco PostgreSQL com o nome:

```text
mediagend_modulo3
```

Execute os scripts SQL da pasta `database/`, nesta ordem:

1. `01_schema.sql` — criação das tabelas e restrições.
2. `02_seed.sql` — inserção dos dados fictícios iniciais.
3. `05_agendas.sql` — geração das disponibilidades adicionais.

Os arquivos `03_crud.sql` e `04_validacao.sql` são utilizados para demonstração e validação das operações SQL. O script CRUD modifica registros de teste e deve ser executado conscientemente.

### 3. Configurar a API

No terminal:

```bash
cd api
npm install
```

Crie um arquivo `.env` dentro da pasta `api` com as configurações locais:

```dotenv
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mediagend_modulo3
DB_USER=postgres
DB_PASSWORD=sua_senha_local
```

Substitua `sua_senha_local` pela senha configurada no seu PostgreSQL.

**Nunca publique o arquivo `.env` com credenciais reais.**

Inicie a API:

```bash
node server.js
```

Para verificar a conexão, abra:

```text
http://localhost:3001/api/health
```

### 4. Executar o frontend

Abra outro terminal na pasta principal do projeto:

```bash
cd app
npm install
npm run dev
```

Acesse o endereço informado pelo Vite, normalmente:

```text
http://localhost:5173
```

Mantenha a API e o frontend em execução simultaneamente.

## Principais endpoints da API

| Método | Endpoint                            | Finalidade                              |
| ------ | ----------------------------------- | --------------------------------------- |
| GET    | `/api/health`                       | Verificar a conexão com o banco.        |
| GET    | `/api/medicos`                      | Listar médicos ativos.                  |
| GET    | `/api/pacientes`                    | Listar pacientes cadastrados.           |
| POST   | `/api/pacientes`                    | Cadastrar paciente fictício.            |
| GET    | `/api/consultas`                    | Consultar agendamentos.                 |
| POST   | `/api/consultas`                    | Criar agendamento.                      |
| PATCH  | `/api/consultas/:id/cancelar`       | Cancelar agendamento.                   |
| GET    | `/api/disponibilidades?medico_id=1` | Consultar horários livres de um médico. |

## Testes realizados

Durante o desenvolvimento, foram realizados testes locais com o PostgreSQL, o pgAdmin, a API e a interface web, incluindo:

- Criação das tabelas e inserção de registros fictícios.
- Consultas SQL com relacionamentos entre tabelas.
- Recuperação de médicos, pacientes e consultas pela API.
- Cadastro de consultas por requisição HTTP.
- Tentativa de agendamento duplicado, rejeitada com resposta HTTP `409 Conflict`.
- Cancelamento de agendamentos e liberação da disponibilidade.
- Persistência de consultas após atualização da página.
- Exibição dinâmica de dias e horários livres no calendário.

Esses testes foram realizados no ambiente local de desenvolvimento e não representam validação para uso clínico ou implantação em produção.

## Limitações e melhorias futuras

O MediAgend ainda não possui autenticação de usuários, autorização por perfil ou integração com sistemas oficiais de saúde.

Entre as possíveis melhorias futuras estão:

- Autenticação de pacientes e administradores.
- Identificação individual segura dos pacientes.
- Reagendamento de consultas.
- Confirmações e notificações automáticas.
- Controle de comparecimento e faltas.
- Painel administrativo para gerenciamento da agenda.
- Testes automatizados e aprimoramentos de segurança.

## Situação atual

O MediAgend possui um protótipo funcional em ambiente local, com frontend React, API Node.js/Express e persistência em PostgreSQL.

As funcionalidades de agendamento, consulta de disponibilidades, prevenção de conflitos e cancelamento foram implementadas e testadas com dados fictícios.

O sistema permanece restrito à finalidade acadêmica e não está disponibilizado para atendimento real de pacientes.

## Autor

**João Antonio de Campos**  
Universidade Federal de Mato Grosso do Sul — UFMS  
Projeto Integrador de Tecnologia da Informação
