const { readFileSync } = require('fs');
const { join } = require('path');

const should = require('should');

const Helpers = require('../../lib/helpers');

describe('lib/helpers', () => {
  const appCert = {};
  beforeEach(() => {
    appCert.sha1Path = join(__dirname, '../fixtures/mock-app-sha1-cert.pem');
    appCert.sha256Path = join(__dirname, '../fixtures/mock-app-sha256-cert.pem');
    appCert.sha1Buffer = readFileSync(appCert.sha1Path);
    appCert.sha256Buffer = readFileSync(appCert.sha256Path);
  });

  it('should be class `Helpers` and only allowed static usage', () => {
    should(() => new Helpers()).throw(Error, {
      name: 'HelpersError',
    });
    Helpers.should.be.a.Function().and.have.property('name', 'Helpers');
  });

  describe('Helpers.LF', () => {
    it('property `LF` should be static and have a fixed value line feed(\\n) char', () => {
      Helpers.LF.should.be.String().and.equal('\n');
    });
  });

  describe('Helpers.md5', () => {
    it('method `md5` should be static function', () => {
      Helpers.md5.should.be.a.Function();
    });

    it('method `md5()` should returns `d41d8cd98f00b204e9800998ecf8427e`', () => {
      Helpers.md5().should.be.String().and.equal('d41d8cd98f00b204e9800998ecf8427e');
    });

    it('method `md5(\'\')` should returns `d41d8cd98f00b204e9800998ecf8427e`', () => {
      Helpers.md5('').should.be.String().and.equal('d41d8cd98f00b204e9800998ecf8427e');
    });

    it('method `md5(\'\', \'\')` should returns `d41d8cd98f00b204e9800998ecf8427e`', () => {
      Helpers.md5('', '').should.be.String().and.equal('d41d8cd98f00b204e9800998ecf8427e');
    });

    it('method `md5(Buffer.from(\'ali\'), \'pay\')` should equal to `md5(\'alipay\')` and equal to `fa42b816950b79e3c969c637657845ad`', () => {
      Helpers.md5(Buffer.from('ali'), 'pay').should.be.String()
        .and.equal(Helpers.md5('alipay'))
        .and.equal('fa42b816950b79e3c969c637657845ad');
    });
  });

  describe('Helpers.wordwrap', () => {
    it('method `wordwrap` should be static function', () => {
      Helpers.wordwrap.should.be.a.Function();
    });

    it('method `wordwrap(`0`.repeat(64))` should be length(64) and not contains LF char', () => {
      Helpers.wordwrap('0'.repeat(64)).should.be.String()
        .and.not.match(/\n$/)
        .and.have.length(64);
    });
    it('method `wordwrap(`0`.repeat(65))` should be length(66) and contains LF char', () => {
      Helpers.wordwrap('0'.repeat(65)).should.be.String()
        .and.match(/\n/)
        .and.have.length(66);
    });

    it('method `wordwrap(`0`.repeat(64), 32)` should be length(65) and contains LF char', () => {
      Helpers.wordwrap('0'.repeat(64), 32).should.be.String()
        .and.match(/\n/)
        .and.have.length(65);
    });

    it('method `wordwrap(`0`.repeat(64), 1)` should be length(127) and contains LF char', () => {
      Helpers.wordwrap('0'.repeat(64), 1).should.be.String()
        .and.match(/\n/)
        .and.have.length(127);
    });

    it('method `wordwrap(`0`.repeat(64), 64, \'\')` should be length(64) and not contains LF char', () => {
      Helpers.wordwrap('0'.repeat(64), 64, '').should.be.String()
        .and.not.match(/\n/)
        .and.have.length(64);
    });

    it('method `wordwrap(`0`.repeat(64), 64, \'1\')` should be length(64) and not contains LF char and endWith(1)', () => {
      Helpers.wordwrap('0'.repeat(64), 64, '1').should.be.String()
        .and.not.match(/\n/)
        .and.match(/.*1$/)
        .and.have.length(65);
    });
  });

  describe('Helpers.OIDs', () => {
    it('property `OIDs` should be static object and have keys(sha1WithRSAEncryption, sha256WithRSAEncryption)', () => {
      Helpers.OIDs.should.be.Object()
        .and.have.keys('sha1WithRSAEncryption', 'sha256WithRSAEncryption');
    });
  });

  describe('Helpers.load', () => {
    it('method `load` should be static function', () => {
      Helpers.load.should.be.a.Function();
    });

    it('method `load()` should thrown TypeError while none-arguments passed', () => {
      should(() => Helpers.load()).throw(TypeError);
    });

    it('method `load(sha1_file_path)` should returns a array and contains a class `Certificate` object', () => {
      const certs = Helpers.load(appCert.sha1Path);
      certs.should.be.Array().and.have.length(1);
      certs[0].should.be.an.Object().have.keys('issuer', 'serialNumber', 'signatureOID');
      certs[0].issuer.should.be.an.Object().have.keys('attributes');
      certs[0].issuer.attributes.should.be.an.Array();
    });

    it('method `load(sha1CertBuffer)` should returns a array and contains a class `Certificate` object', () => {
      const certs = Helpers.load(appCert.sha1Buffer);
      certs.should.be.Array().and.have.length(1);
      certs[0].should.be.an.Object().have.keys('issuer', 'serialNumber', 'signatureOID');
      certs[0].issuer.should.be.an.Object().have.keys('attributes');
      certs[0].issuer.attributes.should.be.an.Array();
    });

    it('method `load(sha256_file_path)` should returns a array and contains a class `Certificate` object', () => {
      const certs = Helpers.load(appCert.sha256Path);
      certs.should.be.Array().and.have.length(1);
      certs[0].should.be.an.Object().have.keys('issuer', 'serialNumber', 'signatureOID');
      certs[0].issuer.should.be.an.Object().have.keys('attributes');
      certs[0].issuer.attributes.should.be.an.Array();
    });

    it('method `load(sha256CertBuffer)` should returns a array and contains a class `Certificate` object', () => {
      const certs = Helpers.load(appCert.sha256Buffer);
      certs.should.be.Array().and.have.length(1);
      certs[0].should.be.an.Object().have.keys('issuer', 'serialNumber', 'signatureOID');
      certs[0].issuer.should.be.an.Object().have.keys('attributes');
      certs[0].issuer.attributes.should.be.an.Array();
    });

    it('method `load(Buffer.concat([sha1CertBuffer, Buffer.from(\'\\n\\n\'), sha256CertBuffer]))` should returns a array and contains two class `Certificate` object', () => {
      const certs = Helpers.load(Buffer.concat([appCert.sha1Buffer, Buffer.from('\n\n'), appCert.sha256Buffer]));
      certs.should.be.Array().and.have.length(2);
      certs.forEach((cert) => {
        cert.should.be.an.Object().have.keys('issuer', 'serialNumber', 'signatureOID');
        cert.issuer.should.be.an.Object().have.keys('attributes');
        cert.issuer.attributes.should.be.an.Array();
      });
    });

    it('method `load(Buffer.concat([sha1CertBuffer, Buffer.from(\'\\n\\n\'), sha256CertBuffer]), \'sha1\')` '
      + 'should returns a array and contains only one class `Certificate` object', () => {
      const certs = Helpers.load(Buffer.concat([appCert.sha1Buffer, Buffer.from('\n\n'), appCert.sha256Buffer]), 'sha1');
      certs.should.be.Array().and.have.length(1);
      certs[0].should.be.an.Object().have.keys('issuer', 'serialNumber', 'signatureOID');
      certs[0].issuer.should.be.an.Object().have.keys('attributes');
      certs[0].issuer.attributes.should.be.an.Array();
    });

    it('method `load(Buffer.concat([sha1CertBuffer, Buffer.from(\'\\n\\n\'), sha256CertBuffer]), \'sha256\')` '
      + 'should returns a array and contains only one class `Certificate` object', () => {
      const certs = Helpers.load(Buffer.concat([appCert.sha1Buffer, Buffer.from('\n\n'), appCert.sha256Buffer]), 'sha256');
      certs.should.be.Array().and.have.length(1);
      certs[0].should.be.an.Object().have.keys('issuer', 'serialNumber', 'signatureOID');
      certs[0].issuer.should.be.an.Object().have.keys('attributes');
      certs[0].issuer.attributes.should.be.an.Array();
    });
  });

  describe('Helpers.extract', () => {
    it('method `extract` should be static function', () => {
      Helpers.extract.should.be.a.Function();
    });

    it('method `extract(sha1CertBuffer)` should returns an empty string', () => {
      Helpers.extract(appCert.sha1Buffer).should.be.String().and.equal('');
    });

    it('method `extract(sha256CertBuffer)` should returns a pem format certificate', () => {
      Helpers.extract(appCert.sha256Buffer).should.be.String()
        .and.match(/^-----BEGIN CERTIFICATE-----\n/)
        .and.match(/\n-----END CERTIFICATE-----$/)
        .and.equal(appCert.sha256Buffer.toString().trim());
    });

    it('method `extract(sha1CertBuffer, \'sha1\')` should returns a pem format certificate', () => {
      Helpers.extract(appCert.sha1Buffer, 'sha1').should.be.String()
        .and.match(/^-----BEGIN CERTIFICATE-----\n/)
        .and.match(/\n-----END CERTIFICATE-----$/)
        .and.equal(appCert.sha1Buffer.toString().trim());
    });

    it('method `extract(Buffer.concat([sha1CertBuffer, Buffer.from(\'\\n\\n\'), sha256CertBuffer]), \'sha\')` should returns two pem format certificates', () => {
      Helpers.extract(Buffer.concat([appCert.sha1Buffer, Buffer.from('\n\n'), appCert.sha256Buffer]), 'sha').should.be.String()
        .and.match(/^-----BEGIN CERTIFICATE-----\n/)
        .and.match(/\n-----END CERTIFICATE-----\n-----BEGIN CERTIFICATE-----\n/)
        .and.match(/\n-----END CERTIFICATE-----$/);
    });
  });

  describe('Helpers.SN', () => {
    it('method `SN` should be static function', () => {
      Helpers.SN.should.be.a.Function();
    });

    it('method `SN(sha1CertBuffer)` should returns an empty string', () => {
      Helpers.SN(appCert.sha1Buffer).should.be.String().and.equal('');
    });

    it('method `SN(sha256CertBuffer)` should returns a length(32) string', () => {
      Helpers.SN(appCert.sha256Buffer).should.be.String()
        .and.not.equal('')
        .and.match(/\w{32}/)
        .and.length(32);
    });

    it('method `SN(sha1CertBuffer, \'sha1\')` should returns a length(32) string', () => {
      Helpers.SN(appCert.sha1Buffer, 'sha1').should.be.String()
        .and.not.equal('')
        .and.match(/\w{32}/)
        .and.length(32);
    });

    it('method `SN(Buffer.concat([sha1CertBuffer, Buffer.from(\'\\n\\n\'), sha256CertBuffer]), \'sha\')` should returns a length(65) string', () => {
      Helpers.SN(Buffer.concat([appCert.sha1Buffer, Buffer.from('\n\n'), appCert.sha256Buffer]), 'sha').should.be.String()
        .and.not.equal('')
        .and.match(/^\w{32}_\w{32}$/)
        .and.length(65);
    });
  });
});
