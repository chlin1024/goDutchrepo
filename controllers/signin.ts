import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import { getuserEmail, getUserPassword, getuserId } from '../models/users.js';

import signUserJWT from '../utils/signJWT.js';
//   import verifyUserJWT from '../utils/verifyJWT.js';

export function signinView(req: Request, res: Response) {
  try {
    res.render('sign_in');
  } catch (error) {
    res.render('404');
  }
}

export async function signIn(req: Request, res: Response) {
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
    return res.redirect('/personal_page');
  } catch (error) {
    console.error(error);
    return res.status(500).render('sign_in', { error });
  }
}
