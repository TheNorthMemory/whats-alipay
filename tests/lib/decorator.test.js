const should = require('should')
const Decorator = require('../../lib/decorator')

describe('lib/decorator', () => {
  it('should be class Decorator', () => {
    should(Decorator).be.a.Function().and.have.property('name', 'Decorator')
  })

  describe('Decorator.client Getter/Setter', () => {
    it('property `client` should be static', () => {
      Decorator.client = `mock`
      Decorator.client.should.be.a.String().and.equal('mock')
    })
  })

  describe('Decorator.privateKey Getter/Setter', () => {
    it('property `privateKey` should be static', () => {
      Decorator.privateKey = `mock`
      Decorator.privateKey.should.instanceof(Buffer)
    })
  })

  describe('Decorator.publicCert Getter/Setter', () => {
    it('property `publicCert` should be static', () => {
      Decorator.publicCert = `mock`
      Decorator.publicCert.should.instanceof(Buffer)
    })
  })

  describe('Decorator.requestInterceptor Getter', () => {
    it('property `requestInterceptor` should returns a named `signer` function', () => {
      Decorator.requestInterceptor.should.be.a.Function().and.have.property('name', 'signer')
    })
  })

  describe('Decorator.responseVerifier Getter', () => {
    it('property `responseVerifier` should returns a named `verifier` function', () => {
      Decorator.responseVerifier.should.be.a.Function().and.have.property('name', 'verifier')
    })
  })

  describe('Decorator.defaults Getter', () => {
    it('property `defaults` should returns an Object and contains `baseURL` property as `https://openapi.alipay.com/gateway.do`', () => {
      Decorator.defaults.should.be.an.Object().and.have.property('baseURL', 'https://openapi.alipay.com/gateway.do')
    })
  })

  describe('Decorator.withDefaults', () => {
    it('method `withDefaults({})` accept empty-plain-object and deepEqual to `Decorator.defaults`', () => {
      Decorator.withDefaults().should.be.an.Object().and.deepEqual(Decorator.defaults)
      Decorator.withDefaults({}).should.be.an.Object().and.deepEqual(Decorator.defaults)
    })

    it('method `withDefaults({method: \'get\'})` should not equal to `Decorator.defaults` and have `method` property to \'get\'', () => {
      should(Decorator.withDefaults({method: 'get'})).have.property('method', 'get')
      Decorator.withDefaults({method: 'get'}).should.be.an.Object().and.not.deepEqual(Decorator.defaults)
    })

    it('method `withDefaults({params: {image_type: \'jpg\'}})` should merged with the given `params`', () => {
      /*eslint camelcase:0*/
      let my = Decorator.withDefaults({params: {image_type: 'jpg'}})

      my.params.should.have.properties(['format', 'charset', 'sign_type', 'version', 'image_type'])
      my.params.should.have.property('image_type', 'jpg')
    })
  })

  describe('new Decorator', () => {
    it('new Decorator operation without any arguments should thrown a `TypeError`', () => {
      should(() => {
        new Decorator
      }).throw(TypeError)
    })

    const privateKey = ''
    const publicCert = ''
    it('new Decorator({privateKey, publicCert}) should returns an instance of `Decorator`', () => {
      new Decorator({
        privateKey,
        publicCert,
      }).should.instanceof(Decorator)
    })

    it('After new Decorator({privateKey, publicCert}), the `Decorator.client` should be instanceof `Axios`', () => {
      new Decorator({
        privateKey,
        publicCert,
      })
      Decorator.client.should.be.a.Function().and.have.property('name', 'wrap')
    })

    it('new Decorator({privateKey, publicCert, baseURL, method}) should accept customization `AxiosConfig` parameters, eg: `baseURL` and `method`', () => {
      let baseURL = 'http://customize-the-config-test-case'
      let method = 'get'
      new Decorator({
        privateKey,
        publicCert,
        baseURL,
        method,
      })
      should(Decorator.client.defaults.method).be.equal(method)
      should(Decorator.client.defaults.baseURL).be.equal(baseURL)
    })
  })
})
