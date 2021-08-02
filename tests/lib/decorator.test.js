const should = require('should');
const Decorator = require('../../lib/decorator');

describe('lib/decorator', () => {
  it('should be class Decorator', () => {
    should(Decorator).be.a.Function().and.have.property('name', 'Decorator');
  });

  describe('Decorator.client Getter/Setter', () => {
    it('property `client` should be static', () => {
      Decorator.client = 'mock';
      Decorator.client.should.be.a.String().and.equal('mock');
    });
  });

  describe('Decorator.privateKey Getter/Setter', () => {
    it('property `privateKey` should be static', () => {
      Decorator.privateKey = 'mock';
      Decorator.privateKey.should.instanceof(Buffer);
    });
  });

  describe('Decorator.publicKey Getter/Setter', () => {
    it('property `publicKey` should be static', () => {
      Decorator.publicKey = 'mock';
      Decorator.publicKey.should.instanceof(Buffer);
    });
  });

  describe('Decorator.requestInterceptor Getter', () => {
    it('property `requestInterceptor` should returns a named `signer` function', () => {
      Decorator.requestInterceptor.should.be.a.Function().and.have.property('name', 'signer');
    });
  });

  describe('Decorator.responseVerifier Getter', () => {
    it('property `responseVerifier` should returns a named `verifier` function', () => {
      Decorator.responseVerifier.should.be.a.Function().and.have.property('name', 'verifier');
    });
  });

  describe('Decorator.defaults Getter', () => {
    it('property `defaults` should returns an Object and contains `baseURL` property as `https://openapi.alipay.com/gateway.do`', () => {
      Decorator.defaults.should.be.an.Object().and.have.property('baseURL', 'https://openapi.alipay.com/gateway.do');
    });
  });

  describe('Decorator.request', () => {
    it('method `request` should be a static function', () => {
      Decorator.request.should.be.a.Function();
    });

    it('called method `request` without arguments should thrown a `TypeError`', () => {
      should(() => {
        Decorator.request();
      }).throw(TypeError);
    });

    it('called method `request` should thrown a `TypeError` before `new Decorator`', () => {
      should(() => {
        Decorator.request({});
      }).throw(TypeError);
    });
  });

  describe('Decorator.withDefaults', () => {
    it('method `withDefaults({})` accept empty-plain-object and deepEqual to `Decorator.defaults`', () => {
      Decorator.withDefaults().should.be.an.Object().and.deepEqual(Decorator.defaults);
      Decorator.withDefaults({}).should.be.an.Object().and.deepEqual(Decorator.defaults);
    });

    it('method `withDefaults({method: \'get\'})` should not equal to `Decorator.defaults` and have `method` property to \'get\'', () => {
      should(Decorator.withDefaults({ method: 'get' })).have.property('method', 'get');
      Decorator.withDefaults({ method: 'get' }).should.be.an.Object().and.not.deepEqual(Decorator.defaults);
    });

    it('method `withDefaults({params: {image_type: \'jpg\'}})` should merged with the given `params`', () => {
      /* eslint-disable-next-line camelcase */
      const my = Decorator.withDefaults({ params: { image_type: 'jpg' } });

      my.params.should.have.properties(['format', 'charset', 'sign_type', 'version', 'image_type']);
      my.params.should.have.property('image_type', 'jpg');
    });
  });

  describe('new Decorator', () => {
    it('new Decorator operation without any arguments should thrown a `TypeError`', () => {
      should(() => new Decorator()).throw(TypeError);
    });

    const privateKey = '';
    const publicCert = '';
    it('new Decorator({privateKey, publicCert}) should returns an instance of `Decorator`', () => {
      new Decorator({
        privateKey,
        publicCert,
      }).should.instanceof(Decorator);
    });

    it('After new Decorator({privateKey, publicCert}), the `Decorator.client` should be instanceof `Axios`', () => {
      /* eslint-disable-next-line no-new */
      new Decorator({
        privateKey,
        publicCert,
      });
      Decorator.client.should.be.a.Function().and.have.property('name', 'wrap');
    });

    it('new Decorator({privateKey, publicCert, baseURL, method}) should accept customization `AxiosConfig` parameters, eg: `baseURL` and `method`', () => {
      const baseURL = 'http://customize-the-config-test-case';
      const method = 'get';
      /* eslint-disable-next-line no-new */
      new Decorator({
        privateKey,
        publicCert,
        baseURL,
        method,
      });
      should(Decorator.client.defaults.method).be.equal(method);
      should(Decorator.client.defaults.baseURL).be.equal(baseURL);
    });

    it('The `transformResponse` should never grown up even `new Decorator({privateKey, publicCert})` did more than once', () => {
      const baseLength = 2;
      for (let index = 0; index < 10; index += 1) {
        /* eslint-disable-next-line no-new */
        new Decorator({
          privateKey,
          publicCert,
        });
        should(Decorator.client.defaults.transformResponse.length).be.equal(baseLength);
        should(Decorator.client.defaults.transformResponse[0]).be.a.Function().and.have.property('name', 'verifier');
      }

      should(Decorator.client.defaults.transformResponse.length).be.equal(baseLength);
      should(Decorator.client.defaults.transformResponse[0]).be.a.Function().and.have.property('name', 'verifier');
    });
  });
});
