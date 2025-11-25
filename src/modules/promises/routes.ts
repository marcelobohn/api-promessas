import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { createComment, patchPromise } from './controllers';

const router = Router();

router.patch('/:promiseId', authenticate, patchPromise);
router.post('/:promiseId/comments', authenticate, createComment);

export default router;
