'use strict';
module.exports = function smtpMailboxUnavailable(mail, smtp) {
  smtp({responseCode: '550', message: 'Mailbox unavailable'});
};
