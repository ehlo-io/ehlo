'use strict';
module.exports = function smtpMailboxUnavailable(mail, smtp) {
  smtp.send(421, 'Try again later');
};
