let GET = require("./GET");
let POST = require("./POST");
let PUT = require("./PUT");

/**
 * Main field where we will fetch all the content and passer
 * @param  {[type]}   event    [description]
 * @param  {[type]}   context  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */

exports.handler = function (event, context, callback) {
  console.log("inside handler :: ----------->");
  context.callbackWaitsForEmptyEventLoop = false;
  switch (event.httpMethod) {
    case "GET":
      GET.execute(event.queryStringParameters, event.headers, callback);
      break;
    case "POST":
      POST.execute(event.body, event.headers, callback);
      break;
    case "PUT":
      PUT.execute(event.body, event.headers, callback);
      break;
    
    default:
      GET.execute(event.queryStringParameters, event.headers, callback);
  }
};
