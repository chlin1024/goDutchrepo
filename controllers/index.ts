import { Request, Response } from 'express';
import { getUserName } from '../models/users.js';
import verifyUserJWT from '../utils/verifyJWT.js';

export default async function indexView(req: Request, res: Response) {
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
}
