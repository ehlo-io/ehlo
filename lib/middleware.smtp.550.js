'use strict';
module.exports = function smtpMailboxUnavailable(mail, smtp) {
  smtp.send(550, 'Mailbox unavailable');
};
