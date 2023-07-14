import jwt from 'jsonwebtoken';

const JWT_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;

export default function signUserJWT(userId: number) {
  try {
    const expiresTime = { expiresIn: '36000s' };
    const payload = { userId };
    const jwtUserToken = jwt.sign(payload, JWT_SECRET_KEY as string, expiresTime);
    return jwtUserToken;
  } catch (error) {
    console.error(error);
    return error;
  }
}
