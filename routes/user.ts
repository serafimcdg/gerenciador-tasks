import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../services/emailService";
import dotenv from "dotenv";
import { IUserRequest } from "../Interfaces/userRequest";
import User from "../models/user";
import { ITokenRequest } from "../Interfaces/tokenRequest";

dotenv.config();

const router = express.Router();

const verificationCodes: { [key: string]: { code: number; expires: number } } = {};

const generateVerificationCode = (): number =>
  Math.floor(100000 + Math.random() * 900000);

const validateVerificationCode = (email: string, verificationCode: string) => {
  const storedCode = verificationCodes[email.toLowerCase()];
  if (
    !storedCode ||
    storedCode.code !== Number(verificationCode) ||
    storedCode.expires < Date.now()
  ) {
    throw new Error("Código de verificação inválido ou expirado");
  }
};
const checkIfEmailExists = async (email: string): Promise<boolean> => {
  const existingUser = await User.findOne({
    where: { email: email.toLowerCase() },
  });
  return !!existingUser;
};

router.post(
  "/validate-code",
  async (req: Request, res: Response): Promise<void> => {
    const { email, verificationCode } = req.body;

    if (isNaN(Number(verificationCode))) {
      res.status(400).json({ message: "Codigo de verificação invalido." });
      return;
    }

    try {
      validateVerificationCode(email, verificationCode);
      res.status(200).json({ message: "Codigo de verificação valido." });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
);

router.post(
  "/register",
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Por favor, preencha todos os campos obrigatorios" });
      return;
    }

    if (!verificationCodes[email.toLowerCase()]) {
      res.status(400).json({
        message: "Email não verificado. Por favor, valide seu e-mail.",
      });
      return;
    }

    try {
      const emailExists = await checkIfEmailExists(email);
      if (emailExists) {
        res.status(409).json({ message: "E-mail já cadastrado." });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        isVerified: true,
      });

      delete verificationCodes[email.toLowerCase()];
      res.status(201).json({ message: "Usuario criado com sucesso", user });
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar usuario" });
    }
  }
);

router.post(
  "/send-verification-code",
  async (req: IUserRequest, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email é necessario" });
      return;
    }

    try {
      const emailExists = await checkIfEmailExists(email);
      if (emailExists) {
        res.status(409).json({ message: "E-mail já cadastrado." });
        return;
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao verificar o e-mail" });
      return;
    }

    const verificationCode = generateVerificationCode();
    verificationCodes[email.toLowerCase()] = { 
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000, 
    };

    try {
      await sendVerificationEmail(email, verificationCode);
      res.status(200).json({ message: "Codigo de verificação enviado para o email" });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao enviar o código de verificação",
      });
    }
  }
);

router.post("/login", async (req: IUserRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      res.status(401).json({ message: "Usuario não encontrado" });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({ message: "Email não cadastrado" });
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Senha invalida" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("sem token");
    }

    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email },
      jwtSecret,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Erro no login" });
  }
});

router.get('/verify-token', async (req: ITokenRequest, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Token não fornecido.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; name: string; email: string };
    
    res.status(200).json({
      valid: true,
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
    });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Token inválido ou expirado.' });
  }
});

export default router;
