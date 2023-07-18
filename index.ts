import express from 'express';
import { body, param, validationResult } from 'express-validator';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import axios from 'axios';

import { getGroupName, getGroupIdByToken, getGroupToken } from './models/payment_groups.js';
import { getPaymentDetails, updatePaymentById } from './models/payments.js';
import { getDebtors } from './models/payment_debtors.js';
import { createGroupMember, getGroupMember } from './models/group_members.js';
import { createSettlement } from './models/settlements.js';
import {
  getuserEmail,
  getUserPassword,
  getuserId,
  saveAccessTokenLine,
  getAccessTokenLine,
  getUserName,
} from './models/users.js';

import { createGroupControl, getGroupData } from './controllers/groups.js';
import sortTransaction from './controllers/split2.js';
import groupMember from './controllers/group_members.js';
import signUp from './controllers/signup.js';
import { printPayments, deletePayment, createPaymentcontrol } from './controllers/payments.js';
import updateDebtor from './controllers/update_debtors.js';
import {
  calpersonalExpenseTotal,
  personalPaymentTotal,
  personalsettlementsTotal,
  personalRepaymentTotal,
} from './controllers/personal_expense.js';

import signUserJWT from './utils/signJWT.js';
import verifyUserJWT from './utils/verifyJWT.js';

dotenv.config();
const app = express();
const port = 3000;
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

app.set('views', path.join(dirName, '../build'));
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('./build'));

app.get('/', (req, res) => {
  const userToken = req.cookies.jwtUserToken;
  if (userToken) {
    res.render('index', { userToken });
  } else {
    res.render('index');
  }
});

app.get('/callback', async (req, res) => {
  try {
    const userToken = req.cookies.jwtUserToken;
    if (userToken) {
      const payload = verifyUserJWT(userToken);
      const { userId } = payload;
      if (!payload) {
        res.redirect('/user/signin');
        return;
      }
      const authorizeCode = req.query.code;
      if (authorizeCode) {
        const oauthToken = await axios.post(
          'https://notify-bot.line.me/oauth/token',
          {
            grant_type: 'authorization_code',
            code: authorizeCode,
            redirect_uri: 'https://www.cphoebelin.com/callback',
            client_id: process.env.LINE_CLIENT_ID,
            client_secret: process.env.LINE_CLIENT_SECRET,
          },
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }
        );
        const accessTokenLine = oauthToken.data.access_token;
        await saveAccessTokenLine(accessTokenLine, userId);
        res.redirect('/personal_page');
      }
    }
  } catch (error) {
    console.error(error);
  }
});

