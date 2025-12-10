import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import ocorrenciaRoutes from "./routes/ocorrenciaRoutes";
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './swagger_output.json'; 

const app = express();

const PORT = process.env.PORT || 4000;
const renderUrl = 'https://nino-backend-ts-mongo.onrender.com';
const swaggerDocument = JSON.parse(JSON.stringify(swaggerFile));

swaggerDocument.servers = [
    { 
        url: renderUrl, 
        description: 'Servidor de Produção (Render)' 
    },
    { 
        url: `http://localhost:${PORT}`, 
        description: 'Servidor de Desenvolvimento Local' 
    }
];

if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    swaggerDocument.schemes = ['https'];
} else {
    swaggerDocument.schemes = ['http'];
}

app.use(cors());
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check - rota para verificar se a API está online
app.get("/", (req, res) => {
    res.json({ message: "API Nino está online!", status: "ok" });
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// rotas
app.use("/auth", authRoutes);
app.use("/ocorrencias", ocorrenciaRoutes);


export default app;