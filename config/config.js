if (typeof process.env.NODE_ENV === 'undefined') {
  require('dotenv').config();
}

const Sequelize = require('sequelize');

module.exports = {
  "development": {
    "username": process.env.DEV_DB_USER,
    "password": process.env.DEV_DB_PASS,
    "database": process.env.DEV_DB_NAME,
    "host": process.env.DEV_DB_HOST,
    "port": process.env.DEV_DB_PORT,
    "dialect": "mssql",
    "encrypt": true,
    "dialectOptions": { 
      "options": {
          "encrypt": true,
      },
    },
    "retry": {
      "match": [
        Sequelize.TimeoutError,
        Sequelize.ConnectionError,
        Sequelize.ConnectionTimedOutError
      ],
      "max": 3
    },
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "production": {
    "use_env_variable": process.env.DATABASE_URL,
    "dialectOptions": {
        ssl: true
    },
    "retry": {
        match: [
            Sequelize.TimeoutError,
            Sequelize.ConnectionError,
            Sequelize.ConnectionTimedOutError
        ],
        max: 3
    }
  }
};
