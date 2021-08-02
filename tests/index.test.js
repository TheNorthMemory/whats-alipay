const should = require('should');

const whats = require('..');

describe('index', () => {
  it('default should be Class Alipay', () => {
    should(whats).is.a.Function().and.have.property('name', 'Alipay');
    should(whats.default).is.a.Function().and.have.property('name', 'Alipay');
  });

  it('should have `Alipay` property and be a Class', () => {
    should(whats.Alipay).is.a.Function().and.have.property('name', 'Alipay');
  });

  it('should have `Rsa` property and be a Class', () => {
    should(whats.Rsa).is.a.Function().and.have.property('name', 'Rsa');
  });

  it('should have `Aes` property and be a Class', () => {
    should(whats.Aes).is.a.Function().and.have.property('name', 'Aes');
  });

  it('should have `AesCbc` property and be a Class', () => {
    should(whats.AesCbc).is.a.Function().and.have.property('name', 'AesCbc');
  });

  it('should have `Multipart` property and be a Class', () => {
    should(whats.Multipart).is.a.Function().and.have.property('name', 'Multipart');
  });

  it('should have `Form` property and be a Class', () => {
    should(whats.Form).is.a.Function().and.have.property('name', 'Multipart');
  });

  it('should have `Formatter` property and be a Class', () => {
    should(whats.Formatter).is.a.Function().and.have.property('name', 'Formatter');
  });

  it('should have `Decorator` property and be a Class', () => {
    should(whats.Decorator).is.a.Function().and.have.property('name', 'Decorator');
  });

  it('should have `Helpers` property and be a Class', () => {
    should(whats.Helpers).is.a.Function().and.have.property('name', 'Helpers');
  });
});
