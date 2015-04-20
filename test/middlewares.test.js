'use strict';

var sinon = require('sinon')
  , request = require('request')
  , assert = require('assert')
;

describe('middleware', function() {
  it('api', function(done) {
    sinon
      .stub(request, 'post')
      .yields(null, {statusCode: 200}, 'STORED;')
    ;

    var middleware = require('../lib/middleware.api');
    middleware({api: 'testapi', json: {from: 'from@ehlo.io'}}, {}, function() {
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
    });
  });
});
