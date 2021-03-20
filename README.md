# 支付宝 OpenAPI SDK

Yet Another Alipay OpenAPI Smart Development Kit

[![GitHub version](https://badgen.net/github/release/TheNorthMemory/whats-alipay)](https://github.com/TheNorthMemory/whats-alipay/releases)
[![GitHub issues](https://badgen.net/github/open-issues/TheNorthMemory/whats-alipay)](https://github.com/TheNorthMemory/whats-alipay/issues)
[![nodejs version](https://badgen.net/npm/node/whats-alipay)](https://github.com/TheNorthMemory/whats-alipay)
[![NPM module version](https://badgen.net/npm/v/whats-alipay)](https://www.npmjs.com/package/whats-alipay)
[![NPM module downloads per month](https://badgen.net/npm/dm/whats-alipay)](https://www.npmjs.com/package/whats-alipay)
[![NPM module license](https://badgen.net/npm/license/whats-alipay)](https://www.npmjs.com/package/whats-alipay)

## 主要功能

- [x] OOP风格化的，可弹性扩容的，支付宝OpenAPI SDK
- [x] 低依赖，目前仅依赖 `Axios`
- [x] 使用Node原生代码实现支付宝OpenAPI的AES(`aes-128-cbc`)加/解密功能
- [x] 使用Node原生代码实现支付宝OpenAPI的RSA(`sha1WithRSAEncryption`)及RSA2(`sha256WithRSAEncryption`)签名、验签功能
- [x] 异步通知消息验签
- [x] 命令行网关交互工具

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

> *证书完整格式* 是指：
> 包含 `-----BEGIN` 及 `-----END`，内容是列宽64的`base64-encoded`字符串，可直接用 `openssl` 命令行工具进行验证格式。

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

`Alipay` 类实例链如下:

<details>
  <summary>$ <b>console.info sample result</b> (click to toggle display)</summary>

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
          'User-Agent': 'WhatsAlipay/0.0.9 Node/14.5.0 darwin/x64'
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

## API(s)

Manually generated by `for f in lib/*.js; do ./node_modules/.bin/jsdoc2md -d 3 $f; done`

### Classes

<dl>
<dt><a href="#Aes">Aes</a></dt>
<dd><p>Aes - Advanced Encryption Standard</p>
</dd>
<dt><a href="#AesCbc">AesCbc</a></dt>
<dd><p>AesCbc</p>
</dd>
</dl>

<a name="Aes"></a>

### Aes
Aes - Advanced Encryption Standard

**Kind**: global class

* [Aes](#Aes)
    * [new Aes()](#new_Aes_new)
    * [.hex](#Aes.hex)
    * [.utf8](#Aes.utf8)
    * [.base64](#Aes.base64)
    * [.BLOCK_SIZE](#Aes.BLOCK_SIZE)
    * [.MODE_CBC](#Aes.MODE_CBC)
    * [.detector(cipherkey, [mode])](#Aes.detector) ⇒ <code>array</code>

<a name="new_Aes_new"></a>

#### new Aes()
To prevent `new` operation, works only as static class.

<a name="Aes.hex"></a>

#### Aes.hex
**Kind**: static property of [<code>Aes</code>](#Aes)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| hex | <code>string</code> | Alias of `hex` string |

<a name="Aes.utf8"></a>

#### Aes.utf8
**Kind**: static property of [<code>Aes</code>](#Aes)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| utf8 | <code>string</code> | Alias of `utf8` string |

<a name="Aes.base64"></a>

#### Aes.base64
**Kind**: static property of [<code>Aes</code>](#Aes)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| base64 | <code>string</code> | Alias of `base64` string |

<a name="Aes.BLOCK_SIZE"></a>

#### Aes.BLOCK\_SIZE
**Kind**: static property of [<code>Aes</code>](#Aes)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| BLOCK_SIZE | <code>integer</code> | The `aes` block size |

<a name="Aes.MODE_CBC"></a>

#### Aes.MODE\_CBC
**Kind**: static property of [<code>Aes</code>](#Aes)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| MODE_CBC | <code>string</code> | The `cbc` mode string |

<a name="Aes.detector"></a>

#### Aes.detector(cipherkey, [mode]) ⇒ <code>array</code>
Detect the algo with given `cipherkey` length and `mode`.

**Kind**: static method of [<code>Aes</code>](#Aes)
**Returns**: <code>array</code> - - `[algorithm, key]` pairs

| Param | Type | Description |
| --- | --- | --- |
| cipherkey | <code>string</code> | Based64 encoded key string. |
| [mode] | <code>string</code> | The `mode` string, default is `this.MODE_CBC`. |

<a name="AesCbc"></a>

### AesCbc
AesCbc

**Kind**: global class

* [AesCbc](#AesCbc)
    * [.encrypt(plaintext, cipherkey, [iv])](#AesCbc.encrypt) ⇒ <code>string</code>
    * [.decrypt(ciphertext, cipherkey, [iv])](#AesCbc.decrypt) ⇒ <code>string</code>

<a name="AesCbc.encrypt"></a>

#### AesCbc.encrypt(plaintext, cipherkey, [iv]) ⇒ <code>string</code>
Encrypts plaintext.

**Kind**: static method of [<code>AesCbc</code>](#AesCbc)
**Returns**: <code>string</code> - Base64-encoded ciphertext.

| Param | Type | Description |
| --- | --- | --- |
| plaintext | <code>string</code> | Text to encode. |
| cipherkey | <code>string</code> | The secret key, base64 encoded string. |
| [iv] | <code>string</code> \| <code>buffer</code> | The initialization vector, 16 bytes string or buffer, default is `0{16}` buffer. |

<a name="AesCbc.decrypt"></a>

#### AesCbc.decrypt(ciphertext, cipherkey, [iv]) ⇒ <code>string</code>
Decrypts ciphertext.

**Kind**: static method of [<code>AesCbc</code>](#AesCbc)
**Returns**: <code>string</code> - Utf-8 plaintext.

| Param | Type | Description |
| --- | --- | --- |
| ciphertext | <code>string</code> | Base64-encoded ciphertext. |
| cipherkey | <code>string</code> | The secret key, base64 encoded string. |
| [iv] | <code>string</code> \| <code>buffer</code> | The initialization vector, 16 bytes string or buffer, default is `0{16}` buffer. |

### Classes

<dl>
<dt><a href="#Alipay">Alipay</a></dt>
<dd><p>Whats Alipay Core</p>
</dd>
</dl>

### Functions

<dl>
<dt><a href="#get">get(target, property)</a> ⇒ <code>object</code></dt>
<dd></dd>
</dl>

<a name="Alipay"></a>

### Alipay
Whats Alipay Core

**Kind**: global class

* [Alipay](#Alipay)
    * [new Alipay(config)](#new_Alipay_new)
    * [.handler](#Alipay.handler)
    * [.compose([prefix], [suffix])](#Alipay.compose) ⇒ <code>Proxy</code>
    * [.chain(method)](#Alipay.chain) ⇒ <code>function</code>

<a name="new_Alipay_new"></a>

#### new Alipay(config)
To compose the method `chain`.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | The configuration passed in `Decorator`. |
| config.privateKey | <code>string</code> \| <code>Buffer</code> | The merchant's RSA's private key. |
| config.publicCert | <code>string</code> \| <code>Buffer</code> | The alipay's RSA's pubkey or certificate(recommend). |
| [config.params] | <code>object</code> | The general parameters. |
| [config.params.app_id] | <code>string</code> \| <code>number</code> | The merchant's application id. |
| [config.params.app_auth_token] | <code>string</code> | The merchant's authorization token. |
| [config.params.app_cert_sn] | <code>string</code> | The merchant's RSA's certificate SN. |
| [config.params.alipay_root_cert_sn] | <code>string</code> | The alipay's RSA's certificate SN. |

<a name="Alipay.handler"></a>

#### Alipay.handler
**Kind**: static property of [<code>Alipay</code>](#Alipay)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| handler | <code>object</code> | A `Getter` handler object |

<a name="Alipay.compose"></a>

#### Alipay.compose([prefix], [suffix]) ⇒ <code>Proxy</code>
Compose a named function with `prefix` and `suffix` whose joined by a `dot(.)`

**Kind**: static method of [<code>Alipay</code>](#Alipay)
**Returns**: <code>Proxy</code> - - With a special `Getter` Function.

| Param | Type | Description |
| --- | --- | --- |
| [prefix] | <code>string</code> | The prefix string. |
| [suffix] | <code>string</code> | The suffix string. |

<a name="Alipay.chain"></a>

#### Alipay.chain(method) ⇒ <code>function</code>
Chain the input method

**Kind**: static method of [<code>Alipay</code>](#Alipay)
**Returns**: <code>function</code> - - Named as given `method` function

| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | The naming string. |

<a name="get"></a>

### get(target, property) ⇒ <code>object</code>
**Kind**: global function
**Returns**: <code>object</code> - - An object or object's property

| Param | Type | Description |
| --- | --- | --- |
| target | <code>object</code> | The object |
| property | <code>string</code> | The property |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| get | <code>function</code> | Object's `getter` handler |

<a name="Decorator"></a>

### Decorator
Decorate the `Axios` instance

**Kind**: global class

* [Decorator](#Decorator)
    * [new Decorator(config)](#new_Decorator_new)
    * [.client](#Decorator.client)
    * [.privateKey](#Decorator.privateKey)
    * [.publicCert](#Decorator.publicCert)
    * [.requestInterceptor](#Decorator.requestInterceptor)
    * [.responseVerifier](#Decorator.responseVerifier)
    * [.defaults](#Decorator.defaults)
    * [.request(config)](#Decorator.request) ⇒ <code>PromiseLike</code>
    * [.withDefaults(config)](#Decorator.withDefaults) ⇒ <code>object</code>

<a name="new_Decorator_new"></a>

#### new Decorator(config)
Decorate factory


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | The configuration. |
| config.privateKey | <code>string</code> \| <code>Buffer</code> | The merchant's RSA's private key. |
| config.publicCert | <code>string</code> \| <code>Buffer</code> | The alipay's RSA's pubkey or certificate(recommend). |
| [config.params] | <code>object</code> | The general parameters. |
| [config.params.app_id] | <code>string</code> \| <code>number</code> | The merchant's application id. |
| [config.params.app_auth_token] | <code>string</code> | The merchant's authorization token. |
| [config.params.app_cert_sn] | <code>string</code> | The merchant's RSA's certificate SN. |
| [config.params.alipay_root_cert_sn] | <code>string</code> | The alipay's RSA's certificate SN. |

<a name="Decorator.client"></a>

#### Decorator.client
**Kind**: static property of [<code>Decorator</code>](#Decorator)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| client | <code>AxiosInstance</code> | The Axios instance. |

<a name="Decorator.privateKey"></a>

#### Decorator.privateKey
**Kind**: static property of [<code>Decorator</code>](#Decorator)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| privateKey | <code>buffer</code> | Buffer of the private key certificate. |

<a name="Decorator.publicCert"></a>

#### Decorator.publicCert
**Kind**: static property of [<code>Decorator</code>](#Decorator)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| publicCert | <code>buffer</code> | Buffer of the alipay public certificate. |

<a name="Decorator.requestInterceptor"></a>

#### Decorator.requestInterceptor
**Kind**: static property of [<code>Decorator</code>](#Decorator)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| requestInterceptor | <code>function</code> | Named as `signer` function. |

<a name="Decorator.responseVerifier"></a>

#### Decorator.responseVerifier
**Kind**: static property of [<code>Decorator</code>](#Decorator)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| responseVerifier | <code>function</code> | Named as `verifier` function. |

<a name="Decorator.defaults"></a>

#### Decorator.defaults
**Kind**: static property of [<code>Decorator</code>](#Decorator)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| defaults | <code>object</code> | The defaults configuration whose pased in `Axios`. |

<a name="Decorator.request"></a>

#### Decorator.request(config) ⇒ <code>PromiseLike</code>
Portable of the `axios.request` with defaults {method, params, headers}
compatible since Axios >= 0.19.0

- Typeof `function` of `config.headers` is available since v0.0.9

**Kind**: static method of [<code>Decorator</code>](#Decorator)
**Returns**: <code>PromiseLike</code> - - The `AxiosPromise` instance.

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | The configuration. |
| config.data | <code>object</code> \| <code>Buffer</code> \| <code>undefined</code> | The post data |
| config.params | <code>object</code> \| <code>undefined</code> | The search parameters |
| config.headers | <code>object</code> \| <code>function</code> \| <code>undefined</code> | The request's headers object or a callback `function` for `sign-only` requests |

<a name="Decorator.withDefaults"></a>

#### Decorator.withDefaults(config) ⇒ <code>object</code>
Deep merge the input with the defaults

**Kind**: static method of [<code>Decorator</code>](#Decorator)
**Returns**: <code>object</code> - - With the built-in configuration.

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | The configuration. |

### Classes

<dl>
<dt><a href="#Form">Form</a></dt>
<dd><p>Simple and lite of <code>multipart/form-data</code> implementation, most similar to <code>form-data</code></p>
<pre><code class="language-js">(new Form)
  .append(&#39;a&#39;, 1)
  .append(&#39;b&#39;, &#39;2&#39;)
  .append(&#39;c&#39;, Buffer.from(&#39;31&#39;))
  .append(&#39;d&#39;, JSON.stringify({}), &#39;any.json&#39;)
  .append(&#39;e&#39;, require(&#39;fs&#39;).readFileSync(&#39;/path/your/file.jpg&#39;), &#39;file.jpg&#39;)
  .getBuffer()</code></pre>
</dd>
</dl>

### Members

<dl>
<dt><a href="#mimeTypes">mimeTypes</a> : <code>Object.&lt;string, string&gt;</code></dt>
<dd><p>built-in mime-type mapping</p>
</dd>
<dt><a href="#dashDash">dashDash</a> : <code>Buffer</code></dt>
<dd></dd>
<dt><a href="#boundary">boundary</a> : <code>Buffer</code></dt>
<dd></dd>
<dt><a href="#CRLF">CRLF</a> : <code>Buffer</code></dt>
<dd></dd>
<dt><a href="#data">data</a> : <code>array.&lt;Buffer&gt;</code></dt>
<dd><p>The Form&#39;s data storage</p>
</dd>
<dt><a href="#indices">indices</a> : <code>Object.&lt;string, number&gt;</code></dt>
<dd><p>The entities&#39; value indices whose were in <code>this.data</code></p>
</dd>
</dl>

<a name="Form"></a>

### Form
Simple and lite of `multipart/form-data` implementation, most similar to `form-data`

```js
(new Form)
  .append('a', 1)
  .append('b', '2')
  .append('c', Buffer.from('31'))
  .append('d', JSON.stringify({}), 'any.json')
  .append('e', require('fs').readFileSync('/path/your/file.jpg'), 'file.jpg')
  .getBuffer()
```

**Kind**: global class

* [Form](#Form)
    * [new Form()](#new_Form_new)
    * [.getBuffer()](#Form+getBuffer) ⇒ <code>Buffer</code>
    * [.getHeaders()](#Form+getHeaders) ⇒ <code>Object.&lt;string, string&gt;</code>
    * [.appendMimeTypes(things)](#Form+appendMimeTypes) ⇒ [<code>Form</code>](#Form)
    * [.append(field, value, [filename])](#Form+append) ⇒ [<code>Form</code>](#Form)

<a name="new_Form_new"></a>

#### new Form()
Create a `multipart/form-data` buffer container for the file uploading.

<a name="Form+getBuffer"></a>

#### form.getBuffer() ⇒ <code>Buffer</code>
To retrieve the `data` buffer

**Kind**: instance method of [<code>Form</code>](#Form)
**Returns**: <code>Buffer</code> - - The payload buffer
<a name="Form+getHeaders"></a>

#### form.getHeaders() ⇒ <code>Object.&lt;string, string&gt;</code>
To retrieve the `Content-Type` multipart/form-data header

**Kind**: instance method of [<code>Form</code>](#Form)
**Returns**: <code>Object.&lt;string, string&gt;</code> - - The `Content-Type` header With `this.boundary`
<a name="Form+appendMimeTypes"></a>

#### form.appendMimeTypes(things) ⇒ [<code>Form</code>](#Form)
Append a customized mime-type(s)

**Kind**: instance method of [<code>Form</code>](#Form)
**Returns**: [<code>Form</code>](#Form) - - The `Form` class instance self

| Param | Type | Description |
| --- | --- | --- |
| things | <code>Object.&lt;string, string&gt;</code> | The mime-type |

<a name="Form+append"></a>

#### form.append(field, value, [filename]) ⇒ [<code>Form</code>](#Form)
Append data wrapped by `boundary`

**Kind**: instance method of [<code>Form</code>](#Form)
**Returns**: [<code>Form</code>](#Form) - - The `Form` class instance self

| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | The field |
| value | <code>string</code> \| <code>Buffer</code> | The value |
| [filename] | <code>String</code> | Optional filename, when provided, then append the `Content-Type` after of the `Content-Disposition` |

<a name="mimeTypes"></a>

### mimeTypes : <code>Object.&lt;string, string&gt;</code>
built-in mime-type mapping

**Kind**: global variable
<a name="dashDash"></a>

### dashDash : <code>Buffer</code>
**Kind**: global variable
<a name="boundary"></a>

### boundary : <code>Buffer</code>
**Kind**: global variable
<a name="CRLF"></a>

### CRLF : <code>Buffer</code>
**Kind**: global variable
<a name="data"></a>

### data : <code>array.&lt;Buffer&gt;</code>
The Form's data storage

**Kind**: global variable
<a name="indices"></a>

### indices : <code>Object.&lt;string, number&gt;</code>
The entities' value indices whose were in `this.data`

**Kind**: global variable
<a name="Formatter"></a>

### Formatter
Provides easy used methods using in this project.

**Kind**: global class

* [Formatter](#Formatter)
    * [new Formatter()](#new_Formatter_new)
    * [.ksort(thing)](#Formatter.ksort) ⇒ <code>object</code>
    * [.queryStringLike(thing)](#Formatter.queryStringLike) ⇒ <code>string</code>
    * [.localeDateTime([when], [timeZone])](#Formatter.localeDateTime) ⇒ <code>string</code>
    * [.fromJsonLike(source, [placeholder])](#Formatter.fromJsonLike) ⇒ <code>object</code>
    * [.isLeapYear(numeric)](#Formatter.isLeapYear) ⇒ <code>boolean</code>
    * [.page(options)](#Formatter.page) ⇒ <code>object</code>

<a name="new_Formatter_new"></a>

#### new Formatter()
To prevent `new` operation, works only as static class.

<a name="Formatter.ksort"></a>

#### Formatter.ksort(thing) ⇒ <code>object</code>
Sorts an Object by key.

**Kind**: static method of [<code>Formatter</code>](#Formatter)
**Returns**: <code>object</code> - - The sorted object.

| Param | Type | Description |
| --- | --- | --- |
| thing | <code>object</code> \| <code>URLSearchParams</code> | The input plain or URLSearchParams object. |

<a name="Formatter.queryStringLike"></a>

#### Formatter.queryStringLike(thing) ⇒ <code>string</code>
Like `queryString` does but without the `sign` and `empty value` entities.

**Kind**: static method of [<code>Formatter</code>](#Formatter)
**Returns**: <code>string</code> - - The sorted object.

| Param | Type | Description |
| --- | --- | --- |
| thing | <code>object</code> | The input object. |

<a name="Formatter.localeDateTime"></a>

#### Formatter.localeDateTime([when], [timeZone]) ⇒ <code>string</code>
Retrieve the current `yyyy-MM-dd HH:mm:ss` date time based on given `timeZone`.

Notes: NodeJS v10.15.3,v12.18.0,v14.5.0 had strange behavior on `Intl.DateTimeFormat`, see `hourCycle:h23` comments below:

**Kind**: static method of [<code>Formatter</code>](#Formatter)
**Returns**: <code>string</code> - - `yyyy-MM-dd HH:mm:ss` date time string

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [when] | <code>string</code> \| <code>number</code> \| <code>Date</code> |  | Any available inputs refer to the `Date() constructor`, default `Date.now()`. |
| [timeZone] | <code>string</code> | <code>&quot;Asia/Shanghai&quot;</code> | Any available inputs refer to the options in `Intl.DateTimeFormat`, default `Asia/Shanghai`. |

<a name="Formatter.fromJsonLike"></a>

#### Formatter.fromJsonLike(source, [placeholder]) ⇒ <code>object</code>
Parse the `source` with given `placeholder`.

**Kind**: static method of [<code>Formatter</code>](#Formatter)
**Returns**: <code>object</code> - - `{ident, payload, sign}` object

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| source | <code>string</code> |  | The inputs string. |
| [placeholder] | <code>string</code> | `(?<ident>[a-z](?:[a-z_])+)_response` | The payload pattern. |

<a name="Formatter.isLeapYear"></a>

#### Formatter.isLeapYear(numeric) ⇒ <code>boolean</code>
Check the given `numeric` input whether or nor the leap year.

**Kind**: static method of [<code>Formatter</code>](#Formatter)
**Returns**: <code>boolean</code> - - `True` means is leap year, otherwise NOT.

| Param | Type | Description |
| --- | --- | --- |
| numeric | <code>number</code> | The inputs number. |

<a name="Formatter.page"></a>

#### Formatter.page(options) ⇒ <code>object</code>
Translate the inputs for the page service, such as `alipay.trade.page.pay`, `alipay.trade.wap.pay` OpenAPI methods.

- Available since v0.0.9

**Kind**: static method of [<code>Formatter</code>](#Formatter)
**Returns**: <code>object</code> - - Minimal following the `AxiosResponse` specification, returns `{data, toJSON(), toString()}` object

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The inputs |
| options.baseURL | <code>string</code> | The OpenAPI gateway URL |
| options.method | <code>string</code> | The HTTP method, should be `get` or `post`, default is `post` |
| options.params | <code>object</code> | The gernal paramters object, including `method`, `version`, `charset`, `sign_type`, `format` etc. |
| options.params.method | <code>string</code> | The OpenAPI's `method`, should be `alipay.trade.page.pay` etc. |
| options.params.version | <code>string</code> | The OpenAPI's `version`, default is `1.0` |
| options.params.charset | <code>string</code> | The OpenAPI's `charset`, default is `utf-8` |
| options.params.format | <code>string</code> | The OpenAPI's `format`, default is `JSON` |
| options.params.sign_type | <code>string</code> | The OpenAPI's `sign_type`, default is `RSA2` |
| options.data | <code>URLSearchParams</code> | The `biz_content` and `sign` contents |
| options.data.biz_content | <code>string</code> | The OpenAPI's `biz_content`, json string |
| options.data.sign | <code>string</code> | The OpenAPI's `sign`, base64 encoded string dependent on the `options.params.sign_type` |

<a name="Helpers"></a>

### Helpers
Provide some useful functions for the catificate(s)

**Kind**: global class

* [Helpers](#Helpers)
    * [new Helpers()](#new_Helpers_new)
    * [.LF](#Helpers.LF)
    * [.OIDs](#Helpers.OIDs)
    * [.md5(...things)](#Helpers.md5) ⇒ <code>string</code>
    * [.wordwrap(str, [width], [char])](#Helpers.wordwrap) ⇒ <code>string</code>
    * [.load(thing, [pattern])](#Helpers.load) ⇒ <code>array.&lt;Certificate&gt;</code>
    * [.extract(thing, [pattern])](#Helpers.extract) ⇒ <code>string</code>
    * [.SN(thing, [pattern])](#Helpers.SN) ⇒ <code>string</code>

<a name="new_Helpers_new"></a>

#### new Helpers()
To prevent `new` operation, works only as static class.

<a name="Helpers.LF"></a>

#### Helpers.LF
**Kind**: static property of [<code>Helpers</code>](#Helpers)
**Propertiy**: LF - The line feed character
<a name="Helpers.OIDs"></a>

#### Helpers.OIDs
**Kind**: static property of [<code>Helpers</code>](#Helpers)
**Propertiy**: OIDs - Built-in ASN.1 OIDs
<a name="Helpers.md5"></a>

#### Helpers.md5(...things) ⇒ <code>string</code>
MD5 hash function

**Kind**: static method of [<code>Helpers</code>](#Helpers)
**Returns**: <code>string</code> - - The digest string

| Param | Type | Description |
| --- | --- | --- |
| ...things | <code>string</code> \| <code>Buffer</code> \| <code>BufferView</code> | To caculating things |

<a name="Helpers.wordwrap"></a>

#### Helpers.wordwrap(str, [width], [char]) ⇒ <code>string</code>
Similar to require('wordwrap') function for formatting the PEM certificate

**Kind**: static method of [<code>Helpers</code>](#Helpers)
**Returns**: <code>string</code> - - The wrapped string

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| str | <code>string</code> |  | The input string |
| [width] | <code>number</code> | <code>64</code> | The wrapping width, default is 64 |
| [char] | <code>string</code> |  | The wrapping character, default is `this.LF` |

<a name="Helpers.load"></a>

#### Helpers.load(thing, [pattern]) ⇒ <code>array.&lt;Certificate&gt;</code>
Mapping to `@fidm/x509`.Certificate.fromPEMs

**Kind**: static method of [<code>Helpers</code>](#Helpers)
**Returns**: <code>array.&lt;Certificate&gt;</code> - - Array of the `@fidm/x509`.Certificate instance

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| thing | <code>string</code> \| <code>Buffer</code> |  | The certificatie(s) file path or Buffer |
| [pattern] | <code>string</code> | <code>&quot;.&quot;</code> | The signatureAlgorithm matching pattern, default is dot(`.`) for all |

<a name="Helpers.extract"></a>

#### Helpers.extract(thing, [pattern]) ⇒ <code>string</code>
Extract a certificate from given `thing`

**Kind**: static method of [<code>Helpers</code>](#Helpers)
**Returns**: <code>string</code> - - The pem format certificate(s)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| thing | <code>string</code> \| <code>Buffer</code> |  | The certificatie(s) file path or Buffer |
| [pattern] | <code>string</code> | <code>&quot;sha256&quot;</code> | The algo prefix or suffix, default is `sha256` prefix |

<a name="Helpers.SN"></a>

#### Helpers.SN(thing, [pattern]) ⇒ <code>string</code>
Calculate the given certificate(s) `SN` value string

Note: The primitive `BigInt` was shipped since nodejs v10.8.0, we're >= 10.15.0 on safety.

**Kind**: static method of [<code>Helpers</code>](#Helpers)
**Returns**: <code>string</code> - - The SN value string

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| thing | <code>string</code> \| <code>Buffer</code> |  | The certificatie(s) file path or Buffer |
| [pattern] | <code>string</code> | <code>&quot;sha256&quot;</code> | The algo prefix or suffix, default is `sha256` prefix |

<a name="Rsa"></a>

### Rsa
Provides sign/verify for the RSA `sha1WithRSAEncryption` RSA2 `sha256WithRSAEncryption` cryptos.

**Kind**: global class

* [Rsa](#Rsa)
    * [new Rsa()](#new_Rsa_new)
    * [.base64](#Rsa.base64)
    * [.ALGO_TYPE_RSA](#Rsa.ALGO_TYPE_RSA)
    * [.ALGO_TYPE_RSA2](#Rsa.ALGO_TYPE_RSA2)
    * [.sign(message, privateKeyCertificate, [type])](#Rsa.sign) ⇒ <code>string</code>
    * [.verify(message, signature, publicCertificate, [type])](#Rsa.verify) ⇒ <code>boolean</code>

<a name="new_Rsa_new"></a>

#### new Rsa()
To prevent `new` operation, works only as static class.

<a name="Rsa.base64"></a>

#### Rsa.base64
**Kind**: static property of [<code>Rsa</code>](#Rsa)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| base64 | <code>string</code> | Alias of `base64` string |

<a name="Rsa.ALGO_TYPE_RSA"></a>

#### Rsa.ALGO\_TYPE\_RSA
**Kind**: static property of [<code>Rsa</code>](#Rsa)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ALGO_TYPE_RSA | <code>string</code> | Alias of `sha1WithRSAEncryption` string |

<a name="Rsa.ALGO_TYPE_RSA2"></a>

#### Rsa.ALGO\_TYPE\_RSA2
**Kind**: static property of [<code>Rsa</code>](#Rsa)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ALGO_TYPE_RSA2 | <code>string</code> | Alias of `sha256WithRSAEncryption` string |

<a name="Rsa.sign"></a>

#### Rsa.sign(message, privateKeyCertificate, [type]) ⇒ <code>string</code>
Creates and returns a `Sign` string that uses given `type=RSA|RSA2`.

**Kind**: static method of [<code>Rsa</code>](#Rsa)
**Returns**: <code>string</code> - Base64-encoded signature.

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Content will be `crypto.Sign`. |
| privateKeyCertificate | <code>string</code> \| <code>Buffer</code> | A PEM encoded private key certificate. |
| [type] | <code>string</code> | one of the algo alias RSA/RSA2, default is `RSA2`. |

<a name="Rsa.verify"></a>

#### Rsa.verify(message, signature, publicCertificate, [type]) ⇒ <code>boolean</code>
Verifying the `message` with given `signature` string that uses given `type=RSA|RSA2`.

**Kind**: static method of [<code>Rsa</code>](#Rsa)
**Returns**: <code>boolean</code> - True is passed, false is failed.

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Content will be `crypto.Verify`. |
| signature | <code>string</code> | The base64-encoded ciphertext. |
| publicCertificate | <code>string</code> \| <code>Buffer</code> | A PEM encoded public certificate. |
| [type] | <code>string</code> | one of the algo alias RSA/RSA2, default is `RSA2`. |


## Unit Test

`npm test`

To disable `nock` and request with the real gateway, just `NOCK_OFF=true npm test`

## Changelog

- v0.1.1
  - 输出 `Helpers` 为本模块基础类之一；
  - 优化 `Helpers.SN` 方法，兼容多`DN`属性情况；
  - 优化 `Formatter.localeDateTime` 方法，使用 `String.padStart` 计算 `h23` 小时；
  - 优化文档及测试用例覆盖；

- v0.1.0
  - 调整 `同步应答验签` 逻辑，遵从本SDK约定，只要能从应答返回中解析出有效负载，即仅返回负载；
  - 新增 `异步通知消息` 验签文档示例函数；
  - 暂时不支持`ts`，相关问题 #4；
  - `npm install --no-optional`(>5.8.0)不起作用，不再可选依赖 `form-data`，以内置 `Form` 类为主；

- v0.0.11 新增 `whatsCli` `cli.js` 命令行交互工具

- v0.0.10 优化 `Formatter.page().data.html`, 重点兼容`utf8`

- v0.0.9 新增 `Formatter.page` 函数，支持`page`类接口调用(以第三入参回调)

- v0.0.8 完善 `API` 文档 by `jsdoc2md`

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
