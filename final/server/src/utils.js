const SQL = require('sequelize');
const path  = require("path");

module.exports.paginateResults = ({
  after: cursor,
  pageSize = 20,
  results,
  // can pass in a function to calculate an item's cursor
  getCursor = () => null,
}) => {
  if (pageSize < 1) return [];

  if (!cursor) return results.slice(0, pageSize);
  const cursorIndex = results.findIndex(item => {
    // if an item has a `cursor` on it, use that, otherwise try to generate one
    let itemCursor = item.cursor ? item.cursor : getCursor(item);

    // if there's still not a cursor, return false by default
    return itemCursor ? cursor === itemCursor : false;
  });

  return cursorIndex >= 0
    ? cursorIndex === results.length - 1 // don't let us overflow
      ? []
      : results.slice(
          cursorIndex + 1,
          Math.min(results.length, cursorIndex + 1 + pageSize),
        )
    : results.slice(0, pageSize);
};

module.exports.createStore = () => {
  const Op = SQL.Op;
  const operatorsAliases = {
    $in: Op.in,
  };

  const db = new SQL('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: path.join(__dirname, "../store.sqlite"),
    operatorsAliases,
    logging: true,
  });
  /*const path = require('path');
  const dbPath = path.resolve(__dirname, 'database.db')
  var db = new sqlite3.Database(dbPath);
  */
  /*
 const path = require('path');
 const dbPath = path.resolve(__dirname, 'database.db')
 console.log('dbPath = '+dbPath);
 const db = new SQL('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: dbPath,
  operatorsAliases
});

  const db = new SQL('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: './store.sqlite',
    operatorsAliases,
    logging: false,
  });
  const dbPath = path.join(app.getPath('userData'), 'database.db');
  log.info(`Using SQLite database at ${dbPath}`);

  sequelize = new Sequelize('database', 'username', sqlCipherKey, {
    dialect: 'sqlite',
    storage: dbPath,
    logging: (_sql, _settings) => {
      // log.info(_sql.substring(0, 120));
      // log.info(_sql);
      // log.info(_settings);
    },
  });
*/
  const users = db.define('user', {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
    email: SQL.STRING,
    token: SQL.STRING,
  });

  const trips = db.define('trip', {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
    launchId: SQL.INTEGER,
    userId: SQL.INTEGER,
  });

  return { users, trips };
};
