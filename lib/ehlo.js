'use strict';

var SMTPServer = require('smtp-server').SMTPServer
  , ehlo = {}
;


ehlo.options = {
  port: 10025
  , api: ''
};

ehlo.start = function() {
  console.log('Starting ehlo');
  var smtp = new SMTPServer({
    banner: 'Welcome to Ehlo SMTP Server'
    , disabledCommands: ['STARTTLS', 'AUTH']
    , onData: function(stream, session, callback) {
      stream.pipe(process.stdout);
      stream.on('end', callback);
    }
    , onMailFrom: function(address, session, callback) {
      callback();
    }
    , onRcptTo: function(address, session, callback) {
      callback();
    }
  });

  smtp.listen(
    this.options.port
    , function() {
      console.log('Listening on port [' + ehlo.options.port + ']');
    }
  );
};

ehlo.stop = function() {
  console.log('Stopping ehlo');
};

module.exports = ehlo;
