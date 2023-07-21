import { Request, Response } from 'express';

import { createUser, getuserEmail } from '../models/users.js';
import signUserJWT from '../utils/signJWT.js';

export function signupView(req: Request, res: Response) {
  try {
    res.render('sign_up');
  } catch (error) {
    res.render('404');
  }
}

export async function signUp(req: Request, res: Response) {
  try {
    const { name, signupEmail, signupPassword } = req.body;
    const { referer } = req.cookies;
    const existUser = await getuserEmail(signupEmail);
    if (existUser.length === 1) {
      res.status(400).render('sign_up', { signUpError: '您已經是會員，請登入！' });
    } else if (existUser.length === 0) {
      const userId = await createUser(name, signupEmail, signupPassword);
      const token = signUserJWT(userId);
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
