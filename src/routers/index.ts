import { Router } from 'express';
import { login } from '../controllers/auth.controllers';
import { getListUser } from '../controllers/user.controlers';

const router = Router();

// Auth
router.post('/login', login);
router.get('/users', getListUser);

export default router;
