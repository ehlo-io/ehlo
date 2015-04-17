'use strict';
var MailParser = require('mailparser').MailParser;
module.exports = function parser(mail, smtp, next) {
  var mailParser = new MailParser();
  mailParser.on('end', function(mailObject) {
    mail.json = mailObject;
    next();
  });
  mailParser.write(mail.raw);
  mailParser.end();
}
