/**
 * Provides easy used methods using in this project.
 */
class Formatter {
  /**
   * Sorts an Object by key.
   *
   * @param {object|URLSearchParams} thing - The input plain or URLSearchParams object.
   *
   * @returns {object} - The sorted object.
   */
  static ksort(thing) {
    if (thing instanceof URLSearchParams) {
      /* eslint-disable-next-line no-param-reassign, no-return-assign, no-sequences */
      thing = [...thing].reduce((des, [key, value]) => (des[key] = value, des), {});
    }

    /* eslint-disable-next-line no-param-reassign, no-return-assign, no-sequences */
    return Object.keys(thing).sort().reduce((des, key) => (des[key] = thing[key], des), {});
  }

  /**
   * Like `queryString` does but without the `sign` and `empty value` entities.
   *
   * @param {object} thing - The input object.
   *
   * @returns {string} - The sorted object.
   */
  static queryStringLike(thing) {
    return Object.entries(thing)
      .filter(([k, v]) => k !== 'sign' && v !== undefined && v !== '')
      .map((i) => i.join('=')).join('&');
  }

  /**
   * Retrieve the current `yyyy-MM-dd HH:mm:ss` date time based on given `timeZone`.
   *
   * Notes: NodeJS v10.15.3,v12.18.0,v14.5.0 had strange behavior on `Intl.DateTimeFormat`, see `hourCycle:h23` comments below:
   *
   * @param {string|number|Date} [when] - Any available inputs refer to the `Date() constructor`, default `Date.now()`.
   * @param {string} [timeZone] - Any available inputs refer to the options in `Intl.DateTimeFormat`, default `Asia/Shanghai`.
   *
   * @returns {string} - `yyyy-MM-dd HH:mm:ss` date time string
   */
  static localeDateTime(when = Date.now(), timeZone = 'Asia/Shanghai') {
    // short `when` like `Aug 9, 1995` is dependend on the `TZ` env
    process.env.TZ = timeZone;

    const data = new Intl.DateTimeFormat(
      'en',
      {
        calendar: 'gregory',
        hourCycle: 'h11',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        timeZone,
      },
    ).formatToParts(
      new Date(when),
    ).filter(({ type }) => type !== 'literal').reduce(
      /* eslint-disable-next-line no-param-reassign, no-return-assign, no-sequences */
      (des, { type, value }) => (des[type.toLowerCase()] = value.toUpperCase(), des),
      {},
    );

    // hourCycle:h23 fix(12 AM to 0, 12 PM to 0)
    data.hour = data.hour === '12' ? '0' : data.hour;

    if (data.dayperiod === 'PM') {
      // hourCycle:h23 add(1 PM to 13)
      data.hour = `${12 + data.hour * 1}`;
    } else if (data.dayperiod === 'AM') {
      // hourCycle:h23 fix(2-digit)
      data.hour = data.hour.padStart(2, 0);
    }

    return `${data.year}-${data.month}-${data.day} ${data.hour}:${data.minute}:${data.second}`;
  }

  /**
   * Parse the `source` with given `placeholder`.
   *
   * @param {string} source - The inputs string.
   * @param {string} [placeholder] - The payload pattern.
   *
   * @returns {object} - `{ident, payload, sign}` object
   */
  static fromJsonLike(source, placeholder = '(?<ident>[a-z](?:[a-z_])+)_response') {
    const maybe = '(?:[\\r|\\n|\\s|\\t]*)';
    const pattern = new RegExp(
      `^${maybe}\\{${maybe}"${placeholder}"${maybe}:${maybe}"?(?<payload>.*?)"?${maybe}`
      + `(?:,)?${maybe}(?:"sign"${maybe}:${maybe}"(?<sign>[^"]+)"${maybe})?\\}${maybe}$`,
      'm',
    );
    const { groups: { ident, payload, sign } } = (source || '').match(pattern) || { groups: {} };

    return { ident, payload, sign };
  }

