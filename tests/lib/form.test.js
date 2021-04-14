const should = require('should');

const Form = require('../../lib/form');

describe('lib/form', () => {
  it('should be class `Form`', () => {
    should(Form).be.a.Function().and.have.property('name', 'Form');
  });

  describe('new Form', () => {
    it('should instanceOf Form and have properties `data` and `indices`', () => {
      (new Form()).should.be.instanceOf(Form).and.have.properties('data', 'indices');
    });

    it('The `mimeTypes` property should be there and only allowed append(cannot deleted)', () => {
      should(Form.mimeTypes).be.Undefined();

      const form = new Form();

      form.mimeTypes.should.be.Object()
        .and.have.keys('bmp', 'gif', 'png', 'jpg', 'jpe', 'jpeg', 'mp4', 'mpeg', 'json');

      should(delete form.mimeTypes).be.False();

      form.mimeTypes = { any: 'mock' };
      form.mimeTypes.should.be.Object()
        .and.have.keys('any')
        .and.not.have.keys('bmp', 'json')
        .and.have.property('any', 'mock');
    });

    it('The `dashDash` Buffer property should be there and cannot be deleted/modified', () => {
      should(Form.dashDash).be.Undefined();

      const form = new Form();

      form.dashDash.should.not.Undefined().and.be.instanceOf(Buffer).and.have.length(2);

      should(delete form.dashDash).be.False();
      Buffer.compare(form.dashDash, Buffer.from('--')).should.be.equal(0);

      const buf = Buffer.alloc(2);

      form.dashDash = buf;
      Buffer.compare(form.dashDash, buf).should.be.equal(1);
    });

    it('The `boundary` Buffer property should be there and cannot be deleted/modified', () => {
      should(Form.boundary).be.Undefined();

      const form = new Form();

      form.boundary.should.not.Undefined()
        .and.be.instanceOf(Buffer)
        .and.have.length(50);

      should(delete form.boundary).be.False();

      const buf = Buffer.alloc(50);

      form.boundary = buf;
      Buffer.compare(form.boundary, buf).should.be.equal(1);
    });

    it('The `CRLF` Buffer property should be there and cannot be deleted/modified', () => {
      should(Form.CRLF).be.Undefined();

      const form = new Form();

      form.CRLF.should.not.Undefined()
        .and.be.instanceOf(Buffer)
        .and.have.length(2);

      should(delete form.CRLF).be.False();
      Buffer.compare(form.CRLF, Buffer.from('\r\n')).should.be.equal(0);

      const buf = Buffer.alloc(2);

      form.CRLF = buf;
      Buffer.compare(form.CRLF, buf).should.be.equal(1);
    });

    it('The `data` property should be instanceOf Array and cannot deleted', () => {
      should(Form.data).be.Undefined();

      const form = new Form();

      form.data.should.be.instanceOf(Array);
      should(delete form.data).be.False();
    });

    it('The `indices` property should be instanceOf Object and cannot deleted', () => {
      should(Form.indices).be.Undefined();

      const form = new Form();

      form.indices.should.be.instanceOf(Object);
      should(delete form.indices).be.False();
    });

    it('Method `getBuffer()` should returns a Buffer instance and had fixed length(108) default', () => {
      should(Form.getBuffer).be.Undefined();
      should(() => Form.getBuffer()).throw(TypeError);

      const form = new Form();

      form.getBuffer().should.be.instanceOf(Buffer).and.have.length(108);
    });

    it('Method `getHeaders()` should returns a Object[`Content-type`] with `multipart/form-data; boundary=`', () => {
      should(Form.getHeaders).be.Undefined();
      should(() => Form.getHeaders()).throw(TypeError);

      const form = new Form();

      form.getHeaders().should.be.Object()
        .and.have.keys('Content-Type');

      should(form.getHeaders()['Content-Type']).be.a.String()
        .and.match(/^multipart\/form-data; boundary=/);
    });

    it('Method `appendMimeTypes()` should returns the Form instance', () => {
      should(() => Form.appendMimeTypes()).throw(TypeError);

      const form = new Form();

      form.appendMimeTypes().should.be.instanceOf(Form);
    });

    it('Method `appendMimeTypes({any: \'mock\'})` should returns the Form instance, and affected `form.data` property', () => {
      should(() => Form.appendMimeTypes({ any: 'mock' })).throw(TypeError);

      const form = new Form();

      form.appendMimeTypes({ any: 'mock' }).should.be.instanceOf(Form);
      form.mimeTypes.should.be.instanceOf(Object)
        .and.have.keys('bmp', 'gif', 'png', 'jpg', 'jpe', 'jpeg', 'mp4', 'mpeg', 'json', 'any')
        .and.have.property('any', 'mock');
    });

    it('Method `append()` should returns the Form instance, and affected `form.data` property', () => {
      should(() => Form.append()).throw(TypeError);

      const form = new Form();
      const defaults = form.data.slice();

      form.append().should.be.instanceOf(Form);
      const previous = form.data.slice();

      form.append();
      const current = form.data.slice();

      defaults.should.be.Array().and.have.length(0);
      previous.should.be.Array().and.have.length(8);
      current.should.be.Array().and.have.length(16);
    });

    it('Method `append()` should append name="undefined" disposition onto the `form.data` property', () => {
      should(() => Form.append()).throw(TypeError);

      const form = new Form();

      form.append().should.be.instanceOf(Form);
      should(Buffer.concat(form.data).toString()).be.String()
        .and.match(/^Content-Disposition.*/)
        .and.match(/name="undefined"/)
        .and.match(/.*\r\n$/);

      should(form.getBuffer().toString()).be.String()
        .and.match(/^--.*/)
        .and.match(/name="undefined"/)
        .and.match(/.*--\r\n$/);
    });

    it('Method `append({}, 1)` should append name="[object Object]" disposition onto the `form.data` property', () => {
      should(() => Form.append()).throw(TypeError);

      const form = new Form();

      form.append({}, 1).should.be.instanceOf(Form);
      should(Buffer.concat(form.data).toString()).be.String()
        .and.match(/^Content-Disposition.*/)
        .and.match(/name="\[object Object\]"/)
        .and.match(/.*\r\n$/);

      should(form.getBuffer().toString()).be.String()
        .and.match(/^--.*/)
        .and.match(/name="\[object Object\]"/)
        .and.match(/.*--\r\n$/);
    });

    it('Method `append(\'meta\', JSON.stringify({}), \'meta.json\')` should append a `Content-Type: application/json` onto the `form.data` property', () => {
      should(() => Form.append()).throw(TypeError);

      const form = new Form();

      form.append('meta', JSON.stringify({}), 'meta.json').should.be.instanceOf(Form);
      should(Buffer.concat(form.data).toString()).be.String()
        .and.match(/^Content-Disposition.*/)
        .and.match(/name="meta"/)
        .and.match(/Content-Type: application\/json/)
        .and.match(/.*\r\n$/);

      should(form.getBuffer().toString()).be.String()
        .and.match(/^--.*/)
        .and.match(/name="meta"/)
        .and.match(/Content-Type: application\/json/)
        .and.match(/.*--\r\n$/);
    });

    it('Method `append(\'image_content\', '
      + 'Buffer.from(\'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==\', \'base64\'), \'demo.gif\')`'
      + ' should append a `Content-Type: image/gif` onto the `form.data` property', () => {
      const form = new Form();
      const buf = Buffer.from('R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', 'base64');
      const filename = 'demo.gif';

      form.append('image_content', buf, filename).should.be.instanceOf(Form);

      should(Buffer.concat(form.data).toString()).be.String()
        .and.match(new RegExp(`^Content-Disposition:.*?filename="${filename}`))
        .and.match(/name="image_content"/)
        .and.match(/Content-Type: image\/gif/)
        .and.match(/.*\r\n$/);

      should(form.getBuffer().toString()).be.String()
        .and.match(/^--.*/)
        .and.match(/name="image_content"/)
        .and.match(/Content-Type: image\/gif/)
        .and.match(/.*--\r\n$/);

      should(Buffer.compare(form.data[form.indices.image_content - 1], buf)).be.equal(0);
    });
  });
});
