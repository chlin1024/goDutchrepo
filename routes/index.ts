import { Router } from 'express';
import indexView from '../controllers/index.js';

const router = Router();

router.route('/').get(indexView);

export default router;
