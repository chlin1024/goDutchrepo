import { Request, Response } from 'express';
import { getGroupData } from './groups.js';
import { getUserName } from '../models/users.js';
import verifyUserJWT from '../utils/verifyJWT.js';

export default async function personalPageView(req: Request, res: Response) {
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
}
