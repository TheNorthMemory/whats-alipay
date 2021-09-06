# 变更历史

## v0.1.5 2021-09-06

- 安全更新，升级依赖的Axios>=0.21.1，相关见[这里](https://github.com/axios/axios/issues/3979);

## v0.1.4 2021-08-03

- 新增 `Rsa.fromPkcs1`, `Rsa.fromPkcs8`, `Rsa.fromSpki` 静态方法加载`私钥`/`公钥`语法糖；
- 调整 `Form` 类为 `Multipart` 类，完整实现[MDN FormData](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData)，同步支持流动模式上传文件;

## v0.1.3 2021-08-02

- 新增 `Rsa.from` 静态方法加载`私钥`/`公钥`，语法糖对应为 `private.pkcs[1|8]://` + '字符串' 或者 `public.[spki|pkcs1]://` + '字符串'；
- 标记 `config.publicCert` 为不推荐初始化入参，使用 `config.publicKey` 替代;

## v0.1.2 2021-01-06

- 依赖 `Axios` 升级至 `>=0.21.1`，相关 `CVE-2020-28168`；

## v0.1.1 2020-11-15

- 输出 `Helpers` 为本模块基础类之一；
- 优化 `Helpers.SN` 方法，兼容多`DN`属性情况；
- 优化 `Formatter.localeDateTime` 方法，使用 `String.padStart` 计算 `h23` 小时；
- 优化文档及测试用例覆盖；

## v0.1.0 2020-10-21

- 调整 `同步应答验签` 逻辑，遵从本SDK约定，只要能从应答返回中解析出有效负载，即仅返回负载；
- 新增 `异步通知消息` 验签文档示例函数；
- 暂时不支持`ts`，相关问题 #4；
- `npm install --no-optional`(>5.8.0)不起作用，不再可选依赖 `form-data`，以内置 `Form` 类为主；

## v0.0.11 2020-10-20

- 新增 `whatsCli` `cli.js` 命令行交互工具

## v0.0.10 2020-10-18

- 优化 `Formatter.page().data.html`, 重点兼容`utf8`

## v0.0.9 2020-10-14

- 新增 `Formatter.page` 函数，支持`page`类接口调用(以第三入参回调)

## v0.0.8 2020-10-10

- 完善 `API` 文档 by `jsdoc2md`

## v0.0.7 2020-10-08

- 新增 `Helpers` 类及 `certHelper` 命令行工具集

## v0.0.6 2020-10-06

- 新增 `Form` 类，缩减并兼容 `form-data`

## v0.0.5 2020-10-05

- 向下兼容 `NodeJS` >= 10.15.0

## v0.0.4 2020-10-04

- 向下兼容 `Axios` >= 0.19.0

## v0.0.3 2020-09-30

- 增加测试用例及BUG修复

## v0.0.2 2020-09-26

- 重新发布版本

## v0.0.1

- 初始版本
