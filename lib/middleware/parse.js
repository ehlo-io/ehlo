'use strict';
var MailParser = require('mailparser').MailParser;
module.exports = function parser() {
  return function(mail, smtp, next) {
    var mailParser = new MailParser();
    mailParser.on('end', function(mailObject) {
      mail.json = mailObject;

      if (mail.json.attachments) {
        mail.json.attachments.forEach(function(attachment, idx, attachments) {
          if (!attachment.content) {
            return;
          }
          attachments[idx].content = attachment.content.toString('base64');
        });
      }

      next();
    });
    mailParser.write(mail.raw);
    mailParser.end();
  };
}
