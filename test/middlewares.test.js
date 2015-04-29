'use strict';

var sinon = require('sinon')
  , request = require('request')
  , assert = require('assert')
  , logger = require('../lib/logger')
;

describe('middleware', function() {
  before(function() {
    sinon.stub(logger, 'info');
    sinon.stub(logger, 'verbose');
    sinon.stub(logger, 'debug');
    sinon.stub(logger, 'warn');
    sinon.stub(logger, 'error');
  });
  after(function() {
    logger.info.restore();
    logger.debug.restore();
    logger.verbose.restore();
    logger.warn.restore();
    logger.error.restore();
  });

  it('api', function(done) {
    sinon
      .stub(request, 'post')
      .yields(null, {statusCode: 200}, 'STORED;')
    ;

    var middleware = require('../lib/middleware.api');
    middleware(
      {
        api: 'testapi'
        , json: {from: 'from@ehlo.io'}
      }
      , {session: {id: 'test'}}
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

  it('api with return code 500', function(done) {
    sinon
      .stub(request, 'post')
      .yields(null, {statusCode: 500}, 'STORED;')
    ;

    var middleware = require('../lib/middleware.api');
    middleware(
      {
        api: 'testapi'
        , json: {from: 'from@ehlo.io'}
      }
      , {
        session: {id: 'test'}
        , send: function(code, message) {
          assert.strictEqual(request.post.callCount, 1);
          assert.strictEqual(code, 421);
          assert.strictEqual(message, 'Try again later');
          request
            .post
            .restore()
          ;
          done();
        }
      }
      , function apiCallback() {}
    );
  });

  it('api with return code 403', function(done) {
    sinon
      .stub(request, 'post')
      .yields(null, {statusCode: 500}, 'STORED;')
    ;

    var middleware = require('../lib/middleware.api');
    middleware(
      {
        api: 'testapi'
        , json: {from: 'from@ehlo.io'}
      }
      , {
        session: {id: 'test'}
        , send: function(code, message) {
          assert.strictEqual(request.post.callCount, 1);
          assert.strictEqual(code, 421);
          assert.strictEqual(message, 'Try again later');
          request
            .post
            .restore()
          ;
          done();
        }
      }
      , function apiCallback() {}
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
        session: {id: 'test'}
        , send: function() {
          done();
        }
      }
    );
  });

  it('smtp return 421', function(done) {
    var middleware = require('../lib/middleware.smtp.421');
    middleware(
      {}
      , {
        session: {id: 'test'}
        , send: function(code, message) {
          assert.strictEqual(code, 421);
          assert.equal(message, 'Try again later');
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
        session: {id: 'test'}
        , send: function(code, message) {
          assert.strictEqual(code, 550);
          assert.equal(message, 'Mailbox unavailable');
          done();
        }
      }
    );
  });

  it('compute empty mail size', function(done) {
    var middleware = require('../lib/middleware.size')
      , mail = {raw: ''}
    ;
    middleware(
      mail
      , {}
      , function sizeCallback() {
        assert.strictEqual(mail.size, '0B');
        done();
      }
    );
  });

  it('compute mail size', function(done) {
    var middleware = require('../lib/middleware.size')
      , mail = {}
    ;
    mail.raw = require('fs').readFileSync('./test/fixtures/mail1.eml');
    middleware(
      mail
      , {}
      , function sizeCallback() {
        assert.strictEqual(mail.size, '86B');
        done();
      }
    );
  });
});
