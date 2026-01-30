// src/utils/crypto.ts
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'user_email_accounts';
const SECRET = 'snapmail2026';

export function encryptAccounts(accounts: any[]): string {
  const data = JSON.stringify(accounts);
  return CryptoJS.AES.encrypt(data, SECRET).toString();
}

export function decryptAccounts(ciphertext: string): any[] {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: any[]) {
  localStorage.setItem(STORAGE_KEY, encryptAccounts(accounts));
}

export function loadAccounts(): any[] {
  const cipher = localStorage.getItem(STORAGE_KEY);
  if (!cipher) return [];
  return decryptAccounts(cipher);
}
