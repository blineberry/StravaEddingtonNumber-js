const Sequelize = require('sequelize');

dev = {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    options: {
        dialect: 'mssql',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        encrypt: true,
        dialectOptions: { 
        options: {
            encrypt: true
        }
        },
        retry: {
            match: [
                Sequelize.TimeoutError,
                Sequelize.ConnectionError,
                Sequelize.ConnectionTimedOutError
            ],
            max: 3
        }
    }
}

prod = {
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

module.exports = process.env.NODE_ENV === 'development' ? dev : prod;
