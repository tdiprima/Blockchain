// cryptoUtils-1.js
//
// Improved version of cryptoUtils.js.
//
// What was wrong with the original:
//   1. Fixed salt ("salt") — the salt should be random and unique every time you
//      encrypt. A fixed salt means an attacker who cracks one password can reuse
//      that work against every other password encrypted with the same salt.
//   2. All-zero IV — the initialization vector must be random and unique per
//      encryption. Reusing the same IV leaks patterns in the ciphertext.
//   3. AES-192-CBC — CBC mode does NOT detect tampering. An attacker can silently
//      corrupt or forge ciphertext. AES-256-GCM is the modern standard: it both
//      encrypts and authenticates (it will throw an error if the data was changed).
//
// How this version fixes those problems:
//   - Generates a fresh random salt (32 bytes) every time you encrypt.
//   - Generates a fresh random IV (12 bytes, ideal for GCM) every time you encrypt.
//   - Uses AES-256-GCM, which produces an "auth tag" you can use to verify the
//     data was not tampered with during decryption.
//   - Packs salt + IV + authTag + ciphertext into one hex string so the caller
//     only needs to store (and pass back) a single value.

const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm"; // Authenticated encryption — detects tampering
const KEY_SIZE = 32;             // 32 bytes = 256-bit key, required for AES-256
const SALT_SIZE = 32;            // 32 random bytes makes the salt practically unique
const IV_SIZE = 12;              // 12 bytes is the recommended IV size for GCM mode
const AUTH_TAG_SIZE = 16;        // GCM always produces a 16-byte authentication tag

// ---------------------------------------------------------------------------
// encryptData(data, password)
//
// Takes a plaintext string and a password, returns a hex string containing:
//   [salt (32 bytes)][iv (12 bytes)][authTag (16 bytes)][ciphertext (variable)]
//
// Everything the decryptor needs is bundled into that one string.
// ---------------------------------------------------------------------------
const encryptData = async (data, password) => {
  // Generate a fresh, random salt every single call.
  // This ensures two encryptions of the same data with the same password
  // produce completely different output — an attacker learns nothing.
  const salt = crypto.randomBytes(SALT_SIZE);

  // Generate a fresh, random IV every single call for the same reason.
  const iv = crypto.randomBytes(IV_SIZE);

  const key = await deriveKey(password, salt);

  // createCipheriv returns a GCM cipher. We can call cipher.update() +
  // cipher.final() synchronously — no need for the streaming event API here.
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt in two steps: update() handles the bulk of the data, final()
  // flushes whatever is left in the internal buffer.
  const encryptedBuffer = Buffer.concat([
    cipher.update(data, "utf8"),
    cipher.final(),
  ]);

  // getAuthTag() must be called AFTER cipher.final().
  // The auth tag is a short checksum that proves the ciphertext was not changed.
  const authTag = cipher.getAuthTag();

  // Bundle everything into one hex string: salt | iv | authTag | ciphertext
  // The sizes are fixed and known, so decryptData can slice them back out.
  const combined = Buffer.concat([salt, iv, authTag, encryptedBuffer]);
  return combined.toString("hex");
};

// ---------------------------------------------------------------------------
// decryptData(encryptedHex, password)
//
// Takes the hex string produced by encryptData and the same password.
// Returns the original plaintext string, or throws if the data was tampered with.
// ---------------------------------------------------------------------------
const decryptData = async (encryptedHex, password) => {
  // Convert hex back to a raw Buffer so we can slice out each component.
  const combined = Buffer.from(encryptedHex, "hex");

  // Slice out each piece using the fixed sizes we defined above.
  let offset = 0;
  const salt      = combined.subarray(offset, offset += SALT_SIZE);
  const iv        = combined.subarray(offset, offset += IV_SIZE);
  const authTag   = combined.subarray(offset, offset += AUTH_TAG_SIZE);
  const ciphertext = combined.subarray(offset); // everything that remains

  const key = await deriveKey(password, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  // Give the decipher the auth tag we stored during encryption.
  // If the ciphertext or tag was altered, decipher.final() will throw —
  // that is intentional and is the whole point of authenticated encryption.
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(), // throws if authentication fails
  ]);

  return decrypted.toString("utf8");
};

// ---------------------------------------------------------------------------
// deriveKey(password, salt)
//
// Converts a human-chosen password into a fixed-size cryptographic key.
// We use scrypt, which is intentionally slow and memory-hard — this makes
// brute-force / dictionary attacks expensive for an attacker.
// ---------------------------------------------------------------------------
const deriveKey = (password, salt) => {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_SIZE, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
};

module.exports = { encryptData, decryptData };
