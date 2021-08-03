/* eslint no-param-reassign: 0 */
const axios = require('axios');

const pkg = require('../package.json');
const Rsa = require('./rsa');
const Formatter = require('./formatter');

const CLIENT = Symbol('CLIENT');
const PRIVATE_KEY = Symbol('PRIVATE_KEY');
const PUBLIC_KEY = Symbol('PUBLIC_KEY');

const SIGN = 'sign';
const SIGN_TYPE = 'sign_type';
const BIZ_CONTENT = 'biz_content';

const isKeyObjectLike = (value) => value !== null && typeof value === 'object' && (
  Buffer.isBuffer(value.key) || ['pkcs1', 'pcks8', 'spki', 'public', 'private'].indexOf(value.type) !== -1
);

/**
 * Decorate the `Axios` instance
 */
class Decorator {
  /**
   * @property {AxiosInstance} client - The Axios instance.
   */
  static get client() { return this[CLIENT]; }

  static set client(instance) { this[CLIENT] = instance; }

  /**
   * @property {buffer|object} privateKey - Buffer of the merchant private key.
   */
  static get privateKey() { return this[PRIVATE_KEY]; }

  static set privateKey(thing) { this[PRIVATE_KEY] = isKeyObjectLike(thing) ? thing : Buffer.from(thing); }

  /**
   * @property {buffer|object} publicKey - Buffer of the alipay public key.
   */
  static get publicKey() { return this[PUBLIC_KEY]; }

  static set publicKey(thing) { this[PUBLIC_KEY] = isKeyObjectLike(thing) ? thing : Buffer.from(thing); }

  /**
   * @property {function} requestInterceptor - Named as `signer` function.
   */
  static get requestInterceptor() {
    const { privateKey } = this;

    /**
     * Convert the inputs and then sign.
     *
     * @param {object} config - The AxiosConfig
     *
     * @returns {object} The AxiosConfig
     */
    return function signer(config = {}) {
      config.params.timestamp = config.params.timestamp || Formatter.localeDateTime();

      const TEMP = new URLSearchParams(config.params);
      TEMP.append(BIZ_CONTENT, Buffer.isBuffer(config.data) ? '' : JSON.stringify(config.data || {}));

      const data = new URLSearchParams();
      data.append(BIZ_CONTENT, TEMP.get(BIZ_CONTENT));
      data.append(SIGN, Rsa.sign(
        Formatter.queryStringLike(Formatter.ksort(TEMP)), privateKey,
      ));

      if (Buffer.isBuffer(config.data)) {
        config.params[SIGN] = data.get(SIGN);
      } else {
        config.data = data;
      }

      return config;
    };
  }

  /**
   * @property {function} responseVerifier - Named as `verifier` function.
   */
  static get responseVerifier() {
    const { publicKey } = this;

    /**
     * Parse the outputs JSONLike text, and stored the parsing info onto headers with `x-alipay-*`.
     *
     * @param {string} data - The response
     * @param {object} headers - The response
     *
     * @returns {string} The json content
     */
    return function verifier(data, headers) {
      const { ident, payload, sign } = Formatter.fromJsonLike(data);

      headers['x-alipay-responder'] = (ident || '').replace(/_/g, '.');
      headers['x-alipay-signature'] = sign;

      if (sign && Rsa.verify(payload, sign, publicKey)) {
        headers['x-alipay-verified'] = 'ok';
      }
      if (ident || payload || sign) {
        return payload;
      }

      return data;
    };
  }

  /**
   * @property {object} defaults - The defaults configuration whose pased in `Axios`.
   */
  static get defaults() {
    const { platform, arch, versions: { node: nodeVersion } } = process || { versions: {} };

    return {
      method: 'post',
      baseURL: 'https://openapi.alipay.com/gateway.do',
      headers: {
        'User-Agent': `WhatsAlipay/${pkg.version} Node/${nodeVersion} ${platform}/${arch}`,
      },
      params: {
        format: 'JSON',
        charset: 'UTF-8',
        [SIGN_TYPE]: 'RSA2',
        version: '1.0',
      },
      // always make shallow copies of the `transformRequest` and `transformResponse`
      transformRequest: axios.defaults.transformRequest.slice(),
      transformResponse: axios.defaults.transformResponse.slice(),
    };
  }

  /**
   * Portable of the `axios.request` with defaults {method, params, headers}
   * compatible since Axios >= 0.19.0
   *
   * - Typeof `function` of `config.headers` is available since v0.0.9
   *
   * @param {object} config - The configuration.
   * @param {object|buffer|undefined} config.data - The post data
   * @param {object|undefined} config.params - The search parameters
   * @param {object|function|undefined} config.headers - The request's headers object or a callback `function` for `sign-only` requests
   *
   * @returns {PromiseLike} - The `AxiosPromise` instance.
   */
  static request({ data, params, headers }) {
    const { method, params: defaultParams, headers: defaultHeaders } = this.client.defaults;

    params = { ...defaultParams, ...params };

    if (typeof headers === 'function') {
      const { baseURL } = this.client.defaults;

      /* eslint-disable-next-line */
      return Promise.resolve(
        headers(
          this.requestInterceptor({
            baseURL, method, data, params,
          }),
        ),
      );
    }

    headers = { ...defaultHeaders, ...headers };

    return this.client.request({
      method, data, params, headers,
    });
  }

  /**
   * Deep merge the input with the defaults
   *
   * @param {object} config - The configuration.
   *
   * @returns {object} - With the built-in configuration.
   */
  static withDefaults(config = {}) {
    const defaults = { ...this.defaults };

    config.headers = { ...defaults.headers, ...config.headers };
    config.params = { ...defaults.params, ...config.params };
    config = { ...defaults, ...config };

    return config;
  }

  /**
   * Decorate factory
   * @param {object} config - The configuration.
   * @param {string|buffer} config.privateKey - The merchant's RSA privateKey.
   * @param {string|Buffer} config.publicKey - The platform's RSA publicKey.
   * @param {string|Buffer} [config.publicCert] - The platform's RSA publicKey or certificate(deprected since v0.1.3).
   * @param {object} [config.params] - The general parameters.
   * @param {string|number} [config.params.app_id] - The merchant's application id.
   * @param {string} [config.params.app_auth_token] - The merchant's authorization token.
   * @param {string} [config.params.app_cert_sn] - The merchant's RSA's certificate SN.
   * @param {string} [config.params.alipay_root_cert_sn] - The alipay's RSA's certificate SN.
   * @constructor
   */
  constructor(config = {}) {
    const that = this.constructor;

    const { privateKey, publicKey, publicCert } = config;
    Reflect.deleteProperty(config, 'privateKey');
    Reflect.deleteProperty(config, 'publicKey');
    Reflect.deleteProperty(config, 'publicCert');
    that.privateKey = privateKey;
    that.publicKey = publicKey || publicCert;

    const instance = axios.create(that.withDefaults(config));

    instance.interceptors.request.use(that.requestInterceptor);
    instance.defaults.transformResponse.unshift(that.responseVerifier);

    that.client = instance;

    return this;
  }
}

module.exports = Decorator;
module.exports.default = Decorator;
