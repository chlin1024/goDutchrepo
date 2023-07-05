import express, { Router } from 'express';
import { body, param, Result, validationResult } from 'express-validator';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
dotenv.config();

import { updateDebtorsByPaymentId } from './models/payment_debtors.js'
import { getGroupName } from './models/payment_groups.js'
import { createPayment, getPaymentDetails, updatePaymentById } from './models/payments.js'
import { createDebtors, getDebtors } from './models/payment_debtors.js'
import { createGroupMember, getGroupsByMemberId, getGroupMember, getGroupUsers } from './models/group_members.js'
import { getuserEmail, getUserPassword, getuserId } from './models/users.js';

import { createGroupControl, getGroupData } from './controllers/groups.js';
import { sortTransaction } from './controllers/split2.js'
import { groupMember } from './controllers/group_members.js';
import { signUp } from './controllers/signup.js'
import { printPayments } from './controllers/payments.js'
import { deletePayment } from './controllers/delete_payment.js'
import { updateDebtor } from './controllers/update_debtors.js'

import { signUserJWT, signGroupJWT } from './utils/signJWT.js'
import { verifyUserJWT, verifyGroupJWT} from './utils/verifyJWT.js'

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('views', path.join(__dirname, '../build'));
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("./build"));

app.get('/', (req, res) => {
  const userToken = req.cookies.jwtUserToken
  if (userToken) {
    res.render('index', {userToken});
  } else {
    res.render('index');
  }
});

app.get('/hopeitworks', (req, res) => {
  res.render('create_payment');
});


app.get('/signup_test', (req, res) => {
  res.render('sign_up');
})

app.get('/text', (req, res) => {
  const group = ["泰國行"];
  res.render('text', {group});
})


app.get('/signin', async (req, res) => {
  res.render('sign_in');
})

app.get('/signup', async (req, res) => {
  res.render('sign_up');
})

app.post('/user/signup',
  body('name').exists({checkFalsy: true}).trim(),
  body('signup_email').exists({checkFalsy: true}).isEmail(), 
  body('signup_password').exists({checkFalsy: true}),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).render('sign_up', { errors: result.array() });
    }
    try{
      const { name, signup_email, signup_password} = req.body;
      const referer = req.cookies.referer;
      const existUser = await getuserEmail(signup_email)
      if (existUser.length === 1) {
        res.status(400).render('sign_up', {error: 'Error! You are exiting user. Please Sign in.'});
      } else if (existUser.length === 0) {
        const userData : any = await signUp(name, signup_email, signup_password);
        const token = userData.token
        res.cookie("jwtUserToken", token);
        if (referer) {
          res.redirect(referer);
        }
        res.redirect('/personal_page');
      }
    } catch (error) {
      console.error(error);
      res.status(500)
    }
  }
);

app.post('/user/signin', 
  body('email').exists({checkFalsy: true}).isEmail(), 
  body('password').exists({checkFalsy: true}), 
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).render('sign_in', { errors: result.array() });
    }
  let userId;
  try {
      const {email, password} = req.body;
      const referer = req.cookies.referer;
      /*if (!email || !password) {
        res.status(400).render('users', {error : "All input required!"});
      }*/
      const existUser = await getuserEmail(email);
      if (existUser.length === 1) {
          const storedPassword = await getUserPassword(email);
          const result = await bcrypt.compare(password, storedPassword[0].password);
          if (result) {
          userId = await getuserId(email);
          } else if(!result) {
          res.status(400).render('sign_in', {error: 'Error! Wrong Password'});
          return;
          }
      } else if (existUser.length === 0) {
        res.status(400).render('sign_in', {error: 'Error! You are not exiting user. Please Sign up.'});
        return;
      }
      const token = signUserJWT(userId)
      res.cookie("jwtUserToken", token);
      if (referer) {
        res.redirect(referer);
      }
      res.redirect('/personal_page');
  } catch(error){
    res.status(500).render('users', {error: 'Sever Error. Something went wrong creating token and query user'});
    console.error(error);
  }
});

app.get('/personal_page', async(req, res) => {
  try{
    const userToken = req.cookies.jwtUserToken
    if (userToken) {
      const payload = verifyUserJWT(userToken);
      const userId = payload.userId;
      if (!payload){
        res.redirect('/signin');
        return;
      }
      const groups = await getGroupData(userId)
      res.render('personal_page_new', {groups : groups});
      } else {
      res.redirect('/signin');
    }
  } catch (error) {
    res.status(500);
  }
})

app.get ('/create/group', async(req, res) =>{
  res.render('create_group_new');
} )

app.post('/create/group',body('groupName').exists({checkFalsy:true}), async(req, res) => {
  const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({ statusCode: 400, result});
      return; 
      //res.status(400).json( statusCode: 400, { message: result.array() });
    }
  try{
    const groupName = req.body.groupName;
    const Cookie = req.cookies;
    const userToken = req.cookies.jwtUserToken
    if (!userToken) {
      res.redirect('/signin');
    }
    const payload = verifyUserJWT(userToken);
    const userId = payload.userId;
    if (!payload){
      res.redirect('/signin');
      return;
    }
    const groupId = await createGroupControl(groupName, userId);
    //const result = await createGroupMember(groupId, userId);
    const groupToken = signGroupJWT(groupId);
    res.cookie("jwtGroupToken", groupToken );
    res.status(200).json({ statusCode: 200, groupId});
    //res.status(200).json({ statusCode: 200, message: `邀請連結:/group/invitation/${groupToken}`});
  } catch(error) {
    console.error(error);
    res.status(500).json({ statusCode: 500, message: error });
  }
})

