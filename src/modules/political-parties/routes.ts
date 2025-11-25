import { Router } from 'express';
import { getParties } from './controllers';

const router = Router();

router.get('/', getParties);

export default router;
