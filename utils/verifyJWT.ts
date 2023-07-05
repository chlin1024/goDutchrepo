import jwt from "jsonwebtoken";
//import * as dotenv from 'dotenv';
//dotenv.config();
//const JWT_SECRET_KEY = "uygukygkuyf";
const JWT_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;

/*const DecodedSchema = Object({
  Id: number(),
});*/

//type Decoded = infer<typeof DecodedSchema>;

export function verifyUserJWT(token: string){
  try {
    const payload : any = jwt.verify(token, JWT_SECRET_KEY as string);
    return payload;
  } catch (error: any) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return false;
    }
    throw error;
  }
}

/*export function verifyGroupJWT(token: string){
  try {
    const payload : any = jwt.verify(token, JWT_SECRET_KEY);
    const groupId = payload.groupId
    return groupId;
  } catch (error) {
    console.error(error);
    throw error;
  }
}*/