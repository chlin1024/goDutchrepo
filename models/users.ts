import promisePool from './databasePool.js'
import bcrypt from "bcrypt";

export async function createUser(name: string, email: string, password: string) {
  const insertUserQuery = `INSERT INTO users (name, email, password) 
                          VALUES (?, ?, ?)`;                       
  const encryptedPassword = await bcrypt.hash(password, 10);
  //Create a user in our database.
  const [insertUser] : any = await promisePool.query(insertUserQuery, [name, email, encryptedPassword]);
  const userId : number = insertUser['insertId'];
  return userId;
}

export async function getuserEmail(email: string) {
  const [userEmail] : any = await promisePool.query(
    `Select email, id FROM users WHERE email = ?`, 
     [email]);
  return userEmail;
}

export async function getUserPassword(email: string) {
  const [userPassword] : any = await promisePool.query(
    `Select password FROM users WHERE email = ?`, 
     [email]);
  return userPassword;
}

export async function getuserId(email: string) {
  const [result] : any = await promisePool.query(
    `Select id FROM users WHERE email = ?`, 
     [email]);
  const userId = result[0].id;
  return userId;
}

export async function getUserName(userId: number) {
  const [userName] : any = await promisePool.query(
    `SELECT name FROM users
     WHERE id = ?`, 
     [userId]);
  return userName;
}

export async function getuserData(email: string) {
  const [userId] : any = await promisePool.query(
    `Select id FROM users WHERE email = ?`, 
     [email]);
  return userId;
}

export async function saveAccessTokenLine(accessTokenLine: string, userId: number) {
  console.log('存資料庫');
  const [result] : any = await promisePool.query(
    `UPDATE users SET line_access_token = ? WHERE Id = ?`, 
     [accessTokenLine, userId]);
  console.log('成功');
  return result;
}

export async function getAccessTokenLine(userId: number){
  const [result] : any = await promisePool.query(
    `SELECT line_access_token from users WHERE Id = ?`, 
     [userId]);
  //console.log(result);
  const accessTokenLine = result[0].line_access_token;
  console.log(accessTokenLine);
  return accessTokenLine;
}
