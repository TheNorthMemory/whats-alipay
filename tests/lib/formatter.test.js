const should = require('should');

const Formatter = require('../../lib/formatter');

describe('lib/formatter', () => {
  it('should be class Formatter', () => {
    should(() => new Formatter()).throw(Error, {
      name: 'FormatterError',
    });
    Formatter.should.be.a.Function().and.have.property('name', 'Formatter');
  });

  describe('Formatter.ksort', () => {
    it('method `ksort` should be a static function', () => {
      Formatter.ksort.should.be.a.Function();
    });

    it('method `ksort({b: 2, aa: 1, a: 0})` should returns an object and deepEqual to {a: 0, aa: 1, b: 2}', () => {
      Formatter.ksort({ b: 2, aa: 1, a: 0 }).should.be.an.instanceOf(Object).and.have.properties(['a', 'aa', 'b']);
      Formatter.ksort({ b: 2, aa: 1, a: 0 }).should.deepEqual({ a: 0, aa: 1, b: 2 });
    });

    it('method `ksort(new URLSearchParams({b: \'2\', aa: \'1\', a: \'0\'}))`'
      + 'should returns an object and deepEqual to {a: \'0\', aa: \'1\', b: \'2\'}', () => {
      Formatter.ksort(new URLSearchParams({ b: '2', aa: '1', a: '0' })).should.be.an.instanceOf(Object).and.have.keys('a', 'aa', 'b');
      Formatter.ksort(new URLSearchParams({ b: '2', aa: '1', a: '0' })).should.deepEqual({ a: '0', aa: '1', b: '2' });
    });
  });

  describe('Formatter.queryStringLike', () => {
    it('method `queryStringLike` should be a static function', () => {
      Formatter.queryStringLike.should.be.a.Function();
    });

    it('method `queryStringLike({method: \'ali.pay\', format: \'JSON\', version: \'1.0\', biz_content: \'{}\', sign: 0})`'
      + ' should returns a string and equal to `method=ali.pay&format=JSON&version=1.0&biz_content={}`', () => {
      Formatter.queryStringLike({
        /* eslint camelcase:0 */
        method: 'ali.pay', format: 'JSON', version: '1.0', biz_content: '{}', sign: 0,
      }).should.be.a.String().and.equal(
        'method=ali.pay&format=JSON&version=1.0&biz_content={}',
      );
    });
  });

  describe('Formatter.localeDateTime', () => {
    it('method `localeDateTime` should be a static function', () => {
      Formatter.localeDateTime.should.be.a.Function();
    });

    it('method `localeDateTime()` should returns a string and with `yyyy-MM-dd HH:mm:ss` format', () => {
      Formatter.localeDateTime().should.be.a.String().and.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/);
    });

    it('method `localeDateTime(1600538598726)` should equal to a string `2020-09-20 02:03:18`', () => {
      Formatter.localeDateTime(1600538598726).should.be.a.String().and.equal('2020-09-20 02:03:18');
    });

    it('method `localeDateTime(\'January 1, 1970, 00:00:00 UTC\')` should equal to a string `1970-01-01 08:00:00`', () => {
      Formatter.localeDateTime('January 1, 1970, 00:00:00 UTC').should.be.a.String().and.equal('1970-01-01 08:00:00');
    });

    it('method `localeDateTime(\'Sat, 21 Sep 2020 04:00:00 GMT\')` should equal to a string `2020-09-21 12:00:00`', () => {
      Formatter.localeDateTime('Sat, 21 Sep 2020 04:00:00 GMT').should.be.a.String().and.equal('2020-09-21 12:00:00');
    });

    it('method `localeDateTime(\'Sat, 21 Sep 2020 16:00:00 GMT\')` should equal to a string `2020-09-22 00:00:00`', () => {
      Formatter.localeDateTime('Sat, 21 Sep 2020 16:00:00 GMT').should.be.a.String().and.equal('2020-09-22 00:00:00');
    });

    it('method `localeDateTime(\'Sat, 22 Sep 2020 13:14:58 GMT\')` should equal to a string `2020-09-22 21:14:58`', () => {
      Formatter.localeDateTime('Sat, 22 Sep 2020 13:14:58 GMT').should.be.a.String().and.equal('2020-09-22 21:14:58');
    });

    it('method `localeDateTime(\'2019-01-01\')` should equal to a string `2019-01-01 08:00:00`', () => {
      Formatter.localeDateTime('2019-01-01').should.be.a.String().and.equal('2019-01-01 08:00:00');
    });

    /** On Windows platform, there were a strange behavior while the datetime string is short, ignore for all
    it('method `localeDateTime(\'2020-11-11 00:00\')` should equal to a string `2020-11-11 00:00:00`', () => {
      Formatter.localeDateTime('2020-11-11 00:00').should.be.a.String().and.equal('2020-11-11 00:00:00')
    })

    it('method `localeDateTime(\'Aug 9, 1995\')` should equal to a string `1995-08-09 00:00:00`', () => {
      Formatter.localeDateTime('Aug 9, 1995').should.be.a.String().and.equal('1995-08-09 00:00:00')
    })

    it('method `localeDateTime(Date.UTC(2012, 11, 20, 3, 0, 0), \'America/Los_Angeles\')` should equal to a string `2012-12-19 19:00:00`', () => {
      Formatter.localeDateTime(Date.UTC(2012, 11, 20, 3, 0, 0), 'America/Los_Angeles').should.be.a.String().and.equal('2012-12-19 19:00:00')
    })
    */
  });

  describe('Formatter.fromJsonLike', () => {
    it('method `fromJsonLike` should be a static function', () => {
      Formatter.fromJsonLike.should.be.a.Function();
    });

    it('method `fromJsonLike()` should returns an Object and deepEqual to {ident: undefined, payload: undefined, sign: undefined}', () => {
      Formatter.fromJsonLike().should.deepEqual({ ident: undefined, payload: undefined, sign: undefined });
    });

    it('method `fromJsonLike(\'{"ali_pay_response":"https:\\/\\/alipay.com","sign":"MA=="}\')` '
      + 'should returns the payload whose keeping the JSON TEXT with escaped dash(/)', () => {
      Formatter.fromJsonLike('{"ali_pay_response":"https:\\/\\/alipay.com","sign":"MA=="}')
        .should.deepEqual({ ident: 'ali_pay', payload: 'https:\\/\\/alipay.com', sign: 'MA==' });
    });

    it('method `fromJsonLike(\'{"ali_pay_response"  :  "https:\\/\\/alipay.com"  ,  "sign":"MA=="}\')` '
      + 'should returns the payload whose keeping the JSON TEXT with escaped dash(/) and drop the extra-spaces', () => {
      Formatter.fromJsonLike('{"ali_pay_response"  :  "https:\\/\\/alipay.com"  ,  "sign":"MA=="}')
        .should.deepEqual({ ident: 'ali_pay', payload: 'https:\\/\\/alipay.com', sign: 'MA==' });
    });

    it('method `fromJsonLike(\'\n{\n  "ali_pay_response":  "https:\\/\\/alipay.com",\n  "sign"            :  "MA=="\n}\n\')` '
      + 'should returns the payload whose keeping the JSON TEXT with escaped dash(/) and drop the extra-spaces and CRLF lines', () => {
      Formatter.fromJsonLike('\n{\n  "ali_pay_response":  "https:\\/\\/alipay.com",\n  "sign"            :  "MA=="\n}\n')
        .should.deepEqual({ ident: 'ali_pay', payload: 'https:\\/\\/alipay.com', sign: 'MA==' });
    });

    it('method `fromJsonLike(\'{"error_response":"isv.permission=no"}\')` should deepEqual to {ident: \'error\', payload: \'isv.permission=no\', sign: undefined}', () => {
      Formatter.fromJsonLike('{"error_response":"isv.permission=no"}').should.deepEqual({ ident: 'error', payload: 'isv.permission=no', sign: undefined });
    });

    it('method `fromJsonLike(\'{"error_response":{"code":"40004","message":isv.permission=no"},}\')` '
      + 'should deepEqual to {ident: \'error\', payload: \'{"code":"40004","message":isv.permission=no"}\', sign: undefined}', () => {
      Formatter.fromJsonLike('{"error_response":{"code":"40004","message":isv.permission=no"},}')
        .should.deepEqual({ ident: 'error', payload: '{"code":"40004","message":isv.permission=no"}', sign: undefined });
    });
  });

  describe('Formatter.isLeapYear', () => {
    it('method `isLeapYear` should be a static function', () => {
      Formatter.isLeapYear.should.be.a.Function();
    });

    it('method `isLeapYear(2020)` should be `True`', () => {
      Formatter.isLeapYear(2020).should.be.True();
    });
  });

  describe('Formatter.page', () => {
    it('method `page` should be a static function', () => {
      Formatter.page.should.be.a.Function();
    });

    it('method `page()` without any arguments should returns an Object, and have keys{data, toJSON, toString}', () => {
      Formatter.page().should.be.an.Object().and.have.keys('data', 'toJSON', 'toString');
    });

    it('method `page().data` should be an Object and have keys `baseURL`, `method`, `params`, `body`, `html`', () => {
      const res = Formatter.page();
      res.data.should.be.an.Object().and.have.keys('baseURL', 'method', 'params', 'body', 'html');
      res.data.baseURL.should.be.a.String();
      res.data.method.should.be.a.String();
      res.data.params.should.be.an.Object();
      res.data.body.should.be.an.Object();
      res.data.html.should.be.a.String().and.match(/<form[^>]+>.*?<\/form>/).and.match(/<script>.*?<\/script>/);
    });

    it('method `page().toJSON` should be a Function and executed result equal to `page().data`', () => {
      const res = Formatter.page();
      res.toJSON.should.be.a.Function();
      res.toJSON().should.be.an.Object().and.deepEqual(res.data);
    });

    it('method `page().toString` should be a Function and executed result equal to `page().data.html`', () => {
      const res = Formatter.page();
      res.toString.should.be.a.Function();
      res.toString().should.be.a.String().and.deepEqual(res.data.html);
    });

    it('literal operation the method page() should deep equal to `page().data.html`', () => {
      const res = Formatter.page();
      should(`${res}`).be.deepEqual(res.data.html);
    });

    it('method `JSON.stringify(page())` should deep equal to `JSON.stringify(page().data)`', () => {
      const res = Formatter.page();
      res.toString.should.be.a.Function();
      should(JSON.stringify(res)).be.deepEqual(JSON.stringify(res.data));
    });
  });
});
