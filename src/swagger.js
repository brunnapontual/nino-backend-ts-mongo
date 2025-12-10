const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
const endpointsFiles = ['./src/routes/authRoutes.ts','./src/routes/ocorrenciaRoutes.ts' ];

const doc = {
  info: {
    title: 'Nino Backend API',
    description: 'Documentação da API do Projeto Nino',
  },
  host: 'localhost:3000', // Altere para a porta e domínio corretos
  schemes: ['http', 'https'],
  // Você pode adicionar mais aqui, como definições de componentes (DTOs)
  // e segurança (Bearer Token), conforme necessário.
};

swaggerAutogen(outputFile, endpointsFiles, doc);