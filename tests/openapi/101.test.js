const { readFileSync } = require('fs');
const { join } = require('path');

require('should');
const nock = require('nock');

const Alipay = require('../..');

describe('OpenAPI Kick Start 101', () => {
  let scope;
  let whats;

  const mocks = (requestUri, requestBody) => {
    /* eslint no-useless-escape:0 */
    const params = new URLSearchParams(requestUri.replace(/[^\?]+(?<search>.*)/, '$<search>'));
    const contents = new URLSearchParams(requestBody);
    const placeholder = `${params.get('method').replace(/\./g, '_')}_response`;

    if (!(params.has('app_id') || contents.has('app_id'))) {
      return `{"${placeholder}":{"code":"40001","msg":"Missing Required Arguments","sub_code":"isv.missing-app-id","sub_msg":"缺少AppID参数"}}`;
    }

    if (params.has('app_id') && params.get('app_id') === '2088') {
      return `{"${placeholder}":{"code":"40002","msg":"Invalid Arguments","sub_code":"isv.invalid-app-id","sub_msg":"无效的AppID参数"}}`;
    }

    return `{"${placeholder}":{"code":"40003","msg":"Insufficient Conditions","sub_code":"isv.missing-signature-config","sub_msg":"应用未配置对应签名算法的公钥或者证书"}}`;
  };

  beforeEach(() => {
    const privateKey = readFileSync(join(__dirname, '../fixtures/mock-app-pkcs1.key'));
    const publicCert = readFileSync(join(__dirname, '../fixtures/mock-svc-spki-pubkey.pem'));

    whats = new Alipay({
      privateKey,
      publicCert,
    });

    scope = nock('https://openapi.alipay.com')
      .defaultReplyHeaders({
        server: 'Tengine/2.1.0',
        'set-cookie': [
          'JSESSIONID=6FF6F65BB1EC785992117C95EA7C27BB; Path=/; HttpOnly',
          'spanner=ubOmkyHGnYLtouOsffShT4n70pJgSji6Xt2T4qEYgj0=;path=/;secure;',
        ],
        via: 'spanner-internet-5396.sa127[200]',
        'Content-Type': 'text/html;charset=utf-8',
      })
      .replyDate()
      .post('/gateway.do')
      .query(true);
  });

  describe('40001:Missing Required Arguments', () => {
    it('alipay.trade.query should get `missing-app-id` response', async () => {
      scope.reply(200, mocks);

      const res = await whats.alipay.trade.query();

      res.headers.should.have.keys('x-alipay-responder', 'x-alipay-signature').and.have.property('x-alipay-responder', 'alipay.trade.query');
      res.data.should.not.have.keys('alipay_trade_query_response').and.instanceof(Object);
      res.data.should.have.keys('code', 'sub_code').and.have.property('sub_code', 'isv.missing-app-id');
    });

    it('alipay.security.risk.content.analyze should get `missing-app-id` response', async () => {
      scope.reply(200, mocks);

      const res = await whats.alipay.security.risk.content.analyze();

      res.headers.should.have.keys('x-alipay-responder', 'x-alipay-signature').and.have.property('x-alipay-responder', 'alipay.security.risk.content.analyze');
      res.data.should.not.have.keys('alipay_security_risk_content_analyze_response').and.instanceof(Object);
      res.data.should.have.keys('code', 'sub_code').and.have.property('sub_code', 'isv.missing-app-id');
    });
  });

  describe('40002:Invalid Arguments', () => {
    it('alipay.trade.query should get `invalid-app-id` response while the `app_id=2088` is passed onto the second parameters', async () => {
      scope.reply(200, mocks);

      /* eslint camelcase:0 */
      const res = await whats.alipay.trade.query({}, { app_id: '2088' });

      res.headers.should.have.keys('x-alipay-responder', 'x-alipay-signature').and.have.property('x-alipay-responder', 'alipay.trade.query');
      res.data.should.not.have.keys('alipay_trade_query_response').and.instanceof(Object);
      res.data.should.have.keys('code', 'sub_code').and.have.property('sub_code', 'isv.invalid-app-id');
    });

    it('alipay.security.risk.content.analyze should get `invalid-app-id` response while the `app_id=2088` is passed onto the second parameters', async () => {
      scope.reply(200, mocks);

      /* eslint camelcase:0 */
      const res = await whats.alipay.security.risk.content.analyze({}, { app_id: '2088' });

      res.headers.should.have.keys('x-alipay-responder', 'x-alipay-signature').and.have.property('x-alipay-responder', 'alipay.security.risk.content.analyze');
      res.data.should.not.have.keys('alipay_security_risk_content_analyze_response').and.instanceof(Object);
      res.data.should.have.keys('code', 'sub_code').and.have.property('sub_code', 'isv.invalid-app-id');
    });
  });

  describe('40003:Insufficient Conditions', () => {
    it('alipay.trade.query should get `missing-signature-config` when `app_id=2014072300007148`', async () => {
      scope.reply(200, mocks);

      /* eslint camelcase:0 */
      const res = await whats.alipay.trade.query({}, { app_id: '2014072300007148' });

      res.headers.should.have.keys('x-alipay-responder', 'x-alipay-signature').and.have.property('x-alipay-responder', 'alipay.trade.query');
      res.data.should.not.have.keys('alipay_trade_query_response').and.instanceof(Object);
      res.data.should.have.keys('code', 'sub_code').and.have.property('sub_code', 'isv.missing-signature-config');
    });

    it('alipay.security.risk.content.analyze should get `missing-signature-config` when `app_id=2014072300007148`', async () => {
      scope.reply(200, mocks);

      /* eslint camelcase:0 */
      const res = await whats.alipay.security.risk.content.analyze({}, { app_id: '2014072300007148' });

      res.headers.should.have.keys('x-alipay-responder', 'x-alipay-signature').and.have.property('x-alipay-responder', 'alipay.security.risk.content.analyze');
      res.data.should.not.have.keys('alipay_security_risk_content_analyze_response').and.instanceof(Object);
      res.data.should.have.keys('code', 'sub_code').and.have.property('sub_code', 'isv.missing-signature-config');
    });
  });
});
