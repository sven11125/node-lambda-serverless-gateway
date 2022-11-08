const jwt = require('jsonwebtoken');

exports.handler = async (event, context, callback) => {
        
    const secretKey = "";
    
    if(!event.headers.authorization)
        return { isAuthorized: false }
    
    //await jwt.verify(event.headers.authorization.replace('Bearer ', '')
    //    , secretKey
    //    , function(err, decoded) {
    //        if(err) {
    //            return { isAuthorized: false }
    //        } else {
    return { isAuthorized: true }
    //        }
    //    });
};
