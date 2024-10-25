import { Request } from 'express';

export interface IUserRequest extends Request {
  body: {
    email: string;
    password: string;
    name?: string;
    verificationCode?: string;
  };
}