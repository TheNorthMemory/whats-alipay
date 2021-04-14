const should = require('should');
const Alipay = require('../../lib/alipay');

describe('lib/alipay', () => {
  it('should be class Alipay', () => {
    should(Alipay).be.a.Function().and.have.property('name', 'Alipay');
  });

  describe('Alipay.compose', () => {
    it('Alipay.compose() should returns an `anonymous` named Function while none-arguments or empty-arguments given', () => {
      Alipay.compose().should.instanceof(Function).and.have.property('name', '');
      Alipay.compose('').should.instanceof(Function).and.have.property('name', '');
      Alipay.compose('', '').should.instanceof(Function).and.have.property('name', '');
    });

    it('Alipay.compose(\'alipay\') should returns a Function which\'s named as `alipay.`', () => {
      Alipay.compose('alipay').should.instanceof(Function).and.have.property('name', 'alipay.');
    });

    it('Alipay.compose(\'\', \'trade\') should returns a Function which\'s named as `trade`', () => {
      Alipay.compose('', 'trade').should.instanceof(Function).and.have.property('name', 'trade');
    });

    it('Alipay.compose(\'alipay\', \'trade\') should returns a Function which\'s named as `alipay.trade`', () => {
      Alipay.compose('alipay', 'trade').should.instanceof(Function).and.have.property('name', 'alipay.trade');
    });

    it('Alipay.compose(\'alipay.trade\', \'query\') should returns a Function which\'s named as `alipay.trade.query`', () => {
      Alipay.compose('alipay.trade', 'query').should.instanceof(Function).and.have.property('name', 'alipay.trade.query');
    });
  });

  describe('Alipay.chain', () => {
    it('Alipay.chain(\'\') should returns an `anonymous` named Function while empty-arguments given', () => {
      Alipay.chain('').should.instanceof(Function).and.have.property('name', '');
    });

    it('Alipay.chain(\'alipay\') should returns a Function which\'s named as `alipay`', () => {
      Alipay.chain('alipay').should.instanceof(Function).and.have.property('name', 'alipay');
    });

    it('Alipay.chain(\'alipay.trade\') should returns a Function which\'s named as `alipay.trade`', () => {
      Alipay.chain('alipay.trade').should.instanceof(Function).and.have.property('name', 'alipay.trade');
    });

    it('Alipay.chain(\'alipay.trade.query\') should returns a Function which\'s named as `alipay.trade.query`', () => {
      Alipay.chain('alipay.trade.query').should.instanceof(Function).and.have.property('name', 'alipay.trade.query');
    });
  });

  describe('Alipay.handler', () => {
    it('Alipay.handler should returns an `Object`', () => {
      Alipay.handler.should.instanceof(Object);
    });

    it('Alipay.handler.get should returns a `Function`', () => {
      Alipay.handler.get.should.instanceof(Function);
    });
  });

  describe('new Alipay', () => {
    it('new Alipay without any arguments should thrown a `TypeError`', () => {
      should(() => new Alipay()).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    const privateKey = '';
    const publicCert = '';
    it('new Alipay({privateKey, publicCert}) should returns an `anonymous` named Function', () => {
      should(() => new Alipay({
        privateKey,
        publicCert,
      })).be.a.Function().and.have.property('name', '');
    });

    it('new Alipay({privateKey, publicCert}).alipay.trade.query should returns a Function which named as `alipay.trade.query`', () => {
      const whats = new Alipay({ privateKey, publicCert });
      whats.alipay.trade.query.should.be.a.Function();
      whats.alipay.trade.query.name.should.equal('alipay.trade.query');
    });
  });
});
