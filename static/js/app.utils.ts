import CryptoJS from 'crypto-js';
import { logout } from './services/auth.service';

/**
 * Check if provided string arrays are equal to each other or not
 * @param arr1
 * @param arr2
 * @returns {boolean}
 */
export const areStringArraysEqual = (arr1: string[], arr2: string[]): boolean => {
  if (!arr1 || !arr2) {
    return false;
  }

  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

export const isAuthorised = () => {
  const userType = decryptString(localStorage.getItem('role'));
  if (userType === 'free' || (userType === 'organization' && localStorage.getItem('outOfOrganization') === 'true')) {
    return false;
  } else if (userType === 'organization' || userType === 'premium' || userType === 'admin') {
    return true;
  } else {
    logout();
  }
}

export const isAdmin = () => {
  const userType = decryptString(localStorage.getItem('role'));
  if (userType === 'admin') {
    return true;
  }
  return false;
}

const encryptionKey = process.env.ENCRYPTION_KEY || 'eastLawPk';

export const encryptString = (str: any) => {
  if (!str) {
    return '';
  }
  const ciphertext = CryptoJS.AES.encrypt(str, encryptionKey);
  return ciphertext.toString();
};

export const decryptString = (ciphertextStr: any) => {
  if (!ciphertextStr) {
    return '';
  }
  const bytes = CryptoJS.AES.decrypt(ciphertextStr, encryptionKey);
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  return plaintext;
};