'use strict';

var assert = require('assert')
  , fs = require('fs')
  , SMTPConnection = require('smtp-connection')
  , Ehlo = require('../ehlo')
  , port = 10026
  , sinon = require('sinon')
  , logger = require('../lib/logger')
;


function sendMailFixture1(response, callback) {
  var connection = new SMTPConnection({
      port: port
    })
  ;
  callback = callback || function() {};
  response = response || 250;
  connection.connect(function(err) {
    assert.strictEqual(err, undefined);
    connection.send(
      {
        from: 'sender@ehlo.io'
        , to: 'to@ehlo.io'
      }
      , fs.readFileSync('./test/fixtures/mail1.eml')
      , function(error, info) {
        if (response === 250) {
          assert.strictEqual(error, null);
        } else {
          assert.strictEqual(error.responseCode, response);
        }
        if (info) {
          if (response) {
            assert.equal(response, info.response.substring(0, 3));
          }
        }
        connection.quit();
        callback();
      }
    );
  });
}

describe('ehlo', function() {
  before(function() {
    sinon.stub(logger, 'info');
    sinon.stub(logger, 'verbose');
    sinon.stub(logger, 'debug');
  });
  after(function() {
    logger.info.restore();
    logger.debug.restore();
    logger.verbose.restore();
  });
  it('ehlo.start', function(done) {
    var ehlo = new Ehlo({port: port});
    ehlo
      .use(function(mail, smtp) {
        assert.equal(
          mail.raw.toString().replace(/\r\n/g, '\n') + '\n'
          , fs.readFileSync('./test/fixtures/mail1.eml').toString()
        );

        smtp.send(250);

        ehlo.stop(done);
      })
      .start()
    ;
    sendMailFixture1();
  });

  it('ehlo.start without middleware', function(done) {
    port++;
    var ehlo = new Ehlo({port: port});
    ehlo.on('error', function(err) {
      assert.equal(err, 'No middleware matching');
      ehlo.stop();
      done();
    });
    ehlo.start();
    sendMailFixture1();
  });

  it('ehlo.start with smtp empty middleware', function(done) {
    port++;
    var ehlo = new Ehlo({port: port});
    ehlo
      .use(
        function(mail, smtp) {
          smtp.send();
        }
      )
      .start();
    sendMailFixture1(250, function() {
      ehlo.stop(done);
    });
  });

  it('ehlo.start with smtp 550 middleware', function(done) {
    port++;
    var ehlo = new Ehlo({port: port});
    ehlo
      .use(
        function(mail, smtp) {
          smtp.send(550);
        }
      )
      .start();
    sendMailFixture1(550, function() {
      ehlo.stop(done);
    });
  });

  it('ehlo.use with string middleware', function(done) {
    var ehlo = new Ehlo();
    assert.throws(
      function() {
        ehlo.use('string test');
      }
      , TypeError
    );
    done();
  });
});
