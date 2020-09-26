const pkg = require('../package.json')

const axios = require('axios')
const mergeConfig = require('axios/lib/core/mergeConfig')

const Rsa = require('./rsa')
const Formatter = require('./formatter')

const CLIENT = Symbol('CLIENT')
const PRIVATE_KEY = Symbol(`PRIVATE_KEY`)
const PUBLIC_CERT = Symbol(`PUBLIC_CERT`)

/**
 * Decorate the `Axios` instance
 */
class Decorator {
  /**
   * @property {AxiosInstance} client - The Axios instance.
   */
  static get client() { return this[CLIENT] }
  static set client(instance) { this[CLIENT] = instance }

  /**
   * @property {buffer} privateKey - Buffer of the private key certificate.
   */
  static get privateKey() { return this[PRIVATE_KEY] }
  static set privateKey(certificate) { this[PRIVATE_KEY] = Buffer.from(certificate) }

  /**
   * @property {buffer} publicCert - Buffer of the alipay public certificate.
   */
  static get publicCert() { return this[PUBLIC_CERT] }
  static set publicCert(certificate) { this[PUBLIC_CERT] = Buffer.from(certificate) }

  /**
   * @property {function} requestInterceptor - Named as `signer` function.
   */
  static get requestInterceptor() {
    const that = this

    /**
     * Convert the inputs and then sign.
     *
     * @param {object} config - The AxiosConfig
     *
     * @returns {object} The AxiosConfig
     */
    return function signer(config = {}) {
      const SIGN = `sign`
      const BODY = `biz_content`

      config.params.timestamp = Formatter.localeDateTime()

      const TEMP = new URLSearchParams(config.params)
      TEMP.append(BODY, Buffer.isBuffer(config.data) ? '' : JSON.stringify(config.data || {}))

      const data = new URLSearchParams()
      data.append(BODY, TEMP.get(BODY))
      data.append(SIGN, Rsa.sign(
        Formatter.queryStringLike(
          Formatter.ksort(
            Object.fromEntries(
              TEMP.entries()
            )
          )
        ), that.privateKey)
      )

      if (Buffer.isBuffer(config.data)) {
        config.params[SIGN] = data.get(SIGN)
      } else {
        config.data = data
      }

      return config
    }
  }

  /**
   * @property {function} responseVerifier - Named as `verifier` function.
   */
  static get responseVerifier() {
    const that = this

    /**
     * Parse the outputs JSONLike text, and stored the parsing info onto headers with `x-alipay-*`.
     *
     * @param {string} data - The response
     * @param {object} headers - The response
     *
     * @returns {string} The json content
     */
    return function verifier(data, headers) {
      const {ident, payload, sign} = Formatter.fromJsonLike(data)

      headers['x-alipay-responder'] = (ident || '').replace(/_/g, '.')
      headers['x-alipay-signature'] = sign || ''

      if (sign && Rsa.verify(payload, sign, that.publicCert)) {
        headers['x-alipay-verified'] = 'ok'
        return payload
      }

      return data
    }
  }

  /**
   * @property {object} defaults - The defaults configuration whose pased in `Axios`.
   */
  static get defaults() {
    const {platform, arch, versions: {node: nodeVersion}} = process || {versions: {}}

    return {
      method: 'post',
      baseURL: 'https://openapi.alipay.com/gateway.do',
      headers: {
        'User-Agent': `WhatsAlipay/${pkg.version} Node/${nodeVersion} ${platform}/${arch}`,
      },
      params: {
        format: 'JSON',
        charset: 'utf-8',
        sign_type: 'RSA2',
        version: '1.0',
      },
    }
  }

  /**
   * Decorate factory
   * @params {object} config - The configuration.
   * @constructor
   */
  constructor(config = {}) {
    const that = this.constructor

    const {privateKey, publicCert} = config
    delete config.privateKey
    delete config.publicCert
    that.privateKey = privateKey
    that.publicCert = publicCert

    const instance = axios.create(mergeConfig(config, that.defaults))

    instance.interceptors.request.use(that.requestInterceptor)
    instance.defaults.transformResponse.unshift(that.responseVerifier)

    that[CLIENT] = instance

    return this
  }
}

module.exports = Decorator
module.exports.default = Decorator
