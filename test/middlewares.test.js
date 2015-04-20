'use strict';

var sinon = require('sinon')
  , request = require('request')
  , assert = require('assert')
  , logger = require('../lib/logger')
;

describe('middleware', function() {
  it('api', function(done) {
    sinon
      .stub(request, 'post')
      .yields(null, {statusCode: 200}, 'STORED;')
    ;
    sinon
      .stub(logger)
    ;

    var middleware = require('../lib/middleware.api');
    middleware(
      {
        api: 'testapi'
        , json: {from: 'from@ehlo.io'}
      }
      , {}
      , function apiCallback() {
        assert.strictEqual(request.post.callCount, 1);
        var args = request.post.args[0][0];
        assert.strictEqual(args.url, 'testapi');
        assert.strictEqual(
          args.formData.mail
          , JSON.stringify({from: 'from@ehlo.io'})
        );

        request
          .post
          .restore()
        ;
        done();
      }
    );
  });

  it('parse', function(done) {
    var middleware = require('../lib/middleware.parse')
      , mail = {};
    mail.raw = require('fs').readFileSync('./test/fixtures/mail1.eml');
    middleware(mail, {}, function parseCallback() {
      assert.strictEqual(mail.json.text, 'Hello !\n');
      assert.strictEqual(mail.json.headers.from, 'from@ehlo.io');
      assert.strictEqual(mail.json.headers.to, 'to@ehlo.io');
      assert.strictEqual(mail.json.headers['message-id'], '<UUID@EHLO.IO>');
      assert.strictEqual(mail.json.messageId, 'UUID@EHLO.IO');
      assert.strictEqual(mail.json.headers.subject, 'SAMPLE');
      assert.strictEqual(mail.json.subject, 'SAMPLE');
      assert.strictEqual(mail.json.priority, 'normal');
      assert.strictEqual(mail.json.from[0].address, 'from@ehlo.io');
      assert.strictEqual(mail.json.from[0].name, '');
      assert.strictEqual(mail.json.to[0].address, 'to@ehlo.io');
      assert.strictEqual(mail.json.to[0].name, '');
      done();
    });
  });

  it('smtp return 250', function(done) {
    var middleware = require('../lib/middleware.smtp.250');
    middleware(
      {}
      , {
        send: function() {
          done();
        }
      }
    );
  });

  it('smtp return 550', function(done) {
    var middleware = require('../lib/middleware.smtp.550');
    middleware(
      {}
      , {
        send: function(code, message) {
          assert.strictEqual(code, 550);
          assert.equal(message, 'Mailbox unavailable');
          done();
        }
      }
    );
  });

});
