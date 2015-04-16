#!/usr/bin/env node
'use strict';

var ehlo = require('./ehlo.js');
ehlo.start();

process.on('SIGINT', function() {
  ehlo.stop();
  process.exit();
});
