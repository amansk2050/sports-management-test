console.log("PostgreSQL GET Connection");
var pg = require("pg");
var connectionString = {
  user: "postgres",
  host: "172.17.0.1",
  database: "postgress",
  password: "password",
  port: 5432,
};


//--------for prods-------

// var connectionString = {
//   user: process.env.user,
//   host: process.env.host_permission,
//   database: process.env.database_permission,
//   password: process.env.password_permission,
//   port: process.env.port_permission,
// };
module.exports = new pg.Pool(connectionString);
