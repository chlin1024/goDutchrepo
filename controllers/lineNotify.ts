import { Request, Response } from 'express';
import axios from 'axios';

import { saveAccessTokenLine, getUserName, getAccessTokenLine } from '../models/users.js';
import { getGroupName } from '../models/payment_groups.js';
import verifyUserJWT from '../utils/verifyJWT.js';

export async function lineNotifyCallback(req: Request, res: Response) {
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
}

export async function sentLineNotify(req: Request, res: Response) {
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
}
