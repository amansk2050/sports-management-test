//....... start default setup ............................................////
const response = require("./lib/response.js");
const con = require("./lib/connection/postgres");
const Ajv = require("ajv");
const ajv = new Ajv.default();

/////....................................... end default setup ............................................////

const postSchema = {
  $async: true,
  type: "object",
  required: ["page"],
  additionalProperties: false,
  properties: {
    page: {
      type: "string",
    },
    coach_id: {
      type: "string",
    },
    status: {
      type: "string",
    },
    coach_name: {
      type: "string",
    },
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
      return get_coach(result);
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

//----------function to get coach-------
function get_coach(result) {
  console.log("insdie get_coachs");
  return new Promise(async (resolve, reject) => {
    try {
      var where1 = [];
      var count1 = 0;
      var query = "";
      query += `select coach_id,coach_name,status from coach `;
      if (result != null) {
        if (
          result.status != undefined ||
          result.coach_id != undefined ||
          result.coach_name != undefined
        ) {
          query += "WHERE ";

          if (result.status) {
            where1[count1] = `status = '${result.status}' `;
            count1++;
          }
          if (result.coach_id) {
            where1[count1] = `coach_id = '${result.coach_id}' `;
            count1++;
          }

          if (result.coach_name) {
            where1[count1] = `coach_name = '${result.coach_name}' `;
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
      query += `offset ${(result.page - 1) * 20} limit 20;`;
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
