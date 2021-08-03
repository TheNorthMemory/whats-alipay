# 支付宝 OpenAPI SDK

Yet Another Alipay OpenAPI Smart Development Kit

[![GitHub actions](https://github.com/TheNorthMemory/whats-alipay/workflows/ci/badge.svg)](https://github.com/TheNorthMemory/whats-alipay/actions)
[![GitHub issues](https://img.shields.io/github/issues/TheNorthMemory/whats-alipay)](https://github.com/TheNorthMemory/whats-alipay/issues)
[![GitHub release](https://img.shields.io/node/v/whats-alipay)](https://github.com/TheNorthMemory/whats-alipay/releases)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/whats-alipay?label=snyk.io)](https://snyk.io/advisor/npm-package/whats-alipay)
[![NPM module version](https://img.shields.io/npm/v/whats-alipay)](https://www.npmjs.com/package/whats-alipay)
[![NPM module downloads per month](https://img.shields.io/npm/dm/whats-alipay)](https://www.npmjs.com/package/whats-alipay)
[![NPM module license](https://img.shields.io/npm/l/whats-alipay?color=blue)](https://www.npmjs.com/package/whats-alipay)

## 主要功能

- OOP风格化的，可弹性扩容的，支付宝OpenAPI SDK
- 低依赖，目前仅依赖 `Axios`
- 使用Node原生代码实现支付宝OpenAPI的AES(`aes-128-cbc`)加/解密功能
- 使用Node原生代码实现支付宝OpenAPI的RSA(`sha1WithRSAEncryption`)及RSA2(`sha256WithRSAEncryption`)签名、验签功能
- 异步通知消息验签
- 命令行网关交互工具

## SDK约定

- 使用 `method({请求参数}[, {公共请求参数}[, {特殊头参数}]])` 作为HTTP接口驱动，释义如下：
  - 接口定义中`公共请求参数`的 `method`，即作为本SDK标准方法链，弹性扩容，示例使用方法如下，详细审查见文末
  - 接口定义中的`请求参数`，以 `Object` 对象作为第一个入参
  - 接口定义中的`公共请求参数`，以 `Object` 对象作为第二个入参
  - 特别的，对于图片/视频上传，需要定义 `multipart/form-data` 头信息，以 `Object` 对象作为第三个入参，见如下示例
  - 特别的，对于页面表单提交型，即所谓的page类接口，第三参数须定义为 `Formatter.page`，返回结果可直接作为页面/接口输出，说明用法见如下示例
- 请求数据签名以及返回数据验签均自动完成，开发者仅需关注业务代码即可；特别地，对于验签结果有依赖的情况，可以从返回值的头部获取：
  - `headers[x-alipay-verified]` 为验签结果，值可能为 `ok`, `undefined`
  - `headers[x-alipay-signature]` 为源返回数据签名值，值可能为 `undefined`
  - `headers[x-alipay-responder]` 为源返回值字段名转译，值可能为 `undefined`, `error` 或者实际请求的 `method` 值

## 使用手册

### whatsCli 命令行工具

以命令行的形式，与OpenAPI网关交互，play the OpenAPI requests over command line.

<details>
  <summary>$ <b>./node_modules/.bin/whatsCli -h</b> (click to toggle display)</summary>

```
Usage: cli.js [options]

Options:
  -k, --privateKey  The privateKey pem file path                                                              [required]
  -p, --publicCert  The publicCert pem file path                                                              [required]
  -m, --method      The method, eg: alipay.trade.query                                                        [required]
  -s, --search      The search parameters, eg: search.app_id=2088                                             [required]
  -b, --biz         The biz_content, eg: biz.out_trade_no=abcd1234                                            [required]
  -d, --log         Turn on the request trace log                                                              [boolean]
  -u, --baseURL     The OpenAPI gateway, eg: https://openapi.alipaydev.com/gateway.do
  -h, --help        Show help                                                                                  [boolean]
  -V, --version     Show version number                                                                        [boolean]

Examples:
  cli.js -k merchant.key -p alipay.pub -m alipay.trade.pay      The Face2Face barCode scenario
  -s.app_id=2088 -b.subject=HelloKitty
  -b.out_trade_no=Kitty0001 -b.scene=bar_code
  -b.total_amount=0.01 -b.auth_code=
  cli.js -k merchant.key -p alipay.pub -m alipay.trade.refund   The trade refund scenario
  -s.app_id=2088 -b.refund_amount=0.01 -b.refund_currency=CNY
  -b.out_trade_no=Kitty0001
  cli.js -d -u https://openapi.alipaydev.com/gateway.do -k      The trade query scenario over the sandbox environment
  merchant.key -p alipay.pub -m alipay.trade.query              with trace logging
  -s.app_id=2088 -b.out_trade_no=Kitty0001
```
</details>

### certHelper 命令行工具

<details>
  <summary>$ <b>./node_modules/.bin/certHelper -h</b> (click to toggle display)</summary>

```
Usage: cert.js [command] [options]

Commands:
  cert.js SN       Get the certificatie(s) `SN`                 [default]
  cert.js extract  Extract the chained certificate(s)

Options:
  -f, --file     The certificate(s) file path                   [required]
  -p, --pattern  The algo prefix or suffix, dot(.) for all
  -h, --help     Show help                                      [boolean]
  -V, --version  Show version number                            [boolean]

Examples:
  cert.js SN -f alipayRootCert.crt                              get the `sha256`(default) certificate `SN`
  cert.js SN -f alipayRootCert.crt -p ec                        get the signatureAlgorithm whose contains `ec` words
                                                                certificate `SN`
  cert.js SN -f alipayRootCert.crt -p .                         get all chained certificate(s) `SN`
  cert.js extract -f alipayRootCert.crt                         extract the `sha256`(default) certificate
  cert.js extract -f alipayRootCert.crt -p sha1                 extract the `sha1` certificate
  cert.js extract -f alipayRootCert.crt -p .                    extract all chained certificate(s)
  cert.js extract -f alipayRootCert.crt -p sha1 | openssl x509  piped openssl x509 command
  -noout -text
  cert.js extract -f alipayRootCert.crt -p sha1 > tmp.pem       save to a file
```
</details>

此命令行工具，主要是用来计算并获取 **公钥证书模式** 所需的 应用公钥证书SN(*app_cert_sn*)及 支付宝公钥证书SN(*alipay_root_cert_sn*)。

> ./bin/cert.js SN -f /path/your/app_cert.crt

> ./bin/cert.js SN -f /path/your/alipay_root_cert.crt -p RSAEncryption

而`SN` 命令是 `Helpers.SN` 的语法糖，可从如下[API文档](#Helpers.SN)查看更详细用法

### 初始化

```javascript
const { Alipay, Rsa } = require('whats-alipay');

//应用app_id
const app_id = '2014072300007148';

//商户RSA私钥，入参是'从官方工具获取到的BASE64字符串'
const privateKey = Rsa.fromPkcs1('MIIEpAIBAAKCAQEApdXuft3as2x...');
// 以上是下列代码的语法糖，格式为 'private.pkcs1://' + '从官方工具获取到的字符串'
// const privateKey = Rsa.from('private.pkcs1://MIIEpAIBAAKCAQEApdXuft3as2x...');
// Node10仅支持以下方式，须保证`private_key.pem`为完整X509格式
// const privateKey = require('fs').readFileSync('/your/openapi/private_key.pem');

//支付宝RSA公钥，入参是'从官方工具获取到的BASE64字符串'
const publicKey = Rsa.fromSpki('MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCg...');
// 以上是下列代码的语法糖，格式为 'public.spki://' + '从官方工具获取到的字符串'
// const publicKey = Rsa.from('public.spki://MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCg...');
// Node10仅支持以下方式，须保证`public_key.pem`为完整X509格式
// const publicKey = require('fs').readFileSync('/the/alipay/public_key.pem');

const whats = new Alipay({ privateKey, publicKey, params: { app_id, } });
```

#### 统一收单线下交易查询

```javascript
whats
  .alipay.trade.query({out_trade_no})
  .then(({headers,data}) => ({headers,data}))
  .catch(({response: {data}}) => data)
  .then(console.log)
```

<details>
  <summary>$ <b>console.log sample result</b> (click to toggle display)</summary>

```javascript
{
  headers: {
    server: 'Tengine/2.1.0',
    date: 'Fri, 25 Sep 2020 03:27:32 GMT',
    'content-type': 'text/html;charset=utf-8',
    'content-length': '829',
    connection: 'close',
    'set-cookie': [
      'JSESSIONID=6FF6F65BB1EC785992117C95EA7C27BB; Path=/; HttpOnly',
      'spanner=ubOmkyHGnYLtouOsffShT4n70pJgSji6Xt2T4qEYgj0=;path=/;secure;'
    ],
    via: 'spanner-internet-5396.sa127[200]',
    'x-alipay-responder': 'alipay.trade.query',
    'x-alipay-signature': 'gALtsKSWEWRG4wSx8==',
    'x-alipay-verified': 'ok'
  },
  data: {
    code: '10000',
    msg: 'Success',
    buyer_logon_id: '134******38',
    buyer_pay_amount: '183.00',
    buyer_user_id: '2088101117955611',
    fund_bill_list: [ { amount: '183.00', fund_channel: 'ALIPAYACCOUNT' } ],
    invoice_amount: '183.00',
    out_trade_no: '6823789339978248',
    point_amount: '0.00',
    receipt_amount: '183.00',
    send_pay_date: '2020-09-19 17:00:28',
    total_amount: '183.00',
    trade_no: '2013112011001004330000121536',
    trade_status: 'TRADE_SUCCESS'
  }
}
```
</details>

#### 统一收单交易支付接口

```javascript
whats
  .alipay.trade.pay({
    out_trade_no,
    scene,
    auth_code,
    product_code,
    subject,
    total_amount,
  })
  .then(({data}) => data)
  .catch(({response: {data}}) => data)
  .then(console.log)
```

#### 统一收单线下交易预创建

```javascript
whats
  .alipay.trade.precreate({
    out_trade_no,
    subject,
    total_amount,
  })
  .then(({data}) => data)
  .catch(({response: {data}}) => data)
  .then(console.log)
```

#### 手机网站支付接口2.0

```javascript
whats
  .alipay.trade.wap.pay({
    out_trade_no,
    subject,
    total_amount,
    product_code,
    quit_url,
  }, {}, Formatter.page)
  .then(res => res)
  .then(console.log)
```

- 注: 特别地 `res` 结构做了优化，直接支持 `literal`(独立服务模式: `${res}`) 或者 `JSON.stringify` (二次接口模式: `JSON.stringify(res)`)

#### 统一收单下单并支付页面接口

```javascript
whats
  .alipay.trade.page.pay({
    out_trade_no,
    subject,
    total_amount,
    product_code,
  }, {return_url}, Formatter.page)
  .then(res => res)
  .then(console.log)
```

- 注: 特别地 `res` 结构做了优化，直接支持 `literal`(独立服务模式: `${res}`) 或者 `JSON.stringify` (二次接口模式: `JSON.stringify(res)`)

#### 订单咨询服务

```javascript
whats
  .alipay.trade.advance.consult({/*文档上的参数就好*/})
  .then(({data}) => data)
  .catch(({response: {data}}) => data)
  .then(console.log)
```

#### 口碑营销活动列表查询

```javascript
whats
  .koubei.marketing.campaign.activity.batchquery(/*文档上的参数就好*/})
  .then(({data}) => data)
  .catch(({response: {data}}) => data)
  .then(console.log)
```

#### 支付API > 图片上传

```javascript
const { Multipart } = require('whats-alipay');
const form = new Multipart();
form.append(
  'image_content',
  require('fs').readFileSync('/path/for/uploading.jpg'),
  'uploading.jpg'
);

whats
  .ant.merchant.expand.indirect.image.upload(
    form.getBuffer(),
    {image_type: 'jpg'},
    {...form.getHeaders()}
  )
  .then(({data}) => data)
  .catch(({response: {data}}) => data)
  .then(console.log)
```

#### 店铺API > 上传门店照片和视频接口

```javascript
const { Multipart } = require('whats-alipay');
const form = new Multipart();
form.append(
  'image_content',
  require('fs').readFileSync('/path/for/uploading.jpg'),
  'uploading.jpg'
);

whats
  .alipay.offline.material.image.upload(
    form.getBuffer(),
    {image_type: 'jpg', image_name: 'uploading.jpg'},
    {...form.getHeaders()}
  )
  .then(({data}) => data)
  .catch(({response: {data}}) => data)
  .then(console.log)
```

#### 芝麻信用API > 授权查询

```javascript
whats
  .zhima.auth.info.authquery(/*文档上的参数就好*/})
  .then(({data}) => data)
  .catch(({response: {data}}) => data)
  .then(console.log)
```

#### 车主服务API > 车辆驶入接口

```javascript
whats
  .alipay.eco.mycar.parking.enterinfo.sync(/*文档上的参数就好*/})
  .then(({data}) => data)
  .catch(({response: {data}}) => data)
  .then(console.log)
```

#### 资金API > 单笔转账接口

```javascript
whats
  .alipay.fund.trans.uni.transfer(/*文档上的参数就好*/})
  .then(({data}) => data)
  .catch(({response: {data}}) => data)
  .then(console.log)
```

## 何以弹性扩容

`whats` 上绑定多少 `method`，即扩容至多少，以上示例打印如下：

<details>
  <summary>$ <b>console.info sample result</b> (click to toggle display)</summary>

```javascript
console.info(whats)

[Function (anonymous)] {
  ant: [Function: ant] {
    merchant: [Function: ant.merchant] {
      expand: [Function: ant.merchant.expand] {
        indirect: [Function: ant.merchant.expand.indirect] {
          image: [Function: ant.merchant.expand.indirect.image] {
            upload: [Function: ant.merchant.expand.indirect.image.upload]
          }
        }
      }
    }
  },
  alipay: [Function: alipay] {
    trade: [Function: alipay.trade] {
      query: [Function: alipay.trade.query],
      precreate: [Function: alipay.trade.precreate],
      advance: [Function: alipay.trade.advance] {
        consult: [Function: alipay.trade.advance.consult]
      },
      page: [Function: alipay.trade.page] {
        pay: [Function: alipay.trade.page.pay]
      },
      wap: [Function: alipay.trade.wap] {
        pay: [Function: alipay.trade.wap.pay]
      }
    },
    fund: [Function: alipay.fund] {
      trans: [Function: alipay.fund.trans] {
        uni: [Function: alipay.fund.trans.uni] {
          transfer: [Function: alipay.fund.trans.uni.transfer]
        }
      }
    },
    eco: [Function: alipay.eco] {
      mycar: [Function: alipay.eco.mycar] {
        parking: [Function: alipay.eco.mycar.parking] {
          enterinfo: [Function: alipay.eco.mycar.parking.enterinfo] {
            sync: [Function: alipay.eco.mycar.parking.enterinfo.sync]
          }
        }
      }
    },
    offline: [Function: alipay.offline] {
      material: [Function: alipay.offline.material] {
        image: [Function: alipay.offline.material.image] {
          upload: [Function: alipay.offline.material.image.upload]
        }
      }
    }
  },
  zhima: [Function: zhima] {
    auth: [Function: zhima.auth] {
      info: [Function: zhima.auth.info] {
        authquery: [Function: zhima.auth.info.authquery]
      }
    }
  },
  koubei: [Function: koubei] {
    marketing: [Function: koubei.marketing] {
      campaign: [Function: koubei.marketing.campaign] {
        activity: [Function: koubei.marketing.campaign.activity] {
          batchquery: [Function: koubei.marketing.campaign.activity.batchquery]
        }
      }
    }
  }
}
```
</details>

## 异步通知消息验签

通知消息验签，依赖相关 `webserver` 提供的 `POST` 数据解析能力，以下函数在 `http.createServer` 上做过验证，仅供参考。

```javascript
function notificationValidator(things, publicCert, withoutSignType = true) {
  const {groups: {sign}} = (typeof things === 'string' ? things : '').match(/\bsign=(?<sign>[^&]+)/) || {groups: {}}
  const source = [...new URLSearchParams(things)].reduce((des, [key, value]) => (des[key] = value, des), {})
  const signType = source['sign_type']
  const signature = (source.sign || '').replace(/ /g, '+').replace(/_/g, '/')
  // The signature with `sign_type` is only for the notifications whose come from `alipay.open.public.*` APIs.
  if (withoutSignType) {
      delete source['sign_type']
  }

  return Rsa.verify(Formatter.queryStringLike(Formatter.ksort(source)), sign || signature, publicCert, signType)
}
```

## 单元测试

`npm install && npm test`

To disable `nock` and request with the real gateway, just `NOCK_OFF=true npm test`

## 链接

- [变更历史](CHANGELOG.md)
## 许可证

[MIT](LICENSE)
