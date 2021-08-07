const response = require("./lib/response.js");
const Ajv = require("ajv");
const ajv = new Ajv.default();
const con = require("./lib/connection/postgres");
///// ...................................... end default setup ............................................////

const postSchema = {
  $async: true,
  type: "object",
  additionalProperties: false,
  required:["team_id"],
  properties: {
    status: {
      type: "boolean",
    },
    team_name: {
      type: "string",
    },
    coach_id: {
      type: "number",
    },
    sports_id: {
      type: "number",
    },
    won:{
      type:"number"
    },
    lost:{
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
      return update_team(result);
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


//---------function to update team----------
function update_team(result) {
  console.log("inside update_team function");
  return new Promise(async (resolve, reject) => {
    var set1 = [];
    var count1 = 0;
    var query = "";
    try {
      query += `update team `;
      if (result != null) {
        if (
          result.team_name != undefined ||
          result.status != undefined ||
          result.coach_id !=undefined ||
          result.sports_id !=undefined ||
          result.won !=undefined ||
          result.lost !=undefined
        ) {
          query += "set ";

          if (result.team_name) {
            set1[count1] = `team_name = '${result.team_name}'  `;
            count1++;
          }
          if (result.coach_id) {
            set1[count1] = `coach_id = '${result.coach_id}'  `;
            count1++;
          }
          if (result.sports_id) {
            set1[count1] = `sports_id = '${result.sports_id}'  `;
            count1++;
          }
          if (result.won) {
            set1[count1] = `won = '${result.won}' + 1 `;
            count1++;
          }
          if (result.lost) {
            set1[count1] = `lost = '${result.lost}' + 1  `;
            count1++;
          }
         
          if (result.status != undefined) {
            set1[count1] = `status = '${result.status}'  `;
            count1++;
          }
         
          query += set1.join(" , ");
        }
      }
      query += `,updated_at = now() where team_id='${result.team_id}';`;
      let res = await client.query(query);
      resolve({ message: "team updated successfully" });
    } catch (err) {
      reject(err);
    }
    finally{
      client.release(true);
    }
  });
}
