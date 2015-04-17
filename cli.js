#!/usr/bin/env node
'use strict';

var ehlo = require('./ehlo.js')
  , program = require('commander')
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
  .parse(process.argv)
;


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
  .start({
    port: program.port || 10025
  })
;

process.on('SIGINT', function() {
  ehlo.stop();
  process.exit();
});
