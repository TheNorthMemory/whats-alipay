const { extname } = require('path');
const { Readable } = require('stream');
const { ReadStream } = require('fs');

const { iterator, toStringTag } = Symbol;

/**
 * Simple and lite of `multipart/form-data` implementation, most similar to `form-data`
 *
 * @since v0.1.4
 * @example
 * // buffer style(Synchronous)
 * (new Multipart())
 *   .append('a', 1)
 *   .append('b', '2')
 *   .append('c', Buffer.from('31'))
 *   .append('d', JSON.stringify({}), 'any.json')
 *   .append('e', require('fs').readFileSync('/path/your/file.jpg'), 'file.jpg')
 *   .getBuffer();
 * // stream style(Asynchronous)
 * (new Multipart())
 *   .append('f', require('fs').createReadStream('/path/your/file2.jpg'), 'file2.jpg')
 *   .pipe(require('fs').createWriteStream('./file3.jpg'));
 */
class Multipart extends Readable {
  /**
   * Create a `multipart/form-data` buffer container for the media(image/video) file uploading.
   *
   * @constructor
   */
  constructor() {
    super({ highWaterMark: 64 * 1024 });
    Object.defineProperties(this, {
      /**
       * @protected
       * @memberof Multipart#
       * @prop {object<string,string>} mimeTypes - Built-in mime-type mapping
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
       * @readonly
       * @memberof Multipart#
       * @prop {buffer} dashDash - Double `dash` buffer
       */
      dashDash: {
        value: Buffer.from('--'),
        configurable: false,
        enumerable: false,
        writable: false,
      },

      /**
       * @readonly
       * @memberof Multipart#
       * @prop {buffer} boundary - The boundary buffer.
       */
      boundary: {
        /* eslint-disable-next-line no-bitwise */
        value: Buffer.from(`${'0'.repeat(24).replace(/0/g, () => Math.random() * 10 | 0).padStart(50, '-')}`),
        configurable: false,
        enumerable: false,
        writable: false,
      },

      /**
       * @readonly
       * @memberof Multipart#
       * @prop {buffer} EMPTY - An empty buffer
       */
      EMPTY: {
        value: Buffer.from([]),
        configurable: false,
        enumerable: false,
        writable: false,
      },

      /**
       * @readonly
       * @memberof Multipart#
       * @prop {buffer} CRLF - Double `dash` buffer
       */
      CRLF: {
        value: Buffer.from('\r\n'),
        configurable: false,
        enumerable: false,
        writable: false,
      },

      /**
       * @protected
       * @memberof Multipart#
       * @prop {Array<Buffer|ReadStream>} data - The Multipart's instance data storage
       */
      data: {
        value: [],
        configurable: false,
        enumerable: true,
        writable: true,
      },

      /**
       * @typedef IndexTuple
       * @memberof Multipart#
       * @type {array} - two element array
       * @property {0} - string|undefined
       * @property {1} - number
       * @protected
       */
      /**
       * @protected
       * @memberof Multipart#
       * @prop {Array<IndexTuple<string|undefined, number>>} indices - The entities' value indices whose were in {@link Multipart#data}
       */
      indices: {
        value: [],
        configurable: false,
        enumerable: true,
        writable: true,
      },
    });
  }

  /**
   * To retrieve the {@link Miltipart#data} buffer
   *
   * @returns {Buffer} - The payload buffer
   */
  getBuffer() {
    return Buffer.concat(this.data);
  }

  /**
   * To retrieve the `Content-Type` multipart/form-data header
   *
   * @returns {object<string, string>} - The `Content-Type` header With {@link Multipart#boundary}
   */
  getHeaders() {
    return {
      'Content-Type': `multipart/form-data; boundary=${this.boundary}`,
    };
  }

  /**
   * Append a customized {@link Multipart#mimeType}
   *
   * @example
   * .appendMimeTypes({p12: 'application/x-pkcs12'})
   * .appendMimeTypes({txt: 'text/plain'})
   *
   * @param {object<string,string>} things - The mime-type
   *
   * @returns {this} - The `Multipart` class instance self
   */
  appendMimeTypes(things) {
    Object.assign(this.mimeTypes, things);

    return this;
  }

  /**
   * Append data wrapped by {@link Multipart#boundary}
   *
   * @param {string} name - The field name
   * @param {string|Buffer|ReadStream} value - The value
   * @param {string} [filename] - Optional filename, when provided, then append the `Content-Type` after of the `Content-Disposition`
   *
   * @returns {this} - The `Multipart` class instance self
   */
  append(name, value, filename = '') {
    const {
      data, dashDash, boundary, CRLF, indices,
    } = this;

    data.splice(...(data.length ? [-2, 1] : [0, 0, dashDash, boundary, CRLF]));
    indices.push([name, data.push(...this.formed(name, value, filename)) - 1]);
    data.push(CRLF, dashDash, boundary, dashDash, CRLF);

    return this;
  }

  /**
   * Formed a named value, a filename reported to the server, when a Buffer or FileStream is passed as the second parameter.
   *
   * @param {string} name - The field name
   * @param {string|Buffer|ReadStream} value - The value
   * @param {string} [filename] - Optional filename, when provided, then append the `Content-Type` after of the `Content-Disposition`
   *
   * @returns {Array<Buffer|ReadStream>} - The part of data
   */
  formed(name, value, filename = '') {
    const { mimeTypes, CRLF, EMPTY } = this;
    const isBufferOrStream = Buffer.isBuffer(value) || (value instanceof ReadStream);
    return [
      Buffer.from(`Content-Disposition: form-data; name="${name}"${filename && isBufferOrStream ? `; filename="${filename}"` : ''}`),
      CRLF,
      ...(
        filename || isBufferOrStream
          ? [Buffer.from(`Content-Type: ${mimeTypes[extname(filename).substring(1).toLowerCase()] || 'application/octet-stream'}`), CRLF]
          : [EMPTY, EMPTY]
      ),
      CRLF,
      isBufferOrStream ? value : Buffer.from(String(value)),
    ];
  }