app.get('/group/invitation/:groupJWT',
  param('groupJWT').isJWT().exists({checkFalsy:true}),
  async(req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      console.log(result);
      res.status(400).json({ statusCode: 400, result});
      return; 
      //res.status(400).json( statusCode: 400, { message: result.array() });
    }
    const groupJWT = req.params?.groupJWT;
    if (!groupJWT) {
      res.status(400).send('Invalid group JWT');
      return;
    }
    const groupId = verifyGroupJWT(groupJWT);
    const groupMemberArray = await groupMember(groupId);
    const userToken = req.cookies.jwtUserToken
    if (!userToken){
      res.cookie("referer", `/group/invitation/${groupJWT}`);
      res.redirect('/signin');
      return;
    } 
    const payload = verifyUserJWT(userToken);
    const userId = payload.userId;
    if (!payload){
      res.redirect('/signin');
      return;
    }
    const isgroupMember = groupMemberArray.includes(userId)
    if (!isgroupMember) {
      const result = await createGroupMember(groupId, userId);
    } 
    res.redirect(`/group/${groupId}`);
  }
);

app.get('/group/:groupId',
  param('groupId').isInt().exists(),
  async (req, res) => {
  try{
    const groupId : number = parseInt(req.params?.groupId);
    const userJWT = req.cookies.jwtUserToken;
    const groupJWT = signGroupJWT(groupId);
    const payload = verifyUserJWT(userJWT);
    const userId = payload.userId;
    if (!payload){
      res.redirect('/signin');
      return;
    }
    if (!groupId) {
      res.status(400).send('Please provide group Id');
      return;
    }
    res.cookie("groupId" , groupId);
    const groupName = await getGroupName(groupId);
    const groupUsers = await getGroupMember(groupId);
    const groupMemberArray = await groupMember(groupId);
    const isgroupMember = groupMemberArray.includes(userId);
    if (isgroupMember) {
      const groupPayments = await printPayments(groupId);
      const groupTransactions = await sortTransaction(groupId);
      res.render('group_page', {groupName: groupName, users: groupUsers, transactions: groupTransactions, payments: groupPayments, invite: `/group/invitation/${groupJWT}`});
    } else {
      res.send('you are not group member');
    }
  } catch (error) {
    res.status(500)
  }
})

app.get('/payment', async (req, res) => {
  const groupId = req.cookies.groupId;
  const groupUsers = await getGroupMember(groupId);
  res.render('create_payment', {users: groupUsers});
})

app.post('/payment/create',
  body('item').exists({checkFalsy:true}),
  body('amount').isInt({min:1, max: 10000000}).exists(),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      console.log(result);
      return res.status(400).render('create_group', { errors: result.array() });
    }
    try{
      const {item, creditor, amount, debtors} = req.body;
      console.log("分帳人", debtors);
      const numberOfDebtors = debtors.length
      const groupId = req.cookies.groupId;
      const creditorId = creditor;
      const insertPaymentId = await createPayment(item, amount, creditorId, groupId, numberOfDebtors)
      const insertPaymendDebtorId = await debtors.map((debtor : any) => createDebtors(insertPaymentId, debtor));
      res.status(200).json({ statusCode: 200, groupId });
    } catch (error) {
      res.status(500).json({ statusCode: 500 });
    }
})

app.get('/payment/:paymentId', async (req, res) => {
  const paymentId : number = parseInt(req.params?.paymentId);
  //get paymentdata with paymentId : 用getPaymentDetails 需要修改query item 檢查其他會不會影響
  const paymentData = await getPaymentDetails(paymentId);
  //get debtors with paymentId ：用getDebtors

  const debtors = await getDebtors(paymentId);
  
  const groupId = req.cookies.groupId;
  const groupUsers = await getGroupMember(groupId);
  res.cookie("paymentId" , paymentId);
  res.render('edit_payment', {users: groupUsers, payment: paymentData, debtors});
})

app.post('/payment/update',
  body('item').exists({checkFalsy:true}),
  body('amount').isInt({min:1, max: 10000000}).exists(),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      console.log(result);
      return res.status(400).render('create_group', { errors: result.array() });
    }
    try{
      const {item, creditor, amount, debtors} = req.body;
      const paymentId = parseInt(req.cookies.paymentId);
      console.log("更新分帳人", debtors);
      const numberOfDebtors = debtors.length
      const groupId = req.cookies.groupId;
      const creditorId = creditor;
      const updatePaymentResult = await updatePaymentById(item, amount, creditorId, numberOfDebtors, paymentId)
      const updateDebtors = await updateDebtor(debtors, paymentId);
      //const updatePaymentDebtorsResult = await debtors.map((debtor : any) => updateDebtorsByPaymentId(paymentId, debtor));
      res.status(200).json({ statusCode: 200, groupId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ statusCode: 500 });
    }
})

app.post('/payment/delete',
  async (req, res) => {
    try{
      const paymentId = req.cookies.paymentId;
      const groupId = req.cookies.groupId;
      console.log(paymentId);
      const result = await deletePayment(paymentId);
      res.status(200).json({ statusCode: 200, groupId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ statusCode: 500 });
    }
})

app.all('*', (req, res) => {
  res.status(404).render('404');
});

app.listen(port, ( ) => {
  console.log(`Server is listening on ${port}`);
});