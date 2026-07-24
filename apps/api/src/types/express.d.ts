import { RequestUser } from './request-user';

declare module 'express' {
  interface Request {
    user?: RequestUser;
  }
}
