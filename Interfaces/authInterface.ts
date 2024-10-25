import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface IAuthenticatedRequest extends Request {
  userId?: string | JwtPayload;
}