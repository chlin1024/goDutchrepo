import { Router } from 'express';
import { body } from 'express-validator';
import { createSettlementView, createSettlementctl } from '../controllers/settlement.js';
import handleResult from '../middleware/validator.js';

const router = Router();

router.route('/settlement/create').get(createSettlementView);

router
  .route('/settlement/create')
  .post([
    body('amount')
      .exists({ checkFalsy: true })
      .withMessage('金額不能空白')
      .isInt({ min: 1, max: 10000000 })
      .withMessage('請輸入數字，且金額需在1-10,000,000之間'),
    handleResult,
    createSettlementctl,
  ]);

export default router;
