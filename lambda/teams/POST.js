const response = require("./lib/response.js");
const Ajv = require("ajv");
const ajv = new Ajv.default();
const con = require("./lib/connection/postgres");
const authorization = require("./lib/authorization.js");

///// ...................................... end default setup ............................................////

const postSchema = {
  $async: true,
  type: "object",
  additionalProperties: false,
  properties: {
    team_name: {
      type: "string"
    },
    sports_id:{
      type:"number"
    },
    coach_id:{
      type:"number"
    }
    
  }
};

var validate1 = ajv.compile(postSchema);
module.exports = { execute };
/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data    [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */
async function execute(data, headers, callback) {
  client = await con.connect();
  if (typeof data == "string") {
    data = JSON.parse(data);
  }
  validate_all(validate1, data)

    .then(function (result) {
      return insert_team(result);
    })
    .then(function (result) {
      response({ code: 200, body: result }, callback);
    })
    .catch(function (err) {
      console.log(err);
      response({ code: 400, err: { err } }, callback);
    });
}
/**
 * validate the data to the categories
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function validate_all(validate, data) {
  return new Promise((resolve, reject) => {
    validate(data)
      .then(function (res) {
        resolve(res);
      })
      .catch(function (err) {
        reject(err.errors[0].dataPath + " " + err.errors[0].message);
      });
  });
}


//------------function to insert team-------
function insert_team(result) {
  console.log("inside insert_team function ");
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof result == "string") {
        result = JSON.parse(result);
      }
      var insert = `insert into team(team_name,sports_id,coach_id)
      values('${result.team_name}','${result.sports_id}','${result.coach_id}')`;
      let res = await client.query(insert);
      resolve({ success: "team  added successfuly" });
    } catch (err) {
      reject(err);
    }
    finally{
      client.release(true);
    }
  });
}
