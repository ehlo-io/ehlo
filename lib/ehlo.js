'use strict';

var SMTPServer = require('smtp-server').SMTPServer
  , streamToBuffer = require('stream-to-buffer')
  , ehlo = {}
;


ehlo.stack = [];

ehlo.start = function start(options) {
  options = options || {};
  options.port = options.port || 10025;
  this.options = options;
  console.log('Starting ehlo');
  this.smtp = new SMTPServer({
    banner: 'Welcome to Ehlo SMTP Server'
    , disabledCommands: ['STARTTLS', 'AUTH']
    , onData: function(stream, session, res) {
      streamToBuffer(stream, function(err, buffer) {
        if (err) {
          console.log(err);
        }

        ehlo.process(buffer, res);
      });
    }
    , onMailFrom: function(address, session, callback) {
      callback();
    }
    , onRcptTo: function(address, session, callback) {
      callback();
    }
  });

  this.smtp.listen(
    this.options.port
    , function() {
      console.log('Listening on port [' + ehlo.options.port + ']');
    }
  );
};

ehlo.process = function process(buffer, smtpCallback) {
  var idx = 0
    , mail = {}
    , stack = this.stack
    , end = false
  ;
  mail.raw = buffer;

  var smtp = {};
  smtp.send = function smtpSend(code, message) {
    end = true;
    code = code || 250;
    if (code === 250) {
      return smtpCallback(null);
    }
    return smtpCallback({responseCode: code, message: message});
  };

  var next = function next() {
    if (idx > stack.length) {
      throw new Error('No middleware matching');
    }

    var middleware = stack[idx++];
    middleware(mail, smtp, next);
    if (end) {
      return;
    }
  };

  console.log('Ehlo processing middlewares');
  next();
};

ehlo.use = function use(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('Use only accept function');
  }
  this.stack.push(fn);

  return this;
};

ehlo.stop = function stop(callback) {
  console.log('Stopping ehlo');
  this.smtp.close(callback);
};

ehlo.buildShortId = function() {
  return Math.floor(
    Math.random() * 10
  ) + parseInt(
    (new Date()).getTime()
  ).toString(36);
};

module.exports = ehlo;
