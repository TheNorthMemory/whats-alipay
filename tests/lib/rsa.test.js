const { readFileSync } = require('fs');
const { join } = require('path');

const should = require('should');
const Rsa = require('../../lib/rsa');

describe('lib/Rsa', () => {
  it('should be class Rsa', () => {
    should(() => new Rsa()).throw(Error, {
      name: 'RsaError',
    });
    Rsa.should.be.a.Function().and.have.property('name', 'Rsa');
  });

  describe('Rsa.base64', () => {
    it('property `base64` should be static and have a fixed value `base64`', () => {
      Rsa.base64.should.be.a.String().and.equal('base64');
    });
  });

  describe('Rsa.ALGO_TYPE_RSA', () => {
    it('property `ALGO_TYPE_RSA` should be static and have a fixed value `sha1WithRSAEncryption`', () => {
      Rsa.ALGO_TYPE_RSA.should.be.a.String().and.equal('sha1WithRSAEncryption');
    });
  });

  describe('Rsa.ALGO_TYPE_RSA2', () => {
    it('property `ALGO_TYPE_RSA2` should be static and have a fixed value `sha256WithRSAEncryption`', () => {
      Rsa.ALGO_TYPE_RSA2.should.be.a.String().and.equal('sha256WithRSAEncryption');
    });
  });

  describe('Rsa.sign', () => {
    it('method `sign` should be static', () => {
      should(Rsa.sign).be.a.Function();
    });

    it('method `sign` should thrown TypeError when none arguments given', () => {
      should(() => {
        Rsa.sign();
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `sign` should thrown TypeError when `privateKeyCertificate` argument is not given', () => {
      should(() => {
        Rsa.sign('');
      }).throw(Error, {
        code: 'ERR_CRYPTO_SIGN_KEY_REQUIRED',
      });
      should(() => {
        Rsa.sign('', undefined);
      }).throw(Error, {
        code: 'ERR_CRYPTO_SIGN_KEY_REQUIRED',
      });
    });

    it('method `sign` should thrown Error when `privateKeyCertificate` is invalid', () => {
      should(() => {
        Rsa.sign('', '');
      }).throw(Error, {
        code: 'ERR_CRYPTO_SIGN_KEY_REQUIRED',
      });
    });

    it('method `sign` should returns a `String` when the `ciphertext` is empty string and the `privateKeyCertificate` is pkcs#1 `pem` buffer', () => {
      const privateKey = readFileSync(join(__dirname, '../fixtures/mock-app-pkcs1.key'));

      privateKey.should.be.instanceof(Buffer);
      Rsa.sign('', privateKey).should.be.String().and.not.be.empty();
    });

    it('method `sign` should returns a `String` when the `ciphertext` is empty string and the `privateKeyCertificate` is pkcs#8 `pem` buffer', () => {
      const privateKey = readFileSync(join(__dirname, '../fixtures/mock-app-pkcs8.key'));

      privateKey.should.be.instanceof(Buffer);
      Rsa.sign('', privateKey).should.be.String().and.not.be.empty();
    });

    it('method `sign` should returns a `string` when the `ciphertext` is empty string and `privateKeyCertificate` is a pkcs#1 `pem` string', () => {
      const privateKey = readFileSync(join(__dirname, '../fixtures/mock-app-pkcs1.key')).toString();

      privateKey.should.be.a.String().and.startWith('-----BEGIN RSA PRIVATE KEY-----').and.match(/-----END RSA PRIVATE KEY-----\n?$/);
      Rsa.sign('', privateKey).should.be.a.String().and.not.be.empty();
    });

    it('method `sign` should returns a `string` when the `ciphertext` is empty string and `privateKeyCertificate` is a pkcs#8 `pem` string', () => {
      const privateKey = readFileSync(join(__dirname, '../fixtures/mock-app-pkcs8.key')).toString();

      privateKey.should.be.a.String().and.startWith('-----BEGIN PRIVATE KEY-----').and.match(/-----END PRIVATE KEY-----\n?$/);
      Rsa.sign('', privateKey).should.be.a.String().and.not.be.empty();
    });

    it('method `sign` should returns a `String` while passed a valid third parameter(RSA|RSA2) which is default as `RSA2`', () => {
      const pkcs1PrivateKey = readFileSync(join(__dirname, '../fixtures/mock-app-pkcs1.key'));

      pkcs1PrivateKey.should.be.instanceof(Buffer);
      Rsa.sign('', pkcs1PrivateKey, 'RSA').should.be.String().and.not.be.empty();
      Rsa.sign('', pkcs1PrivateKey, 'RSA2').should.be.String().and.not.be.empty();
      Rsa.sign('', pkcs1PrivateKey, 'RSA2').should.be.String().and.not.be.empty().and.equal(Rsa.sign('', pkcs1PrivateKey));
      Rsa.sign('', pkcs1PrivateKey.toString(), 'RSA').should.be.String().and.not.be.empty();
      Rsa.sign('', pkcs1PrivateKey.toString(), 'RSA2').should.be.String().and.not.be.empty();
      Rsa.sign('', pkcs1PrivateKey.toString(), 'RSA2').should.be.String().and.not.be.empty().and.equal(Rsa.sign('', pkcs1PrivateKey.toString()));

      const pkcs8PrivateKey = readFileSync(join(__dirname, '../fixtures/mock-app-pkcs8.key'));

      pkcs8PrivateKey.should.be.instanceof(Buffer);
      Rsa.sign('', pkcs8PrivateKey, 'RSA').should.be.String().and.not.be.empty();
      Rsa.sign('', pkcs8PrivateKey, 'RSA2').should.be.String().and.not.be.empty();
      Rsa.sign('', pkcs8PrivateKey.toString(), 'RSA').should.be.String().and.not.be.empty();
      Rsa.sign('', pkcs8PrivateKey.toString(), 'RSA2').should.be.String().and.not.be.empty();
    });

    it('method `sign` result should equals whether the `privateKeyCertificate` were pkcs#1 nor pkcs#8 format', () => {
      const pkcs1PrivateKey = readFileSync(join(__dirname, '../fixtures/mock-app-pkcs1.key'));
      const pkcs8PrivateKey = readFileSync(join(__dirname, '../fixtures/mock-app-pkcs8.key'));

      pkcs1PrivateKey.should.be.instanceof(Buffer);
      pkcs8PrivateKey.should.be.instanceof(Buffer);

      Rsa.sign('', pkcs1PrivateKey, 'RSA').should.equal(Rsa.sign('', pkcs8PrivateKey, 'RSA'));
      Rsa.sign('', pkcs1PrivateKey, 'RSA2').should.equal(Rsa.sign('', pkcs8PrivateKey, 'RSA2'));

      Rsa.sign('', pkcs1PrivateKey, 'RSA').should.not.equal(Rsa.sign('', pkcs1PrivateKey, 'RSA2'));
      Rsa.sign('', pkcs8PrivateKey, 'RSA').should.not.equal(Rsa.sign('', pkcs8PrivateKey, 'RSA2'));
    });

    it('method `sign` should thrown TypeError while the third parameter is not one of RSA or RSA2 values', () => {
      const privateKey = readFileSync(join(__dirname, '../fixtures/mock-app-pkcs1.key'));

      should(() => {
        Rsa.sign('', privateKey, 'MOCK');
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });
  });

  describe('Rsa.verify', () => {
    it('method `verify` should be static', () => {
      should(Rsa.verify).be.a.Function();
    });

    it('method `verify` should thrown TypeError when none arguments given', () => {
      should(() => {
        Rsa.verify();
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `verify` should thrown TypeError when the `publicCertificate` argument is not given', () => {
      should(() => {
        Rsa.verify('');
      }).throw(TypeError, {
      });
    });

    it('method `verify` should thrown TypeError when the `publicCertificate` argument is is invalid', () => {
      should(() => {
        Rsa.verify('', '');
      }).throw(TypeError, {
      });
    });

    it('method `verify` should thrown TypeError when the `signature` argument is undefined', () => {
      const cert = readFileSync(join(__dirname, '../fixtures/mock-svc-spki-pubkey.pem'));

      cert.should.be.instanceof(Buffer);
      should(() => {
        Rsa.verify('', undefined, cert);
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `verify` should returns Boolean `False` when the `signature` argument is empty string', () => {
      const cert = readFileSync(join(__dirname, '../fixtures/mock-svc-spki-pubkey.pem'));

      cert.should.be.instanceof(Buffer);
      Rsa.verify('', '', cert).should.be.Boolean().and.be.False();
    });

    it('method `verify` should returns Boolean `True` when given then `publicCertificate` `pem` Buffer and the `signature` as the result of the `Rsa.sign` an empty string', () => {
      const privateKey = readFileSync(join(__dirname, '../fixtures/mock-svc-pkcs1.key'));

      privateKey.should.be.instanceof(Buffer);

      const signature = Rsa.sign('', privateKey);

      signature.should.be.String().and.not.be.empty();

      const cert = readFileSync(join(__dirname, '../fixtures/mock-svc-spki-pubkey.pem'));

      cert.should.be.instanceof(Buffer);
      Rsa.verify('', signature, cert).should.be.Boolean().and.be.True();
    });

    it('method `verify` should returns Boolean `True` when given then `publicCertificate` `pem` String and the `signature` as the result of the `Rsa.sign` an empty string', () => {
      const privateKey = readFileSync(join(__dirname, '../fixtures/mock-svc-pkcs1.key'));

      privateKey.should.be.instanceof(Buffer);

      const signature = Rsa.sign('', privateKey);

      signature.should.be.String().and.not.be.empty();

      const cert = readFileSync(join(__dirname, '../fixtures/mock-svc-spki-pubkey.pem')).toString();

      cert.should.be.a.String().and.startWith('-----BEGIN PUBLIC KEY-----').and.match(/-----END PUBLIC KEY-----\n?$/);
      Rsa.verify('', signature, cert).should.be.Boolean().and.be.True();
    });

    it('method `verify` should returns Boolean `False` while the `signature` as of `RSA` and the verificaiton by `RSA2`', () => {
      const privateKey = readFileSync(join(__dirname, '../fixtures/mock-svc-pkcs1.key'));

      privateKey.should.be.instanceof(Buffer);

      const signature = Rsa.sign('', privateKey, 'RSA');

      signature.should.be.String().and.not.be.empty();

      const cert = readFileSync(join(__dirname, '../fixtures/mock-svc-spki-pubkey.pem'));

      cert.should.be.instanceof(Buffer);
      Rsa.verify('', signature, cert).should.be.Boolean().and.be.False();
    });

    it('method `verify` should returns Boolean `False` while the `signature` as of `RSA2` and the verificaiton by `RSA`', () => {
      const privateKey = readFileSync(join(__dirname, '../fixtures/mock-svc-pkcs1.key'));

      privateKey.should.be.instanceof(Buffer);

      const signature = Rsa.sign('', privateKey, 'RSA2');

      signature.should.be.String().and.not.be.empty();

      const cert = readFileSync(join(__dirname, '../fixtures/mock-svc-spki-pubkey.pem'));

      cert.should.be.instanceof(Buffer);
      Rsa.verify('', signature, cert, 'RSA').should.be.Boolean().and.be.False();
    });
  });
});
