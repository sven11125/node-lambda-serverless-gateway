'use strict';
const send = (statusCode, data) => {

  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',  
    'Access-Control-Allow-Credentials': true
  };

  return {
      statusCode: statusCode,
      headers: responseHeaders,
      body: JSON.stringify(data, null, 2),
    };
};


module.exports = {
  send
};