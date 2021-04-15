#!/usr/bin/env node
const yargs = require('yargs');

const { argv } = yargs
  .alias('k', 'privateKey')
  .describe('k', 'The privateKey pem file path')
  .alias('p', 'publicCert')
  .describe('p', 'The publicCert pem file path')
  .alias('m', 'method')
  .describe('m', 'The method, eg: alipay.trade.query')
  .alias('s', 'search')
  .describe('s', 'The search parameters, eg: search.app_id=2088')
  .alias('b', 'biz')
  .describe('b', 'The biz_content, eg: biz.out_trade_no=abcd1234')
  .demandOption(['k', 'p', 'm', 'b', 's'])
  .boolean('log')
  .alias('d', 'log')
  .describe('d', 'Turn on the request trace log')
  .alias('u', 'baseURL')
  .describe('u', 'The OpenAPI gateway, eg: https://openapi.alipaydev.com/gateway.do')
  .help('h')
  .alias('h', 'help')
  .version()
  .alias('V', 'version')
  .wrap(null)
  .example([
    ['$0 -k merchant.key '
      + '-p alipay.pub '
      + '-m alipay.trade.pay '
      + '-s.app_id=2088 '
      + '-b.subject=HelloKitty -b.out_trade_no=Kitty0001 -b.scene=bar_code -b.total_amount=0.01 -b.auth_code=', 'The Face2Face barCode scenario'],
    ['$0 -k merchant.key '
      + '-p alipay.pub '
      + '-m alipay.trade.refund '
      + '-s.app_id=2088 '
      + '-b.refund_amount=0.01 -b.refund_currency=CNY -b.out_trade_no=Kitty0001', 'The trade refund scenario'],
    ['$0 -k merchant.key '
      + '-p alipay.pub '
      + '-m alipay.trade.refund '
      + '-s.app_id=2088 '
      + '-d -u https://openapi.alipaydev.com/gateway.do '
      + '-b.out_trade_no=Kitty0001', 'The trade query scenario over the sandbox environment with trace logging'],
  ]);

const fs = require('fs');
const { Alipay, Decorator } = require('..');

const whats = new Alipay({
  privateKey: fs.readFileSync(argv.privateKey),
  publicCert: fs.readFileSync(argv.publicCert),
});

if (argv.baseURL) {
  Decorator.client.defaults.baseURL = argv.baseURL;
}

if (argv.log) {
  Decorator.client.interceptors.request.use((c) => {
    /* eslint-disable-next-line no-console */
    console.info([c.baseURL, c.method, c.data, c.params]);
    return c;
  });
  Decorator.client.defaults.transformRequest.push((d) => {
    /* eslint-disable-next-line no-console */
    console.info(d);
    return d;
  });
  Decorator.client.defaults.transformResponse.unshift((d) => {
    /* eslint-disable-next-line no-console */
    console.info(d);
    return d;
  });
}

argv.method.split('.').reduce((f, i) => f[i], whats)(argv.biz, argv.search)
  .catch(({ response: { data } }) => data)
  .then(({ headers, data }) => ({ headers, data }))
  /* eslint-disable-next-line no-console */
  .then(console.log);
