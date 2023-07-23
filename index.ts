import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import axios from 'axios';

import userRouter from './routes/user.js';
import settlementRouter from './routes/settlement.js';
import paymentRouter from './routes/payment.js';
import groupRouter from './routes/group.js';
import personalPageRouter from './routes/personalPage.js';
import indexRouter from './routes/index.js';

import { getGroupName } from './models/payment_groups.js';
import { saveAccessTokenLine, getAccessTokenLine, getUserName } from './models/users.js';

//  import { getGroupData } from './controllers/groups.js';

import verifyUserJWT from './utils/verifyJWT.js';

dotenv.config();
const app = express();
const port = 3000;
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
//  const router = Router();

app.set('views', path.join(dirName, '../build'));
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('./build'));

/*  router.use(function (req, res, next) {
  next();
}); */

/*  app.get('/', async (req, res) => {
  try {
    const userToken = req.cookies.jwtUserToken;
    if (userToken) {
      const payload = verifyUserJWT(userToken);
      const { userId } = payload;
      const userNameResult = await getUserName(userId);
      const userName = userNameResult[0].name;
      res.render('index', { userToken, userName });
    } else {
      res.render('index');
    }
  } catch (error) {
    res.status(500);
  }
}); */

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
        點擊連結登記還款: https://www.cphoebelin.com/settlement/create?group=${groupId}&debtor=${debtor}&creditor=${creditor}&amount=${amount}`,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${accessTokenLine}`,
        },
      }
    );
    if (response.data.status === 200) {
      res.redirect(`/group/${groupId}?status=success`);
    }
  } catch (error) {
    const { groupId } = req.cookies;
    res.redirect(`/group/${groupId}?status=error`);
    console.error(error);
  }
});

app.use('/', [userRouter, settlementRouter, paymentRouter, groupRouter, personalPageRouter, indexRouter]);

/*  app.get('/personal_page', async (req, res) => {
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
}); */

app.all('*', (req, res) => {
  res.status(404).render('404');
});

app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
