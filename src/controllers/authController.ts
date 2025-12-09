import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutos

function generateToken(user: any) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET!,
    { expiresIn: "8h" }
  );
}

export default {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
    if (user.isLocked()) {
      const remaining = (user.lockUntil! - Date.now()) / 1000;
      return res.status(403).json({ message: `Usuário bloqueado. Tente novamente em ${remaining.toFixed(0)}s` });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= MAX_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
        await user.save();
        return res.status(403).json({ message: "Usuário bloqueado por tentativas excessivas" });
      }

      await user.save();
      return res.status(400).json({ message: "Credenciais inválidas" });
    }

    // reset de logar
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const token = generateToken(user);

    return res.json({
      message: "Login bem-sucedido",
      token,
      role: user.role,
      user: {
        email: user.email,
        role: user.role,
        primeiroNome: user.primeiroNome || '',
        sobrenome: user.sobrenome || '',
        usuario: user.usuario || '',
        telefone: user.telefone || ''
      }
    });
  },

  async logout(req: Request, res: Response) {
    return res.json({ message: "Logout efetuado" });
  },

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const user = await User.findById(userId).select('-password -loginAttempts -lockUntil');

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.json({
        email: user.email,
        role: user.role,
        primeiroNome: user.primeiroNome || '',
        sobrenome: user.sobrenome || '',
        usuario: user.usuario || '',
        telefone: user.telefone || ''
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json({ message: "Erro ao buscar perfil" });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { primeiroNome, sobrenome, usuario, telefone, senha } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Atualiza campos de perfil
      if (primeiroNome !== undefined) user.primeiroNome = primeiroNome;
      if (sobrenome !== undefined) user.sobrenome = sobrenome;
      if (usuario !== undefined) user.usuario = usuario;
      if (telefone !== undefined) user.telefone = telefone;

      // Atualiza senha se fornecida
      if (senha && senha.trim() !== '') {
        user.password = senha;
      }

      await user.save();

      return res.json({
        message: "Perfil atualizado com sucesso",
        user: {
          email: user.email,
          role: user.role,
          primeiroNome: user.primeiroNome || '',
          sobrenome: user.sobrenome || '',
          usuario: user.usuario || '',
          telefone: user.telefone || ''
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
  }
};