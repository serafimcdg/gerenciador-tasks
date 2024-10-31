import { Request } from 'express';

export interface ITokenRequest extends Request {
  headers: {
    authorization?: string;
  };
}