import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string, 
  },
});

export const sendVerificationEmail = async (email: string, verificationCode: number): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER as string,
    to: email,
    subject: 'Código de Verificação',
    text: `Seu código dde verificação é: ${verificationCode},`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de verificação enviado');
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error('Erro ao enviar email');
  }
};
