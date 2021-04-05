const { extname } = require('path');
/**
 * Simple and lite of `multipart/form-data` implementation, most similar to `form-data`
 *
 * ```js
 * (new Form)
 *   .append('a', 1)
 *   .append('b', '2')
 *   .append('c', Buffer.from('31'))
 *   .append('d', JSON.stringify({}), 'any.json')
 *   .append('e', require('fs').readFileSync('/path/your/file.jpg'), 'file.jpg')
 *   .getBuffer()
 * ```
 */
class Form {
  /**
   * Create a `multipart/form-data` buffer container for the file uploading.
   *
   * @constructor
   */
  constructor() {
    Object.defineProperties(this, {
      /**
       * built-in mime-type mapping
       * @type {Object<string,string>}
       */
      mimeTypes: {
        value: {
          bmp: 'image/bmp',
          gif: 'image/gif',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpe: 'image/jpeg',
          jpeg: 'image/jpeg',
          mp4: 'video/mp4',
          mpeg: 'video/mpeg',
          json: 'application/json',
        },
        configurable: false,
        enumerable: false,
        writable: true,
      },

      /**
       * @type {Buffer}
       */
      dashDash: {
        value: Buffer.from('--'),
        configurable: false,
        enumerable: false,
        writable: false,
      },

      /**
       * @type {Buffer}
       */
      boundary: {
        /* eslint-disable-next-line no-bitwise */
        value: Buffer.from(`${'-'.repeat(26)}${'0'.repeat(24).replace(/0/g, () => Math.random() * 10 | 0)}`),
        configurable: false,
        enumerable: false,
        writable: false,
      },

      /**
       * @type {Buffer}
       */
      CRLF: {
        value: Buffer.from('\r\n'),
        configurable: false,
        enumerable: false,
        writable: false,
      },

      /**
       * The Form's data storage
       * @type {array<Buffer>}
       */
      data: {
        value: [],
        configurable: false,
        enumerable: true,
        writable: true,
      },

      /**
       * The entities' value indices whose were in `this.data`
       * @type {Object<string, number>}
       */
      indices: {
        value: {},
        configurable: false,
        enumerable: true,
        writable: true,
      },
    });
  }

  /**
   * To retrieve the `data` buffer
   *
   * @return {Buffer} - The payload buffer
   */
  getBuffer() {
    return Buffer.concat([
      this.dashDash, this.boundary, this.CRLF,
      ...this.data.slice(0, -2),
      this.boundary, this.dashDash, this.CRLF,
    ]);
  }

  /**
   * To retrieve the `Content-Type` multipart/form-data header
   *
   * @return {Object<string, string>} - The `Content-Type` header With `this.boundary`
   */
  getHeaders() {
    return {
      'Content-Type': `multipart/form-data; boundary=${this.boundary}`,
    };
  }

  /**
   * Append a customized mime-type(s)
   *
   * @param {Object<string,string>} things - The mime-type
   *
   * @return {Form} - The `Form` class instance self
   */
  appendMimeTypes(things) {
    Object.assign(this.mimeTypes, things);

    return this;
  }

  /**
   * Append data wrapped by `boundary`
   *
   * @param  {string} field - The field
   * @param  {string|Buffer} value - The value
   * @param  {String} [filename] - Optional filename, when provided, then append the `Content-Type` after of the `Content-Disposition`
   *
   * @return {Form} - The `Form` class instance self
   */
  append(field, value, filename = '') {
    const {
      data, dashDash, boundary, CRLF, mimeTypes, indices,
    } = this;

    data.push(Buffer.from(`Content-Disposition: form-data; name="${field}"${filename && Buffer.isBuffer(value) ? `; filename="${filename}"` : ''}`));
    data.push(CRLF);
    if (filename || Buffer.isBuffer(value)) {
      data.push(Buffer.from(`Content-Type: ${mimeTypes[extname(filename).substring(1).toLowerCase()] || 'application/octet-stream'}`));
      data.push(CRLF);
    }
    data.push(CRLF);
    indices[field] = data.push(Buffer.isBuffer(value) ? value : Buffer.from(String(value)));
    data.push(CRLF);
    data.push(dashDash);
    data.push(boundary);
    data.push(CRLF);

    return this;
  }
}

module.exports = Form;
module.exports.default = Form;
