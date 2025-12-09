import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import ocorrenciaRoutes from "./routes/ocorrenciaRoutes";

const app = express();

app.use(cors());
app.use(express.json());

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