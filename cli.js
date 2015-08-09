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
  .option('-s, --save [path]', 'Save email in a json file')
  .option('-d, --debug', 'Enable SMTP debug')
  .parse(process.argv)
;

logger.transports.console.level = 'verbose';
if (program.debug) {
  logger.transports.console.level = 'debug';
}

var ehlo = new Ehlo({port: program.port});
ehlo
  .use(require('./lib/middleware/parse')())
  .use(require('./lib/middleware/size')())
  .use(function(mail, smtp, next) {
    logger.info(
      '[%s] Ip [%s] send new mail (%s)'
      , smtp.session.id
      , smtp.session.remoteAddress
      , mail.size
    );
    logger.info(
      '[%s] Mail from [%s] to [%s]'
      , smtp.session.id
      , smtp.session.envelope.mailFrom.address || 'unknow'
      , smtp.session.envelope.rcptTo[0].address || 'unknow'
    );

    return next();
  })
;

if (program.save) {
  ehlo
    .use(function(mail, smtp, next) {
      require('fs')
        .writeFile(
          program.save + smtp.session.id + '.json'
          , JSON.stringify(mail.json, null, '  ')
          , function(errWrite) {
            if (errWrite) {
              logger.error(errWrite);
              return next();
            }
            logger.info(
              '[%s] Mail json stored in [%s]'
              , smtp.session.id
              , program.save + smtp.session.id + '.json'
            );

            return next();
          }
        );
    })
  ;
}

if (program.api) {
  ehlo
    .use(function(mail, smtp, next) {
      mail.api = program.api;

      return next();
    })
    .use(require('./lib/middleware/api')())
  ;
}

ehlo
  .use(require('./lib/middleware/smtp')(250))
  .start()
;

process.on('SIGINT', function() {
  ehlo.stop();
  process.exit();
});
