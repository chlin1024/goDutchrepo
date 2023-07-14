import { createUser } from '../models/users.js';
import signUserJWT from '../utils/signJWT.js';

export default async function signUp(name: string, email: string, password: string) {
  try {
    const userId = await createUser(name, email, password);
    const token = signUserJWT(userId);
    const userData = { userId, token };
    return userData;
  } catch (error) {
    console.error(error);
    return error;
  }
}
