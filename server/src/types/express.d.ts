import { Database } from 'sqlite';

export interface JWTPayload {
    id: string;
    username: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            db: Database;
            user?: JWTPayload;
        }
    }
}
