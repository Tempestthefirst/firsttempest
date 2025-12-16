/**
 * Secure PIN hashing utilities using Web Crypto API
 * Uses PBKDF2 with SHA-256 for key derivation with unique per-user salts
 */

const ITERATIONS = 100000;

/**
 * Generate a unique random salt for a new user
 */
export function generateSalt(): string {
  const saltArray = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a PIN using PBKDF2 with a unique salt
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const pinData = encoder.encode(pin);
  const saltData = encoder.encode(salt);

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
 * Verify a PIN against a stored hash using the user's salt
 */
export async function verifyPin(pin: string, storedHash: string, salt: string): Promise<boolean> {
  const computedHash = await hashPin(pin, salt);
  return computedHash === storedHash;
}
