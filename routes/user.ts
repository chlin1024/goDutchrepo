import { Router } from 'express';
import { body } from 'express-validator';
import { signinView, signIn } from '../controllers/signin.js';
import { signupView, signUp } from '../controllers/signup.js';
import logOut from '../controllers/logout.js';
import handleResult from '../middleware/validator.js';

const router = Router();

router.route('/user/signin').get(signinView);
router.route('/user/signup').get(signupView);
router.route('/user/logout').get(logOut);

router
  .route('/user/signin')
  .post([
    body('email').exists({ checkFalsy: true }).withMessage('Email不能空白').isEmail().withMessage('請輸入正確Email'),
    body('password').exists({ checkFalsy: true }).withMessage('密碼不能空白'),
    handleResult,
    signIn,
  ]);

router
  .route('/user/signup')
  .post([
    body('name').exists({ checkFalsy: true }).withMessage('名字不能空白').trim(),
    body('signupEmail')
      .exists({ checkFalsy: true })
      .withMessage('Email不能空白')
      .isEmail()
      .withMessage('請輸入正確Email'),
    body('signupPassword').exists({ checkFalsy: true }).withMessage('密碼不能空白'),
    handleResult,
    signUp,
  ]);

export default router;
