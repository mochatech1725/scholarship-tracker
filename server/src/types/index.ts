import { Request } from 'express';

export interface AuthPayload {
  sub?: string;
  iss?: string;
  aud?: string | string[];
  [key: string]: unknown;
}

export interface AuthToken {
  payload: AuthPayload;
  header: Record<string, unknown>;
  token: string;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
  auth?: AuthToken;
}

export interface JwtPayload {
  userId: string;
} 