const response = require("./lib/response.js");
const Ajv = require("ajv");
const ajv = new Ajv.default();
const con = require("./lib/connection/postgres");
///// ...................................... end default setup ............................................////

const postSchema = {
  $async: true,
  type: "object",
  additionalProperties: false,
  required:["sport_id"],
  properties: {
    status: {
      type: "boolean",
    },
    sport_id: {
      type: "number",
    },
    sport_name: {
      type: "string",
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
      return update_sport(result);
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


//---------function to update sport----------
function update_sport(result) {
  console.log("inside update_sport function");
  return new Promise(async (resolve, reject) => {
    var set1 = [];
    var count1 = 0;
    var query = "";
    try {
      query += `update sport `;
      if (result != null) {
        if (
          result.sport_name != undefined ||
          result.status != undefined 
        ) {
          query += "set ";

          if (result.sport_name) {
            set1[count1] = `sport_name = '${result.sport_name}'  `;
            count1++;
          }
         
          if (result.status != undefined) {
            set1[count1] = `status = '${result.status}'  `;
            count1++;
          }
         
          query += set1.join(" , ");
        }
      }
      query += `,updated_at = now() where sport_id='${result.sport_id}';`;
      let res = await client.query(query);
      resolve({ message: "sport updated successfully" });
    } catch (err) {
      reject(err);
    }
    finally{
      client.release(true);
    }
  });
}