  /**
   * Check the given `numeric` input whether or nor the leap year.
   *
   * @param {number} numeric - The inputs number.
   *
   * @returns {boolean} - `True` means is leap year, otherwise NOT.
   */
  static isLeapYear(numeric) {
    return (numeric % 4 === 0 && (numeric % 100 !== 0 || numeric % 400 === 0));
  }

  /**
   * Translate the inputs for the page service, such as `alipay.trade.page.pay`, `alipay.trade.wap.pay` OpenAPI methods.
   *
   * - Available since v0.0.9
   *
   * @param {object} options - The inputs
   * @param {string} options.baseURL - The OpenAPI gateway URL
   * @param {string} options.method - The HTTP method, should be `get` or `post`, default is `post`
   * @param {object} options.params - The gernal paramters object, including `method`, `version`, `charset`, `sign_type`, `format` etc.
   * @param {string} options.params.method - The OpenAPI's `method`, should be `alipay.trade.page.pay` etc.
   * @param {string} options.params.version - The OpenAPI's `version`, default is `1.0`
   * @param {string} options.params.charset - The OpenAPI's `charset`, default is `utf-8`
   * @param {string} options.params.format - The OpenAPI's `format`, default is `JSON`
   * @param {string} options.params.sign_type - The OpenAPI's `sign_type`, default is `RSA2`
   * @param {URLSearchParams} options.data - The `biz_content` and `sign` contents
   * @param {string} options.data.biz_content - The OpenAPI's `biz_content`, json string
   * @param {string} options.data.sign - The OpenAPI's `sign`, base64 encoded string dependent on the `options.params.sign_type`
   *
   * @return {object} - Minimal following the `AxiosResponse` specification, returns `{data, toJSON(), toString()}` object
   */
  static page({
    baseURL = '', method = 'post', params = {}, data = new URLSearchParams(),
  } = {}) {
    const { charset } = params;
    const name = `WhatsAlipayForm${+new Date()}`;
    /* eslint-disable-next-line no-param-reassign, no-return-assign, no-sequences */
    const body = [...data].reduce((des, [key, value]) => (des[key] = value, des), {});
    const safety = (str) => str.replace(/"/g, '&quot;');

    // While the `charset` wasn't onto the gateway's URL, there shall be a charset-compatible issue.
    // @link https://opensupport.alipay.com/support/helpcenter/192/201602472810
    if (baseURL && /^https?:\/\/\w+/i.test(baseURL)) {
      /* eslint-disable no-param-reassign */
      baseURL = new URL(baseURL);
      const searchParams = new URLSearchParams(baseURL.search);
      searchParams.set('charset', charset);
      baseURL.search = searchParams;
      baseURL = baseURL.toString();
      delete params.charset;
      /* eslint-enable no-param-reassign */
    }

    const html = [
      '<!DOCTYPE html>',
      '<html lang="zh-CN">',
      '<head>',
      '<title>...</title>',
      `<meta http-equiv="Content-Type" content="text/html; charset=${charset}"/>`,
      '</head>',
      '<body>',
      `<form id="${name}" name="${name}" method="${method}" action="${baseURL}">`,
      ...Object.entries(params).map(([key, value]) => `<input type="hidden" name="${safety(key)}" value="${safety(value)}"/>`),
      ...Object.entries(body).map(([key, value]) => `<input type="hidden" name="${safety(key)}" value="${safety(value)}"/>`),
      '</form>',
      `<script>function ${name}(){document.${name}.submit()}try{document.addEventListener('DOMContentLoaded',${name},false)}catch(e){${name}()}</script>`,
      `<noscript>Your browser doesn't support javascript, please click <button form="${name}" type="submit" accesskey="s">Submit</button> to continue.</noscript>`,
      '</body>',
      '</html>',
    ].join('');

    return {
      data: {
        baseURL, method, params, body, html,
      },
      toJSON() {
        return this.data;
      },
      toString() {
        return this.data.html;
      },
    };
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

module.exports = Formatter;
module.exports.default = Formatter;
