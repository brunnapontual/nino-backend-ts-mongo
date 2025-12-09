import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export type UserRole = "operador" | "chefe" | "admin";

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;

  // Campos de perfil
  primeiroNome?: string;
  sobrenome?: string;
  usuario?: string;
  telefone?: string;

  loginAttempts: number;
  lockUntil: number | null;

  comparePassword(password: string): Promise<boolean>;
  isLocked(): boolean;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["operador", "chefe", "admin"], default: "operador" },

    // Campos de perfil
    primeiroNome: { type: String },
    sobrenome: { type: String },
    usuario: { type: String },
    telefone: { type: String },

    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Number, default: null }
  },
  { timestamps: true }
);
UserSchema.methods.isLocked = function () {
  return this.lockUntil !== null && this.lockUntil > Date.now();
};
UserSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};
// antes de salvar  hash da senha
UserSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err: any) {
    throw err;
  }
});

export default mongoose.model<IUser>("User", UserSchema);