const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

async function getKeyMaterial(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  return crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveKey']);
}

async function deriveKey(keyMaterial: CryptoKey, salt: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(text: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const keyMaterial = await getKeyMaterial(password);
  const key = await deriveKey(keyMaterial, salt);

  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );

  const encryptedArray = new Uint8Array(encrypted);
  const result = new Uint8Array(salt.length + iv.length + encryptedArray.length);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(encryptedArray, salt.length + iv.length);

  return btoa(String.fromCharCode(...result));
}

export async function decrypt(encryptedText: string, password: string): Promise<string> {
  const data = Uint8Array.from(atob(encryptedText), (c) => c.charCodeAt(0));

  const salt = data.slice(0, 16);
  const iv = data.slice(16, 16 + IV_LENGTH);
  const encrypted = data.slice(16 + IV_LENGTH);

  const keyMaterial = await getKeyMaterial(password);
  const key = await deriveKey(keyMaterial, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
