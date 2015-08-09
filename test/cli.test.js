'use strict';

var exec = require('child_process').exec
  , assert = require('assert')
  , os = require('os')
  , bin = './cli.js'
;

describe('cli', function() {
  it('should display help', function(done) {
    exec(bin + ' --help', function(error, stdout, stderr) {
      assert.equal(error, null);
      assert.equal(stderr, '');
      assert.equal(
        stdout
        , [
          ,'  Usage: ehlo [options]'
          , ''
          , '  Options:'
          , ''
          , '    -h, --help         output usage information'
          , '    -V, --version      output the version number'
          , '    -p, --port <n>     The port to bind the smtp on. Default to 10025'
          , '    -a, --api [url]    The url to post emails'
          , '    -s, --save [path]  Save email in a json file'
          , '    -d, --debug        Enable SMTP debug'
          , ''
          , ''
        ].join(os.EOL)
      );
      done();
    });
  });
});
