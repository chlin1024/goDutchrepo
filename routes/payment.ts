import { Router } from 'express';
import { body } from 'express-validator';
import handleResult from '../middleware/validator.js';
import {
  createPaymentView,
  paymentInfoView,
  createPaymentRoute,
  paymentUpdate,
  paymentDelete,
} from '../controllers/payments.js';

const router = Router();

router.route('/payment').get(createPaymentView);
router.route('/payment/:paymentId').get(paymentInfoView);

router
  .route('/payment/create')
  .post(
    body('item').exists({ checkFalsy: true }).withMessage('品項不能空白'),
    body('amount').exists({ checkFalsy: true }).withMessage('金額不能空白'),
    body('amount').isInt({ min: 1, max: 10000000 }).withMessage('請輸入數字，且在1-10,000,000'),
    handleResult,
    createPaymentRoute
  );

router
  .route('/payment/update')
  .post(
    body('item').exists({ checkFalsy: true }).withMessage('品項不能空白'),
    body('amount').exists({ checkFalsy: true }).withMessage('金額不能空白'),
    body('amount').isInt({ min: 1, max: 10000000 }).withMessage('請輸入數字，且在1-10,000,000'),
    handleResult,
    paymentUpdate
  );

router.route('/payment/delete').post(paymentDelete);

export default router;
