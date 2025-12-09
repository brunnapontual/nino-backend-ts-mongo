import { Request, Response } from "express";
import Ocorrencia from "../models/Ocorrencia";
import { AuthRequest } from "../middlewares/auth";

export default {

  async sync(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const ocorrencias = req.body.ocorrencias;

      if (!Array.isArray(ocorrencias)) {
        return res.status(400).json({ message: "Formato inválido. Esperado array." });
      }

      const salvas: any[] = [];
      const ignoradas: any[] = [];

      for (const item of ocorrencias) {
        const {
          localId,
          tipo,
          dataHora,
          viatura,
          equipe,
          descricao,
          fotos,
          localizacao,
          notas,
          assinaturaVitimado,
          assinaturaTestemunha,
          assinatura
        } = item;

        if (!tipo || !dataHora || !viatura || !equipe || !descricao) {
          ignoradas.push({ localId, motivo: "Campos obrigatórios faltando" });
          continue;
        }

        // evitar duplicação
        if (localId) {
          const jaExiste = await Ocorrencia.findOne({ localId });
          if (jaExiste) {
            ignoradas.push({ localId, motivo: "Já sincronizada" });
            continue;
          }
        }

        const nova = new Ocorrencia({
          localId: localId || null,
          tipo,
          dataHora: new Date(dataHora),
          viatura,
          equipe,
          descricao,
          fotos: fotos || [],
          localizacao: localizacao
            ? {
              latitude: localizacao.latitude,
              longitude: localizacao.longitude,
              accuracy: localizacao.accuracy || null,
              capturedAt: localizacao.capturedAt
                ? new Date(localizacao.capturedAt)
                : new Date()
            }
            : undefined,
          notas,
          assinaturaVitimado: assinaturaVitimado || null,
          assinaturaTestemunha: assinaturaTestemunha || null,
          assinatura: assinatura || null,

          statusSync: "sincronizado",

          createdBy: req.user.id
        });

        await nova.save();
        salvas.push({ localId, idGerado: nova._id });
      }

      return res.json({
        message: "Sincronização concluída",
        salvas,
        ignoradas
      });
    } catch (err) {
      return res.status(500).json({ message: "Erro na sincronização" });
    }
  },
  // LISTAR PENDENTES
  // GET /ocorrencias/pending
  async pendingList(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: "Não autenticado" });

      let filtro: any = { statusSync: "pendente" };

      if (req.user.role === "operador") {
        filtro.createdBy = req.user.id;
      }
      // chefe/admin: vê todos os pendentes

      const ocorrencias = await Ocorrencia.find(filtro).sort({ createdAt: -1 });
      return res.json(ocorrencias);
    } catch (err) {
      return res.status(500).json({ message: "Erro ao listar pendentes" });
    }
  },
  // aceita multipart/form-data com fotos (opcional) ou JSON
  async updatePending(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: "Não autenticado" });

      const { id } = req.params;

      const ocorrencia = await Ocorrencia.findById(id);
      if (!ocorrencia) return res.status(404).json({ message: "Ocorrência não encontrada" });

      // so permite editar se tiver pendente
      if (ocorrencia.statusSync !== "pendente") {
        return res.status(403).json({ message: "Apenas ocorrências pendentes podem ser editadas" });
      }

      // operador só edita as próprias; chefe/admin podem editar qualquer pendente
      if (req.user.role === "operador" && ocorrencia.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Sem permissão para editar esta ocorrência" });
      }
      const allowedFields = [
        "tipo",
        "dataHora",
        "viatura",
        "equipe",
        "descricao",
        "localizacao",
        "notas",
        "assinaturaVitimado",
        "assinaturaTestemunha",
        "assinatura"
      ];

      for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
          if (field === "dataHora" && req.body.dataHora) {
            ocorrencia.dataHora = new Date(req.body.dataHora);
          } else if (field === "localizacao" && req.body.localizacao) {
            const loc = typeof req.body.localizacao === "string"
              ? JSON.parse(req.body.localizacao)
              : req.body.localizacao;
            ocorrencia.localizacao = {
              latitude: loc.latitude,
              longitude: loc.longitude,
              accuracy: loc.accuracy || null,
              capturedAt: loc.capturedAt ? new Date(loc.capturedAt) : new Date()
            };
          } else {
            (ocorrencia as any)[field] = req.body[field];
          }
        }
      }

      // se vier fotos via multipart/form-data (req.files) -> converte para base64 e substitui ou concatena
      // se o cliente envia fotos no update, vai substituir o array de fotos
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const fotosBase64 = (req.files as Express.Multer.File[]).map(f => f.buffer.toString("base64"));
        ocorrencia.fotos = fotosBase64;
      } else if (req.body.fotos) {
        // se enviou um array de base64 via JSON substitui tb
        ocorrencia.fotos = Array.isArray(req.body.fotos) ? req.body.fotos : ocorrencia.fotos;
      }
      ocorrencia.statusSync = "pendente";
      await ocorrencia.save();

      return res.json({ message: "Ocorrência pendente atualizada", ocorrencia });
    } catch (err) {
      return res.status(500).json({ message: "Erro ao atualizar ocorrência pendente" });
    }
  },

  async criar(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const {
        tipo,
        dataHora,
        viatura,
        equipe,
        descricao,
        fotos,
        localizacao,
        notas,
        assinaturaVitimado,
        assinaturaTestemunha,
        assinatura
      } = req.body;

      if (!tipo || !dataHora || !viatura || !equipe || !descricao) {
        return res.status(400).json({ message: "Campos obrigatórios ausentes" });
      }

      const ocorrencia = new Ocorrencia({
        tipo,
        dataHora: new Date(dataHora),
        viatura,
        equipe,
        descricao,
        fotos: fotos || [],
        localizacao: localizacao
          ? {
            latitude: localizacao.latitude,
            longitude: localizacao.longitude,
            accuracy: localizacao.accuracy || null,
            capturedAt: localizacao.capturedAt
              ? new Date(localizacao.capturedAt)
              : new Date()
          }
          : undefined,
        notas,
        assinaturaVitimado: assinaturaVitimado || null,
        assinaturaTestemunha: assinaturaTestemunha || null,
        assinatura: assinatura || null,

        statusSync: "sincronizado",

        createdBy: req.user.id
      });

      await ocorrencia.save();

      return res.status(201).json({
        message: "Ocorrência registrada com sucesso",
        ocorrencia
      });
    } catch (err) {
      return res.status(500).json({ message: "Erro ao criar ocorrência" });
    }
  },

  async listar(req: AuthRequest, res: Response) {
    try {
      if (!req.user)
        return res.status(401).json({ message: "Não autenticado" });

      let filtro = {};

      if (req.user.role === "operador") {
        filtro = { createdBy: req.user.id };
      }

      const ocorrencias = await Ocorrencia.find(filtro).sort({ createdAt: -1 });

      return res.json(ocorrencias);
    } catch (err) {
      return res.status(500).json({ message: "Erro ao listar ocorrências" });
    }
  },

  async deletar(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { id } = req.params;

      const ocorrencia = await Ocorrencia.findById(id);
      if (!ocorrencia) {
        return res.status(404).json({ message: "Ocorrência não encontrada" });
      }

      // Operador só pode deletar as próprias, chefe/admin podem deletar qualquer uma
      if (req.user.role === "operador" && ocorrencia.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Sem permissão para deletar esta ocorrência" });
      }

      await Ocorrencia.findByIdAndDelete(id);

      return res.json({ message: "Ocorrência deletada com sucesso" });
    } catch (err) {
      return res.status(500).json({ message: "Erro ao deletar ocorrência" });
    }
  },

  async buscarPorId(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { id } = req.params;

      const ocorrencia = await Ocorrencia.findById(id);
      if (!ocorrencia) {
        return res.status(404).json({ message: "Ocorrência não encontrada" });
      }

      // Operador só pode ver as próprias
      if (req.user.role === "operador" && ocorrencia.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Sem permissão para ver esta ocorrência" });
      }

      return res.json(ocorrencia);
    } catch (err) {
      return res.status(500).json({ message: "Erro ao buscar ocorrência" });
    }
  }
};