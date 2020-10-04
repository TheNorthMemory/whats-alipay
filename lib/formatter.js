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
   * Notes: NodeJS v10.15.3,v12.18.0,v14.5.0 had strange behavior on `Intl.DateTimeFormat`, see `hourCycle:h23` comments below:
   *
   * @param {string|number|Date} [when] - Any avaliable inputs refer to the `Date() constructor`, default `Date.now()`.
   * @param {string} [timeZone] - Any avaliable inputs refer to the options in `Intl.DateTimeFormat`, default `Asia/Shanghai`.
   *
   * @returns {string} - `yyyy-MM-dd HH:mm:ss` date time string
   */
  static localeDateTime(when = Date.now(), timeZone = 'Asia/Shanghai') {

    // short `when` like `Aug 9, 1995` is dependend on the `TZ` env
    process.env.TZ = timeZone

    let data = new Intl.DateTimeFormat(
      'en',
      {
        calendar: 'gregory', hourCycle: 'h11',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: 'numeric', minute: '2-digit', second: '2-digit',
        timeZone,
      }
    ).formatToParts(
      new Date(when)
    ).filter(({type}) => type != 'literal').reduce(
      (des, {type, value}) => (des[type.toLowerCase()] = value.toUpperCase(), des),
      {}
    )

    // hourCycle:h23 fix(12 AM to 0, 12 PM to 0)
    data.hour = data.hour == '12' ? `0` : data.hour

    if (data.dayperiod == 'PM') {
      // hourCycle:h23 add(1 PM to 13)
      data.hour = `${12 + data.hour * 1}`
    } else if (data.dayperiod == 'AM') {
      // hourCycle:h23 fix(2-digit)
      data.hour = data.hour.length > 1 ? data.hour : `0${data.hour}`
    }

    return `${data.year}-${data.month}-${data.day} ${data.hour}:${data.minute}:${data.second}`
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
