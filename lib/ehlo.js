'use strict';

var SMTPServer = require('smtp-server').SMTPServer
  , MailParser = require("mailparser").MailParser
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
      var mailParser = new MailParser();
      mailParser.on('end', function(mail) {
        console.log(mail);
      });
      stream.pipe(mailParser);
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

ehlo.buildShortId = function() {
  return Math.floor(
    Math.random() * 10
  ) + parseInt(
    (new Date()).getTime()
  ).toString(36);
};

module.exports = ehlo;
