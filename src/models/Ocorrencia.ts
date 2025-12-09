import mongoose, { Document, Schema } from "mongoose";

export interface IOcorrencia extends Document {
  tipo: string;
  dataHora: Date;
  viatura: string;
  equipe: string;
  descricao: string;

  fotos?: string[];
  localizacao?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    capturedAt?: Date;
  };

  notas?: string;
  localId: string | null;

  assinaturaVitimado?: string;
  assinaturaTestemunha?: string;
  assinatura?: string;

  statusSync: "pendente" | "sincronizado";

  createdBy: mongoose.Types.ObjectId;
}

const OcorrenciaSchema = new Schema<IOcorrencia>(
  {
    tipo: { type: String, required: true },
    dataHora: { type: Date, required: true },
    viatura: { type: String, required: true },
    equipe: { type: String, required: true },
    descricao: { type: String, required: true },

    fotos: { type: [String], default: [] },

    localizacao: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      capturedAt: Date
    },

    notas: { type: String },

    // sync
    localId: { type: String, default: null },

    assinaturaVitimado: { type: String, default: null },
    assinaturaTestemunha: { type: String, default: null },
    assinatura: { type: String, default: null },

    statusSync: {
      type: String,
      enum: ["pendente", "sincronizado"],
      default: "pendente"
    },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IOcorrencia>("Ocorrencia", OcorrenciaSchema);