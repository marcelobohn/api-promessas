import { Router } from 'express';
import { getStates } from './controllers';

const router = Router();

router.get('/', getStates);

export default router;
