//....... start default setup ............................................////
const response = require("./lib/response.js");
const con = require("./lib/connection/postgres");
const Ajv = require("ajv");
const { and } = require("ajv/dist/compile/codegen");
const ajv = new Ajv.default();

/////....................................... end default setup ............................................////

const postSchema = {
  $async: true,
  type: "object",
  required: ["page", "role"],
  additionalProperties: false,
  properties: {
    page: {
      type: "string",
    },
    sports_id: {
      type: "string",
    },
    player_id: {
      type: "string",
    },
    coach_id: {
      type: "string",
    },
    team_id:{
      type:"string"
    },
    role: {
      type: "string",
    },
    status:{
      type:"string"
    },
    player_name:{
      type:"string"
    },
    sport_name:{
      type:"string"
    }
  },
};
const validate = ajv.compile(postSchema);
module.exports = { execute };

/**
 * This is the Promise caller which will call each and every function based
 * @param  {[type]}   data     [content to manipulate the data]
 * @param  {Function} callback [need to send response with]
 * @return {[type]}            [description]
 */

async function execute(data, headers, callback) {
  client = await con.connect();
  if (typeof data == "string") {
    data = JSON.parse(data);
  }
  validate_all(validate, data)
    .then(function (result) {
      if (result.role == "Admin") {
        return get_all(result);
      } else if (result.role == "Coach") {
        return get_player(result);
      }
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

//----------function to get all (for admin)-------
function get_all(result) {
  console.log("insdie get_all");
  return new Promise(async (resolve, reject) => {
    try {
      var where1 = [];
      var count1 = 0;
      var query = "";
      query += `select t.team_id,t.team_name,p.player_id,p.player_name,t.sports_id,s.sport_name,p.match_played,
                p.point from team as t inner join player_details as p on t.team_id = p.team_id inner join 
                sports as s on t.sports_id = s.sports_id `;
      if (result != null) {
        if (
          result.status != undefined ||
          result.player_id != undefined ||
          result.player_name != undefined ||
          result.sports_id != undefined ||
          result.sport_name != undefined
        ) {
          query += "WHERE ";

          if (result.status) {
            where1[count1] = `p.status = '${result.status}' `;
            count1++;
          }
          if (result.player_id) {
            where1[count1] = `p.player_id = '${result.player_id}' `;
            count1++;
          }

          if (result.player_name) {
            where1[count1] = `p.player_name ilike '%${result.player_name}%' `;
            count1++;
          }
          if (result.sports_id) {
            where1[count1] = `t.sports_id = '${result.sports_id}' `;
            count1++;
          }

          if (result.sport_name) {
            where1[count1] = `s.sport_name ilike '%${result.sport_name}%' `;
            count1++;
          }
          query += where1.join(" AND ");
        }
        if (result.page) {
          result.page = JSON.parse(result.page);
        } else {
          result["page"] = 1;
        }
      }
      query += `order by p.point desc offset ${
        (result.page - 1) * 20
      } limit 20;`;
      console.log("----------", query);
      let res = await client.query(query);
      resolve({ count: res.rowCount, data: res.rows });
    } catch (err) {
      reject(err);
    } finally {
      client.release(true);
    }
  });
}

//----------function to get player (for coach )-------

//---team_id and coach_id is mandatory for ---

function get_all(result) {
  console.log("insdie get_all");
  return new Promise(async (resolve, reject) => {
    try {
      if (result.team_id != undefined && result.coach_id !=undefined) {
        var where1 = [];
        var count1 = 0;
        var query = "";
        query += `select t.team_id,t.team_name,p.player_id,p.player_name,t.sports_id,s.sport_name,p.match_played,
                p.point from team as t inner join player_details as p on t.team_id = p.team_id inner join 
                sports as s on t.sports_id = s.sports_id `;
        if (result != null) {
          if (
            result.status != undefined ||
            result.coach_id != undefined ||
            result.team_id != undefined ||
            result.player_id != undefined ||
            result.player_name != undefined ||
            result.sports_id != undefined ||
            result.sport_name != undefined
          ) {
            query += "WHERE ";

            if (result.status) {
              where1[count1] = `p.status = '${result.status}' `;
              count1++;
            }
            if (result.player_id) {
              where1[count1] = `p.player_id = '${result.player_id}' `;
              count1++;
            }

            if (result.player_name) {
              where1[count1] = `p.player_name ilike '%${result.player_name}%' `;
              count1++;
            }
            if (result.sports_id) {
              where1[count1] = `t.sports_id = '${result.sports_id}' `;
              count1++;
            }
            if (result.coach_id) {
              where1[count1] = `t.coach_id = '${result.coach_id}' `;
              count1++;
            }
            if (result.team_id) {
              where1[count1] = `t.team_id = '${result.team_id}' `;
              count1++;
            }

            if (result.sport_name) {
              where1[count1] = `s.sport_name ilike '%${result.sport_name}%' `;
              count1++;
            }
            query += where1.join(" AND ");
          }
          if (result.page) {
            result.page = JSON.parse(result.page);
          } else {
            result["page"] = 1;
          }
        }
        query += `order by p.point desc offset ${
          (result.page - 1) * 20
        } limit 20;`;
        console.log("----------", query);
        let res = await client.query(query);
        resolve({ count: res.rowCount, data: res.rows });
      }
      else{
        reject({message:"please provide team_id and coach_id"})
      }
    } catch (err) {
      reject(err);
    } finally {
      client.release(true);
    }
  });
}
