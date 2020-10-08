# 支付宝 OpenAPI SDK

Yet Another Alipay OpenAPI Smart Development Kit

[![GitHub version](https://badgen.net/github/release/TheNorthMemory/whats-alipay)](https://github.com/TheNorthMemory/whats-alipay/releases)
[![GitHub issues](https://badgen.net/github/open-issues/TheNorthMemory/whats-alipay)](https://github.com/TheNorthMemory/whats-alipay/issues)
[![nodejs version](https://badgen.net/npm/node/whats-alipay)](https://github.com/TheNorthMemory/whats-alipay)
[![types](https://badgen.net/npm/types/whats-alipay)](https://www.npmjs.com/package/whats-alipay)
[![NPM module version](https://badgen.net/npm/v/whats-alipay)](https://www.npmjs.com/package/whats-alipay)
[![NPM module downloads per month](https://badgen.net/npm/dm/whats-alipay)](https://www.npmjs.com/package/whats-alipay)
[![NPM module license](https://badgen.net/npm/license/wechatpay-axios-plugin)](https://www.npmjs.com/package/whats-alipay)

## 主要功能

- [x] OOP风格化的，可弹性扩容的，支付宝OpenAPI SDK
- [x] 低依赖，目前仅依赖 `Axios`
- [x] 使用Node原生代码实现支付宝OpenAPI的AES(`aes-128-cbc`)加/解密功能
- [x] 使用Node原生代码实现支付宝OpenAPI的RSA(`sha1WithRSAEncryption`)及RSA2(`sha256WithRSAEncryption`)签名、验签功能

## SDK约定

- 使用 `method({请求参数}[, {公共请求参数}[, {特殊头参数}]])` 作为HTTP接口驱动，释义如下：
  - 接口定义中`公共请求参数`的 `method`，即作为本SDK标准方法链，弹性扩容，示例使用方法如下，详细审查见文末
  - 接口定义中的`请求参数`，以 `Object` 对象作为第一个入参
  - 接口定义中的`公共请求参数`，以 `Object` 对象作为第二个入参
  - 特别的，对于图片/视频上传，需要定义 `multipart/form-data` 头信息，以 `Object` 对象作为第三个入参，见如下示例
- 请求数据签名以及返回数据验签均自动完成，开发者仅需关注业务代码即可；特别地，对于验签结果有依赖的情况，可以从返回值的头部获取：
  - `headers[x-alipay-verified]` 为验签结果，值可能为 `ok`, `undefined`
  - `headers[x-alipay-signature]` 为源返回数据签名值，值可能为 `undefined`
  - `headers[x-alipay-responder]` 为源返回值字段名转译，值可能为 `undefined`, `error` 或者实际请求的 `method` 值

## 使用手册

### certHelper 命令行工具

```
Usage: cert.js [command] [options]

Commands:
  cert.js SN       get `SN`                                     [default]
  cert.js extract  extract cert

Options:
  -f, --file     Load a file                                    [required]
  -p, --pattern  the algo prefix or suffix, dot(.) for all
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

### 初始化

```javascript
const {readFileSync} = require('fs')
const {Alipay} = require('whats-alipay')

//应用app_id
const app_id = '2014072300007148'

//商户私钥证书，须完整格式，同时支持 `PKCS#1` `PKCS#8` 格式
const privateKey = readFileSync('/your/openapi/private_key.pem')

//支付宝公钥证书，须完整格式，同时支持 `PKCS#1` `PKCS#8` 格式
const publicCert = readFileSync('/the/alipay/public_cert.pem')

const whats = new Alipay({ privateKey, publicCert, params: { app_id, } })
```

#### 统一收单线下交易查询

```javascript
whats
  .alipay.trade.query({out_trade_no})
  .then(({headers,data}) => ({headers,data}))
  .catch(({response: {data}}) => data)
  .then(console.log)

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
    'x-alipay-signature': 'gALtsKSWEWRG4wSx8f1aPcLXYrro3ZLGplxNWerZkIAGR4qNz3fP4JCjdRx2M4uFfLfL1uIQ/L1Rt/oZD+NVKn46rLj7YLXWz2jTEnPPofgXywhwHIZ/MfrRc1DjL0xAh00OI6Gur2lileXmn7zaOG0RQoc0mXkSO5AwLWbiO0EnSoh3897TgQFp1hRDpTpXjnxvKSSFiUgr4EDCklfJbc6B3I1i3BvHtzB+lXtHPABukAvzJD/QtjjglIyOeZZ03699cCEl2JmJYGdA1Du+bBjsycLogCNXBLCmdOi5ntRVEo/Tlvl0QYTRleC7dGuCCn1ousZXLy09VUzJ1m85Fw==',
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
const {Form} = require('whats-alipay')
const payload = new Form()
payload.append('image_content', require('fs').readFileSync('/path/for/uploading.jpg'), 'uploading.jpg')

whats
  .ant.merchant.expand.indirect.image.upload(
    payload.getBuffer(),
    {image_type: 'jpg'},
    {...payload.getHeaders()}
  )
  .then(({data}) => data)
  .catch(({response: {data}}) => data)
  .then(console.log)
```

#### 店铺API > 上传门店照片和视频接口

```javascript
const {Form} = require('whats-alipay')
const payload = new Form()
payload.append('image_content', require('fs').readFileSync('/path/for/uploading.jpg'), 'uploading.jpg')

whats
  .alipay.offline.material.image.upload(
    payload.getBuffer(),
    {image_type: 'jpg', image_name: 'uploading.jpg'},
    {...payload.getHeaders()}
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

`Alipay` 类实例链如下:

```javascript
console.info(Alipay)

<ref *1> [class Alipay] {
  default: [Circular *1],
  Alipay: [Circular *1],
  Rsa: <ref *2> [class Rsa] { default: [Circular *2] },
  Aes: <ref *3> [class Aes] {
    default: [Circular *3],
    AesCbc: [class AesCbc extends Aes]
  },
  AesCbc: [class AesCbc extends Aes],
  Form: <ref *4> [class Form] { default: [Circular *4] },
  Formatter: <ref *5> [class Formatter] { default: [Circular *5] },
  Decorator: <ref *6> [class Decorator] {
    default: [Circular *6],
    [Symbol(PRIVATE_KEY)]: <Buffer 2d 2d 2d 2d 2d 42 45 47 49 4e 20 50 52 49 56 41 54 45 20 4b 45 59 2d 2d 2d 2d 2d 0a 4d 49 49 45 76 67 49 42 41 44 41 4e 42 67 6b 71 68 6b 69 47 39 77 ... 1653 more bytes>,
    [Symbol(PUBLIC_CERT)]: <Buffer 2d 2d 2d 2d 2d 42 45 47 49 4e 20 50 55 42 4c 49 43 20 4b 45 59 2d 2d 2d 2d 2d 0a 4d 49 49 42 49 6a 41 4e 42 67 6b 71 68 6b 69 47 39 77 30 42 41 51 45 ... 400 more bytes>,
    [Symbol(CLIENT)]: [Function: wrap] {
      request: [Function: wrap],
      getUri: [Function: wrap],
      delete: [Function: wrap],
      get: [Function: wrap],
      head: [Function: wrap],
      options: [Function: wrap],
      post: [Function: wrap],
      put: [Function: wrap],
      patch: [Function: wrap],
      defaults: {
        method: 'post',
        headers: {
          common: { Accept: 'application/json, text/plain, */*' },
          delete: {},
          get: {},
          head: {},
          post: { 'Content-Type': 'application/x-www-form-urlencoded' },
          put: { 'Content-Type': 'application/x-www-form-urlencoded' },
          patch: { 'Content-Type': 'application/x-www-form-urlencoded' },
          'User-Agent': 'WhatsAlipay/0.0.6 Node/14.5.0 darwin/x64'
        },
        params: {
          app_id: '2014072300007148',
          format: 'JSON',
          charset: 'utf-8',
          sign_type: 'RSA2',
          version: '1.0'
        },
        baseURL: 'https://openapi.alipay.com/gateway.do',
        transformRequest: [ [Function: transformRequest] ],
        transformResponse: [ [Function: verifier], [Function: transformResponse] ],
        timeout: 0,
        adapter: [Function: httpAdapter],
        xsrfCookieName: 'XSRF-TOKEN',
        xsrfHeaderName: 'X-XSRF-TOKEN',
        maxContentLength: -1,
        maxBodyLength: -1,
        validateStatus: [Function: validateStatus]
      },
      interceptors: {
        request: InterceptorManager {
          handlers: [ { fulfilled: [Function: signer], rejected: undefined } ]
        },
        response: InterceptorManager { handlers: [] }
      }
    }
  }
}
```

## TODO

- [ ] 返回的加密密文解密

## Unit Test

`npm test`

To disable `nock` and request with the real gateway, just `NOCK_OFF=true npm test`

## Changelog

- v0.0.7 新增 `Helpers` 类及 `certHelper` 命令行工具集

- v0.0.6 新增 `Form` 类，缩减并兼容 `form-data`

- v0.0.5 向下兼容 `NodeJS` >= 10.15.0

- v0.0.4 向下兼容 `Axios` >= 0.19.0

- v0.0.3 增加测试用例及BUG修复

- v0.0.2 重新发布版本

- v0.0.1 初始版本

## License

The MIT License (MIT)

Copyright (c) 2020 James ZHANG(TheNorthMemory)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