  /**
   * Sets a new value for an existing key inside a {@link Multipart#data} instance, or adds the key/value if it does not already exist.
   *
   * @param {string} name - The field name
   * @param {string|Buffer|ReadStream} value - The value
   * @param {string} [filename] - Optional filename, when provided, then append the `Content-Type` after of the `Content-Disposition`
   *
   * @returns {this} - The Multipart instance
   */
  set(name, value, filename = '') {
    if (this.has(name)) {
      this.indices.filter(([field]) => field === name).forEach(([field, index]) => {
        this.data.splice(index - 5, 6, ...this.formed(field, value, filename));
      });
    } else {
      this.append(name, value, filename);
    }

    return this;
  }

  /**
   * Deletes a key and its value(s) from a {@link Multipart#data} instance
   *
   * @param {string} name - The field name
   *
   * @returns {this} - The Multipart instance
   */
  delete(name) {
    this.indices = Object.values(this.indices.filter(([field]) => field === name).reduceRight((mapper, [, index]) => {
      this.data.splice(index - 8, 10);
      Reflect.deleteProperty(mapper, `${index}`);
      Object.entries(mapper).filter(([fixed]) => +fixed > index).forEach(([fixed, [field, idx]]) => {
        Reflect.set(mapper, `${fixed}`, [field, idx - 10]);
      });
      return mapper;
    }, this.indices.reduce((des, [field, value]) => {
      Reflect.set(des, value, [field, value]);
      return des;
    }, {})));

    if (!this.indices.length) {
      this.data.splice(0, this.data.length);
    }

    return this;
  }

  /**
   * Returns the first value associated with a given key from within a {@link Multipart#data} instance
   *
   * @param {string} name - The field name
   *
   * @return {Buffer|ReadStream|undefined} value - The value, undefined means none named key exists
   */
  get(name) { return this.data[(this.indices[this.indices.findIndex(([field]) => field === name)] || [])[1]]; }

  /**
   * Returns all values associated with a given key from within a {@link Multipart#data} instance
   *
   * @param {string} name - The field name
   *
   * @return {Array<Buffer|ReadStream>} value(s) - The value(s)
   */
  getAll(name) { return this.indices.filter(([field]) => field === name).map(([, index]) => this.data[index]); }

  /**
   * Returns a boolean stating whether a {@link Multipart#data} instance contains a certain key.
   *
   * @param {string} name - The field name
   *
   * @return {boolean} - True for contains
   */
  has(name) { return this.indices.findIndex(([field]) => field === name) !== -1; }

  /**
   * @typedef EntryTuple
   * @memberof Multipart#
   * @type {array} - two element array
   * @property {0} - string|undefined
   * @property {1} - Buffer|ReadStream
   * @protected
   */
  /**
   * To go through all key/value pairs contained in this {@link Multipart#data} instance
   *
   * @return {Iterator<Array<EntryTuple<string|undefined, Buffer|ReadStream>>>} - An Array Iterator key/value pairs.
   */
  entries() { return this.indices.map(([name, index]) => [name, this.data[index]])[iterator](); }

  /**
   * To go through all keys contained in {@link Multipart#data} instance
   *
   * @return {Iterator<string|undefined>} - An Array Iterator key pairs.
   */
  keys() { return this.indices.map(([name]) => name)[iterator](); }

  /**
   * To go through all values contained in {@link Multipart#data} instance
   *
   * @return {Iterator<Buffer|ReadStream>} - An Array Iterator value pairs.
   */
  values() { return this.indices.map(([, index]) => this.data[index])[iterator](); }

  /**
   * alias of {@link Multipart#entries}
   * @return {Iterator<Array<EntryTuple<string|undefined, Buffer|ReadStream>>>} - An Array Iterator key/value pairs.
   */
  [iterator]() { return this.entries(); }

  /**
   * @returns {string} - FormData string
   */
  static get [toStringTag]() { return 'FormData'; }

  /**
   * @returns {string} - FormData string
   */
  get [toStringTag]() { return this.constructor[toStringTag]; }

  /**
   * @returns {string} - FormData string
   */
  toString() { return `[object ${this[toStringTag]}]`; }

  /* eslint-disable-next-line class-methods-use-this, no-underscore-dangle */
  _read() {}

  /**
   * Pushing {@link Multipart#data} into the readable BufferList
   *
   * @returns {Promise<this>} - The Multipart instance
   */
  async flowing() {
    /* eslint-disable-next-line no-restricted-syntax */
    for (const value of this.data) {
      if (value instanceof ReadStream) {
        /* eslint-disable-next-line no-await-in-loop, no-restricted-syntax */
        for await (const chunk of value) {
          this.push(chunk);
        }
      } else {
        this.push(value);
      }
    }
    this.push(null);

    return this;
  }

  /**
   * Attaches a Writable stream to the {@link Multipart} instance
   *
   * @param  {stream.Writable} destination - The destination for writing data
   * @param {object} [options] - Pipe options
   * @param {boolean} [options.end = true] - End the writer when the reader ends. Default: true.
   * @returns {stream.Writable} - The destination, allowing for a chain of pipes
   */
  pipe(destination, options = { end: true }) {
    super.pipe(destination, options);
    this.flowing();
    return destination;
  }
}

module.exports = Multipart;
module.exports.default = Multipart;
