const fs = require('fs')
const crypto = require('crypto')

const x509 = require('@fidm/x509')

/**
 * Provide some useful functions for the catificate(s)
 */
class Helpers {
  /**
   * To prevent `new` operation, works only as static class.
   *
   * @constructor
   */
  constructor() {
    const error = new Error(`${this.constructor.name} class should only static usage`)
    error.name = `${this.constructor.name}Error`

    throw error
  }

  /**
   * @propertiy LF - The line feed character
   */
  static get LF() { return `\n` }

  /**
   * MD5 hash function
   * @param {...string|Buffer|BufferView} things - To caculating things
   * @return {string} - The digest string
   */
  static md5(...things) {
    const hash = crypto.createHash('md5')

    things.map(thing => hash.update(thing))

    return hash.digest('hex')
  }

  /**
   * Similar to require('wordwrap') function for formatting the PEM certificate
   * @param {string} str - The input string
   * @param {number} [width] - The wrapping width, default is 64
   * @param {[type]} [char] - The wrapping character, default is `this.LF`
   * @return {string} - The wrapped string
   */
  static wordwrap(str = '', width = 64, char = this.LF) {
    return str.replace(
      new RegExp(`(?<txt>[^${char}]{${width}})`, 'g'),
      `$<txt>${char}`
    ).trim(char)
  }

  /**
   * @propertiy OIDs - Built-in ASN.1 OIDs
   */
  static get OIDs() {
    return {
      sha1WithRSAEncryption: `1.2.840.113549.1.1.5`,
      sha256WithRSAEncryption: `1.2.840.113549.1.1.11`,
      ecdsaWithSha384: `1.2.840.10045.4.3.3`,
      SM3WithSM2: `1.2.156.10197.1.501`,
      // rsaEncryption: `1.2.840.113549.1.1.1`,
      // ecEncryption: `1.2.840.10045.2.1`,
      // SM2: `1.2.156.10197.1.301`,
      // sha1withSM2: `1.2.156.10197.1.502`,
      // sha256withSM2: `1.2.156.10197.1.503`,
      // sm3withRSAEncryption: `1.2.156.10197.1.504`,
    }
  }

  /**
   * Mapping to `@fidm/x509`.Certificate.fromPEMs
   * @param  {string|Buffer} thing - The certificatie(s) file path or Buffer
   * @return {object} - The `@fidm/x509`.Certificate instance
   */
  static load(thing) {
    return x509.Certificate.fromPEMs(
      Buffer.isBuffer(thing) ? thing : fs.readFileSync(thing)
    )
  }

  /**
   * Extract a certificate from given `thing`
   *
   * @param  {string|Buffer} thing - The certificatie(s) file path or Buffer
   * @param  {string} [pattern] - The algo prefix or suffix, default is `sha256` prefix
   *
   * @return {string} - The pem format certificate(s)
   */
  static extract(thing, pattern = 'sha256') {
    return this.load(thing)
    .filter(cert => {
      return Object.entries(Helpers.OIDs).filter(
        ([key]) => key.match(pattern)
      ).map(
        ([,value]) => value
      ).includes(cert.signatureOID)
    })
    .map(({raw}) => Buffer.from(raw).toString('base64'))
    .map(str => this.wordwrap(str))
    .map(str => [`-----BEGIN CERTIFICATE-----`, str, `-----END CERTIFICATE-----`].join(this.LF))
    .join(this.LF)
  }

  /**
   * Calculate the given certificate(s) `SN` value string
   *
   * Note: The primitive `BigInt` was shipped since nodejs v10.8.0, it's >= 10.15.0 as safety.
   *
   * @param {string|Buffer} thing - The certificatie(s) file path or Buffer
   * @param {string} [pattern] - The algo prefix or suffix, default is `sha256` prefix
   *
   * @return {string} - The SN value string
   */
  static SN(thing, pattern = 'sha256') {
    return this.load(thing)
    .filter(cert => {
      return Object.entries(Helpers.OIDs).filter(
        ([key]) => key.match(pattern)
      ).map(
        ([,value]) => value
      ).includes(cert.signatureOID)
    })
    .map(({issuer: {attributes}, serialNumber}) => {
      const attrs = attributes.map(
        ({shortName, value}) => ({[shortName]: value})
      ).reverse(
        /*ordering to [{CN},{OU},{O},{C}] format*/
      ).reduce(
        (des, one) => (des = {...des, ...one}, des),
        {}
      )

      return [
        Object.entries(attrs).map(row => row.join(`=`)).join(`,`),
        /*eslint-disable-next-line*/
        BigInt(`0x${serialNumber}`)
      ]
    })
    .map(row => row.join(``))
    .map(row => this.md5(...row))
    .join(`_`)
  }
}

module.exports = Helpers
module.exports.default = Helpers
