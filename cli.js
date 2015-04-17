#!/usr/bin/env node
'use strict';

var ehlo = require('./ehlo.js');
ehlo
  .use(require('./lib/middleware.parse'))
  .use(require('./lib/middleware.smtp.250'))
  .start()
;

process.on('SIGINT', function() {
  ehlo.stop();
  process.exit();
});
