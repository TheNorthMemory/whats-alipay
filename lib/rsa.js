const crypto = require('crypto');

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

  /**
   * Creates and returns a `Sign` string that uses given `type=RSA|RSA2`.
   *
   * @param {string} message - Content will be `crypto.Sign`.
   * @param {string|buffer} privateKeyCertificate - A PEM encoded private key certificate.
   * @param {string} [type] - one of the algo alias RSA/RSA2, default is `RSA2`.
   *
   * @returns {string} Base64-encoded signature.
   */
  static sign(message, privateKeyCertificate, type = 'RSA2') {
    return crypto.createSign(
      this[`ALGO_TYPE_${type.toUpperCase()}`],
    ).update(message).sign(
      privateKeyCertificate,
      this.base64,
    );
  }

  /**
   * Verifying the `message` with given `signature` string that uses given `type=RSA|RSA2`.
   *
   * @param {string} message - Content will be `crypto.Verify`.
   * @param {string} signature - The base64-encoded ciphertext.
   * @param {string|buffer} publicCertificate - A PEM encoded public certificate.
   * @param {string} [type] - one of the algo alias RSA/RSA2, default is `RSA2`.
   *
   * @returns {boolean} True is passed, false is failed.
   */
  static verify(message, signature, publicCertificate, type = 'RSA2') {
    return crypto.createVerify(
      this[`ALGO_TYPE_${type.toUpperCase()}`],
    ).update(message).verify(
      publicCertificate,
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
