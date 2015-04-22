#!/usr/bin/env node
'use strict';

var Ehlo = require('./ehlo.js')
  , program = require('commander')
  , logger = require('./lib/logger')
  , pkg = require('./package.json')
;


process.argv[1] = 'ehlo';
program
  .version(pkg.version)
  .option(
    '-p, --port <n>'
    , 'The port to bind the smtp on. Default to 10025'
    , parseInt
  )
  .option('-a, --api [url]', 'The url to post emails')
  .option('-d, --debug', 'Enable SMTP debug')
  .parse(process.argv)
;

logger.transports.console.level = 'verbose';
if (program.debug) {
  logger.transports.console.level = 'debug';
}

var ehlo = new Ehlo({port: program.port});
ehlo.use(require('./lib/middleware.parse'));

if (program.api) {
  ehlo
    .use(function(mail, smtp, next) {
      mail.api = program.api;
      next();
    })
    .use(require('./lib/middleware.api'))
  ;
}

ehlo
  .use(require('./lib/middleware.smtp.250'))
  .start()
;

process.on('SIGINT', function() {
  ehlo.stop();
  process.exit();
});
