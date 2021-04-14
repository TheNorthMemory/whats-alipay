const { readFileSync } = require('fs');
const { join } = require('path');

const should = require('should');
const nock = require('nock');
const axios = require('axios');

const { Alipay, Formatter, Rsa } = require('../..');

describe('openapi/alipay.trade.wap.pay', () => {
  let scope;
  let whats;

  const subject = '唯Bug与代码不可辜负'; const outTradeNo = 'out_trade_no'; const totalAmount = 'total_amount'; const productCode = 'product_code'; const
    quitUrl = 'quit_url';

  const appPublicCert = readFileSync(join(__dirname, '../fixtures/mock-app-spki-pubkey.pem'));
  const mocks = (requestUri, requestBody) => {
    /* eslint no-useless-escape:0 */
    const params = new URLSearchParams(requestUri.replace(/[^\?]+(?<search>.*)/, '$<search>'));
    const contents = new URLSearchParams(requestBody);

    // mock the server request verification
    contents.forEach((value, key) => params.append(key, value));
    const payload = Formatter.queryStringLike(
      Formatter.ksort(
        params,
      ),
    );

    if (!Rsa.verify(payload, params.get('sign'), appPublicCert, params.get('sign_type'))) {
      return ['<html>', '<head>', `<meta charset="${params.get('charset') || 'gb2312'}"/>`, '</head>', '<body>', '<div>',
        '{"code":"40002","msg":"Invalid Arguments"',
        ',"sub_code":"isv.invalid-signature"',
        `,"sub_msg":"验签出错，建议检查签名字符串或签名私钥与应用公钥是否匹配，网关生成的验签字符串为：${payload.replace(/&(?!amp;)/g, '&amp;')}"}`,
        '</div>', '</body>', '</html>'].join('\r\n');
    }

    const bizContent = 'biz_content';
    let biz;
    try {
      biz = JSON.parse(contents.get(bizContent));
    } catch { /* ignore */ }
    if (!(biz && biz.subject && biz[outTradeNo] && biz[totalAmount] && biz[productCode] && biz[quitUrl])) {
      return ['<html>', '<head>', `<meta charset="${params.get('charset') || 'gb2312'}"/>`, '</head>', '<body>', '<div>',
        'BIZ_CONTENT_FORMAT_ERROR',
        '</div>', '</body>', '</html>'].join('\r\n');
    }

    return '<html><body>MOCK REDIRECT</body></html>';
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

    scope = nock('https://openapi.alipay.com', {
      filteringScope: (str) => /^https:\/\/(?:openapi|tscenter|mclient).alipay.com/.test(str),
    })
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

  it('Method should be executed `Formatter.page` callback function', async () => {
    const res = await whats.alipay.trade.wap.pay({
      subject,
      [outTradeNo]: `PO${+new Date()}`,
      [totalAmount]: '0.01',
      [productCode]: 'FAST_INSTANT_TRADE_PAY',
      [quitUrl]: 'https://forum.alipay.com/mini-app/post/15501011',
    }, {}, Formatter.page);

    res.data.should.be.an.Object().and.have.keys('baseURL', 'method', 'params', 'body', 'html');
    res.data.baseURL.should.be.a.String();
    res.data.method.should.be.a.String();
    res.data.params.should.be.an.Object();
    res.data.body.should.be.an.Object();
    res.data.html.should.be.a.String().and.match(/.*<form[^>]+>.*?<\/form>.*/);
    res.toJSON.should.be.a.Function();
    res.toJSON().should.be.an.Object().and.deepEqual(res.data);
    res.toString.should.be.a.Function();
    res.toString().should.be.a.String().and.deepEqual(res.data.html);
    should(`${res}`).be.deepEqual(res.data.html);
    should(JSON.stringify(res)).be.deepEqual(JSON.stringify(res.data));

    nock.cleanAll();
  });

  /**
   * @link https://opensupport.alipay.com/support/helpcenter/191/201602560864
   */
  it('Mock the browser\'s `form.submit()` event with an invalid-signature to the gateway URL', async () => {
    scope.reply(200, mocks);

    const res = await whats.alipay.trade.wap.pay({
      subject,
      [outTradeNo]: `PO${+new Date()}`,
      [totalAmount]: '0.01',
      [productCode]: 'FAST_INSTANT_TRADE_PAY',
      [quitUrl]: 'https://forum.alipay.com/mini-app/post/15501011',
    }, {}, Formatter.page);

    let { data: { body, params } } = res;
    body = new URLSearchParams(body);
    params = new URLSearchParams(params);
    [...params].map(([k, v]) => body.append(k, v));

    body.set('sign', 'Inject an invalid signature blah blah blah');

    const { data: html } = await axios.create({}).post(res.data.baseURL, body);
    // The `s` (dotAll) flag for regular expressions was shipped since NodeJS v9.11.2
    // It's ES2018 specification, maynot works on browser.
    html.should.match(/.*?<html>.*40002.*isv\.invalid-signature.*<\/html>.*/s);

    nock.cleanAll();
  });

  /**
   * @link https://opensupport.alipay.com/support/helpcenter/191/201602496403
   */
  it('Mock the browser\'s `form.submit()` event with an invalid-biz_content(`subject` missing case) to the gateway URL', async () => {
    scope.reply(200, mocks);

    const res = await whats.alipay.trade.wap.pay({
      // subject,
      [outTradeNo]: `PO${+new Date()}`,
      [totalAmount]: '0.01',
      [productCode]: 'FAST_INSTANT_TRADE_PAY',
      [quitUrl]: 'https://forum.alipay.com/mini-app/post/15501011',
    }, {}, Formatter.page);

    let { data: { body, params } } = res;
    body = new URLSearchParams(body);
    params = new URLSearchParams(params);
    [...params].map(([k, v]) => body.append(k, v));

    const { data: html } = await axios.create({}).post(res.data.baseURL, body);
    html.should.match(/.*?<html>.*BIZ_CONTENT_FORMAT_ERROR.*<\/html>.*/s);

    nock.cleanAll();
  });

  /**
   * Just practise up on the browser's payment events
   */
  it('Mock the browser\'s `form.submit()` event to the gateway URL then redirected to `mclient.alipay.com` for payment', async () => {
    scope.reply(302, mocks, {
      Location: 'https://mclient.alipay.com/cashier/mobilepay.htm?'
       + 'alipay_exterface_invoke_assign_target=invoke_blah32chars&alipay_exterface_invoke_assign_sign=_htt_e_m_r_pcytd%2F_encoded%2B_params%3D%3D',
    })
      .get('/cashier/mobilepay.htm')
      .delay(200)
      .query(true)
      .reply(200, '<!DOCTYPE html><html><meta name="data-bizType" content="pay"/><body>\'/h5Continue.htm?h5_route_token=\r\nmock `FAST_INSTANT_TRADE_PAY` page</body></html>')
      .get('/h5Continue.htm')
      .delay(200)
      .query(true)
      .reply(200, '<!DOCTYPE html><html><body>mock `h5` page</body></html>');

    const res = await whats.alipay.trade.wap.pay({
      subject,
      [outTradeNo]: `PO${+new Date()}`,
      [totalAmount]: '0.01',
      [productCode]: 'FAST_INSTANT_TRADE_PAY',
      [quitUrl]: 'https://forum.alipay.com/mini-app/post/15501011',
    }, {}, Formatter.page);

    let { data: { body, params } } = res;
    body = new URLSearchParams(body);
    params = new URLSearchParams(params);
    [...params].map(([k, v]) => body.append(k, v));

    axios.create({}).post(res.data.baseURL, body)
      .catch(({ response }) => response)
      .then((page) => {
        page.request.res.responseUrl.should.match(/https:\/\/mclient\.alipay\.com\/cashier\/mobilepay\.htm/);
        page.data.should.match(/.*?<html>.*FAST_INSTANT_TRADE_PAY.*<\/html>.*/s);
        page.data.should.match(/\/h5Continue.htm\?h5_route_token=/s);

        return page;
      })
      .then(() => axios.create({}).get('https://mclient.alipay.com/h5Continue.htm?h5_route_token=fakeToken'))
      .then((page) => {
        page.request.res.responseUrl.should.match(/https:\/\/mclient\.alipay\.com\/h5Continue\.htm/);
        page.data.should.match(/.*?<html>.*<\/html>.*/s);

        return page;
      })
      .then(() => nock.cleanAll());
  });
});
