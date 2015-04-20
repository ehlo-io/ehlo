'use strict';

var SMTPServer = require('smtp-server').SMTPServer
  , streamToBuffer = require('stream-to-buffer')
;

function ehlo(options) {
  this.stack = [];
  options = options || {};
  options.port = options.port || 10025;
  this.options = options;
}

ehlo.prototype.start = function start(callback) {
  var that = this;
  callback = callback || function() {};
  console.log('Starting ehlo');
  this.smtp = new SMTPServer({
    banner: 'Welcome to Ehlo SMTP Server'
    , disabledCommands: ['STARTTLS', 'AUTH']
    , onData: function(stream, session, res) {
      streamToBuffer(stream, function(err, buffer) {
        if (err) {
          console.log(err);
        }

        that.process(buffer, res);
      });
    }
  });


  this.smtp.listen(
    this.options.port
    , function() {
      console.log('Listening on port [' + that.options.port + ']');
      callback();
    }
  );
};

ehlo.prototype.process = function process(buffer, smtpCallback) {
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
    if (idx >= stack.length) {
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

ehlo.prototype.use = function use(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('Use only accept function');
  }
  this.stack.push(fn);

  return this;
};

ehlo.prototype.stop = function stop(callback) {
  console.log('Stopping ehlo');
  this.smtp.close(callback);
};

module.exports = ehlo;
