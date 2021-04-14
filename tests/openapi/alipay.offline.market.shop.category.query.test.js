const { readFileSync } = require('fs');
const { join } = require('path');

require('should');
const nock = require('nock');

const {
  Alipay, Formatter, Rsa, Decorator,
} = require('../..');

describe('openapi/alipay.offline.market.shop.category.query', () => {
  let scope;
  let whats;

  const svcPrivateKey = readFileSync(join(__dirname, '../fixtures/mock-svc-pkcs1.key'));
  const appPublicCert = readFileSync(join(__dirname, '../fixtures/mock-app-spki-pubkey.pem'));
  const mocks = (requestUri, requestBody) => {
    /* eslint no-useless-escape:0 */
    const params = new URLSearchParams(requestUri.replace(/[^\?]+(?<search>.*)/, '$<search>'));
    const contents = new URLSearchParams(requestBody);
    const placeholder = `${params.get('method').replace(/\./g, '_')}_response`;

    // mock the server request verification
    contents.forEach((value, key) => params.append(key, value));
    const payload = Formatter.queryStringLike(
      Formatter.ksort(
        params,
      ),
    );

    let data;
    if (!Rsa.verify(payload, params.get('sign'), appPublicCert, params.get('sign_type'))) {
      data = '{"code":"40002","msg":"Invalid Arguments",'
      + '"sub_code":"isv.invalid-signature",'
      + `"sub_msg":"验签出错，建议检查签名字符串或签名私钥与应用公钥是否匹配，网关生成的验签字符串为：${payload.replace(/&(?!amp;)/g, '&amp;')}"}`;
    } else {
      data = readFileSync(join(__dirname, `../fixtures/${params.get('method')}.json`)).toString();
    }

    return `{"${placeholder}":${data},"sign":"${Rsa.sign(data, svcPrivateKey, params.get('sign_type'))}"}`;
  };

  beforeEach(() => {
    const privateKey = readFileSync(join(__dirname, '../fixtures/mock-app-pkcs1.key'));
    const publicCert = readFileSync(join(__dirname, '../fixtures/mock-svc-spki-pubkey.pem'));

    whats = new Alipay({
      privateKey,
      publicCert,
      params: {
        /* eslint camelcase:0 */
        app_id: '2088',
      },
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
      .replyContentLength()
      .replyDate()
      .post('/gateway.do')
      .query(true);
  });

  it('The request data signature on Invalid case, the gateway should responsed `40002:invalid-signature`', async () => {
    scope.reply(200, mocks);

    Decorator.client.defaults.transformRequest.unshift((data) => {
      if (data instanceof URLSearchParams) {
        data.set('sign', 'Inject an invalid signature blah blah blah');
      }

      return data;
    });

    const res = await whats.alipay.offline.market.shop.category.query();

    res.headers.should.have.keys('x-alipay-responder', 'x-alipay-signature').and.have.property('x-alipay-responder', 'alipay.offline.market.shop.category.query');
    res.data.should.have.keys('code', 'sub_code').and.instanceof(Object);
    res.data.should.have.keys('code', 'sub_code').and.have.property('sub_code', 'isv.invalid-signature');
  });

  it('The response data should parsed without `alipay_offline_market_shop_category_query_response` key', async () => {
    scope.reply(200, mocks);

    const res = await whats.alipay.offline.market.shop.category.query();

    res.headers.should.have.keys('x-alipay-responder', 'x-alipay-signature', 'x-alipay-verified');
    res.headers.should.have.property('x-alipay-responder', 'alipay.offline.market.shop.category.query');
    res.headers.should.have.property('x-alipay-verified', 'ok');

    res.data.should.be.instanceof(Object).not.have.keys('alipay_offline_market_shop_category_query_response');
    res.data.should.be.instanceof(Object).have.keys('code', 'msg', 'shop_category_config_infos').and.have.property('code', '10000');

    res.data.shop_category_config_infos.should.instanceof(Array);
    res.data.shop_category_config_infos[0].should.be.instanceof(Object).have.keys('level', 'link', 'id', 'is_leaf', 'nm');
  });
});
