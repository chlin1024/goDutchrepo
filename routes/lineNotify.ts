import { Router } from 'express';
import { lineNotifyCallback, sentLineNotify } from '../controllers/lineNotify.js';

const router = Router();

router.route('/callback').get(lineNotifyCallback);

router.route('/sent').get(sentLineNotify);

export default router;
