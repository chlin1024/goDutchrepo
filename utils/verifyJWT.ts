import jwt from 'jsonwebtoken';

const JWT_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;

export default function verifyUserJWT(token: string) {
  try {
    const payload : any = jwt.verify(token, JWT_SECRET_KEY as string);
    return payload;
  } catch (error: any) {
    console.error(error);
    if (error.name === 'TokenExpiredError') {
      return false;
    }
    throw error;
  }
}
