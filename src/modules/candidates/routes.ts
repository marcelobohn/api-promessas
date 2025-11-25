import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { createCandidate, createPromise, getCandidatePromises, getCandidates } from './controllers';

const router = Router();

router.get('/', getCandidates);
router.post('/', authenticate, createCandidate);
router.get('/:candidateId/promises', getCandidatePromises);
router.post('/:candidateId/promises', authenticate, createPromise);

export default router;
