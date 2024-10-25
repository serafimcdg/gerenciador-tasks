
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IAuthenticatedRequest } from '../Interfaces/authInterface';

dotenv.config();

export const verifyToken = (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization; 
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(403).json({ message: 'Token n foi entregue' });
    return;
  }

  
  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: '' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload; 

    if (decoded && typeof decoded !== 'string') {
      req.userId = decoded.userId as string; 
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invallido' });
  }
};
