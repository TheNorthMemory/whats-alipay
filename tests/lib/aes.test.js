const should = require('should');

const Aes = require('../../lib/aes');

describe('lib/aes', () => {
  it('should be class `Aes` and only allowed static usage', () => {
    should(() => new Aes()).throw(Error, {
      name: 'AesError',
    });
    Aes.should.be.a.Function().and.have.property('name', 'Aes');
  });

  it('should have a subclass `AesCbc` and only allowed static usage', () => {
    should(() => new Aes.AesCbc()).throw(Error, {
      name: 'AesCbcError',
    });
    Aes.AesCbc.should.be.a.Function().and.have.property('name', 'AesCbc');
  });

  it('`Aes.AesCbc` should extends of `Aes`', () => {
    Aes.AesCbc.prototype.should.instanceOf(Aes);
  });

  describe('Aes.hex', () => {
    it('property `hex` should be static', () => {
      should(Aes.hex).be.a.String();
    });

    it('property `hex` should have a fixed value `hex`', () => {
      should(Aes.hex).be.a.String().and.equal('hex');
    });
  });

  describe('Aes.utf8', () => {
    it('property `utf8` should be static', () => {
      should(Aes.utf8).be.a.String();
    });

    it('property `utf8` should have a fixed value `utf8`', () => {
      should(Aes.utf8).be.a.String().and.equal('utf8');
    });
  });

  describe('Aes.base64', () => {
    it('property `base64` should be static', () => {
      should(Aes.base64).be.a.String();
    });

    it('property `base64` should have a fixed value `base64`', () => {
      should(Aes.base64).be.a.String().and.equal('base64');
    });
  });

  describe('Aes.BLOCK_SIZE', () => {
    it('property `BLOCK_SIZE` should be static', () => {
      should(Aes.BLOCK_SIZE).be.a.Number();
    });

    it('property `BLOCK_SIZE` should have a fixed value 16', () => {
      should(Aes.BLOCK_SIZE).be.a.Number().and.equal(16);
    });
  });

  describe('Aes.MODE_CBC', () => {
    it('property `MODE_CBC` should be static', () => {
      should(Aes.MODE_CBC).be.a.String();
    });

    it('property `MODE_CBC` should have a fixed value `cbc`', () => {
      should(Aes.MODE_CBC).be.a.String().and.equal('cbc');
    });
  });

  describe('Aes.detector', () => {
    it('method `detector` should be static', () => {
      should(Aes.detector).be.a.Function();
    });

    it('method `detector` should thrown `TypeError` while none-arguments passed', () => {
      should(() => {
        Aes.detector();
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `detector(\'\')` should allowed empty string passed and equal to `[\'aes-0-cbc\', Buffer []]`', () => {
      Aes.detector('').should.be.an.Array().and.deepEqual(['aes-0-cbc', Buffer.from('')]);
    });

    it('method `detector(\'AAAAAAAAAAAAAAAAAAAAAA==\')` should equal to `[\'aes-128-cbc\', Buffer.alloc(16)]`', () => {
      Aes.detector('AAAAAAAAAAAAAAAAAAAAAA==').should.be.an.Array().and.deepEqual(['aes-128-cbc', Buffer.alloc(16)]);
    });

    it('method `detector(\'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\')` should equal to `[\'aes-192-cbc\', Buffer.alloc(24)]`', () => {
      Aes.detector('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA').should.be.an.Array().and.deepEqual(['aes-192-cbc', Buffer.alloc(24)]);
    });

    it('method `detector(\'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=\')` should equal to `[\'aes-256-cbc\', Buffer.alloc(32)]`', () => {
      Aes.detector('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=').should.be.an.Array().and.deepEqual(['aes-256-cbc', Buffer.alloc(32)]);
    });

    it('method `detector(\'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=\', \'ecb\')` should equal to `[\'aes-256-ecb\', Buffer.alloc(32)]`', () => {
      Aes.detector('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', 'ecb').should.be.an.Array().and.deepEqual(['aes-256-ecb', Buffer.alloc(32)]);
    });

    it('method `detector(\'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=\', \'gcm\')` should equal to `[\'aes-256-gcm\', Buffer.alloc(32)]`', () => {
      Aes.detector('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', 'gcm').should.be.an.Array().and.deepEqual(['aes-256-gcm', Buffer.alloc(32)]);
    });
  });

  describe('Aes.AesCbc.hex', () => {
    it('property `hex` should be static', () => {
      should(Aes.AesCbc.hex).be.a.String();
    });

    it('property `hex` should have a fixed value `hex`', () => {
      should(Aes.AesCbc.hex).be.a.String().and.equal('hex');
    });
  });

  describe('Aes.AesCbc.utf8', () => {
    it('property `utf8` should be static', () => {
      should(Aes.AesCbc.utf8).be.a.String();
    });

    it('property `utf8` should have a fixed value `utf8`', () => {
      should(Aes.AesCbc.utf8).be.a.String().and.equal('utf8');
    });
  });

  describe('Aes.AesCbc.base64', () => {
    it('property `base64` should be static', () => {
      should(Aes.AesCbc.base64).be.a.String();
    });

    it('property `base64` should have a fixed value `base64`', () => {
      should(Aes.AesCbc.base64).be.a.String().and.equal('base64');
    });
  });

  describe('Aes.AesCbc.BLOCK_SIZE', () => {
    it('property `BLOCK_SIZE` should be static', () => {
      should(Aes.AesCbc.BLOCK_SIZE).be.a.Number();
    });

    it('property `BLOCK_SIZE` should have a fixed value 16', () => {
      should(Aes.AesCbc.BLOCK_SIZE).be.a.Number().and.equal(16);
    });
  });

  describe('Aes.AesCbc.detector', () => {
    it('method `detector` should be static', () => {
      should(Aes.AesCbc.detector).be.a.Function();
    });

    it('method `detector(\'AAAAAAAAAAAAAAAAAAAAAA==\')` should equal to `[\'aes-128-cbc\', Buffer.alloc(16)]`', () => {
      Aes.AesCbc.detector('AAAAAAAAAAAAAAAAAAAAAA==').should.be.an.Array().and.deepEqual(['aes-128-cbc', Buffer.alloc(16)]);
    });
  });

  describe('Aes.AesCbc.encrypt', () => {
    it('method `encrypt` should be static', () => {
      should(Aes.AesCbc.encrypt).be.a.Function();
    });

    it('method `encrypt()` should thrown `TypeError` while none-arguments passed', () => {
      should(() => {
        Aes.AesCbc.encrypt();
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `encrypt(\'\')` should thrown `TypeError` while only one empty-string argument passed', () => {
      should(() => {
        Aes.AesCbc.encrypt('');
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `encrypt(\'\', \'\')` should thrown `Error` while two empty-string arguments passed', () => {
      should(() => {
        Aes.AesCbc.encrypt('', '');
      }).throw(Error, {
      });
    });

    it('method `encrypt(\'\', \'AAAAAAAAAAAAAAAAAAAAAA==\')` should returns a string and equal to `AUPbY+5msM3/n2mRdoAVHg==`', () => {
      Aes.AesCbc.encrypt('', 'AAAAAAAAAAAAAAAAAAAAAA==').should.be.a.String().and.equal('AUPbY+5msM3/n2mRdoAVHg==');
    });
  });

  describe('Aes.AesCbc.decrypt', () => {
    it('method `decrypt` should be static', () => {
      should(Aes.AesCbc.decrypt).be.a.Function();
    });

    it('method `decrypt()` should thrown `TypeError` while none-arguments passed', () => {
      should(() => {
        Aes.AesCbc.decrypt();
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `decrypt(\'\')` should thrown `TypeError` while only one empty-string argument passed', () => {
      should(() => {
        Aes.AesCbc.decrypt('');
      }).throw(TypeError, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });

    it('method `decrypt(\'\', \'\')` should thrown `Error` while two empty-string arguments passed', () => {
      should(() => {
        Aes.AesCbc.encrypt('', '');
      }).throw(Error, {
      });
    });

    it('method `decrypt(\'AUPbY+5msM3/n2mRdoAVHg==\', \'AAAAAAAAAAAAAAAAAAAAAA==\')` should returns a string and equal to an empty-string', () => {
      Aes.AesCbc.decrypt('AUPbY+5msM3/n2mRdoAVHg==', 'AAAAAAAAAAAAAAAAAAAAAA==').should.be.a.String().and.equal('');
    });
  });
});
