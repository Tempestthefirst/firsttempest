/**
 * Secure PIN hashing utilities using Web Crypto API
 * Uses PBKDF2 with SHA-256 for key derivation
 */

const SALT = 'firstpay-pin-salt-v1'; // In production, use unique salt per user stored in DB
const ITERATIONS = 100000;

/**
 * Hash a PIN using PBKDF2
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const pinData = encoder.encode(pin);
  const saltData = encoder.encode(SALT);

  // Import the PIN as a key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    pinData,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Verify a PIN against a stored hash
 */
export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const computedHash = await hashPin(pin);
  return computedHash === storedHash;
}
