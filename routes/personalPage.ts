import { Router } from 'express';
import personalPageView from '../controllers/personal_page.js';

const router = Router();

router.route('/personal_page').get(personalPageView);

export default router;
