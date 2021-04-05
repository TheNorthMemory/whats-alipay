/* eslint max-classes-per-file: ["error", 2] */
const crypto = require('crypto');

/**
 * Aes - Advanced Encryption Standard
 */
class Aes {
  /**
   * @property {string} hex - Alias of `hex` string
   */
  static get hex() { return 'hex'; }

  /**
   * @property {string} utf8 - Alias of `utf8` string
   */
  static get utf8() { return 'utf8'; }

  /**
   * @property {string} base64 - Alias of `base64` string
   */
  static get base64() { return 'base64'; }

  /**
   * @property {integer} BLOCK_SIZE - The `aes` block size
   */
  static get BLOCK_SIZE() { return 16; }

  /**
   * @property {string} MODE_CBC - The `cbc` mode string
   */
  static get MODE_CBC() { return 'cbc'; }

  /**
   * Detect the algo with given `cipherkey` length and `mode`.
   *
   * @param {string} cipherkey - Based64 encoded key string.
   * @param {string} [mode] - The `mode` string, default is `this.MODE_CBC`.
   *
   * @returns {array} - `[algorithm, key]` pairs
   */
  static detector(cipherkey, mode = this.MODE_CBC) {
    const key = Buffer.from(cipherkey, this.base64);

    return [`aes-${key.length * 8}-${mode.toLowerCase()}`, key];
  }

  /**
   * To prevent `new` operation, works only as static class.
   *
   * @constructor
   */
  constructor() {
    const error = new Error(`${this.constructor.name} class should only static usage`);
    error.name = `${this.constructor.name}Error`;

    throw error;
  }
}

/**
 * AesCbc
 */
class AesCbc extends Aes {
  /**
   * Encrypts plaintext.
   *
   * @param {string} plaintext - Text to encode.
   * @param {string} cipherkey - The secret key, base64 encoded string.
   * @param {string|buffer} [iv] - The initialization vector, 16 bytes string or buffer, default is `0{16}` buffer.
   *
   * @returns {string} Base64-encoded ciphertext.
   */
  static encrypt(plaintext, cipherkey, iv = Buffer.alloc(this.BLOCK_SIZE)) {
    const payload = Buffer.from(plaintext);
    const cipher = crypto.createCipheriv(
      ...this.detector(cipherkey), iv,
    ).setAutoPadding(true);

    return Buffer.concat([
      cipher.update(payload, this.utf8),
      cipher.final(),
    ]).toString(this.base64);
  }

  /**
   * Decrypts ciphertext.
   *
   * @param {string} ciphertext - Base64-encoded ciphertext.
   * @param {string} cipherkey - The secret key, base64 encoded string.
   * @param {string|buffer} [iv] - The initialization vector, 16 bytes string or buffer, default is `0{16}` buffer.
   *
   * @returns {string} Utf-8 plaintext.
   */
  static decrypt(ciphertext, cipherkey, iv = Buffer.alloc(this.BLOCK_SIZE)) {
    const payload = Buffer.from(ciphertext, this.base64);
    const decipher = crypto.createDecipheriv(
      ...this.detector(cipherkey), iv,
    ).setAutoPadding(true);

    return Buffer.concat([
      decipher.update(payload, this.hex),
      decipher.final(),
    ]).toString(this.utf8);
  }
}

module.exports = Aes;
module.exports.default = Aes;
module.exports.AesCbc = AesCbc;