app.get('/sent', async (req, res) => {
  try {
    const { groupId } = req.cookies;
    const { debtor, creditor, amount } = req.query;
    const debtorId = parseInt(debtor as string, 10);
    const creditorId = parseInt(creditor as string, 10);
    const creditorNameResult = await getUserName(creditorId);
    const creditorName = creditorNameResult[0].name;
    const groupName = await getGroupName(groupId);
    const accessTokenLine = await getAccessTokenLine(debtorId);
    const response = await axios.post(
      'https://notify-api.line.me/api/notify',
      {
        message: `還款囉～ 在${groupName}要給${creditorName}新台幣${amount}元！ 
        點擊連結登記還款: https://www.cphoebelin.com/settlement/create?debtor=${debtor}&creditor=${creditor}&amount=${amount}`,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${accessTokenLine}`,
        },
      }
    );
    if (response.data.status === 200) {
      res.cookie('messageSent', 'success');
    }
    res.redirect(`/group/${groupId}`);
  } catch (error) {
    const { groupId } = req.cookies;
    res.cookie('messageSent', 'error');
    res.redirect(`/group/${groupId}`);
    console.error(error);
  }
});

app.get('/user/signin', async (req, res) => {
  res.render('sign_in');
});

app.get('/user/signup', async (req, res) => {
  res.render('sign_up');
});

app.get('/user/logout', async (req, res) => {
  res.cookie('jwtUserToken', '', { maxAge: 1 });
  res.redirect('/');
});

app.post(
  '/user/signup',
  body('name').exists({ checkFalsy: true }).withMessage('名字不能空白').trim(),
  body('signupEmail')
    .exists({ checkFalsy: true })
    .withMessage('Email不能空白')
    .isEmail()
    .withMessage('請輸入正確Email'),
  body('signupPassword').exists({ checkFalsy: true }).withMessage('密碼不能空白'),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).render('sign_up', { errors: result.array() });
    }
    try {
      const { name, signupEmail, signupPassword } = req.body;
      const { referer } = req.cookies;
      const existUser = await getuserEmail(signupEmail);
      if (existUser.length === 1) {
        res.status(400).render('sign_up', { signUpError: '您已經是會員，請登入！' });
      } else if (existUser.length === 0) {
        const userData: any = await signUp(name, signupEmail, signupPassword);
        const { token } = userData;
        res.cookie('jwtUserToken', token);
        if (referer) {
          res.redirect(referer);
        }
        res.redirect('/personal_page');
      }
      return res.status(200);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
);

app.post(
  '/user/signin',
  body('email').exists({ checkFalsy: true }).withMessage('Email不能空白').isEmail().withMessage('請輸入正確Email'),
  body('password').exists({ checkFalsy: true }).withMessage('密碼不能空白'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('sign_in', { errors: errors.array() });
    }
    let userId;
    try {
      const { email, password } = req.body;
      const { referer } = req.cookies;
      const existUser = await getuserEmail(email);
      if (existUser.length === 1) {
        const storedPassword = await getUserPassword(email);
        const result = await bcrypt.compare(password, storedPassword[0].password);
        if (result) {
          userId = await getuserId(email);
        } else if (!result) {
          return res.status(400).render('sign_in', { SignInError: '密碼錯誤' });
        }
      } else if (existUser.length === 0) {
        return res.status(400).render('sign_in', { SignInError: '這個Email尚未註冊會員，請註冊會員！' });
      }
      const token = signUserJWT(userId);
      res.cookie('jwtUserToken', token);
      if (referer) {
        res.redirect(referer);
      }
      res.redirect('/personal_page');
      return res.status(200);
    } catch (error) {
      console.error(error);
      return res.status(500).render('sign_in', { error });
    }
  }
);

app.get('/personal_page', async (req, res) => {
  try {
    const userToken = req.cookies.jwtUserToken;
    if (userToken) {
      const payload = verifyUserJWT(userToken);
      const { userId } = payload;
      if (!payload) {
        res.redirect('/user/signin');
        return;
      }
      const userNameResult = await getUserName(userId);
      const userName = userNameResult[0].name;
      const groups = await getGroupData(userId);
      res.render('personal_page_new', { userName, groups });
    } else {
      res.redirect('/user/signin');
    }
  } catch (error) {
    res.status(500);
  }
});

app.get('/group/create', async (req, res) => {
  res.render('create_group_new');
});

app.post('/group/create', body('groupName').exists({ checkFalsy: true }), async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).json({ result });
    return;
  }
  try {
    const { groupName } = req.body;
    const userToken = req.cookies.jwtUserToken;
    if (!userToken) {
      res.redirect('/user/signin');
    }
    const payload = verifyUserJWT(userToken);
    const { userId } = payload;
    if (!payload) {
      res.redirect('/user/signin');
      return;
    }
    const groupId = await createGroupControl(groupName, userId);
    res.status(200).json({ statusCode: 200, groupId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ statusCode: 500, message: error });
  }
});

app.get('/group/invitation/:groupToken', param('groupToken').exists({ checkFalsy: true }), async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result);
    res.status(400).send({ statusCode: 400, result });
    return;
  }
  const groupToken = req.params?.groupToken;
  const userToken = req.cookies.jwtUserToken;
  if (!userToken) {
    res.cookie('referer', `/group/invitation/${groupToken}`);
    res.redirect('/user/signin');
    return;
  }
  const payload = verifyUserJWT(userToken);
  const { userId } = payload;
  if (!payload) {
    res.redirect('/user/signin');
    return;
  }
  const groupId = await getGroupIdByToken(groupToken);
  if (groupId) {
    const groupMemberArray = await groupMember(groupId);
    const isgroupMember = groupMemberArray.includes(userId);
    if (!isgroupMember) {
      await createGroupMember(groupId, userId);
    }
    res.redirect(`/group/${groupId}`);
  }
});

app.get('/group/:groupId', param('groupId').isInt().exists(), async (req, res) => {
  try {
    const groupId: number = parseInt(req.params?.groupId, 10);
    const userJWT = req.cookies.jwtUserToken;
    const groupToken = await getGroupToken(groupId);
    const payload = verifyUserJWT(userJWT);
    const { userId } = payload;
    if (!payload) {
      res.redirect('/user/signin');
      return;
    }
    if (!groupId) {
      res.status(400).send('Please provide group Id');
      return;
    }
    res.cookie('groupId', groupId);
    const groupName = await getGroupName(groupId);
    const groupUsers = await getGroupMember(groupId);
    const groupMemberArray = await groupMember(groupId);
    const isgroupMember = groupMemberArray.includes(userId);
    if (isgroupMember) {
      const groupPayments = await printPayments(groupId);
      const groupTransactions = await sortTransaction(groupId);
      const personalExpenseTotal = await calpersonalExpenseTotal(groupId, userId);
      const personalpayments = await personalPaymentTotal(groupId, userId);
      const personalsettlements = await personalsettlementsTotal(groupId, userId);
      const personalsrepayments = await personalRepaymentTotal(groupId, userId);
      res.render('group_page', {
        groupName,
        users: groupUsers,
        transactions: groupTransactions,
        payments: groupPayments,
        personalExpenseTotal,
        personalpayments,
        personalsettlements,
        personalsrepayments,
        invite: `/group/invitation/${groupToken}`,
      });
    } else {
      res.send('you are not group member');
    }
  } catch (error) {
    res.status(500);
  }
});

app.get('/payment', async (req, res) => {
  const { groupId } = req.cookies;
  const groupUsers = await getGroupMember(groupId);
  res.render('create_payment', { users: groupUsers });
});

app.post(
  '/payment/create',
  body('item').exists({ checkFalsy: true }).withMessage('品項不能空白'),
  body('amount').exists({ checkFalsy: true }).withMessage('金額不能空白'),
  body('amount').isInt({ min: 1, max: 10000000 }).withMessage('請輸入數字，且在1-10,000,000'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    try {
      const { item, creditor, amount, debtors } = req.body;
      const numberOfDebtors = debtors.length;
      const { groupId } = req.cookies;
      await createPaymentcontrol(item, amount, creditor, groupId, numberOfDebtors, debtors);
      res.status(200).json({ statusCode: 200, groupId });
    } catch (error) {
      res.status(500).json({ statusCode: 500 });
    }
  }
);

app.get('/payment/:paymentId', async (req, res) => {
  try {
    const paymentId: number = parseInt(req.params?.paymentId, 10);
    const { groupId } = req.cookies;
    const paymentData = await getPaymentDetails(paymentId);
    if (paymentData.length === 1) {
      const debtors = await getDebtors(paymentId);
      const groupUsers = await getGroupMember(groupId);
      res.cookie('paymentId', paymentId);
      res.render('edit_payment', { users: groupUsers, payment: paymentData, debtors });
    } else {
      res.redirect(`/group/${groupId}`);
    }
  } catch (error) {
    console.error(error);
  }
});

app.post(
  '/payment/update',
  body('item').exists({ checkFalsy: true }).withMessage('品項不能空白'),
  body('amount').exists({ checkFalsy: true }).withMessage('金額不能空白'),
  body('amount').isInt({ min: 1, max: 10000000 }).withMessage('請輸入數字，且金額需在1-10,000,000之間'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { item, creditor, amount, debtors } = req.body;
      const paymentId = parseInt(req.cookies.paymentId, 10);
      const numberOfDebtors = debtors.length;
      const { groupId } = req.cookies;
      const creditorId = creditor;
      await updatePaymentById(item, amount, creditorId, numberOfDebtors, paymentId);
      await updateDebtor(debtors, paymentId);
      return res.status(200).json({ statusCode: 200, groupId });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ statusCode: 500 });
    }
  }
);

app.post('/payment/delete', async (req, res) => {
  try {
    const { paymentId, groupId } = req.cookies;
    await deletePayment(paymentId);
    res.status(200).json({ statusCode: 200, groupId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ statusCode: 500 });
  }
});

app.get('/settlement/create', async (req, res) => {
  const { debtor, creditor, amount } = req.query;
  const transactionData = { debtor, creditor, amount };
  const { groupId } = req.cookies;
  const groupUsers = await getGroupMember(groupId);
  res.render('create_settlement', { users: groupUsers, transactionData });
});

app.post(
  '/settlement/create',
  body('amount')
    .exists({ checkFalsy: true })
    .withMessage('金額不能空白')
    .isInt({ min: 1, max: 10000000 })
    .withMessage('請輸入數字，且金額需在1-10,000,000之間'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { payer, amount, receiver } = req.body;
      const { groupId } = req.cookies;
      await createSettlement(amount, payer, groupId, receiver);
      return res.status(200).json({ statusCode: 200, groupId });
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
);

app.all('*', (req, res) => {
  res.status(404).render('404');
});

app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
