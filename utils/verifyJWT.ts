import jwt from "jsonwebtoken";

const JWT_SECRET_KEY = "uygukygkuyf";
//process.env.JWT_SECRET_KEY;

/*const DecodedSchema = Object({
  Id: number(),
});*/

//type Decoded = infer<typeof DecodedSchema>;

export function verifyUserJWT(token: string){
  try {
    const payload : any = jwt.verify(token, JWT_SECRET_KEY);
    return payload;
  } catch (error: any) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return false;
    }
    throw error;
  }
}

export function verifyGroupJWT(token: string){
  try {
    const payload : any = jwt.verify(token, JWT_SECRET_KEY);
    const groupId = payload.groupId
    return groupId;
  } catch (error) {
    console.error(error);
    throw error;
  }
}