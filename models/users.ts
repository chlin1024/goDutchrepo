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

