import CryptoJS from 'crypto-js';


const secretPhrase = 'sdfdfdasei90302fj';

export async function encryptGroupId(groupId: number) {
  const encrypted = CryptoJS.AES.encrypt(groupId.toString(), secretPhrase).toString();;
  return encrypted;
}

export async function decryptedGroupId(encrypted: any) {
  const decrypted = CryptoJS.AES.decrypt(encrypted, secretPhrase);
  const originalText = decrypted.toString(CryptoJS.enc.Utf8);
  return originalText;
}
