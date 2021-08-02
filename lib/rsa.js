const { createSign, createVerify } = require('crypto');

/**
 * Provides sign/verify for the RSA `sha1WithRSAEncryption` RSA2 `sha256WithRSAEncryption` cryptos.
 */
class Rsa {
  /**
   * @property {string} base64 - Alias of `base64` string
   */
  static get base64() { return 'base64'; }

  /**
   * @property {string} ALGO_TYPE_RSA - Alias of `sha1WithRSAEncryption` string
   */
  static get ALGO_TYPE_RSA() { return 'sha1WithRSAEncryption'; }

  /**
   * @property {string} ALGO_TYPE_RSA2 - Alias of `sha256WithRSAEncryption` string
   */
  static get ALGO_TYPE_RSA2() { return 'sha256WithRSAEncryption'; }

  /** @property {object} - Supported loading rules */
  static get RULES() {
    return {
      /** -----BEGIN RSA PRIVATE KEY----- ... -----END RSA PRIVATE KEY----- */
      'private.pkcs1': ['der', 'pkcs1', 16],
      /** -----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY----- */
      'private.pkcs8': ['der', 'pkcs8', 16],
      /** -----BEGIN RSA PUBLIC KEY----- ... -----BEGIN RSA PUBLIC KEY----- */
      'public.pkcs1': ['der', 'pkcs1', 15],
      /** -----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY----- */
      'public.spki': ['der', 'spki', 14],
    };
  }

  /**
   * Sugar for loading input `privateKey` string.
   *
   * @param {string} str - The string in `PKCS#8` format.
   *
   * @return {object} - The keyObjectLike `{key,format,type}` structure.
   */
  static fromPkcs8(str) { return this.from(`private.pkcs8://${str}`); }

  /**
   * Sugar for loading input `privateKey/publicKey` string.
   *
   * @param {string} str - The string in `PKCS#1` format.
   *
   * @return {object} - The keyObjectLike `{key,format,type}` structure.
   */
  static fromPkcs1(str) { return this.from(`private.pkcs1://${str}`); }

  /**
   * Sugar for loading input `publicKey` string.
   *
   * @param {string} str - The string in `SPKI` format.
   *
   * @return {object} - The keyObjectLike `{key,format,type}` structure.
   */
  static fromSpki(str) { return this.from(`public.spki://${str}`); }

  /**
   * Loading the privateKey/publicKey from a protocol like string.
   *
   * @param {string} thing - The `private.pkcs1://` or `public.spki://` protocol string.
   *
   * @return {string|object} - The content can be passed onto `createSign`(privateKey) or `createVerify`(publicKey).
   */
  static from(thing) {
    const protocol = thing.slice(0, thing.indexOf('://'));
    const [format, type, offset] = (this.RULES[protocol] || []);

    if (format && type && offset) {
      const key = Buffer.from(thing.slice(offset), this.base64);
      return { key, format, type };
    }

    return thing;
  }

  /**
   * Creates and returns a `Sign` string that uses given `type=RSA|RSA2`.
   *
   * @param {string} message - Content will be `crypto.Sign`.
   * @param {string|buffer} privateKey - A PEM encoded private key certificate.
   * @param {string} [type] - one of the algo alias RSA/RSA2, default is `RSA2`.
   *
   * @returns {string} Base64-encoded signature.
   */
  static sign(message, privateKey, type = 'RSA2') {
    return createSign(
      this[`ALGO_TYPE_${type.toUpperCase()}`],
    ).update(message).sign(
      privateKey,
      this.base64,
    );
  }

  /**
   * Verifying the `message` with given `signature` string that uses given `type=RSA|RSA2`.
   *
   * @param {string} message - Content will be `crypto.Verify`.
   * @param {string} signature - The base64-encoded ciphertext.
   * @param {string|buffer} publicKey - A PEM encoded public certificate.
   * @param {string} [type] - one of the algo alias RSA/RSA2, default is `RSA2`.
   *
   * @returns {boolean} True is passed, false is failed.
   */
  static verify(message, signature, publicKey, type = 'RSA2') {
    return createVerify(
      this[`ALGO_TYPE_${type.toUpperCase()}`],
    ).update(message).verify(
      publicKey,
      signature,
      this.base64,
    );
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

module.exports = Rsa;
module.exports.default = Rsa;
