const response = require("./lib/response.js");
const Ajv = require("ajv");
const ajv = new Ajv.default();
const con = require("./lib/connection/postgres");
///// ...................................... end default setup ............................................////

const postSchema = {
  $async: true,
  type: "object",
  additionalProperties: false,
  required: ["team_id", "player_id", "match_result"],
  properties: {
    team_id: {
      type: "number",
    },
    player_id: {
      type: "array",
    },
    match_result: {
      type: "boolean",
    },
  },
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
      return update_afterMatch(result);
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

//---------function to update afterMatch----------
function update_afterMatch(result) {
  console.log("inside update_afterMatch function");
  return new Promise(async (resolve, reject) => {
    try {
      //----update team table that match won/lost ----------
      if (result.team_id != undefined) {
        if (result.match_result === false) {
          query_team = `update team set lost = lost + 1 , updated_at = now() where team_id = '${result.team_id}'`;
        } else {
          query_team = `update team set won = won + 1 , updated_at = now() where team_id = '${result.team_id}'`;
        }

        let res_team = await client.query(query_team);
      }
      //-----update playerDetails table ----
      if (result.player_id != undefined) {
        if (result.match_result === false) {
          query_player = `update player_details set point = point - 0.5 , updated_at = now() where player_id IN('${result.player_id}')`;
        } else {
          query_player = `update player_details set point = point + 2 , updated_at = now() where player_id IN('${result.player_id}')`;
        }

        let res_player = await client.query(query_player);
      }
      resolve({ message: "match results updated successfully" });
    } catch (err) {
      reject(err);
    } finally {
      client.release(true);
    }
  });
}
