'use strict';

var assert = require('assert')
  , fs = require('fs')
  , SMTPConnection = require('smtp-connection')
  , Ehlo = require('../ehlo')
  , port = 10026
;

function sendMailFixture1(response, callback) {
  var connection = new SMTPConnection({
      port: port
    })
  ;
  console.log('trying port : [' + port + ']');
  callback = callback || function() {};
  connection.connect(function(err) {
    assert.strictEqual(err, undefined);
    connection.send(
      {
        from: 'sender@ehlo.io'
        , to: 'to@ehlo.io'
      }
      , fs.readFileSync('./test/fixtures/mail1.eml')
      , function(error, info) {
        assert.strictEqual(error, null);
        if (info) {
          connection.quit();
          callback();
        }
      }
    );
  });
}

describe('ehlo', function() {
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
