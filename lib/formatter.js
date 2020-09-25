/**
 * Provides easy used methods using in this project.
 */
class Formatter {
  /**
   * Sorts an Object by key.
   *
   * @param {object} thing - The input object.
   *
   * @returns {object} - The sorted object.
   */
  static ksort(thing) {
    return Object.keys(thing).sort().reduce((des, key) => (des[key] = thing[key], des), {})
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
      .filter(([k, v]) => k != `sign` && v !== void 0 && v !== ``)
      .map(i => i.join(`=`)).join(`&`)
  }

  /**
   * Retrieve the current `yyyy-MM-dd HH:mm:ss` date time based on given `timeZone`.
   *
   * @param {string|number|Date} [when] - Any avaliable inputs refer to the `Date() constructor`, default `Date.now()`.
   * @param {string} [timeZone] - Any avaliable inputs refer to the options in `Intl.DateTimeFormat`, default `Asia/Shanghai`.
   *
   * @returns {string} - `yyyy-MM-dd HH:mm:ss` date time string
   */
  static localeDateTime(when = Date.now(), timeZone = 'Asia/Shanghai') {
    return new Intl.DateTimeFormat(
      'en-GB',
      {
        dateStyle:'short',
        timeStyle:'medium',
        timeZone,
      }
    ).format(
      new Date(when)
    ).replace(
      /^(?<dd>\d{2})\/(?<MM>\d{2})\/(?<yyyy>\d{4}),\s(?<HH>\d{2}):(?<mm>\d{2}):(?<ss>\d{2})$/,
      '$<yyyy>-$<MM>-$<dd> $<HH>:$<mm>:$<ss>'
    )
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
    const maybe = `(?:[\\r|\\n|\\s|\\t]*)`
    const pattern = new RegExp(
      `^${maybe}\\{${maybe}"${placeholder}"${maybe}:${maybe}"?(?<payload>.*?)"?${maybe}` +
      `(?:,)?${maybe}(?:"sign"${maybe}:${maybe}"(?<sign>[^"]+)"${maybe})?\\}${maybe}$`,
      'm'
    )
    const {groups: {ident, payload, sign}} = (source || '').match(pattern) || {groups: {}}

    return {ident, payload, sign}
  }

  /**
   * Check the given `numeric` input whether or nor the leap year.
   *
   * @param {number} numeric - The inputs number.
   *
   * @returns {boolean} - `True` means is leap year, otherwise NOT.
   */
  static isLeapYear(numeric) {
    return (numeric % 4 == 0 && (numeric % 100 != 0 || numeric % 400 == 0))
  }

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
}

module.exports = Formatter
module.exports.default = Formatter
