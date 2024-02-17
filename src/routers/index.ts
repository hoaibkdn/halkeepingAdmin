import { Router } from 'express';
import { login } from '../controllers/auth.controllers';
import { getListUser } from '../controllers/user.controlers';
import { getProvinces } from './../controllers/province.controllers';

const router = Router();

// Auth
router.post('/login', login);
router.get('/users', getListUser);

router.get('/provinces', getProvinces);

export default router;
