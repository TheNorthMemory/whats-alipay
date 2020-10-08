#!/usr/bin/env node
const yargs = require('yargs')

const argv = yargs
  .usage('Usage: $0 [command] [options]')
  .command(['SN', '$0'], 'get `SN`')
  .command('extract', 'extract cert')
  .alias('f', 'file')
  .nargs('f', 1)
  .describe('f', 'Load a file')
  .demandOption(['f'])
  .alias('p', 'pattern')
  .describe('p', 'the algo prefix or suffix, dot(.) for all')
  .help('h')
  .alias('h', 'help')
  .version()
  .alias('V', 'version')
  .wrap(yargs.terminalWidth())
  .example([
    ['$0 SN -f alipayRootCert.crt', 'get the `sha256`(default) certificate `SN`'],
    ['$0 SN -f alipayRootCert.crt -p ec', 'get the signatureAlgorithm whose contains `ec` words certificate `SN`'],
    ['$0 SN -f alipayRootCert.crt -p .', 'get all chained certificate(s) `SN`'],
    ['$0 extract -f alipayRootCert.crt', 'extract the `sha256`(default) certificate'],
    ['$0 extract -f alipayRootCert.crt -p sha1', 'extract the `sha1` certificate'],
    ['$0 extract -f alipayRootCert.crt -p .', 'extract all chained certificate(s)'],
    ['$0 extract -f alipayRootCert.crt -p sha1 | openssl x509 -noout -text', 'piped openssl x509 command'],
    ['$0 extract -f alipayRootCert.crt -p sha1 > tmp.pem', 'save to a file'],
  ])
  .argv

const Helpers = require('../lib/helpers')
const {_: [cmd = 'SN'], file, pattern} = argv

console.log(Helpers[cmd](file, pattern))