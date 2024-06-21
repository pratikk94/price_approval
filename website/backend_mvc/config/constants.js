/* eslint-disable no-undef */
require('dotenv').config();

const BASE_PATH = "http://" + process.env.URL + ":5173";
const SESSION_SECRET = process.env.SESSION_SECRET

const DB_CONFIG = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: 1433,
    database: process.env.DB_NAME
};

module.exports = {
    BASE_PATH,
    SESSION_SECRET,
    DB_CONFIG

};
