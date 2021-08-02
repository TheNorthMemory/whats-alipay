const Decorator = require('./decorator');

const CLIENT = Symbol('CLIENT');

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
    const name = (prefix ? `${prefix}.${suffix}` : suffix).toLowerCase();

    return new Proxy(this.chain(name), this.handler);
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
     * - Typeof `function` of `config.headers` is available since v0.0.9
     *
     * @param {object} data - The input, `biz_content` part.
     * @param {object} [params] - The input, others parts.
     * @param {object|function} [headers] - The optional headers, specificly, the `function` is only for `Formatter.page` etc callbacks.
     *
     * @returns {PromiseLike} - The `AxiosPromise` instance.
     */
    return {
      [method](data, params, headers = {}) {
        /* eslint-disable-next-line no-param-reassign */
        params = Object.assign(params || {}, { method });

        return Decorator.request({ data, params, headers });
      },
    }[method];
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
        if (!property || typeof property === 'symbol' || property === 'inspect') {
          return target;
        }

        if (!Object.prototype.hasOwnProperty.call(target, property)) {
          /* eslint-disable-next-line no-param-reassign */
          target[property] = this.compose(target.name, property);
        }

        return target[property];
      },
    };
  }

  /**
   * To compose the method `chain`.
   *
   * @param {object} config - The configuration passed in `Decorator`.
   * @param {string|Buffer} config.privateKey - The merchant's RSA private key.
   * @param {string|Buffer} config.publicKey - The platform's RSA publicKey.
   * @param {string|Buffer} [config.publicCert] - The platform's RSA publicKey or certificate(deprected since v0.1.3).
   * @param {object} [config.params] - The general parameters.
   * @param {string|number} [config.params.app_id] - The merchant's application id.
   * @param {string} [config.params.app_cert_sn] - The merchant's RSA's certificate SN.
   * @param {string} [config.params.alipay_root_cert_sn] - The alipay's RSA's certificate SN.
   *
   * @constructor
   */
  constructor(config = {}) {
    return Object.defineProperty(this.constructor, CLIENT, { writable: true, value: new Decorator(config) }).compose();
  }
}

module.exports = Alipay;
module.exports.default = Alipay;
