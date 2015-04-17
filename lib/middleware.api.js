'use strict';
var request = require('request');
module.exports = function api(mail, smtp, next) {
  console.log('Send post request to [' + mail.api + ']');

  request.post(
    {
      url: mail.api
      , formData: {
        mail: JSON.stringify(mail.json)
      }
    }
    , function(error, response) {
      if (error) {
        console.log(error);
      }
      console.log(
        'Mail pushed to [' + mail.api + '] ' +
        'with response [' + response.statusCode + ']'
      );
      next();
    }
  );
};
