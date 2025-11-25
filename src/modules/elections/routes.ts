import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { createElection, getElections } from './controllers';

const router = Router();

router.get('/', getElections);
router.post('/', authenticate, createElection);

export default router;
