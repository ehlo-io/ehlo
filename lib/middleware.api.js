'use strict';
var request = require('request')
  , logger = require('./logger')
;
module.exports = function api(mail, smtp, next) {
  logger.verbose(
    '[%s] Send post request to [' + mail.api + ']'
    , smtp.session.id
  );

  request.post(
    {
      url: mail.api
      , formData: {
        mail: JSON.stringify(mail.json)
      }
    }
    , function(error, response) {
      if (error) {
        logger.error(error);
      }
      logger.verbose(
        '[%s] Mail pushed to [' + mail.api + '] ' +
        'with response [' + response.statusCode + ']'
        , smtp.session.id
      );
      next();
    }
  );
};
