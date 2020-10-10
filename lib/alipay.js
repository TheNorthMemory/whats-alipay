const Decorator = require('./decorator')

/**
 * Whats Alipay Core
 */
class Alipay {
  /**
   * Compose a named function with `prefix` and `suffix` whose joined by a `dot(.)`
   *
   * @param {string} [prefix] - The prefix string.
   * @param {string} [suffix] - The suffix string.
   *
   * @returns {Proxy} - With a special `Getter` Function.
   */
  static compose(prefix = '', suffix = '') {
    const name = (prefix ? `${prefix}.${suffix}` : suffix).toLowerCase()

    /*eslint-disable-next-line*/
    return new Proxy(this.chain(name), this.handler)
  }

  /**
   * Chain the input method
   *
   * @param {string} method - The naming string.
   *
   * @returns {function} - Named as given `method` function
   */
  static chain(method) {
    /**
     * Naming as given `method` function
     *
     * @param {object} data - The input, `biz_content` part.
     * @param {object} params - The input, others parts.
     * @param {object} [headers] - The optional headers.
     *
     * @returns {PromiseLike} - The `AxiosPromise` instance.
     */
    return {[method](data, params, headers = {}) {
      params = Object.assign(params || {}, {method})

      return Decorator.request({data, params, headers})
    }}[method]
  }

  /**
   * @property {object} handler - A `Getter` handler object
   */
  static get handler() {
    return {
      /**
       * @property {function} get - Object's `getter` handler
       * @param {object} target - The object
       * @param {string} property - The property
       * @returns {object} - An object or object's property
       */
      get: (target, property) => {
        if (!property || typeof property === `symbol` || property === `inspect`) {
          return target
        }

        if (!(property in target)) {
          target[property] = this.compose(target.name, property)
        }

        return target[property]
      }
    }
  }

  /**
   * To compose the method `chain`.
   *
   * @param {object} config - The configuration passed in `Decorator`.
   * @param {string|Buffer} config.privateKey - The merchant's RSA's private key.
   * @param {string|Buffer} config.publicCert - The alipay's RSA's pubkey or certificate(recommend).
   * @param {object} [config.params] - The merchant's application id.
   * @param {string|number} [config.params.app_id] - The merchant's application id.
   * @param {string} [config.params.app_cert_sn] - The merchant's RSA's certificate SN.
   * @param {string} [config.params.alipay_root_cert_sn] - The alipay's RSA's certificate SN.
   *
   * @constructor
   */
  constructor(config = {}) {
    new Decorator(config)

    return this.constructor.compose()
  }
}

module.exports = Alipay
module.exports.default = Alipay
