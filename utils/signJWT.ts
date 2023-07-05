import { error } from "console";
import jwt from "jsonwebtoken";

const JWT_SECRET_KEY = "uygukygkuyf";
//process.env.JWT_SECRET_KEY;

export function signUserJWT(userId: number) {
  try {
    const expiresTime = { expiresIn: '36000s'};
    const payload = {
      userId: userId
    }
    const jwtUserToken = jwt.sign(payload, JWT_SECRET_KEY, expiresTime)
    return jwtUserToken;
  } catch (err) {
    console.error(err);
  }
}

export function signGroupJWT(groupId: number) {
  try {
    const expiresTime = { expiresIn: '360000s'};
    const jwtGroupToken = jwt.sign({groupId}, JWT_SECRET_KEY, expiresTime)
    return jwtGroupToken;
  } catch (err) {
    console.error(err);
  }
}
/*try {
  const [user] = await promisePool.query(userQuery, [userId]);
  // create a signed JWT token.
  const payload = user[0];
  console.log(payload);
  const expiresTime = { expiresIn: '3600s'};
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, expiresTime);
  // send response back
  res.cookie('Authorization', token);
  res.redirect('/profile');
  } catch(error){
    res.status(500).render('user', {error: 'Sever Error. Something went wrong creating token and query user'});
    console.error(error);
  }*/