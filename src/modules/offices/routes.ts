import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { createOffice, getOffices, updateOffice } from './controllers';

const router = Router();

router.get('/', getOffices);
router.post('/', authenticate, createOffice);
router.patch('/:officeId', authenticate, updateOffice);

export default router;
