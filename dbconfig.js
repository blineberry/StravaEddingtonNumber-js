const Sequelize = require('sequelize');

module.exports = {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    options: {
        dialect: 'postgres',
        protocol: 'postgres',
        host: process.env.DB_HOST,
        dialectOptions: {
            ssl: true
        },
        port: process.env.DB_PORT,
        retry: {
            match: [
                Sequelize.TimeoutError,
                Sequelize.ConnectionError,
                Sequelize.ConnectionTimedOutError
            ],
            max: 3
        }
    }
};
