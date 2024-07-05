/* eslint-disable no-undef */
require("dotenv").config();

const BASE_PATH = "http://" + process.env.URL + ":5173";
const SESSION_SECRET = process.env.SESSION_SECRET;

const DB_CONFIG = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: 1433,
  database: process.env.DB_NAME,
};
const CREATED_BY = "backend_user";
const STATUS = {
  DRAFT: "-1",
  PENDING: "0",
  APPROVED: "1",
  REJECTED: "2",
  REWORK: "3",
  BLOCKED: "4",
  EXTENSION: "5",
  COPY: "6",
  MERGE: "7",
  COMPLETELY_APPROVED: "8",
};

module.exports = {
  BASE_PATH,
  SESSION_SECRET,
  DB_CONFIG,
  CREATED_BY,
  STATUS,
};
