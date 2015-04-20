'use strict';

var assert = require('assert')
  , fs = require('fs')
  , SMTPConnection = require('smtp-connection')
  , ehlo = require('../ehlo')
  , port = 10026
;

describe('ehlo', function() {
  after(function(done) {
    // ehlo.stop();
    done();
  });
  it('ehlo.start', function(done) {
    ehlo
      .use(function(mail, smtp, next) {
        console.log('received mail');
        console.log(mail.raw.toString());
        console.log(
          fs.readFileSync('./test/fixtures/mail1.eml').toString()
        );
        assert.equal(
          mail.raw.toString().replace(/\r\n/g, '\n') + '\n'
          , fs.readFileSync('./test/fixtures/mail1.eml').toString()
        );

        done();
      })
      .start({port: port});
    var connection = new SMTPConnection({
      port: port
    });
    connection.connect(function(err) {
      assert.strictEqual(err, undefined);
      connection.send(
        {
          from: 'sender@ehlo.io'
          , to: 'to@ehlo.io'
        }
        , fs.readFileSync('./test/fixtures/mail1.eml')
        , function(error) {
          assert.strictEqual(error, undefined);
        }
      );
    });
  });
});
