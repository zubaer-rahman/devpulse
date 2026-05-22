import type {ROLES} from '../types/index'
declare global{
    namespace Express {
        interface Request {
            user?: UserModel
            role?: ROLES
        }
    }
}
