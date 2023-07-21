import { Request, Response } from 'express';

export default function signupView(req: Request, res: Response) {
  try {
    res.cookie('jwtUserToken', '', { maxAge: 1 });
    res.redirect('/');
  } catch (error) {
    res.status(500);
  }
}
