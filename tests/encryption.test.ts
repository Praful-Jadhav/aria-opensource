import crypto from 'crypto';

// Setup environment for testing
process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

// Use relative path for tests if alias is not resolved by node directly.
// In actual Next.js app, we use @/services. Here let's just use relative.
import { encrypt, decrypt, verifyEncryptionService } from '../src/services/encryption.service';
import assert from 'assert';

function runTests() {
  console.log('Running Encryption Service Tests...\n');

  // Test 1: Encrypt -> Decrypt integrity
  const testString = 'super-secret-oauth-token-12345';
  const encryptedObj = encrypt(testString);
  
  assert(encryptedObj.encrypted.length > 0, 'Encrypted string is empty');
  assert(encryptedObj.iv.length === 32, 'IV should be 16 bytes (32 hex chars)');
  assert(encryptedObj.authTag.length === 32, 'Auth tag should be 16 bytes (32 hex chars)');
  
  const decryptedString = decrypt(encryptedObj);
  assert(decryptedString === testString, 'Decrypted string does not match original plaintext');
  console.log('✅ Encrypt -> Decrypt integrity verified');

  // Test 2: Tampered ciphertext detection
  const tamperedObj = {
    ...encryptedObj,
    encrypted: encryptedObj.encrypted.substring(0, encryptedObj.encrypted.length - 2) + '00' // change last byte
  };
  
  let caughtCiphertextTamper = false;
  try {
    decrypt(tamperedObj);
  } catch (err: any) {
    if (err.message.includes('Decryption failed. Data may be tampered.')) {
      caughtCiphertextTamper = true;
    }
  }
  assert(caughtCiphertextTamper, 'Tampered ciphertext was not detected (no error thrown or wrong error)');
  console.log('✅ Tampered ciphertext detection verified');

  // Test 3: Tampered auth tag detection
  const tamperedAuthTagObj = {
    ...encryptedObj,
    authTag: '00' + encryptedObj.authTag.substring(2)
  };

  let caughtAuthTagTamper = false;
  try {
    decrypt(tamperedAuthTagObj);
  } catch (err: any) {
    if (err.message.includes('Decryption failed. Data may be tampered.')) {
      caughtAuthTagTamper = true;
    }
  }
  assert(caughtAuthTagTamper, 'Tampered auth tag was not detected');
  console.log('✅ Tampered auth tag detection verified');
  
  // Test 4: Health check method
  assert(verifyEncryptionService() === true, 'Health check failed');
  console.log('✅ Encryption health check verified');

  console.log('\nAll tests passed!');
}

runTests();
